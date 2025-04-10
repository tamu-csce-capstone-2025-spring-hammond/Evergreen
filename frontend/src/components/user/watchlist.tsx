// Import necessary hooks and functions
import { useEffect, useState } from "react";
import useJwtStore from "@/store/jwtStore";

type WatchlistItem = {
  ticker: string;
  name: string;
  last_price: number;
  day_percent_change: number;
};

const Watchlist = () => {
  // Initialize state to store watchlist data
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  
  // Get the token using the custom hook
  const { getToken } = useJwtStore();

  // Fetch watchlist data when the component mounts
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    fetch(`${backendUrl}/watchlist`, {
      headers: {
        Authorization: `Bearer ${getToken()}`, // Send the token in the Authorization header
      },
    })
      .then((res) => {
        console.log("Response status:", res.status);
        if (!res.ok) throw new Error("Unauthorized or error fetching");
        return res.json();
      })
      .then((data) => {
        console.log("Watchlist data:", data);
        setWatchlist(data); // Store the fetched data in the state
      })
      .catch((err) => console.error("Fetch error:", err)); // Catch and log errors
  }, [getToken]); // Re-run the effect if the token changes

  return (
    <div className="h-full flex flex-col bg-evergray-400 rounded-xl p-4">
      <h2 className="text-2xl font-semibold mb-4">Watchlist</h2>

      <div className="flex-1 overflow-y-auto border border-gray-300 rounded-md scrollbar-clean">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-evergray-600 text-white">
            <tr className="border-b border-gray-300">
              <th className="px-4 py-2">Symbol</th>
              <th className="px-4 py-2">Last Price</th>
              <th className="px-4 py-2">% Change</th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-4 py-2">
                  <div className="font-semibold">{item.ticker}</div>
                  <div className="text-xs">{item.name}</div>
                </td>
                <td className="px-4 py-2">${item.last_price.toFixed(2)}</td>
                <td className="px-4 py-2 font-medium">
                  {item.day_percent_change >= 0 ? (
                    <span className="text-green-600">▲ {item.day_percent_change.toFixed(2)}%</span>
                  ) : (
                    <span className="text-red-500">▼ {item.day_percent_change.toFixed(2)}%</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Watchlist;
