import { Module } from '@nestjs/common';
import { WatchlistController } from './watchlist.controller';
import { PrismaService } from 'src/prisma.service';
import { WatchlistService } from './watchlist.service';

@Module({
  providers: [PrismaService, WatchlistService],
  controllers: [WatchlistController],
})
export class WatchlistModule {}
