import { Controller, Get, Logger } from '@nestjs/common';
import { TradingService } from './trading.service';

@Controller('trading')
export class TradingController {
  private readonly logger = new Logger(TradingController.name);

  constructor(private readonly tradingService: TradingService) {}

  @Get('test')
  async test123() {
    this.logger.log('Testing...');
    await this.tradingService.setupForTesting()
    this.tradingService.handleQueue();
    return 'LMAO';
  }
}
