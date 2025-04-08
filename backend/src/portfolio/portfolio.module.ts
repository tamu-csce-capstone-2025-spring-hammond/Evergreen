import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { PrismaService } from '../prisma.service';
import { AlpacaService } from 'src/stock-apis/alpaca.service';

@Module({
  controllers: [PortfolioController],
  providers: [PortfolioService, PrismaService, AlpacaService],
})
export class PortfolioModule {}
