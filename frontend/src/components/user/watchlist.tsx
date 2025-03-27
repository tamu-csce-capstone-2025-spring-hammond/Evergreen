"use client";
console.log("Watchlist loaded")
import { useEffect, useState } from "react";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
    console.log("JWT:", process.env.NEXT_PUBLIC_JWT);
    console.log("API:", process.env.NEXT_PUBLIC_BACKEND_URL);


  useEffect(() => {
    const rawToken = process.env.NEXT_PUBLIC_JWT;
    const token = rawToken?.replace(/^"(.*)"$/, "$1");
    console.log("Using token:", token);

    fetch("http://localhost:4000/watchlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          console.log("Response status:", res.status); // 👈 Step 2
          if (!res.ok) throw new Error("Unauthorized or error fetching");
          return res.json();
        })
        .then((data) => {
          console.log("Watchlist data:", data); // 👈 Step 3
          setWatchlist(data);
        })
        .catch((err) => console.error("Fetch error:", err)); // 👈 Step 4
    }, []);

    return (
        <div className="p-4 bg-evergray-400 rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">Watchlist</h2>
    
          {watchlist.length === 0 ? (
            <p className="text-gray-500">No items in watchlist.</p>
          ) : (
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="px-4 py-2">Ticker</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Last Price</th>
                  <th className="px-4 py-2">% Change</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-4 py-2 font-semibold">{item.ticker}</td>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">${item.last_price.toFixed(2)}</td>
                    <td
                      className={`px-4 py-2 ${
                        item.day_percent_change >= 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {item.day_percent_change.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
};

export default Watchlist;
