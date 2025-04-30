import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { WatchlistModule } from './watchlist/watchlist.module';
import { StockApisModule } from './stock-apis/stock-apis.module';
import { NewsModule } from './news/news.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AccountModule } from './account/account.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WatchlistModule,
    StockApisModule,
    NewsModule,
    PortfolioModule,
    AccountModule,
  ],
})
export class AppModule {}
