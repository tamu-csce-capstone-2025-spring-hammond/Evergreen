import { Module } from '@nestjs/common';
import { TradingService } from './trading.service';
import { PrismaService } from '../prisma.service';
import { AlpacaService } from '../stock-apis/alpaca.service';
import { TradingController } from './trading.controller';

@Module({
  providers: [TradingService, PrismaService, AlpacaService],
  controllers: [TradingController],
})
export class TradingModule {}
