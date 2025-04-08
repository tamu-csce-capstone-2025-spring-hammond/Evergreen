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
            },
            portfolioSnapshot: {
              findMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: AlpacaService,
          useValue: {
            getCurrentPortfolioInfo: jest.fn(),
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
    it('should create a new portfolio', async () => {
      const dto = {
        portfolioName: 'Test Portfolio',
        targetDate: new Date(),
        createdDate: new Date(),
        initial_deposit: new Decimal(1000),
        color: 'blue',
        bitcoin_focus: true,
      };
      const mockResult = { portfolio_id: 1, ...dto };
      prisma.portfolio.create = jest.fn().mockResolvedValue(mockResult);

      const result = await service.create(dto as any, 123);
      expect(result).toEqual(mockResult);
      expect(prisma.portfolio.create).toHaveBeenCalled();
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
    it('should update cash balances correctly', async () => {
      prisma.$transaction = jest.fn().mockImplementation(async (fn) => fn(prisma));
      prisma.portfolio.update = jest.fn().mockResolvedValue({ portfolio_id: 1 });
      const result = await service.deposit(123, 1, 100);
      expect(result.portfolio_id).toBe(1);
    });

    it('should throw NotFoundException on P2025 error', async () => {
      const error = { code: 'P2025' };
      prisma.$transaction = jest.fn().mockRejectedValue(error);
      await expect(service.deposit(123, 1, 100)).rejects.toThrow(NotFoundException);
    });
  });

  describe('withdraw', () => {
    it('should throw BadRequest if withdraw amount is negative', async () => {
      await expect(service.withdraw(123, 1, -100)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFound if portfolio is missing', async () => {
      prisma.$transaction = jest.fn().mockImplementation(async (fn) => fn(prisma));
      prisma.portfolio.findUnique = jest.fn().mockResolvedValue(null);
      await expect(service.withdraw(123, 1, 100)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequest if not enough cash', async () => {
      prisma.$transaction = jest.fn().mockImplementation(async (fn) => fn(prisma));
      prisma.portfolio.findUnique = jest.fn().mockResolvedValue({ uninvested_cash: new Decimal(50) });
      await expect(service.withdraw(123, 1, 100)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete the portfolio', async () => {
      prisma.portfolio.delete = jest.fn().mockResolvedValue({ portfolio_id: 1 });
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
});
