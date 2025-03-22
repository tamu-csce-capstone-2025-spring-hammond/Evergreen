import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { ConfigService } from '@nestjs/config';

describe('NewsService', () => {
  let service: NewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mockValue'),
          },
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
