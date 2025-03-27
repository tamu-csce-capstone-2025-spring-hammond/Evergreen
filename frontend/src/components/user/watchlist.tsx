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
    <div className="p-4 bg-evergray-400">
      <h2 className="text-2xl align-middle">Watchlist</h2>
      <pre>{JSON.stringify(watchlist, null, 2)}</pre>
    </div>
  );
};

export default Watchlist;
