"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/user/sidebar";
import PortfolioList from "@/components/user/portfolio/portfolioList";
import Watchlist from "@/components/user/watchlist";
import Chart from "@/components/user/chart";
import News from "@/components/user/news";
import Header from "@/components/user/header";
import { useRouter } from "next/navigation";
import useJwtStore from "@/store/jwtStore";
import { getAllPortfolios, PortfolioCardProps } from "@/components/api/portfolio";

export default function Dashboard() {
  const [portfolios, setPortfolios] = useState<PortfolioCardProps[]>([]);
  const [error, setError] = useState("");
  const { getToken } = useJwtStore();
  const router = useRouter();

  const fetchPortfolios = async () => {
    const token = getToken();
    if (!token) {
      setError("User is not authenticated");
      return;
    }
    try {
      const formattedPortfolios = await getAllPortfolios(token);
      setPortfolios(formattedPortfolios);
    } catch (err: any) {
      console.error("Error fetching portfolios:", err);
      setError(err.message || "An error occurred while fetching portfolios");
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const onClick = (card: PortfolioCardProps) => {
    router.push(`/user/portfolios?portfolioId=${card.portfolioId}`);
  };

  return (
    <div className="flex dark:bg-evergray-700 dark:text-evergray-100 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex-1 grid grid-rows-[450px_1fr] grid-cols-[3fr_2fr] gap-4 p-4 overflow-hidden min-h-">
            <Chart portfolios={portfolios}/>
            <Watchlist />
            <div className="overflow-hidden flex flex-col">
                <h2 className="p-4 text-evergray-500">Portfolios</h2>
                <PortfolioList home={true} cards={portfolios} selectedCardName={undefined} onCardClick={onClick}/>
            </div>
            <News />
        </div>
      </div>
    </div>
  );
}
