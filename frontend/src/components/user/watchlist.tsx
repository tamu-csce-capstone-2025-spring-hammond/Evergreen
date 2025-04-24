// Import necessary hooks and functions
import { useEffect, useState } from "react";
import useJwtStore from "@/store/jwtStore";
import { WatchlistItem, getWatchlist } from "../api/watchlist"; 

const Watchlist = () => {
  // Initialize state to store watchlist data
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  
  // Get the token using the custom hook
  const { getToken } = useJwtStore();

  // Fetch watchlist data when the component mounts
  useEffect(() => {
    fetchWatchlist();
  }, []);
  
  const fetchWatchlist = async () => {
    const token = getToken();
    if (!token) {
      throw new Error("No JWT token");
    }
    const data = await getWatchlist(token);
    setWatchlist(data);
  }

  return (
    <div className="h-full flex flex-col p-4 pb-0">
        <h2 className="text-evergray-500 mb-4">Watchlist</h2>

        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm text-left table-fixed">
                <thead className="bg-evergray-200 text-evergray-700">
                    <tr className="">
                        <th className="px-4 py-3 w-2/5 font-semibold">Symbol</th>
                        <th className="px-2 w-3/10 font-semibold">Last Price</th>
                        <th className="w-3/10 font-semibold">% Change</th>
                    </tr>
                </thead>
            </table>
            </div>

            <div className="overflow-y-auto overflow-x-auto flex-1 border-b-1 border-evergray-200">
            <table className="min-w-full text-sm text-left table-fixed">
                <tbody>
                {watchlist.map((item, index) => (
                    <tr key={index} className="border-b border-evergray-200">
                    <td className="pl-4 py-3 w-2/5">
                        <div className="font-semibold tracking-wider text-evergray-600">{item.ticker}</div>
                        <div className="text-xs text-evergray-500">{item.ticker_name}</div>
                    </td>
                    <td className="text-evergray-500 pl-4 py-3 font-mono text-lg w-3/10">
                        ${item.last_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-lg font-mono w-3/10">
                        {item.day_percent_change >= 0 ? (
                        <span className="text-evergreen-500">▲ {item.day_percent_change.toFixed(2)}%</span>
                        ) : (
                        <span className="text-everred-400">▼ {item.day_percent_change.toFixed(2).slice(1)}%</span>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
    </div>
  );
};

export default Watchlist;
