import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlpacaSnapshotResponse, TickerSnapshot } from './alpaca-types';

@Injectable()
export class AlpacaService {
  constructor(private configService: ConfigService) {}

  async getTickerValues(tickers: string[]): Promise<AlpacaSnapshotResponse> {
    if (tickers.length === 0) throw new Error('No tickers passed');

    const apiKey = this.configService.get<string>('ALPACA_API_KEY');
    const apiSecret = this.configService.get<string>('ALPACA_API_SECRET');

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
      },
    };

    const buildAlpacaSnapshotUrl = (tickers: string[]) => {
      const baseUrl = 'https://data.alpaca.markets/v2/stocks/snapshots';
      const symbolsParam = tickers.join(',');
      return `${baseUrl}?symbols=${encodeURIComponent(symbolsParam)}&feed=delayed_sip`;
    };

    const url = buildAlpacaSnapshotUrl(tickers);

    try {
      const response = await fetch(url, options);
      const data: AlpacaSnapshotResponse = await response.json();
      console.log(data);
      return data;
    } catch (err) {
      console.error('Error fetching ticker values:', err);
      throw err;
    }
  }

  // Example of how to use the types
  processTickerData(data: AlpacaSnapshotResponse) {
    // Now you can safely access ticker data
    Object.entries(data).forEach(([ticker, tickerData]) => {
      console.log(`Ticker: ${ticker}`);
      console.log(`Current Price: ${tickerData.latestTrade.p}`);
      console.log(`Daily High: ${tickerData.dailyBar.h}`);
    });
  }
  calculatePercentChange = (tickerData: TickerSnapshot) => {
    const { dailyBar, prevDailyBar } = tickerData;
    const previousClose = prevDailyBar.c;
    const currentClose = dailyBar.c;
    const percentChange =
      ((currentClose - previousClose) / previousClose) * 100;
    return Number(percentChange.toFixed(2));
  };
}
