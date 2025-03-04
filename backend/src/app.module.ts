import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { WatchlistModule } from './watchlist/watchlist.module';

@Module({
  imports: [AuthModule, ConfigModule.forRoot(), WatchlistModule],
})
export class AppModule {}
