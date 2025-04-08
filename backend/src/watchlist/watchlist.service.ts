import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AlpacaService } from '../stock-apis/alpaca.service';
import { AlpacaSnapshotResponse } from '../stock-apis/alpaca-types';
import { ErrorCodes } from '../error-codes.enum';
import { error } from 'console';

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
    let stockData: AlpacaSnapshotResponse;
    try {
      stockData = await this.alpacaService.getTickerValues(tickers);
    } catch (error) {
      throw new Error(ErrorCodes.EXTERNAL_API_FAILURE);
    }
    // Transform watchlist with stock data
    const enrichedWatchlist = watchlistItems.map((item) => {
      const tickerData = stockData[item.ticker];

      // Handle case where ticker data might be missing
      if (!tickerData) {
        return {
          ticker: item.ticker,
          last_price: null,
          day_percent_change: null,
          name: item.ticker_name,
        };
      }

      return {
        ticker: item.ticker,
        last_price: this.alpacaService.calculateLatestQuote(tickerData),
        day_percent_change:
          this.alpacaService.calculatePercentChange(tickerData),
        name: item.ticker_name,
      };
    });

    return enrichedWatchlist;
  }
}
