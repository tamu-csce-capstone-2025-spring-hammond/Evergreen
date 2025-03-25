import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { JwtGuard } from '../auth/jwt.guard';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '../error-codes.enum';

describe('WatchlistController', () => {
  let controller: WatchlistController;
  let mockWatchlistService: {
    getWatchlist: jest.Mock;
  };

  const mockJwtGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    mockWatchlistService = {
      getWatchlist: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchlistController],
      providers: [
        {
          provide: WatchlistService,
          useValue: mockWatchlistService,
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .compile();

    controller = module.get<WatchlistController>(WatchlistController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('watchlist (GET)', () => {
    it('should return user watchlist', async () => {
      const mockWatchlist = [
        {
          ticker: 'SPY',
          last_price: 30.33,
          day_percent_change: 3,
          name: 'SPDR S&P 500 ETF Trust',
        },
      ];

      mockWatchlistService.getWatchlist.mockResolvedValue(mockWatchlist);

      const result = await controller.watchlist({ userid: 1 });

      expect(result).toEqual(mockWatchlist);
      expect(mockWatchlistService.getWatchlist).toHaveBeenCalledWith(1);
    });
  });
});
