"use client";

import { useState } from "react";
import PortfolioList from "@/components/user/portfolio/portfolioList";
import Sidebar from "@/components/user/sidebar";
import Header from "@/components/user/header";
import PortfolioSelection from "@/components/user/portfolio/portfolioSelection";
import PieChart from "@/components/user/pieChart";

const exampleCards = [
    {
      name: "Retirement",
      color: "#4CAF50",
      total: 100000.01,
      percent: 5.12,
      startDate: "2020-01-01",
      endDate: "2030-01-01",
      deposited: 123.00
    },
    {
      name: "Emergency",
      color: "#6137CC",
      total: 15000.12,
      percent: 2.34,
      startDate: "2021-05-15",
      endDate: "2026-05-15",
      deposited: 1233.00
    },
    {
      name: "Vacation",
      color: "#EAB813",
      total: 5000.12,
      percent: 3.54,
      startDate: "2022-03-01",
      endDate: "2027-03-01",
      deposited: 123.56
    },
];  

interface PortfolioCardProps {
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

  const totalDeposited = exampleCards.reduce((sum, card) => sum + card.deposited, 0);
  const totalGained = Number(exampleCards.reduce((sum, card) => sum + (card.total - card.deposited), 0).toFixed(2));
  const netReturn = totalDeposited > 0 ? Number(((totalGained / totalDeposited) * 100).toFixed(2)) : 0.00;
  const netReturnSymbol = (netReturn > 0) ? "+" : (netReturn < 0)  ? "-" : "";
  const feedbackColor = (netReturn > 0) ? "text-evergreen-500" : (netReturn < 0)  ? "text-everred-500" : "text-evergray-500";

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
                    <PortfolioList home={false} cards={exampleCards} onCardClick={setSelectedCard} selectedCardName={selectedCard ? selectedCard.name : undefined}/>
                </div>
                <div className="flex-1 pt-8 pr-8 h-full">
                    <div className="h-full border-1 border-evergray-300 rounded-3xl">    
                    {selectedCard ? (
                        <PortfolioSelection card={selectedCard} />
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
