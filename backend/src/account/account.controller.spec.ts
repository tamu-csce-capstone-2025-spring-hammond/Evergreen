import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { JwtGuard } from '../auth/jwt.guard';
import { HttpStatus } from '@nestjs/common';
// Mocking the AccountService and JwtGuard
const mockAccountService = {
  getStats: jest.fn(),
};

const mockJwtGuard = {
  canActivate: jest.fn(() => true), // mock that JwtGuard allows the request
};

describe('AccountController', () => {
  let accountController: AccountController;
  let accountService: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [{ provide: AccountService, useValue: mockAccountService }],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    accountController = module.get<AccountController>(AccountController);
    accountService = module.get<AccountService>(AccountService);
  });

  describe('getStats', () => {
    it('should return account stats successfully when a valid JWT token is provided', async () => {
      // Arrange
      const mockUserId = 1;
      const mockStats = {
        account_creation_date: '2021-12-31T11:08:42Z',
        total_account_value: 123456,
        percent_change: 23.34,
      };
      mockAccountService.getStats.mockResolvedValue(mockStats);

      // Act
      const result = await accountController.getStats({ userid: mockUserId });

      // Assert
      expect(result).toEqual(mockStats);
      expect(mockAccountService.getStats).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw UnauthorizedException if JWT token is invalid', async () => {
      // Arrange
      mockJwtGuard.canActivate = jest.fn(() => false); // simulate invalid JWT

      // Act & Assert
      try {
        await accountController.getStats({ userid: 1 });
      } catch (e) {
        expect(e.response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(e.response.message).toBe('Invalid Bearer Token');
      }
    });
  });
});
