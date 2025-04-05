"use client";

import { useState, useEffect, useReducer } from "react";
import PortfolioList from "@/components/user/portfolio/portfolioList";
import Sidebar from "@/components/user/sidebar";
import Header from "@/components/user/header";
import PortfolioSelection from "@/components/user/portfolio/portfolioSelection";
import PieChart from "@/components/user/pieChart";
import { useRouter, useSearchParams } from "next/navigation";
import CreatePortfolioModal from "@/components/user/portfolio/createPortfolioModal";
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

interface PortfolioResponse {
  portfolio_id: number,
  portfolio_name: string,
  created_at: Date,
  target_date: Date,
  color: string,
  total_deposited: string,
  uninvested_cash: string
}

export default function Portfolios() {
  const [selectedCard, setSelectedCard] = useState<PortfolioCardProps | undefined>(undefined);
  const [portfolios, setPortfolios] = useState<PortfolioCardProps[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [portfolioIds, setPortfolioIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const { getToken } = useJwtStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const portfolioId = searchParams.get("portfolioId");

  useEffect(() => {
    if (portfolioId) {
      const selectedCard = portfolios.find((card) => card.portfolioId === parseInt(portfolioId));
      setSelectedCard(selectedCard);
    }
  }, [portfolioId, portfolios]);

  const fetchPortfolios = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = getToken();

    try {
      const response = await fetch(`${backendUrl}/portfolio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching portfolios: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch portfolios:", error);
      return [];
    }
  }

  const getPortfolios = async () => {
    if (!portfolioIds) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = getToken();
  
    try {
      console.log("inside try statement")
      const portfolioFetches = portfolioIds.map(async (id) => {
        console.log("inside the portfolio fetches call")
        const res = await fetch(`${backendUrl}/portfolio/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!res.ok) {
          throw new Error(`Failed to fetch portfolio ${id}: ${res.statusText}`);
        }

        return await res.json();
      });
      
      const fullPortfolios = await Promise.all(portfolioFetches);

      const formattedPortfolios: PortfolioCardProps[] = fullPortfolios.map((portfolio: any) => ({
        portfolioId: portfolio.portfolio_id,
        name: portfolio.portfolio_name,
        color: portfolio.color || "#000000",
        total: Number(portfolio.current_value),
        percent: Number(portfolio.percent_change),
        startDate: new Date(portfolio.created_at).toISOString().split("T")[0],
        endDate: new Date(portfolio.target_date).toISOString().split("T")[0],
        deposited: Number(portfolio.amount_change) 
          ? Number(portfolio.current_value) - Number(portfolio.amount_change)
          : 0,
      }));
  
      setPortfolios(formattedPortfolios);
    } catch (error) {
      console.error("Error fetching full portfolio data:", error);
    }
  };
  

  const getPortfolioIds = async () => {
    const data = await fetchPortfolios();
    const portfolioIds: number[] = data.map((portfolio: PortfolioResponse) => {
      return(portfolio.portfolio_id);
    })
    setPortfolioIds(portfolioIds);
  };
  
  useEffect(() => {
    getPortfolioIds();
    getPortfolios();
  }, []);

  // console.log("Here are the portfolios ids: " + portfolioIds)
  const exampleCards = portfolios;
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

  const refreshPortfolios = async () => {
    await getPortfolios();
};

const handleCreatePortfolio = async (name: string, depositedCash: number, targetDate: string, color: string, riskAptitude: number) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const payload = {
    portfolio_name: name,
    color: color,
    target_date: new Date(targetDate).toISOString().split("T")[0],
    cash: Number(depositedCash), 
    deposited_cash: Number(depositedCash),
    risk_aptitude: riskAptitude,
  };

  try {
    console.log("Sending data:", JSON.stringify(payload));
    const response = await fetch(`${backendUrl}/portfolio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    console.log("Finish fetch")
    const responseData = await response.json();
    console.log("Got response data: " + JSON.stringify(responseData))
    if (!response.ok) {
      throw new Error(responseData.message || "Portfolio creation failed");
    }

    console.log("Portfolio created successfully", responseData);
  } catch (error: any) {
    setError(error.message);
  }
  setIsModalOpen(false);
  refreshPortfolios();
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
                        <button 
                        type="button" 
                        className="cursor-pointer"
                        onClick={() => {setIsModalOpen(true);}}
                        >
                          Create New <span className="ml-2 material-symbols-outlined outline-2 -outline-offset-3 aspect-square rounded-md !py-[0.1rem]">add</span></button>
                    </div>
                    <PortfolioList home={false} cards={exampleCards} onCardClick={selectCard} selectedCardName={selectedCard ? selectedCard.name : undefined}/>
                </div>
                <div className="flex-1 pt-8 pr-8 h-full">
                    <div className="h-full border-1 border-evergray-300 rounded-3xl">    
                    {selectedCard ? (
                        <PortfolioSelection card={selectedCard} onDeselectCard={deselectCard} refreshPortfolios={refreshPortfolios} />
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
        <CreatePortfolioModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleCreatePortfolio} />
    </div>
  );
}
