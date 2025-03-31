import { Decimal } from '@prisma/client/runtime/library';

export interface PortfolioType {
  portfolio_id: number;
  portfolio_name: string;
  created_at: Date; // ISO date string
  target_date: Date; // ISO date string
  //   risk_aptitude: number | null;
  uninvested_cash: Decimal;
  current_value: Decimal;
  percent_change: Decimal;
  amount_change: Decimal;
  investments: Investment[];
  performance_graph: GraphPoint[];
}

export interface Investment {
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

/**
 *     "snapshot_time": "2023-01-03T05:00:00Z",
        "snapshot_value": 1242.79,
 */
