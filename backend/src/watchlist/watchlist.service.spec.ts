import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistService } from './watchlist.service';
import { PrismaService } from '../prisma.service';
import { AlpacaService } from '../stock-apis/alpaca.service';
import { ErrorCodes } from '../error-codes.enum';

describe('WatchlistService', () => {
  let watchlistService: WatchlistService;
  let prismaService: PrismaService;
  let alpacaService: AlpacaService;

  const mockWatchlist = [
    { ticker: 'VTI', ticker_name: 'Total US Stock Market', user_id: 1 },
    { ticker: 'VXUS', ticker_name: 'Total International Stock Market', user_id: 1 },
    { ticker: 'USO', ticker_name: 'US Oil', user_id: 1 },
    { ticker: 'VGT', ticker_name: 'Tech', user_id: 1 },
    { ticker: 'GLD', ticker_name: 'Gold', user_id: 1 },
    { ticker: 'AAPL', ticker_name: 'Apple Inc', user_id: 1 },
    { ticker: 'TSLA', ticker_name: 'Tesla Inc', user_id: 1 },
    { ticker: 'MSFT', ticker_name: 'Microsoft Corp', user_id: 1 },
    { ticker: 'BND', ticker_name: 'Total Bond Market', user_id: 1 },
    { ticker: 'TLT', ticker_name: 'US Treasury', user_id: 1 },
  ];

  const mockStockData = {
    VTI: { latestQuote: { ap: 200, bp: 180 } },
    VXUS: { latestQuote: { ap: 100, bp: 90 } },
    USO: { latestQuote: { ap: 70, bp: 65 } },
    VGT: { latestQuote: { ap: 300, bp: 290 } },
    GLD: { latestQuote: { ap: 180, bp: 175 } },
    AAPL: { latestQuote: { ap: 150, bp: 145 } },
    TSLA: { latestQuote: { ap: 600, bp: 580 } },
    MSFT: { latestQuote: { ap: 280, bp: 275 } },
    BND: { latestQuote: { ap: 85, bp: 82 } },
    TLT: { latestQuote: { ap: 105, bp: 100 } },
  };

  const expectedResult = [
    { ticker: 'VTI', last_price: 190, day_percent_change: 1.23, ticker_name: 'Total US Stock Market' },
    { ticker: 'VXUS', last_price: 95, day_percent_change: 1.23, ticker_name: 'Total International Stock Market' },
    { ticker: 'USO', last_price: 67.5, day_percent_change: 1.23, ticker_name: 'US Oil' },
    { ticker: 'VGT', last_price: 295, day_percent_change: 1.23, ticker_name: 'Tech' },
    { ticker: 'GLD', last_price: 177.5, day_percent_change: 1.23, ticker_name: 'Gold' },
    { ticker: 'AAPL', last_price: 147.5, day_percent_change: 1.23, ticker_name: 'Apple Inc' },
    { ticker: 'TSLA', last_price: 590, day_percent_change: 1.23, ticker_name: 'Tesla Inc' },
    { ticker: 'MSFT', last_price: 277.5, day_percent_change: 1.23, ticker_name: 'Microsoft Corp' },
    { ticker: 'BND', last_price: 83.5, day_percent_change: 1.23, ticker_name: 'Total Bond Market' },
    { ticker: 'TLT', last_price: 102.5, day_percent_change: 1.23, ticker_name: 'US Treasury' },
  ];

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

  it('should return enriched watchlist using mocked Alpaca data', async () => {
    
    prismaService.watchlist.findMany = jest.fn().mockResolvedValue(mockWatchlist);

 
    alpacaService.getTickerValues = jest.fn().mockResolvedValue(mockStockData);
    alpacaService.calculateLatestQuote = jest.fn().mockImplementation(
      (data) => (data.latestQuote.ap + data.latestQuote.bp) / 2
    );
    alpacaService.calculatePercentChange = jest.fn().mockReturnValue(1.23);

   
    const result = await watchlistService.getWatchlist(1);

    
    expect(result).toEqual(expectedResult);
  });
});
