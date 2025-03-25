import { Module } from '@nestjs/common';
import { WatchlistController } from './watchlist.controller';
import { PrismaService } from '../prisma.service';
import { WatchlistService } from './watchlist.service';
import { StockApisModule } from 'src/stock-apis/stock-apis.module';
import { AlpacaService } from 'src/stock-apis/alpaca.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [PrismaService, WatchlistService, AlpacaService],
  controllers: [WatchlistController],
  imports: [
    StockApisModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class WatchlistModule {}
