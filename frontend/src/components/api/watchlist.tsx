const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface WatchlistItem {
  ticker: string;
  ticker_name: string;
  last_price: number;
  day_percent_change: number;
};

export const getWatchlist = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/watchlist`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!res.ok) throw new Error("Failed to fetch watchlist");
  
      const data = await res.json();
      return data
    } catch (err) {
      console.error("Error fetching watchlist:", err);
    }
  };
  