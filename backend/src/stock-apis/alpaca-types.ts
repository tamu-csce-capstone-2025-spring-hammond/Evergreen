import { IsNumber, IsString, IsArray } from 'class-validator';

export interface BarData {
  c: number; // Close price
  h: number; // High price
  l: number; // Low price
  n: number; // Number of trades
  o: number; // Open price
  t: string; // Timestamp
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
