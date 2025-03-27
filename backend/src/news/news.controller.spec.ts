import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { JwtGuard } from '../auth/jwt.guard';

describe('NewsController', () => {
  let controller: NewsController;
  let mockNewsService: {
    fetchNews: jest.Mock;
  };

  const mockJWTGuard = {
    canActivate: jest.fn(() => true),
  };
  beforeEach(async () => {
    mockNewsService = {
      fetchNews: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        {
          provide: NewsService,
          useValue: mockNewsService,
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJWTGuard)
      .compile();

    controller = module.get<NewsController>(NewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('news (GET)', () => {
    it('should return news fetched from service', async () => {
      const newsSample = [
        {
          id: 24843171,
          headline:
            'Apple Leader in Phone Sales in China for Second Straight Month in November With 23.6% Share, According to Market Research Data',
          author: 'Charles Gross',
          created_at: '2021-12-31T11:08:42Z',
          updated_at: '2021-12-31T11:08:43Z',
          summary:
            'This headline-only article is meant to show you why a stock is moving, the most difficult aspect of stock trading',
          content:
            '<p>This headline-only article is meant to show you why a stock is moving, the most difficult aspect of stock trading....</p>',
          url: 'https://www.benzinga.com/news/21/12/24843171/apple-leader-in-phone-sales-in-china-for-second-straight-month-in-november-with-23-6-share-according',
          images: [],
          symbols: ['AAPL'],
          source: 'benzinga',
        },
      ];
      mockNewsService.fetchNews.mockResolvedValue(newsSample);

      const result = await controller.getNews();
      expect(result).toEqual(newsSample);
      expect(mockNewsService.fetchNews).toHaveBeenCalled();
    });
  });
});
