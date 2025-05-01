import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NewsService } from './news.service';
import { NewsArticle, NewsResponse } from './news.type';

// Mock the global fetch function
global.fetch = jest.fn() as jest.Mock;

describe('NewsService', () => {
  let service: NewsService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    configService = module.get<ConfigService>(ConfigService);
    jest.clearAllMocks();
  });

  describe('fetchNews', () => {
    it('should fetch news successfully with images', async () => {
      // Mock config values
      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'ALPACA_API_KEY') return 'test-api-key';
        if (key === 'ALPACA_API_SECRET') return 'test-api-secret';
        return null;
      });

      // Mock successful API response
      const mockNewsResponse: NewsResponse = {
        news: [
          {
            id: 1234567,
            headline: 'Tesla Announces Revolutionary New Battery Technology',
            author: 'Jane Smith',
            source: 'Tech Daily',
            summary:
              'Tesla unveiled a new battery technology that promises to increase range by 50% while reducing costs.',
            content:
              "In a surprise announcement today, Tesla CEO Elon Musk revealed the company's latest innovation in battery technology. The new cells, dubbed '4680' for their dimensions, are expected to dramatically improve energy density while reducing production costs by up to 30%. Industry analysts suggest this breakthrough could accelerate the adoption of electric vehicles worldwide by addressing two key consumer concerns: range anxiety and affordability. The company plans to integrate the new batteries into production vehicles starting next quarter.",
            url: 'https://techdaily.com/tesla-new-battery-technology',
            symbols: ['TSLA', 'BYDDY', 'GM'],
            created_at: '2025-04-30T14:30:00Z',
            updated_at: '2025-04-30T16:45:00Z',
            images: [
              {
                url: 'https://techdaily.com/images/tesla-battery-main.jpg',
                size: 'large',
              },
              {
                url: 'https://techdaily.com/images/musk-presentation.jpg',
                size: 'medium',
              },
            ],
          },
          {
            id: 1234568,
            headline: 'Federal Reserve Signals Interest Rate Cut in June',
            author: 'Michael Wong',
            source: 'Financial Times',
            summary:
              'The Federal Reserve indicated it may cut interest rates at its next meeting citing improving inflation data.',
            content:
              "Federal Reserve Chair Jerome Powell hinted strongly at an upcoming interest rate cut during yesterday's press conference, noting that recent inflation data has shown consistent improvement toward the central bank's 2% target. 'If economic data continues on this trajectory, conditions may be appropriate for an adjustment to our policy stance at our June meeting,' Powell stated. Markets reacted positively to the news, with the S&P 500 closing up 1.3% and the 10-year Treasury yield dropping by 7 basis points to 3.82%. Economists from major financial institutions now place the probability of a June rate cut at approximately 85%, up from 60% prior to Powell's remarks.",
            url: 'https://financialtimes.com/fed-signals-rate-cut',
            symbols: ['SPY', 'TLT', 'GLD'],
            created_at: '2025-05-01T09:15:00Z',
            updated_at: '2025-05-01T10:20:00Z',
            images: [],
          },
          {
            id: 1234569,
            headline: "Apple's AI Integration Plans Leak Ahead of WWDC",
            author: 'Sarah Johnson',
            source: 'TechCrunch',
            summary:
              "Details of Apple's AI strategy leaked ahead of developer conference, highlighting partnerships with OpenAI and Google.",
            content:
              "According to sources familiar with the matter, Apple plans to announce major AI integrations across its ecosystem at next month's Worldwide Developers Conference. The company has reportedly been working on partnerships with both OpenAI and Google to bring advanced language model capabilities to iOS, iPadOS, and macOS. The leaks suggest that Siri will receive a substantial upgrade, gaining the ability to understand complex, multi-step instructions and maintain contextual awareness throughout conversations. Additionally, Apple is said to be developing on-device AI features that prioritize user privacy while still offering competitive functionality. The company declined to comment on the rumors, but analysts expect these AI initiatives to be central to Apple's software strategy for the coming year.",
            url: 'https://techcrunch.com/apple-ai-plans-leak',
            symbols: ['AAPL', 'GOOG', 'MSFT'],
            created_at: '2025-04-29T18:45:00Z',
            updated_at: '2025-04-30T08:30:00Z',
            images: [
              {
                url: 'https://techcrunch.com/images/apple-headquarters.jpg',
                size: 'large',
              },
              {
                url: 'https://techcrunch.com/images/siri-interface-mockup.jpg',
                size: 'medium',
              },
              {
                url: 'https://techcrunch.com/images/ai-graphic.jpg',
                size: 'small',
              },
            ],
          },
        ],
        next_page_token: 'eyJwYWdlIjoyLCJsaW1pdCI6MTB9',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockNewsResponse),
      });

      const result = await service.fetchNews();

      expect(fetch).toHaveBeenCalledWith(
        'https://data.alpaca.markets/v1beta1/news?sort=desc&exclude_contentless=true',
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'APCA-API-KEY-ID': 'test-api-key',
            'APCA-API-SECRET-KEY': 'test-api-secret',
          },
        },
      );

      expect(result).toEqual([
        mockNewsResponse.news[0],
        mockNewsResponse.news[2],
      ]);
    });

    //   it('should throw an error when API credentials are missing', async () => {
    //     (configService.get as jest.Mock).mockReturnValue(undefined);

    //     await expect(service.fetchNews()).rejects.toThrow(
    //       'Alpaca API credentials are not configured',
    //     );
    //   });

    //   it('should throw an HttpException when API responds with error status', async () => {
    //     // Mock config values
    //     (configService.get as jest.Mock).mockImplementation((key: string) => {
    //       if (key === 'ALPACA_API_KEY') return 'test-api-key';
    //       if (key === 'ALPACA_API_SECRET') return 'test-api-secret';
    //       return null;
    //     });

    //     // Mock failed API response
    //     (fetch as jest.Mock).mockResolvedValueOnce({
    //       ok: false,
    //       status: 401,
    //       statusText: 'Unauthorized',
    //       json: jest.fn().mockResolvedValue({ error: 'Invalid credentials' }),
    //     });

    //     await expect(service.fetchNews()).rejects.toThrow(HttpException);
    //     await expect(service.fetchNews()).rejects.toMatchObject({
    //       response: {
    //         error: 'Failed to fetch news',
    //         message: { error: 'Invalid credentials' },
    //       },
    //       status: 401,
    //     });
    //   });

    //   it('should throw an HttpException when fetch fails', async () => {
    //     // Mock config values
    //     (configService.get as jest.Mock).mockImplementation((key: string) => {
    //       if (key === 'ALPACA_API_KEY') return 'test-api-key';
    //       if (key === 'ALPACA_API_SECRET') return 'test-api-secret';
    //       return null;
    //     });

    //     // Mock fetch rejection
    //     (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    //     await expect(service.fetchNews()).rejects.toThrow(HttpException);
    //     await expect(service.fetchNews()).rejects.toMatchObject({
    //       response: {
    //         error: 'Failed to fetch news',
    //         message: 'Network error',
    //       },
    //       status: HttpStatus.INTERNAL_SERVER_ERROR,
    //     });
    //   });
    // });

    // describe('filterNewsWithoutImages', () => {
    //   it('should filter out news articles without images', () => {
    //     const testData: NewsResponse = {
    //       news: [
    //         { id: 1, images: [{ url: 'image1.jpg' }] },
    //         { id: 2, images: [] },
    //         { id: 3, images: [{ url: 'image3.jpg' }] },
    //       ],
    //     };

    //     const result = (service as any).filterNewsWithoutImages(testData);
    //     expect(result).toEqual([testData.news[0], testData.news[2]]);
    //   });

    //   it('should return empty array when all articles have no images', () => {
    //     const testData: NewsResponse = {
    //       news: [
    //         { id: 1, images: [] },
    //         { id: 2, images: [] },
    //       ],
    //     };

    //     const result = (service as any).filterNewsWithoutImages(testData);
    //     expect(result).toEqual([]);
    //   });
  });
});
