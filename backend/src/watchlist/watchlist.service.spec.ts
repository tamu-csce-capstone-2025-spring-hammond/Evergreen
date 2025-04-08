import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistService } from './watchlist.service';
import { PrismaService } from '../prisma.service';
import { AlpacaService } from '../stock-apis/alpaca.service';
import { ErrorCodes } from '../error-codes.enum';

describe('WatchlistService', () => {
  let watchlistService: WatchlistService;
  let prismaService: PrismaService;
  let alpacaService: AlpacaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        {
          provide: PrismaService,
          useValue: {
            watchlist: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: AlpacaService,
          useValue: {
            getTickerValues: jest.fn(),
            calculateLatestQuote: jest.fn(),
            calculatePercentChange: jest.fn(),
          },
        },
      ],
    }).compile();

    watchlistService = module.get<WatchlistService>(WatchlistService);
    prismaService = module.get<PrismaService>(PrismaService);
    alpacaService = module.get<AlpacaService>(AlpacaService);
  });

  it('should return an empty array if user has no watchlist', async () => {
    prismaService.watchlist.findMany = jest.fn().mockResolvedValue([]);
    const result = await watchlistService.getWatchlist(1);
    expect(result).toEqual([]);
  });

  it('should return enriched watchlist when stock data is available', async () => {
    prismaService.watchlist.findMany = jest.fn().mockResolvedValue([
      { ticker: 'AAPL', ticker_name: 'Apple Inc.', user_id: 1 },
      { ticker: 'MSFT', ticker_name: 'Microsoft Corp.', user_id: 1 },
    ]);
    
    alpacaService.getTickerValues = jest.fn().mockResolvedValue({
      AAPL: { latestQuote: { ap: 150, bp: 148 } },
      MSFT: { latestQuote: { ap: 300, bp: 298 } },
    });
    
    alpacaService.calculateLatestQuote = jest.fn()
      .mockImplementation((data) => (data.latestQuote.ap + data.latestQuote.bp) / 2);
    
    alpacaService.calculatePercentChange = jest.fn().mockReturnValue(1.5);
    
    const result = await watchlistService.getWatchlist(1);

    expect(result).toEqual([
      { ticker: 'AAPL', last_price: 149, day_percent_change: 1.5, name: 'Apple Inc.' },
      { ticker: 'MSFT', last_price: 299, day_percent_change: 1.5, name: 'Microsoft Corp.' },
    ]);
  });

  it('should return watchlist with null values if stock data is missing', async () => {
    prismaService.watchlist.findMany = jest.fn().mockResolvedValue([
      { ticker: 'GOOG', ticker_name: 'Alphabet Inc.', user_id: 1 },
    ]);
    
    alpacaService.getTickerValues = jest.fn().mockResolvedValue({}); // No data returned
    
    const result = await watchlistService.getWatchlist(1);
    expect(result).toEqual([
      { ticker: 'GOOG', last_price: null, day_percent_change: null, name: 'Alphabet Inc.' },
    ]);
  });

  it('should throw an error if Alpaca API fails', async () => {
    prismaService.watchlist.findMany = jest.fn().mockResolvedValue([
      { ticker: 'TSLA', ticker_name: 'Tesla Inc.', user_id: 1 },
    ]);
    
    alpacaService.getTickerValues = jest.fn().mockRejectedValue(new Error('API Error'));
    
    await expect(watchlistService.getWatchlist(1)).rejects.toThrow(ErrorCodes.EXTERNAL_API_FAILURE);
  });
});
