import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AlpacaSnapshotResponse,
  MarketClockInfo,
  TickerSnapshot,
  AlpacaPortfolioOverview,
  AlpacaHistoricalBarsApiResponse,
  BacktestResult,
  GraphPoint,
  PortfolioAllocation,
  holdingInfo,
  trade,
  FutureProjections,
} from './alpaca-types';
import { promises } from 'dns';
import { Decimal } from '@prisma/client/runtime/library';
import { investmentAllocation } from 'src/portfolio/portfolio.types';

@Injectable()
export class AlpacaService {
  private options = {};
  private logger = new Logger(AlpacaService.name);
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

  getPortfolioBacktest = async (
    tickers: { ticker: string; quantity: Decimal }[],
    beginning: Date,
    ending: Date = new Date(Date.now() - 15 * 60 * 1000),
  ): Promise<BacktestResult> => {
    const baseUrl = 'https://data.alpaca.markets/v2/stocks/bars';
    const symbols = tickers.map(({ ticker }) => ticker).join(',');

    const toISOString = (date: Date) => date.toISOString();
    const start = toISOString(beginning);
    const end = toISOString(ending);

    const params = new URLSearchParams({
      symbols,
      timeframe: '1Day',
      start,
      end,
      limit: '10000',
      adjustment: 'all',
      feed: 'sip',
      sort: 'asc',
    });

    const url = `${baseUrl}?${params.toString()}`;
    const response = await fetch(url, this.options);

    if (!response.ok) {
      this.logger.error(
        `Failed to fetch portfolio history: ${response.statusText}`,
      );
      throw new Error(
        `Alpaca API request failed with status ${response.status}`,
      );
    }

    const history: AlpacaHistoricalBarsApiResponse = await response.json();

    const portfolioGraph: GraphPoint[] = [];

    const referenceTicker = tickers[0].ticker;
    const barCount = history.bars[referenceTicker]?.length || 0;

    for (let i = 0; i < barCount; i++) {
      let totalValue = Decimal(0);

      for (const { ticker, quantity } of tickers) {
        const price = history.bars[ticker][i]?.c;
        totalValue = totalValue.add(quantity.times(price));
      }

      const timestamp = history.bars[referenceTicker][i]?.t;

      portfolioGraph.push({
        snapshot_time: timestamp,
        snapshot_value: totalValue,
      });
    }

    return {
      sharpe_ratio: Decimal(0),
      omega_ratio: Decimal(0),
      raw_returns: Decimal(0),
      annualized_returns: Decimal(0),
      TSP: Decimal(0),
      graph: portfolioGraph,
    };
  };

  getTickerName = async (ticker: string) => {
    return fetch(
      `https://paper-api.alpaca.markets/v2/assets/${ticker}`,
      this.options,
    )
      .then((res) => res.json())
      .then((res) => res.name)
      .catch((err) => console.error(err));
  };

  seedSim = async (
    portfolio: PortfolioAllocation[],
    initialInvestment: Decimal,
    startDate: Date,
    endDate: Date = new Date(Date.now() - 15 * 60 * 1000),
  ): Promise<{
    backtestResult: BacktestResult;
    investments: holdingInfo[];
    trades: trade[];
  }> => {
    const baseUrl = 'https://data.alpaca.markets/v2/stocks/bars';
    const symbols = portfolio.map(({ ticker }) => ticker).join(',');

    const toISOString = (date: Date) => date.toISOString();
    const start = toISOString(startDate);
    const end = toISOString(
      new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    );
    const params = new URLSearchParams({
      symbols,
      timeframe: '1Day',
      start,
      end,
      limit: '400',
      adjustment: 'all',
      feed: 'sip',
      sort: 'asc',
    });

    const url = `${baseUrl}?${params.toString()}`;
    const response = await fetch(url, this.options);

    if (!response.ok) {
      this.logger.error(
        `Failed to fetch portfolio history: ${response.statusText}`,
      );
      throw new Error(
        `Alpaca API request failed with status ${response.status}`,
      );
    }

    const history: AlpacaHistoricalBarsApiResponse = await response.json();
    // this.logger.debug(history.bars);
    const investments = await Promise.all(
      portfolio.map(async ({ ticker, percent }) => {
        const quantity = initialInvestment
          .times(percent)
          .dividedBy(history.bars[ticker][0].c);

        return {
          ticker,
          ticker_name: await this.getTickerName(ticker),
          quantity,
          average_cost_basis: Decimal(history.bars[ticker][0].c),
          last_updated: history.bars[ticker][0].t,
        };
      }),
    );
    const trades: trade[] = investments.map(
      ({ ticker, quantity, average_cost_basis, last_updated }) => {
        return {
          ticker,
          trade_time: last_updated,
          trade_is_buy: true,
          amount_shares_traded: quantity,
          av_price_paid: average_cost_basis,
        };
      },
    );
    return {
      backtestResult: await this.getPortfolioBacktest(
        investments,
        startDate,
        endDate,
      ),
      investments: investments,
      trades,
    };
  };

  backtestSim = async (
    portfolio: investmentAllocation[],
    endingInvestment: Decimal,
    startDate: Date,
    endDate: Date = new Date(Date.now() - 15 * 60 * 1000),
  ): Promise<{
    historical_graph: GraphPoint[];
    future_projections: FutureProjections;
    sharpe_ratio: Decimal;
  }> => {
    const baseUrl = 'https://data.alpaca.markets/v2/stocks/bars';
    const symbols = portfolio.map(({ ticker }) => ticker).join(',');

    const toISOString = (date: Date) => date.toISOString();
    const start = toISOString(startDate);
    const end = toISOString(
      new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000),
    );
    const params = new URLSearchParams({
      symbols,
      timeframe: '1Day',
      start,
      end,
      limit: '10000',
      adjustment: 'all',
      feed: 'sip',
      sort: 'asc',
    });

    const url = `${baseUrl}?${params.toString()}`;
    const response = await fetch(url, this.options);

    if (!response.ok) {
      this.logger.error(
        `Failed to fetch portfolio history: ${response.statusText}`,
      );
      throw new Error(
        `Alpaca API request failed with status ${response.status}`,
      );
    }

    const history: AlpacaHistoricalBarsApiResponse = await response.json();
    const investments = portfolio.map(({ ticker, percent_of_portfolio }) => {
      const quantity = endingInvestment
        .times(percent_of_portfolio)
        .dividedBy(history.bars[ticker][history.bars[ticker].length - 1].c);
      return {
        ticker,
        quantity,
      };
    });
    const portfolioGraph: GraphPoint[] = [];

    const referenceTicker = investments[0].ticker;
    const barCount = history.bars[referenceTicker]?.length || 0;

    for (let i = 0; i < barCount; i++) {
      let totalValue = Decimal(0);

      for (const { ticker, quantity } of investments) {
        const price = history.bars[ticker][i]?.c;
        totalValue = totalValue.add(quantity.times(price));
      }

      const timestamp = history.bars[referenceTicker][i]?.t;

      portfolioGraph.push({
        snapshot_time: timestamp,
        snapshot_value: totalValue,
      });
    }

    return {
      historical_graph: portfolioGraph,
      future_projections: {
        time_interval: 'Days',
        simulations: [{ id: Decimal(1), values: [] }],
      },
      sharpe_ratio: Decimal(2),
    };
  };
}
