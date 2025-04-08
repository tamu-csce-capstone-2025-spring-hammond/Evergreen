import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AlpacaSnapshotResponse,
  MarketClockInfo,
  TickerSnapshot,
  AlpacaPortfolioOverview,
} from './alpaca-types';
import { promises } from 'dns';

@Injectable()
export class AlpacaService {
  private options = {};
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ALPACA_API_KEY');
    const apiSecret = this.configService.get<string>('ALPACA_API_SECRET');
    this.options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
      },
    };
  }

  async getTickerValues(tickers: string[]): Promise<AlpacaSnapshotResponse> {
    if (tickers.length === 0) throw new Error('No tickers passed');

    const buildAlpacaSnapshotUrl = (tickers: string[]) => {
      const baseUrl = 'https://data.alpaca.markets/v2/stocks/snapshots';
      const symbolsParam = tickers.join(',');
      return `${baseUrl}?symbols=${encodeURIComponent(symbolsParam)}&feed=delayed_sip`;
    };

    const url = buildAlpacaSnapshotUrl(tickers);

    try {
      const response = await fetch(url, this.options);
      const data: AlpacaSnapshotResponse = await response.json();
      // console.log(data);
      return data;
    } catch (err) {
      console.error('Error fetching ticker values:', err);
      throw err;
    }
  }

  // Example of how to use the types
  // processTickerData(data: AlpacaSnapshotResponse) {
  //   // Now you can safely access ticker data
  //   Object.entries(data).forEach(([ticker, tickerData]) => {
  //     console.log(`Ticker: ${ticker}`);
  //     console.log(`Current Price: ${tickerData.latestTrade.p}`);
  //     console.log(`Daily High: ${tickerData.dailyBar.h}`);
  //   });
  // }
  calculatePercentChange = (tickerData: TickerSnapshot) => {
    const { dailyBar, prevDailyBar } = tickerData;
    const previousClose = prevDailyBar.c;
    const currentClose = dailyBar.c;
    const percentChange =
      ((currentClose - previousClose) / previousClose) * 100;
    return Number(percentChange.toFixed(2));
  };

  getCurrentPortfolioInfo = async (
    tickers: { ticker: string; quantity: number }[],
  ): Promise<AlpacaPortfolioOverview> => {
    const data = await this.getTickerValues(tickers.map((t) => t.ticker));

    const holdings: { [ticker: string]: number } = {};
    let totalValue = 0;

    tickers.forEach(({ ticker, quantity }) => {
      const latestPrice = this.calculateLatestQuote(data[ticker]);
      holdings[ticker] = latestPrice;
      totalValue += latestPrice * quantity;
    });

    return {
      total_portfolio_value: totalValue,
      holdings,
    };
  };

  calculateLatestQuote = (tickerData: TickerSnapshot) => {
    const { latestQuote, latestTrade } = tickerData;
    if (!latestQuote || !latestQuote.ap || !latestQuote.bp) {
      if (!latestTrade) return null;
      return latestTrade.p; // Or fallback to last traded price if available
    }
    return (latestQuote.ap + latestQuote.bp) / 2;
  };

  isTradingOpen = async (): Promise<boolean> => {
    try {
      const output = await fetch(
        'https://paper-api.alpaca.markets/v2/clock',
        this.options,
      );
      const data: MarketClockInfo = await output.json();
      return data.is_open;
    } catch (err) {
      console.error('Error fetching ticker values:', err);
      throw err;
    }
  };
}
