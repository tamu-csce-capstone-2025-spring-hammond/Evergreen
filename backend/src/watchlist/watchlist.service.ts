import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AlpacaService } from 'src/stock-apis/alpaca.service';
import { AlpacaSnapshotResponse } from 'src/stock-apis/alpaca-types';

@Injectable()
export class WatchlistService {
  constructor(
    private prismaService: PrismaService,
    private alpacaService: AlpacaService,
  ) {}

  async getWatchlist(userid: number) {
    // Fetch user's watchlist from database
    const watchlistItems = await this.prismaService.watchlist.findMany({
      where: { user_id: userid },
    });

    // If no watchlist items, return empty array
    if (watchlistItems.length === 0) {
      return [];
    }
    const tickers = watchlistItems.map((item) => item.ticker);

    // Fetch stock data for all tickers
    const stockData = await this.alpacaService.getTickerValues(tickers);

    // Transform watchlist with stock data
    const enrichedWatchlist = watchlistItems.map((item) => {
      const tickerData = stockData[item.ticker];

      // Handle case where ticker data might be missing
      if (!tickerData) {
        return {
          ticker: item.ticker,
          last_price: null,
          day_percent_change: null,
          name: item.name,
        };
      }

      return {
        ticker: item.ticker,
        last_price: tickerData.latestTrade.p,
        day_percent_change:
          this.alpacaService.calculatePercentChange(tickerData),
        name: item.name,
      };
    });

    return enrichedWatchlist;
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

  processTickerData(data: AlpacaSnapshotResponse) {
    // Now you can safely access ticker data
    Object.entries(data).forEach(([ticker, tickerData]) => {
      console.log(`Ticker: ${ticker}`);
      console.log(`Current Price: ${tickerData.latestTrade.p}`);
      console.log(`Daily High: ${tickerData.dailyBar.h}`);
    });
  }
}
