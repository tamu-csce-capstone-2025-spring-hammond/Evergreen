import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { PrismaService } from '../prisma.service';
import { PortfolioService } from 'src/portfolio/portfolio.service';
import { AlpacaService } from 'src/stock-apis/alpaca.service';
@Module({
  providers: [AccountService, PrismaService, PortfolioService, AlpacaService],
  controllers: [AccountController],
})
export class AccountModule {}
