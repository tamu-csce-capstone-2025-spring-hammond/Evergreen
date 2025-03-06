import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
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
        name: element.name,
      };
    });
    // console.log(watchlist);
    return watchlist;
  }

  async addToWatchList(userid: number, ticker: string) {
    const watchlistCount = await this.prismaService.watchlist.count();
    console.log(watchlistCount);
    try {
      const watchlistEntry = await this.prismaService.watchlist.create({
        data: {
          user_id: userid,
          ticker: ticker,
          name: 'Company Name',
        },
      });
      return watchlistEntry;
    } catch (error) {
      throw error;
    }
  }

  async deleteWatchListItem(userid: number, ticker: string) {}
}
