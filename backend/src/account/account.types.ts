import { Decimal } from '@prisma/client/runtime/library';

export interface Stats {
  created_date: Date;
  total_account_value: Decimal;
  percent_change: Decimal;
}

export interface GraphPoint {
  snapshot_time: Date;
  snapshot_value: Decimal;
}
