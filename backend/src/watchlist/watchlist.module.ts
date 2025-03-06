import { Module } from '@nestjs/common';
import { WatchlistController } from './watchlist.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [PrismaService],
  controllers: [WatchlistController],
})
export class WatchlistModule {}
