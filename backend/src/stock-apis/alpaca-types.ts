import { Decimal } from '@prisma/client/runtime/library';
import { IsNumber, IsString, IsArray } from 'class-validator';

export interface BarData {
  c: number; // Close price
  h: number; // High price
  l: number; // Low price
  n: number; // Number of trades
  o: number; // Open price
  t: Date; // Timestamp
  v: number; // Volume
  vw: number; // Volume-weighted average price
}

export interface QuoteData {
  ap: number; // Ask price
  as: number; // Ask size
  ax: string; // Ask exchange
  bp: number; // Bid price
  bs: number; // Bid size
  bx: string; // Bid exchange
  c: any[]; // Condition codes
  t: string; // Timestamp
  z: string; // Tape
}

export interface TradeData {
  c: any[]; // Condition codes
  i: number; // Trade ID
  p: number; // Price
  s: number; // Size
  t: string; // Timestamp
  x: string; // Exchange
  z: string; // Tape
}

export interface TickerSnapshot {
  dailyBar: BarData;
  latestQuote: QuoteData;
  latestTrade: TradeData;
  minuteBar: BarData;
  prevDailyBar: BarData;
}

export interface AlpacaSnapshotResponse {
  [ticker: string]: TickerSnapshot;
}

export interface MarketClockInfo {
  timestamp: Date;
  is_open: boolean;
  next_open: Date;
  next_close: Date;
}

export interface AlpacaPortfolioOverview {
  total_portfolio_value: number;
  holdings: { [ticker: string]: number };
}

export interface BacktestResult {
  sharpe_ratio: Decimal;
  omega_ratio: Decimal;
  raw_returns: Decimal;
  annualized_returns: Decimal;
  TSP: Decimal;
  graph: GraphPoint[];
}

export interface GraphPoint {
  snapshot_time: Date;
  snapshot_value: Decimal;
}

export interface historicalTicker {}

export interface HistoricalBars {
  [symbol: string]: BarData[];
}

export interface AlpacaHistoricalBarsApiResponse {
  bars: HistoricalBars;
  next_page_token: string | null;
}

export interface PortfolioAllocation {
  ticker: string;
  percent: Decimal;
}

export interface holdingInfo {
  ticker: string;
  ticker_name: string;
  quantity: Decimal;
  average_cost_basis: Decimal;
  last_updated: Date;
}

export interface trade {
  ticker: string;
  trade_time: Date;
  trade_is_buy: boolean;
  amount_shares_traded: Decimal;
  av_price_paid: Decimal;
}

export interface FutureProjections {
  time_interval: string;
  simulations: { id: string; values: number[] }[];
}
