import { Test, TestingModule } from '@nestjs/testing';
import { AlpacaService } from './alpaca.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import {
  AlpacaHistoricalBarsApiResponse,
  AlpacaSnapshotResponse,
  BacktestResult,
  PortfolioAllocation,
  TickerSnapshot,
} from './alpaca-types';
import { Decimal } from '@prisma/client/runtime/library';
import { investmentAllocation } from 'src/portfolio/portfolio.types';

global.fetch = jest.fn();

describe('AlpacaService', () => {
  let service: AlpacaService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlpacaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ALPACA_API_KEY') return 'test-api-key';
              if (key === 'ALPACA_API_SECRET') return 'test-api-secret';
              return null;
            }),
          },
        },
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
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AlpacaService>(AlpacaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error if no tickers are passed', async () => {
    await expect(service.getTickerValues([])).rejects.toThrow(
      'No tickers passed',
    );
  });

  it('should fetch ticker values successfully', async () => {
    const mockResponse = {
      AAPL: {
        latestTrade: { p: 150 },
        dailyBar: { h: 155, c: 152 },
        prevDailyBar: { c: 148 },
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await service.getTickerValues(['AAPL']);
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://data.alpaca.markets/v2/stocks/snapshots?symbols=AAPL',
      ),
      expect.objectContaining({
        headers: expect.objectContaining({
          'APCA-API-KEY-ID': 'test-api-key',
          'APCA-API-SECRET-KEY': 'test-api-secret',
        }),
      }),
    );
  });

  it('should calculate percent change correctly', () => {
    const mockData = {
      dailyBar: { c: 152 },
      prevDailyBar: { c: 148 },
    };

    const percentChange = service.calculatePercentChange(mockData as any);
    expect(percentChange).toBeCloseTo(2.7, 1);
  });

  it('should calculate latest quote correctly', () => {
    const mockData = {
      latestQuote: { ap: 151, bp: 149 },
      latestTrade: { p: 150 },
      dailyBar: { c: 149 },
    };

    const latestQuote = service.calculateLatestQuote(mockData as any);
    expect(latestQuote).toBe(149);
  });

  it('should calculate portfolio info correctly in getCurrentPortfolioInfo', async () => {
    const tickers = [
      { ticker: 'AAPL', quantity: 2 },
      { ticker: 'GOOG', quantity: 1 },
    ];

    // const mockTickerValues : AlpacaSnapshotResponse= {
    //   AAPL: { latestTrade: { p: 150 }, latestQuote: { ap: 151, bp: 149 } },
    //   GOOG: { latestTrade: { p: 100 }, latestQuote: { ap: 101, bp: 99 } },
    // };
    const mockAlpacaSnapshotResponse: AlpacaSnapshotResponse = {
      AAPL: {
        dailyBar: {
          c: 182.63, // close
          h: 183.79, // high
          l: 182.54, // low
          n: 123456, // number of trades
          o: 183.02, // open
          t: new Date('2023-05-15T20:00:00Z'), // timestamp
          v: 4567890, // volume
          vw: 182.85, // VWAP
        },
        latestQuote: {
          ap: 182.65, // ask price
          as: 200, // ask size
          ax: 'Q', // ask exchange (NASDAQ)
          bp: 182.6, // bid price
          bs: 300, // bid size
          bx: 'Q', // bid exchange (NASDAQ)
          c: ['R'], // regular trade
          t: '2023-05-15T19:59:59Z',
          z: 'C', // tape C (NASDAQ)
        },
        latestTrade: {
          c: ['@', 'T'], // trade conditions
          i: 123456789, // trade ID
          p: 182.63, // price
          s: 100, // size
          t: '2023-05-15T19:59:58Z',
          x: 'Q', // exchange (NASDAQ)
          z: 'C', // tape C (NASDAQ)
        },
        minuteBar: {
          c: 182.63,
          h: 182.65,
          l: 182.6,
          n: 42,
          o: 182.62,
          t: new Date('2023-05-15T19:59:00Z'),
          v: 1234,
          vw: 182.63,
        },
        prevDailyBar: {
          c: 181.45,
          h: 182.12,
          l: 180.89,
          n: 987654,
          o: 181.2,
          t: new Date('2023-05-14T20:00:00Z'),
          v: 5678901,
          vw: 181.5,
        },
      },
      MSFT: {
        dailyBar: {
          c: 328.39,
          h: 329.45,
          l: 327.12,
          n: 98765,
          o: 328.1,
          t: new Date('2023-05-15T20:00:00Z'),
          v: 3456789,
          vw: 328.25,
        },
        latestQuote: {
          ap: 328.4,
          as: 150,
          ax: 'Q',
          bp: 328.35,
          bs: 250,
          bx: 'Q',
          c: ['R'],
          t: '2023-05-15T19:59:59Z',
          z: 'C',
        },
        latestTrade: {
          c: ['@', 'T'],
          i: 987654321,
          p: 328.39,
          s: 75,
          t: '2023-05-15T19:59:57Z',
          x: 'Q',
          z: 'C',
        },
        minuteBar: {
          c: 328.39,
          h: 328.42,
          l: 328.35,
          n: 35,
          o: 328.4,
          t: new Date('2023-05-15T19:59:00Z'),
          v: 987,
          vw: 328.39,
        },
        prevDailyBar: {
          c: 327.89,
          h: 328.75,
          l: 326.45,
          n: 87654,
          o: 327.5,
          t: new Date('2023-05-14T20:00:00Z'),
          v: 2345678,
          vw: 327.8,
        },
      },
      // Add more tickers as needed
    };

    jest
      .spyOn(service, 'getTickerValues')
      .mockResolvedValue(mockAlpacaSnapshotResponse);
    jest
      .spyOn(service, 'calculateLatestQuote')
      .mockImplementation((data: TickerSnapshot) => 25);

    const result = await service.getCurrentPortfolioInfo(tickers);

    expect(result).toEqual({
      total_portfolio_value: 75,
      holdings: {
        AAPL: 25,
        GOOG: 25,
      },
    });
  });

  it('should return is_open from Alpaca clock in isTradingOpen', async () => {
    const mockClockResponse = { is_open: true };

    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockClockResponse),
    });

    const result = await service.isTradingOpen();

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      'https://paper-api.alpaca.markets/v2/clock',
      expect.any(Object),
    );
  });

  it('should fetch and compute portfolio backtest data correctly', async () => {
    const beginning = new Date('2024-01-01');
    const ending = new Date('2024-01-03');
    const tickers = [
      { ticker: 'AAPL', quantity: new Decimal(2) },
      { ticker: 'GOOG', quantity: new Decimal(1) },
    ];

    const mockResponse = {
      bars: {
        AAPL: [
          { c: 150, t: '2024-01-01T00:00:00Z' },
          { c: 160, t: '2024-01-02T00:00:00Z' },
        ],
        GOOG: [
          { c: 100, t: '2024-01-01T00:00:00Z' },
          { c: 105, t: '2024-01-02T00:00:00Z' },
        ],
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await service.getPortfolioBacktest(
      tickers,
      beginning,
      ending,
    );

    expect(result.graph.length).toBe(2);
    expect(result.graph[0].snapshot_time).toBe('2024-01-01T00:00:00Z');
    expect(result.graph[0].snapshot_value.toNumber()).toBeCloseTo(400);
    expect(result.graph[1].snapshot_value.toNumber()).toBeCloseTo(425);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://data.alpaca.markets/v2/stocks/bars'),
      expect.any(Object),
    );
  });

  it('backtest sim works as intended', async () => {
    const mockPortfolio: investmentAllocation[] = [
      { ticker: 'AAPL', percent_of_portfolio: Decimal(33), name: 'Apple Inc' },
    ];

    const mockResponse = {
      AAPL: {
        latestTrade: { p: 150 },
        dailyBar: { h: 155, c: 152 },
        prevDailyBar: { c: 148 },
      },
    };

    const mockHistoricalBarsResponse: AlpacaHistoricalBarsApiResponse = {
      bars: {
        "AAPL": [
          {
            t: new Date('2025-04-25T09:30:00Z'),
            o: 172.41,
            h: 173.85,
            l: 171.92,
            c: 173.12,
            v: 1524632,
            n: 8532,
            vw: 172.94,
          },
          {
            t: new Date('2025-04-25T10:30:00Z'),
            o: 173.15,
            h: 174.62,
            l: 172.88,
            c: 174.21,
            v: 1378495,
            n: 7845,
            vw: 173.85,
          },
          {
            t: new Date('2025-04-25T11:30:00Z'),
            o: 174.25,
            h: 175.18,
            l: 173.91,
            c: 174.83,
            v: 1264871,
            n: 7124,
            vw: 174.56,
          },
          {
            t: new Date('2025-04-25T12:30:00Z'),
            o: 174.87,
            h: 176.34,
            l: 174.52,
            c: 176.05,
            v: 1583267,
            n: 8912,
            vw: 175.73,
          },
          {
            t: new Date('2025-04-25T13:30:00Z'),
            o: 176.08,
            h: 176.42,
            l: 174.96,
            c: 175.32,
            v: 1429814,
            n: 8038,
            vw: 175.64,
          },
          {
            t: new Date('2025-04-25T14:30:00Z'),
            o: 175.35,
            h: 176.28,
            l: 175.02,
            c: 176.15,
            v: 1687429,
            n: 9483,
            vw: 175.76,
          },
          {
            t: new Date('2025-04-25T15:30:00Z'),
            o: 176.18,
            h: 177.42,
            l: 175.89,
            c: 177.32,
            v: 2154683,
            n: 12134,
            vw: 176.85,
          },
          {
            t: new Date('2025-04-28T09:30:00Z'),
            o: 177.65,
            h: 178.93,
            l: 177.12,
            c: 178.45,
            v: 1876523,
            n: 10528,
            vw: 178.24,
          },
          {
            t: new Date('2025-04-28T10:30:00Z'),
            o: 178.48,
            h: 179.56,
            l: 178.21,
            c: 179.32,
            v: 1621379,
            n: 9125,
            vw: 179.05,
          },
          {
            t: new Date('2025-04-28T11:30:00Z'),
            o: 179.35,
            h: 180.47,
            l: 179.08,
            c: 180.24,
            v: 1785216,
            n: 10092,
            vw: 179.92,
          },
        ],
      },
      next_page_token: 'MTY3MjE1Mzc2MDAwMDAwMDAwMHwxNnxBQVBM',
    };

    const mockResponseAPI = {
      ok: true,
      json: jest.fn().mockResolvedValue(mockHistoricalBarsResponse),
      statusText: 'OK',
      body: 'Success',
    };

    (fetch as jest.Mock).mockResolvedValue(mockResponseAPI);

    const results = await service.backtestSim(
      mockPortfolio,
      Decimal(10000),
      new Date('11-22-2022'),
      new Date('11-22-2032'),
    );
  });
});
