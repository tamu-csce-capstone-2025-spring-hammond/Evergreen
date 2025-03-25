import { Test, TestingModule } from '@nestjs/testing';
import { AlpacaService } from './alpaca.service';
import { ConfigModule } from '@nestjs/config';

describe('AlpacaService', () => {
  let service: AlpacaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [AlpacaService],
    }).compile();

    service = module.get<AlpacaService>(AlpacaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('more tests', async () => {
    const data = await service.getTickerValues(['AAPL', 'T']);
    service.processTickerData(data)
  });
});
