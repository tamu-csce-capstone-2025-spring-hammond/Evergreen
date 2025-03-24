import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { WatchlistModule } from './watchlist/watchlist.module';
import { NewsModule } from './news/news.module';
import { PortfolioModule } from './portfolio/portfolio.module'

@Module({
  imports: [AuthModule, ConfigModule.forRoot(), WatchlistModule, NewsModule, PortfolioModule],
})
export class AppModule {}
