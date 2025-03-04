import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { watchlistElementType } from './watchlist.type';

@Injectable()
export class WatchlistService {
  constructor(private prismaService: PrismaService) {}

  async getWatchlist(userid: number) {
    const watchlistRaw = await this.prismaService.watchlist.findMany({
      where: { user_id: userid },
    });
    const watchlist = watchlistRaw.map((element) => {
      return {
        ticker: element.ticker,
        last_price: 30.33,
        day_percent_change: 3,
        name: 'Company Name',
      };
    });
    // console.log(watchlist);
    return watchlist;
  }

  async addToWatchList(userid: number, ticker: string) {
    
  }
}
