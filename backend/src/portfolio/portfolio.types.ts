import { Decimal } from '@prisma/client/runtime/library';

export interface PortfolioSummary {
  portfolio_id: number;
  portfolio_name: string;
  created_at: Date;
  target_date: Date;
  uninvested_cash: Decimal;
  current_value: Decimal;
  percent_change: Decimal;
  amount_change: Decimal;
  bitcoin_focus: boolean;
  smallcap_focus: boolean;
  value_focus: boolean;
  momentum_focus: boolean;
  investments: InvestmentOutput[];
}

export interface PortfolioOutput {
  portfolio_id: number;
  portfolio_name: string;
  created_at: Date;
  target_date: Date;
  uninvested_cash: Decimal;
  current_value: Decimal;
  percent_change: Decimal;
  amount_change: Decimal;
  bitcoin_focus: boolean;
  smallcap_focus: boolean;
  value_focus: boolean;
  momentum_focus: boolean;
  investments: InvestmentOutput[];
  performance_graph: GraphPoint[];
  color: string,
  total_deposited: Decimal
}

export interface InvestmentOutput {
  ticker: string;
  name: string;
  quantity_owned: Decimal;
  average_cost_basis: Decimal;
  current_price: Decimal;
  percent_change: Decimal;
}

export interface GraphPoint {
  snapshot_time: Date;
  snapshot_value: Decimal;
}
