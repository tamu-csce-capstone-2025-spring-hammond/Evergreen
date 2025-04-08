import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { JwtGuard } from '../auth/jwt.guard';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PortfolioController', () => {
  let controller: PortfolioController;
  let service: PortfolioService;

  const mockService = {
    create: jest.fn(),
    getFullPortfolioInfo: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    deposit: jest.fn(),
    withdraw: jest.fn(),
  };

  const mockRequest = { userid: 123 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [
        {
          provide: PortfolioService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PortfolioController>(PortfolioController);
    service = module.get<PortfolioService>(PortfolioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new portfolio', async () => {
      const dto = {
        portfolioName: 'Retirement',
        color: '#4CAF50',
        createdDate: new Date('2025-01-01T00:00:00.000Z'),
        targetDate: new Date('2050-01-01T00:00:00.000Z'),
        initial_deposit: 1000000,
        bitcoin_focus: true,
        smallcap_focus: false,
        value_focus: true,
        momentum_focus: false,
        risk_aptitude: 2,
      };
      const result = { id: 1, ...dto };
      mockService.create.mockResolvedValue(result);

      expect(await controller.create(dto, mockRequest)).toEqual(result);
      expect(mockService.create).toHaveBeenCalledWith(dto, 123);
    });
  });

  describe('findOne', () => {
    it('should return a portfolio by ID', async () => {
      const result = { portfolio_id: 1, portfolio_name: 'Test' };
      mockService.getFullPortfolioInfo.mockResolvedValue(result);

      expect(await controller.findOne(1, mockRequest)).toEqual(result);
    });
  });

  describe('getPortfoliosByUserId', () => {
    it('should return portfolios for the user', async () => {
      const result = [{ portfolio_id: 1 }];
      mockService.findByUserId.mockResolvedValue(result);

      expect(await controller.getPortfoliosByUserId(mockRequest)).toEqual(
        result,
      );
    });

    it('should throw NotFoundException on service error', async () => {
      mockService.findByUserId.mockRejectedValue(new Error('Not found'));

      await expect(
        controller.getPortfoliosByUserId(mockRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a portfolio', async () => {
      const dto = { portfolioName: 'Updated' };
      const result = { portfolio_id: 1, ...dto };
      mockService.update.mockResolvedValue(result);

      expect(await controller.update(1, dto, mockRequest)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should delete a portfolio', async () => {
      mockService.remove.mockResolvedValue(true);
      await expect(controller.remove(1, mockRequest)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if portfolio not found', async () => {
      mockService.remove.mockResolvedValue(false);
      await expect(controller.remove(1, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deposit', () => {
    it('should deposit funds into a portfolio', async () => {
      const dto = { depositAmount: 1000 };
      const result = {
        portfolio_id: 1,
        portfolio_name: 'Growth',
        uninvested_cash: 2000,
        total_deposited: 3000,
      };
      mockService.deposit.mockResolvedValue(result);

      const response = await controller.deposit(1, dto, mockRequest);
      expect(response).toEqual({
        message: 'Successfully deposited 1000',
        portfolioId: 1,
        portfolioName: 'Growth',
        currentBalance: 2000,
        totalDeposited: 3000,
      });
    });

    it('should throw BadRequestException on invalid deposit', async () => {
      await expect(
        controller.deposit(1, { depositAmount: -100 }, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('withdraw', () => {
    it('should withdraw funds from a portfolio', async () => {
      const dto = { withdrawAmount: 1000 };
      const result = {
        portfolio_id: 1,
        portfolio_name: 'Growth',
        uninvested_cash: 1500,
      };
      mockService.withdraw.mockResolvedValue(result);

      const response = await controller.withdraw(1, dto, mockRequest);
      expect(response).toEqual({
        message: 'Successfully withdrew 1000',
        portfolioId: 1,
        portfolioName: 'Growth',
        currentBalance: 1500,
      });
    });

    it('should throw BadRequestException on invalid withdraw', async () => {
      await expect(
        controller.withdraw(1, { withdrawAmount: -50 }, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
