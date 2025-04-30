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
    const { latestQuote, latestTrade, dailyBar } = tickerData;
    // if (!latestQuote || !latestQuote.ap || !latestQuote.bp) {
    //   if (!latestTrade) return null;
    //   return latestTrade.p; // Or fallback to last traded price if available
    // }
    console.log("Hello My old Friend")
    return dailyBar.c;
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

  tradeSim = async (portfolio: PortfolioAllocation[], value: Decimal) => {
    const baseUrl = 'https://data.alpaca.markets/v2/stocks/bars/latest';
    const symbols = portfolio.map(({ ticker }) => ticker).join(',');

    const params = new URLSearchParams({
      symbols,
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

    const history = await response.json();
    this.logger.debug(value);

    const investments = await Promise.all(
      portfolio.map(async ({ ticker, percent }) => {
        const bar = history.bars[ticker];
        this.logger.debug(percent, "FML");
        const quantity = value.times(percent.div(100)).dividedBy(bar.c); // use the closing price directly
        this.logger.debug(
          ticker,
          percent,
          value.times(percent.div(100)),
          quantity,
          bar.c,
        );
        this.logger.debug(await this.getTickerName(ticker))
        return {
          ticker,
          ticker_name: await this.getTickerName(ticker),
          quantity: quantity.toDecimalPlaces(6),
          average_cost_basis: Decimal(bar.c).toDecimalPlaces(4),
          last_updated: bar.t,
        };
      }),
    );
    // this.logger.debug(investments);
    return {
      investments: investments,
    };
  };

  backtestSim = async (
    portfolio: investmentAllocation[],
    endingInvestment: Decimal,
    startDate: Date,
    targetDate: Date,
  ): Promise<{
    historical_graph: GraphPoint[];
    future_projections: FutureProjections;
    sharpe_ratio: Decimal;
  }> => {
    const baseUrl = 'https://data.alpaca.markets/v2/stocks/bars';
    const symbols = portfolio.map(({ ticker }) => ticker).join(',');
    const todayDate: Date = new Date(Date.now() - 20 * 60 * 1000);

    const toISOString = (date: Date) => date.toISOString();
    const start = toISOString(startDate);
    const today = toISOString(todayDate);
    const params = new URLSearchParams({
      symbols,
      timeframe: '1Day',
      start,
      end: today,
      limit: '10000',
      adjustment: 'all',
      feed: 'sip',
      sort: 'asc',
    });

    const url = `${baseUrl}?${params.toString()}`;
    this.logger.debug(url);
    const response = await fetch(url, this.options);

    if (!response.ok) {
      this.logger.error(
        `Failed to fetch portfolio history: ${response.statusText}`,
      );
      throw new Error(
        `Alpaca API request failed with status ${await response.body}`,
      );
    }

    const history: AlpacaHistoricalBarsApiResponse = await response.json();
    this.logger.error(portfolio[0].percent_of_portfolio);
    const investments = portfolio.map(({ ticker, percent_of_portfolio }) => {
      const quantity = endingInvestment
        .times(percent_of_portfolio.div(100))
        .dividedBy(history.bars[ticker][history.bars[ticker].length - 1].c);
      return { ticker, quantity };
    });

    const portfolioGraph: GraphPoint[] = [];
    const referenceTicker = investments[0].ticker;
    const barCount = history.bars[referenceTicker]?.length || 0;

    for (let i = 0; i < barCount; i++) {
      let totalValue = Decimal(0);
      for (const { ticker, quantity } of investments) {
        let price = history.bars[ticker][i]?.c;
        // this.logger.fatal(price)
        if (price===undefined){
          price = 0;
          this.logger.fatal("Bad looks")
        }
        totalValue = totalValue.add(quantity.times(price));
      }
      const timestamp = history.bars[referenceTicker][i]?.t;
      portfolioGraph.push({
        snapshot_time: timestamp,
        snapshot_value: totalValue,
      });
    }

    // Compute log returns
    const logReturns: Decimal[] = [];
    for (let i = 1; i < portfolioGraph.length; i++) {
      const prev = portfolioGraph[i - 1].snapshot_value;
      const curr = portfolioGraph[i].snapshot_value;
      const logReturn = Decimal.ln(curr.dividedBy(prev));
      logReturns.push(logReturn);
    }

    // Blended method: long-term + recent (last 30 days)
    const recentReturns = logReturns.slice(-30);
    const longTermReturns = logReturns;

    const meanLong = longTermReturns
      .reduce((acc, r) => acc.plus(r), Decimal(0))
      .dividedBy(longTermReturns.length);
    const stdDevLong = Decimal.sqrt(
      longTermReturns
        .reduce((acc, r) => acc.plus(r.minus(meanLong).pow(2)), Decimal(0))
        .dividedBy(longTermReturns.length),
    );

    const meanRecent = recentReturns
      .reduce((acc, r) => acc.plus(r), Decimal(0))
      .dividedBy(recentReturns.length);
    const stdDevRecent = Decimal.sqrt(
      recentReturns
        .reduce((acc, r) => acc.plus(r.minus(meanRecent).pow(2)), Decimal(0))
        .dividedBy(recentReturns.length),
    );

    const drift = meanLong.times(0.8).plus(meanRecent.times(0.2));
    const volatility = stdDevLong.times(0.8).plus(stdDevRecent.times(0.2));

    const lastValue = portfolioGraph[portfolioGraph.length - 1].snapshot_value;

    this.logger.debug(lastValue);

    // Calculate difference in milliseconds
    const diffInMs: number = targetDate.getTime() - todayDate.getTime();

    // Convert milliseconds to days
    const numDays: number = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const numSimulations = 100;
    const futureSimulations: { id: Decimal; values: number[] }[] = [];

    const fastBoxMuller = (() => {
      let spare: number | null = null;
      return (): number => {
        if (spare !== null) {
          const val = spare;
          spare = null;
          return val;
        }

        let u = 0,
          v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();

        const mag = Math.sqrt(-2.0 * Math.log(u));
        spare = mag * Math.sin(2.0 * Math.PI * v);
        return mag * Math.cos(2.0 * Math.PI * v);
      };
    })();

    const adjustedDrift = drift.toNumber() - volatility.toNumber() ** 2 / 2;
    const vol = volatility.toNumber();

    this.logger.debug(adjustedDrift);
    this.logger.debug(vol);

    for (let sim = 0; sim < numSimulations; sim++) {
      const values: number[] = [];
      let price = lastValue.toNumber();

      for (let day = 0; day < numDays; day++) {
        const z = fastBoxMuller();
        const shock = vol * z;
        price *= Math.exp(adjustedDrift + shock);
        values.push(price);
      }

      futureSimulations.push({ id: Decimal(sim + 1), values });
    }

    // Map to final value with index
    const finalValues = futureSimulations.map((sim, index) => ({
      index,
      finalValue: sim.values[sim.values.length - 1],
    }));

    // Sort by final value
    finalValues.sort((a, b) => a.finalValue - b.finalValue);

    // Find indices for each percentile
    const lowest = finalValues[0].index;
    const highest = finalValues[finalValues.length - 1].index;
    const p25 = finalValues[Math.floor(finalValues.length * 0.25)].index;
    const p50 = finalValues[Math.floor(finalValues.length * 0.5)].index;
    const p75 = finalValues[Math.floor(finalValues.length * 0.75)].index;

    // Extract those simulations
    const representativeLines = [
      { ...futureSimulations[lowest], id: 'Lowest return' },
      { ...futureSimulations[p25], id: '25th percentile return' },
      { ...futureSimulations[p50], id: 'Median return (50th percentile)' },
      { ...futureSimulations[p75], id: '75th percentile return' },
      { ...futureSimulations[highest], id: 'Highest return' },
    ];

    const sharpeRatio = meanLong.dividedBy(stdDevLong).times(Math.sqrt(252)); // daily returns assumed

    return {
      historical_graph: portfolioGraph,
      future_projections: {
        time_interval: 'Years',
        simulations: representativeLines,
      },
      sharpe_ratio: sharpeRatio,
    };
  };
}
