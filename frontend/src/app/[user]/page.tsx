"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/user/sidebar";
import PortfolioList from "../../components/user/portfolio/portfolioList";
import Watchlist from "../../components/user/watchlist";
import Chart from "../../components/user/chart";
import News from "../../components/user/news";
import Header from "../../components/user/header";
import { useRouter } from "next/navigation";

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
  const userId = 1;
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<PortfolioCardProps | undefined>(undefined);
  
  const fetchPortfolios = async (userId: number) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    try {
      const response = await fetch(`${backendUrl}/portfolio/user/${userId}`);
      if (!response.ok) {
        throw new Error(`Error fetching portfolios: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch portfolios:", error);
      return [];
    }
  }
  
  
  useEffect(() => {
    async function getPortfolios() {
      const data = await fetchPortfolios(userId);
      
      const formattedPortfolios: PortfolioCardProps[] = data.map((portfolio: any) => {
        const deposited = parseFloat(portfolio.deposited_cash) || 0;
        const total = parseFloat(portfolio.cash) || 0;
        const percent = deposited > 0 ? ((total - deposited) / deposited) * 100 : 0;

        return {
          portfolioId: portfolio.portfolio_id,
          name: portfolio.portfolio_name,
          color: portfolio.color,
          total,
          percent: Number(percent.toFixed(2)),
          startDate: portfolio.created_at ? new Date(portfolio.created_at).toISOString().split("T")[0] : "",
          endDate: portfolio.target_date ? new Date(portfolio.target_date).toISOString().split("T")[0] : "",
          deposited,
        };
      });

      setPortfolios(formattedPortfolios);
    }
    getPortfolios();
  }, [userId]);

  const onClick = (card: PortfolioCardProps) => {
    console.log("This is the dashboard page, this is the card: " + card);
    setSelectedCard(card);
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
                <PortfolioList home={true} cards={exampleCards} selectedCardName={undefined} onCardClick={onClick}/> {/* TODO: Add the OnClick function here too - send to portfolio page with the clicked portfolio selected */}
            </div>
            <News />
        </div>
      </div>
    </div>
  );
}