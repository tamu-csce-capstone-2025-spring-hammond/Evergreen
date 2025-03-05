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
    addToWatchList: jest.Mock;
    deleteWatchListItem: jest.Mock;
  };

  const mockJwtGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    mockWatchlistService = {
      getWatchlist: jest.fn(),
      addToWatchList: jest.fn(),
      deleteWatchListItem: jest.fn(),
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

  describe('addToWatchlist (POST)', () => {
    it('should successfully add ticker to watchlist', async () => {
      const mockWatchlist = [
        {
          ticker: 'SPY',
          last_price: 30.33,
          day_percent_change: 3,
          name: 'SPDR S&P 500 ETF Trust',
        },
      ];

      mockWatchlistService.addToWatchList.mockResolvedValue(mockWatchlist);

      const result = await controller.addToWatchlist(
        { userid: 1 },
        { ticker: 'SPY' },
      );

      expect(result).toEqual(mockWatchlist);
      expect(mockWatchlistService.addToWatchList).toHaveBeenCalledWith(
        1,
        'SPY',
      );
    });

    it('should handle max watchlist limit error', async () => {
      const error = new Error(ErrorCodes.MAX_WATCHLIST_LIMIT_REACHED);
      mockWatchlistService.addToWatchList.mockRejectedValue(error);

      const result = await controller.addToWatchlist(
        { userid: 1 },
        { ticker: 'SPY' },
      );

      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus() == HttpStatus.BAD_REQUEST);
    });

    it('should handle ticker not found error', async () => {
      const error = new Error(ErrorCodes.TICKER_NOT_FOUND);
      mockWatchlistService.addToWatchList.mockRejectedValue(error);

      const result = await controller.addToWatchlist(
        { userid: 1 },
        { ticker: 'INVALID' },
      );

      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus() == HttpStatus.BAD_REQUEST);
    });
  });

    describe('removeTicker (DELETE)', () => {
      it('should successfully remove ticker from watchlist', async () => {
        mockWatchlistService.deleteWatchListItem.mockResolvedValue(null);

        const result = await controller.removeTicker(
          { userid: 1 },
          { ticker: 'SPY' },
        );

        expect(result).toBeNull();
        expect(mockWatchlistService.deleteWatchListItem).toHaveBeenCalledWith(
          1,
          'SPY',
        );
      });

      it('should handle ticker not found error', async () => {
        const error = new Error(ErrorCodes.TICKER_NOT_FOUND);
        mockWatchlistService.deleteWatchListItem.mockRejectedValue(error);

        const result = await controller.removeTicker(
          { userid: 1 },
          { ticker: 'INVALID' },
        );

        expect(result).toBeInstanceOf(HttpException);
        expect(result.getStatus()).toBe(HttpStatus.NOT_FOUND);
      });

      it('should handle internal server error', async () => {
        const error = new Error('Unexpected error');
        mockWatchlistService.deleteWatchListItem.mockRejectedValue(error);

        const result = await controller.removeTicker(
          { userid: 1 },
          { ticker: 'SPY' },
        );

        expect(result).toBeInstanceOf(HttpException);
        expect(result.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
});
