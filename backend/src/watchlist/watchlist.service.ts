import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AlpacaService } from '../stock-apis/alpaca.service';
import { AlpacaSnapshotResponse } from '../stock-apis/alpaca-types';
import { watchlistElementType, RawWatchlistItem } from './watchlist.type'; // Ensure you import the correct types

@Injectable()
export class WatchlistService {
  constructor(
    private prismaService: PrismaService,
    private alpacaService: AlpacaService,
  ) {}

  async getWatchlist(userid: number): Promise<watchlistElementType[]> {
    // Fetch user's watchlist from the database. Use ticker_name correctly.
    const watchlistItems: RawWatchlistItem[] = await this.prismaService.watchlist.findMany({
      where: { user_id: userid },
      select: {
        user_id: true,
        ticker: true,
        ticker_name: true, // Correct field is ticker_name
      },
    });


    // If no watchlist items, return an empty array
    if (watchlistItems.length === 0) {
      return [];
    }

    const tickers = watchlistItems.map((item) => item.ticker);

    // Fetch stock data for all tickers from Alpaca
    let stockData: AlpacaSnapshotResponse;
    try {
      stockData = await this.alpacaService.getTickerValues(tickers);
    } catch (error) {
      throw new Error("Error fetching stock data from Alpaca.");
    }

    // Transform the watchlist items to include the dynamic data (last_price, day_percent_change)
    const enrichedWatchlist: watchlistElementType[] = watchlistItems.map<watchlistElementType>((item) => {
      const tickerData = stockData[item.ticker];

      // Handle case where ticker data might be missing
      if (!tickerData) {
        return {
          ticker: item.ticker,
          last_price: null,
          day_percent_change: null,
          ticker_name: item.ticker_name, // Correct field usage
        };
      }

      return {
        ticker: item.ticker,
        last_price: this.alpacaService.calculateLatestQuote(tickerData),
        day_percent_change: this.alpacaService.calculatePercentChange(tickerData),
        ticker_name: item.ticker_name, // Correct field usage
      };
    });

    return enrichedWatchlist;
  }
}
