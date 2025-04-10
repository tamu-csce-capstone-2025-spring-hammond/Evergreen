"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/user/sidebar";
import PortfolioList from "../../components/user/portfolio/portfolioList";
import Watchlist from "../../components/user/watchlist";
import Chart from "../../components/user/chart";
import News from "../../components/user/news";
import Header from "../../components/user/header";
import { useRouter } from "next/navigation";
import useJwtStore from "@/store/jwtStore";

interface PortfolioCardProps {
  portfolioId: number,
  name: string;
  color: string;
  total: number;
  percent: number;
  startDate: string;
  endDate: string;
  deposited: number;
}

export default function Dashboard() {
  const [portfolios, setPortfolios] = useState<PortfolioCardProps[]>([]);
  const [error, setError] = useState("");
  const { getToken } = useJwtStore();
  const userId = 1;
  const router = useRouter();
  
  const getPortfolios = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = getToken();
    if (!token) {
      setError("User is not authenticated");
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/portfolio`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch portfolios");
      }
  
      const transformed: PortfolioCardProps[] = data.map((item: any) => {
        const deposited = Number(item.total_deposited ?? 0);
        const total = Number(item.current_value ?? 0);
        const amountChange = Number(item.amount_change ?? 0);
        const percent = deposited > 0 ? Number(((amountChange / deposited) * 100).toFixed(2)) : 0;
  
        return {
          portfolioId: item.portfolio_id,
          name: item.portfolio_name,
          color: item.color,
          total,
          percent,
          startDate: new Date(item.created_at).toISOString().split("T")[0],
          endDate: new Date(item.target_date).toISOString().split("T")[0],
          deposited
        };
      });
  
      setPortfolios(transformed);
    } catch (err: any) {
      console.error("Error fetching portfolios:", err);
      setError(err.message || "An error occurred while fetching portfolios");
    }
  };
  
  
  useEffect(() => {
    getPortfolios();
  }, []);

  const onClick = (card: PortfolioCardProps) => {
    router.push(`/user/portfolios?portfolioId=${card.portfolioId}`);
  };

  const exampleCards = portfolios;

  return (
    <div className="flex dark:bg-evergray-700 dark:text-evergray-100 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex-1 grid grid-rows-[5fr_4fr] grid-cols-[3fr_2fr] gap-4 p-4 overflow-hidden">
            <Chart />
            <Watchlist />
            <div className="overflow-hidden flex flex-col">
                <h2 className="p-4 text-evergray-500">Portfolios</h2>
                <PortfolioList home={true} cards={exampleCards} selectedCardName={undefined} onCardClick={onClick}/>
            </div>
            <News />
        </div>
      </div>
    </div>
  );
}