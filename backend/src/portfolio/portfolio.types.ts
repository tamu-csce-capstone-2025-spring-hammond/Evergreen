interface Portfolio {
  portfolio_id: number;
  user_id: number;
  portfolio_name: string;
  created_at: string; // ISO date string
  target_date: string; // ISO date string
  risk_aptitude: number | null;
  uninvested_cash: string;
  current_value: number;
  percent_change: number;
  amount_change: number;
  investments: Investment[];
  performance_graph: GraphPoint[];
}

interface Investment {
  ticker: string;
  name: string;
  quantity_owned: number;
  average_cost_basis: number;
  current_price: number;
  percent_change: number;
}

interface GraphPoint {
    
}
