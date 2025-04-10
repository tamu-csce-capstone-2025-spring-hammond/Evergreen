// RawWatchlistItem: Fetched from Prisma
export type RawWatchlistItem = {
  user_id: number;
  ticker: string;
  ticker_name: string; // This should match the field in your database
};

// watchlistElementType: Enriched data with dynamic values
export type watchlistElementType = {
  ticker: string;
  last_price: number | null;
  day_percent_change: number | null;
  ticker_name: string; // This matches the DB field
};
