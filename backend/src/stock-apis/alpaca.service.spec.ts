import { Test, TestingModule } from '@nestjs/testing';
import { AlpacaService } from './alpaca.service';
import { ConfigService } from '@nestjs/config';

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
    };

    const latestQuote = service.calculateLatestQuote(mockData as any);
    expect(latestQuote).toBe(150);
  });

  it('should return last traded price if latest quote is missing', () => {
    const mockData = {
      latestTrade: { p: 150 },
    };

    const latestQuote = service.calculateLatestQuote(mockData as any);
    expect(latestQuote).toBe(150);
  });

  it('should return null if no latest trade or quote', () => {
    const mockData = {};
    const latestQuote = service.calculateLatestQuote(mockData as any);
    expect(latestQuote).toBeNull();
  });
});
