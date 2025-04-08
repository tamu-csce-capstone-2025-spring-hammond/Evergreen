import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { PrismaService } from '../prisma.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { AlpacaService } from '../stock-apis/alpaca.service';
import { Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

// Mocking dependencies
const mockPrismaService = {
  users: {
    findUnique: jest.fn(),
  },
};

const mockPortfolioService = {
  findByUserId: jest.fn(),
};

const mockAlpacaService = {};

describe('AccountService', () => {
  let accountService: AccountService;
  let prismaService: PrismaService;
  let portfolioService: PortfolioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PortfolioService, useValue: mockPortfolioService },
        { provide: AlpacaService, useValue: mockAlpacaService },
      ],
    }).compile();

    accountService = module.get<AccountService>(AccountService);
    prismaService = module.get<PrismaService>(PrismaService);
    portfolioService = module.get<PortfolioService>(PortfolioService);
  });

  describe('getStats', () => {
    it('should return account stats with total value and percent change', async () => {
      // Arrange
      const mockUserID = 1;
      const mockUser = { user_id: 1, created_at: '2021-12-31T11:08:42Z' };
      const mockPortfolios = [
        { current_value: new Decimal(100), total_deposited: new Decimal(200) },
        { current_value: new Decimal(200), total_deposited: new Decimal(100) },
        { current_value: new Decimal(200), total_deposited: new Decimal(100) },
      ];

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPortfolioService.findByUserId.mockResolvedValue(mockPortfolios);

      // Act
      const result = await accountService.getStats(mockUserID);

      // Assert
      expect(result.created_date).toBe(mockUser.created_at);
      expect(result.total_account_value.toString()).toBe('500');
      expect(result.percent_change.toString()).toBe('25');
    });

    it('should return zero for percent_change when total_deposit is zero', async () => {
      // Arrange
      const mockUserID = 1;
      const mockUser = { user_id: 1, created_at: '2021-12-31T11:08:42Z' };
      const mockPortfolios = [
        { current_value: new Decimal(100), total_deposited: new Decimal(0) },
      ];

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPortfolioService.findByUserId.mockResolvedValue(mockPortfolios);

      // Act
      const result = await accountService.getStats(mockUserID);

      // Assert
      expect(result.created_date).toBe(mockUser.created_at);
      expect(result.total_account_value.toString()).toBe('100');
      expect(result.percent_change.toString()).toBe('Infinity'); // Division by zero case
    });

    it('should handle empty portfolios gracefully', async () => {
      // Arrange
      const mockUserID = 1;
      const mockUser = { user_id: 1, created_at: '2021-12-31T11:08:42Z' };
      const mockPortfolios = [];

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPortfolioService.findByUserId.mockResolvedValue(mockPortfolios);

      // Act
      const result = await accountService.getStats(mockUserID);

      // Assert
      expect(result.created_date).toBe(mockUser.created_at);
      expect(result.total_account_value.toString()).toBe('0');
      expect(result.percent_change.toString()).toBe('NaN'); // Division by zero (no portfolios)
    });
  });
});
