"use client";

import { useState, useEffect, useReducer } from "react";
import PortfolioList from "@/components/user/portfolio/portfolioList";
import Sidebar from "@/components/user/sidebar";
import Header from "@/components/user/header";
import PortfolioSelection from "@/components/user/portfolio/portfolioSelection";
import PieChart from "@/components/user/pieChart";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function Portfolios() {
  const [selectedCard, setSelectedCard] = useState<PortfolioCardProps | undefined>(undefined);
  const [portfolios, setPortfolios] = useState<PortfolioCardProps[]>([]);
  const userId = 1;
  const router = useRouter();
  const searchParams = useSearchParams();
  const portfolioId = searchParams.get("portfolioId");

  useEffect(() => {
    if (portfolioId) {
      const selectedCard = portfolios.find((card) => card.portfolioId === parseInt(portfolioId));
      setSelectedCard(selectedCard);
    }
  }, [portfolioId, portfolios]);

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

  const exampleCards = portfolios;
  console.log(exampleCards);
  const totalDeposited = exampleCards.reduce((sum, card) => sum + card.deposited, 0);
  const totalGained = Number(exampleCards.reduce((sum, card) => sum + (card.total - card.deposited), 0).toFixed(2));
  const netReturn = totalDeposited > 0 ? Number(((totalGained / totalDeposited) * 100).toFixed(2)) : 0.00;
  const netReturnSymbol = (netReturn > 0) ? "+" : (netReturn < 0)  ? "-" : "";
  const feedbackColor = (netReturn > 0) ? "text-evergreen-500" : (netReturn < 0)  ? "text-everred-500" : "text-evergray-500";

  const selectCard = (card: PortfolioCardProps) => {
    router.push(`/user/portfolios?portfolioId=${card.portfolioId}`);
  }
  const deselectCard = () => {
    setSelectedCard(undefined);
    router.push('/user/portfolios');
  };

  return (
    <div className="flex dark:bg-evergray-700 dark:text-evergray-100 h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Header />
            <div className="flex h-full pb-8">
                <div className="p-4 pb-0 space-y-4 flex-2">
                    <div className="px-4 mr-2 pt-4 flex justify-between items-end">
                        <h2 className="text-xl text-evergray-500">Your Portfolios</h2>
                        <button type="button" className="cursor-pointer">Create New <span className="ml-2 material-symbols-outlined outline-2 -outline-offset-3 aspect-square rounded-md !py-[0.1rem]">add</span></button>
                    </div>
                    <PortfolioList home={false} cards={exampleCards} onCardClick={selectCard} selectedCardName={selectedCard ? selectedCard.name : undefined}/>
                </div>
                <div className="flex-1 pt-8 pr-8 h-full">
                    <div className="h-full border-1 border-evergray-300 rounded-3xl">    
                    {selectedCard ? (
                        <PortfolioSelection card={selectedCard} onDeselectCard={deselectCard} />
                    ) : (
                        <div className="px-8 py-7 flex flex-col h-full justify-between items-center">
                            <h2 className="text-2xl text-center">Total Distribution</h2>
                            <div className="w-3/4"><PieChart/></div>
                            <div className="text-evergray-500 text-md space-y-6">
                                <p>Total Deposited:<br></br><span className="text-evergray-600 font-roboto text-3xl">${totalDeposited}</span></p>
                                <p>Total Gained:<br></br><span className={`text-evergray-600 font-roboto text-3xl ${feedbackColor}`}>${totalGained}</span></p>
                                <p>Net Return:<br></br><span className={`text-evergray-600 font-roboto text-3xl ${feedbackColor}`}>{netReturnSymbol + netReturn}%</span></p>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
