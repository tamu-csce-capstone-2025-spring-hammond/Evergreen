import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { PrismaService } from '../prisma.service';
import { AlpacaService } from '../stock-apis/alpaca.service';
import {
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import {
  Decimal,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let prisma: PrismaService;
  let alpacaService: AlpacaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: PrismaService,
          useValue: {
            portfolio: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            holdings: {
              findMany: jest.fn(),
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
            portfolioSnapshot: {
              findMany: jest.fn(),
            },
            portfolioTemplate: {
              findFirst: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: AlpacaService,
          useValue: {
            getCurrentPortfolioInfo: jest.fn(),
            backtestSim: jest.fn(),
            tradeSim: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    prisma = module.get<PrismaService>(PrismaService);
    alpacaService = module.get<AlpacaService>(AlpacaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new portfolio with holdings from tradeSim', async () => {
      const dto = {
        portfolioName: 'Test Portfolio',
        targetDate: new Date('2025-01-01'),
        createdDate: new Date('2024-01-01'),
        initial_deposit: new Decimal(1000),
        color: 'blue',
        bitcoin_focus: true,
        smallcap_focus: false,
        value_focus: false,
        momentum_focus: false,
        risk_aptitude: 5,
      };

      const mockAllocations = [
        { ticker: 'AAPL', percent_of_portfolio: 0.6 },
        { ticker: 'MSFT', percent_of_portfolio: 0.4 },
      ];

      const mockSim = {
        investments: [
          { ticker: 'AAPL', quantity: 3, cost_basis: new Decimal(600) },
          { ticker: 'MSFT', quantity: 2, cost_basis: new Decimal(400) },
        ],
      };

      const mockResult = {
        portfolio_id: 1,
        ...dto,
        user_id: 123,
        total_deposited: dto.initial_deposit,
        uninvested_cash: 0,
        holdings: {
          create: mockSim.investments,
        },
      };

      // Mock getAllocations and tradeSim
      jest
        .spyOn(service as any, 'getAllocations')
        .mockResolvedValue(mockAllocations);
      alpacaService.tradeSim = jest.fn().mockResolvedValue(mockSim);
      prisma.portfolio.create = jest.fn().mockResolvedValue(mockResult);

      const result = await service.create(dto as any, 123);

      expect(result).toEqual(mockResult);
      expect(prisma.portfolio.create).toHaveBeenCalledWith({
        data: {
          user_id: 123,
          portfolio_name: dto.portfolioName,
          target_date: dto.targetDate,
          created_at: dto.createdDate,
          total_deposited: dto.initial_deposit,
          uninvested_cash: 0,
          color: dto.color,
          bitcoin_focus: dto.bitcoin_focus,
          smallcap_focus: dto.smallcap_focus,
          value_focus: dto.value_focus,
          momentum_focus: dto.momentum_focus,
          risk_aptitude: dto.risk_aptitude,
          holdings: {
            create: mockSim.investments,
          },
        },
      });
    });
  });

  describe('getFullPortfolioInfo', () => {
    it('should throw NotFoundException if portfolio does not exist', async () => {
      prisma.portfolio.findUnique = jest.fn().mockResolvedValue(null);
      await expect(service.getFullPortfolioInfo(1, 123)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if user does not own the portfolio', async () => {
      prisma.portfolio.findUnique = jest
        .fn()
        .mockResolvedValue({ user_id: 999 });
      await expect(service.getFullPortfolioInfo(1, 123)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return portfolio info if valid', async () => {
      const fakePortfolio = {
        portfolio_id: 1,
        user_id: 123,
        portfolio_name: 'Test',
        created_at: new Date(),
        target_date: new Date(),
        uninvested_cash: new Decimal(500),
        total_deposited: new Decimal(1000),
        bitcoin_focus: false,
        smallcap_focus: false,
        value_focus: false,
        momentum_focus: false,
      };

      prisma.portfolio.findUnique = jest.fn().mockResolvedValue(fakePortfolio);
      prisma.holdings.findMany = jest.fn().mockResolvedValue([]);
      prisma.portfolioSnapshot.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getFullPortfolioInfo(1, 123);
      expect(result.portfolio_id).toBe(1);
      expect(result.investments).toEqual([]);
    });

    it('should return portfolio info if valid 2', async () => {
      const fakePortfolio = {
        portfolio_id: 1,
        user_id: 123,
        portfolio_name: 'Test',
        created_at: new Date(),
        target_date: new Date(),
        uninvested_cash: new Decimal(500),
        total_deposited: new Decimal(1000),
        bitcoin_focus: false,
        smallcap_focus: false,
        value_focus: false,
        momentum_focus: false,
      };

      const fakeHoldings: {
        portfolio_id: number;
        ticker: string;
        ticker_name: string;
        quantity: Prisma.Decimal;
        average_cost_basis: Prisma.Decimal;
        last_updated: Date;
      }[] = [
        {
          portfolio_id: 1,
          ticker: 'AAPL',
          ticker_name: 'Apple',
          quantity: Decimal(4),
          average_cost_basis: Decimal(120),
          last_updated: new Date('11-22-2022'),
        },
      ];

      prisma.portfolio.findUnique = jest.fn().mockResolvedValue(fakePortfolio);
      prisma.holdings.findMany = jest.fn().mockResolvedValue(fakeHoldings);
      prisma.portfolioSnapshot.findMany = jest.fn().mockResolvedValue([]);

      alpacaService.getCurrentPortfolioInfo = jest
        .fn()
        .mockResolvedValue({
          total_portfolio_value: 120,
          holdings: { AAPL: 150 },
        });

      const result = await service.getFullPortfolioInfo(1, 123);
      expect(result.portfolio_id).toBe(1);
      // expect(result.investments).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a portfolio successfully', async () => {
      prisma.portfolio.update = jest
        .fn()
        .mockResolvedValue({ portfolio_id: 1 });
      const result = await service.update(
        1,
        { portfolioName: 'New Name' } as any,
        123,
      );
      expect(result.portfolio_id).toBe(1);
    });

    it('should throw NotFoundException for P2025 error', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '2' },
      );
      prisma.portfolio.update = jest.fn().mockRejectedValue(error);

      await expect(service.update(1, {} as any, 123)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deposit', () => {
    it('should deposit into the portfolio and return updated portfolio data with total value', async () => {
      const userId = 1;
      const portfolioId = 42;
      const depositAmount = 500;
      const mockPortfolio = {
        portfolio_id: portfolioId,
        user_id: userId,
        total_deposited: new Decimal(1000),
      };

      const updatedPortfolio = {
        ...mockPortfolio,
        total_deposited: new Decimal(1500),
      };

      const mockValue = new Decimal(1200);
      const mockNewTotalValue = mockValue.add(depositAmount);

      // Mock findUnique before deposit
      prisma.portfolio.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockPortfolio) // first fetch
        .mockResolvedValueOnce(updatedPortfolio); // after update

      // Mock getPortfolioValue
      service.getPortfolioValue = jest
        .fn()
        .mockResolvedValueOnce(mockValue)
        .mockResolvedValueOnce(mockNewTotalValue);

      // Mock update
      prisma.portfolio.update = jest.fn().mockResolvedValue(undefined);

      // Mock reallocate
      service.reallocate = jest.fn().mockResolvedValue(undefined);

      const result = await service.deposit(userId, portfolioId, depositAmount);

      expect(prisma.portfolio.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.portfolio.update).toHaveBeenCalledWith({
        where: { portfolio_id: portfolioId },
        data: {
          total_deposited: {
            increment: depositAmount,
          },
        },
      });
      expect(service.reallocate).toHaveBeenCalledWith(
        portfolioId,
        userId,
        mockNewTotalValue,
      );
      expect(result).toEqual({
        ...updatedPortfolio,
        total_value: mockNewTotalValue,
      });
    });

    it('should throw NotFoundException if portfolio does not exist', async () => {
      prisma.portfolio.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.deposit(1, 999, 100)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if user does not own portfolio', async () => {
      const mockPortfolio = {
        portfolio_id: 999,
        user_id: 2, // different user
      };
      prisma.portfolio.findUnique = jest.fn().mockResolvedValue(mockPortfolio);

      await expect(service.deposit(1, 999, 100)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('withdraw', () => {
    it('should withdraw from the portfolio and return updated portfolio data with total value', async () => {
      const userId = 1;
      const portfolioId = 42;
      const withdrawAmount = 500;
      const mockPortfolio = {
        portfolio_id: portfolioId,
        user_id: userId,
        total_deposited: new Decimal(1000),
      };

      const updatedPortfolio = {
        ...mockPortfolio,
        total_deposited: new Decimal(500),
      };

      const mockValue = new Decimal(1200);
      const mockNewTotalValue = mockValue.sub(withdrawAmount);

      // Mock findUnique before deposit
      prisma.portfolio.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockPortfolio) // first fetch
        .mockResolvedValueOnce(updatedPortfolio); // after update

      prisma.portfolio.findFirst = jest.fn().mockRejectedValue(null);

      // Mock getPortfolioValue
      service.getPortfolioValue = jest
        .fn()
        .mockResolvedValueOnce(mockValue)
        .mockResolvedValueOnce(mockNewTotalValue);

      // Mock update
      prisma.portfolio.update = jest.fn().mockResolvedValue(undefined);

      // Mock reallocate
      service.reallocate = jest.fn().mockResolvedValue(undefined);

      const result = await service.withdraw(
        userId,
        portfolioId,
        withdrawAmount,
      );

      expect(prisma.portfolio.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.portfolio.update).toHaveBeenCalledWith({
        where: { portfolio_id: portfolioId },
        data: {
          total_deposited: {
            decrement: withdrawAmount,
          },
        },
      });
      expect(service.reallocate).toHaveBeenCalledWith(
        portfolioId,
        userId,
        mockNewTotalValue,
      );
      expect(result).toEqual({
        ...updatedPortfolio,
        total_value: mockNewTotalValue,
      });
    });
    it('should throw BadRequestException if withdraw amount exceeds portfolio value', async () => {
      const userId = 1;
      const portfolioId = 42;
      const withdrawAmount = 1500;

      // Mock the portfolio value to be less than the withdraw amount
      jest
        .spyOn(service, 'getPortfolioValue')
        .mockResolvedValue(new Decimal(1000));

      try {
        await service.withdraw(userId, portfolioId, withdrawAmount);
        fail(
          'Expected withdraw to throw BadRequestException due to insufficient funds',
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(
          'Insufficient funds. Available: 1000, Requested: 1500',
        );
      }
    });

    it('should throw error if negative withdraw amount', async () => {
      const userId = 1;
      const portfolioId = 42;
      const withdrawAmount = -500;
      const mockPortfolio = {
        portfolio_id: portfolioId,
        user_id: userId,
        total_deposited: new Decimal(1000),
      };
    });

    it('should throw error if negative withdraw amount', async () => {
      const userId = 1;
      const portfolioId = 42;
      const withdrawAmount = -500;

      try {
        await service.withdraw(userId, portfolioId, withdrawAmount);
        fail('Expected withdraw to throw BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Withdraw amount must be positive');
      }
    });
  });

  describe('remove', () => {
    it('should delete the portfolio', async () => {
      prisma.portfolio.delete = jest
        .fn()
        .mockResolvedValue({ portfolio_id: 1 });
      const result = await service.remove(1, 123);
      expect(result.portfolio_id).toBe(1);
    });

    it('should throw NotFoundException on P2025 error', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '2' },
      );
      prisma.portfolio.delete = jest.fn().mockRejectedValue(error);
      await expect(service.remove(1, 123)).rejects.toThrow(NotFoundException);
    });
  });

  it('should return a preview object with backtest simulation data and portfolio details', async () => {
    const mockAllocations = [
      { ticker: 'AAPL', name: 'Apple', percent_of_portfolio: Decimal(50) },
      { ticker: 'T', name: 'AT&T', percent_of_portfolio: Decimal(50) },
    ];

    const mockDto = {
      value: 10000,
      targetDate: new Date('2027-01-01'),
      risk_aptitude: 2,
      bitcoin_focus: true,
      smallcap_focus: false,
      value_focus: true,
      momentum_focus: false,
    };

    const mockBacktestSim = {
      historical_graph: [{ date: '2023-01-01', value: 10000 }],
      future_projections: [{ date: '2027-01-01', value: 15000 }],
      sharpe_ratio: 1.2,
    };

    alpacaService.backtestSim = jest.fn().mockResolvedValue(mockBacktestSim);

    const result = await service.preview(mockDto, mockAllocations);

    expect(result).toMatchObject({
      targetDate: mockDto.targetDate,
      initial_deposit: mockDto.value,
      risk_aptitude: mockDto.risk_aptitude,
      bitcoin_focus: mockDto.bitcoin_focus,
      smallcap_focus: mockDto.smallcap_focus,
      value_focus: mockDto.value_focus,
      momentum_focus: mockDto.momentum_focus,
      investments: mockAllocations,
      historical_graph: mockBacktestSim.historical_graph,
      future_projections: mockBacktestSim.future_projections,
      sharpe_ratio: mockBacktestSim.sharpe_ratio,
    });

    // Check that createdDate is a valid date close to now
    expect(new Date(result.createdDate).getTime()).toBeCloseTo(Date.now(), -2);
  });

  it('should reallocate a valid portfolio', async () => {
    const portfolioId = 1;
    const userId = 123;
    const holdings = [
      { ticker: 'AAPL', quantity: new Decimal(2) },
      { ticker: 'MSFT', quantity: new Decimal(3) },
    ];

    const portfolio = {
      portfolio_id: portfolioId,
      user_id: userId,
      uninvested_cash: new Decimal(100),
      target_date: new Date(),
      bitcoin_focus: true,
      smallcap_focus: false,
      value_focus: true,
      momentum_focus: false,
      risk_aptitude: 'moderate',
    };

    const portfolioInfo = {
      total_portfolio_value: '500',
    };

    const simResult = {
      investments: [
        {
          ticker: 'AAPL',
          ticker_name: 'Apple',
          quantity: new Decimal(1),
          average_cost_basis: new Decimal(150),
          last_updated: new Date(),
        },
      ],
    };

    prisma.portfolio.findUnique = jest.fn().mockResolvedValue(portfolio);
    prisma.holdings.findMany = jest.fn().mockResolvedValue(holdings);
    alpacaService.getCurrentPortfolioInfo = jest
      .fn()
      .mockResolvedValue(portfolioInfo);
    alpacaService.tradeSim = jest.fn().mockResolvedValue(simResult);
    prisma.holdings.deleteMany = jest.fn().mockResolvedValue({});
    prisma.holdings.createMany = jest.fn().mockResolvedValue({});
    prisma.portfolio.update = jest.fn().mockResolvedValue({});
    prisma.portfolioTemplate.findFirst = jest.fn().mockResolvedValue(false);

    await service.reallocate(portfolioId, userId);

    expect(prisma.portfolio.findUnique).toHaveBeenCalledWith({
      where: { portfolio_id: portfolioId, user_id: userId },
    });

    expect(prisma.holdings.findMany).toHaveBeenCalledWith({
      where: { portfolio_id: portfolioId },
    });

    expect(alpacaService.getCurrentPortfolioInfo).toHaveBeenCalled();
    expect(alpacaService.tradeSim).toHaveBeenCalled();

    expect(prisma.holdings.deleteMany).toHaveBeenCalled();
    expect(prisma.holdings.createMany).toHaveBeenCalled();
    expect(prisma.portfolio.update).toHaveBeenCalledWith({
      where: { portfolio_id: portfolioId, user_id: userId },
      data: { uninvested_cash: 0 },
    });
  });

  it('should throw NotFoundException if portfolio not found', async () => {
    prisma.portfolio.findUnique = jest.fn().mockResolvedValue(null);

    await expect(service.reallocate(1, 123)).rejects.toThrow(NotFoundException);
  });

  it('should throw UnauthorizedException if user does not own the portfolio', async () => {
    prisma.portfolio.findUnique = jest.fn().mockResolvedValue({
      portfolio_id: 1,
      user_id: 999, // different user
    });

    await expect(service.reallocate(1, 123)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
