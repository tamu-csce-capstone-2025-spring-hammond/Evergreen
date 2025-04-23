"use client"

import { useEffect, useState } from "react";
import DepositWithdrawModal from "./depositWithdrawModal";
import EditPortfolioModal from "./editPortfolioModal";
import useJwtStore from "@/store/jwtStore";
import { useRouter } from "next/navigation";
import PieChart from "@/components/user/pieChart";

interface PortfolioCardProps {
    portfolioId: number;
    name: string;
    color: string;
    total: number;
    percent: number;
    startDate: string;
    endDate: string;
    deposited: number;
}

interface Portfolio {
    card: PortfolioCardProps;
    onDeselectCard: () => void;
    refreshPortfolios: () => void;
}

interface Investment {
    ticker: string;
    name: string;
    quantity_owned: string;
    average_cost_basis: string;
    current_price: string;
    percent_change: string;
  }

const PortfolioSelection: React.FC<Portfolio> = ({ card, onDeselectCard, refreshPortfolios }) => {
    const [isDepositWithdrawOpen, setIsDepositWithdrawOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<"deposit" | "withdraw" | null>(null);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const { getToken } = useJwtStore()
    const router = useRouter();

    const handleOpenDepositWithdrawModal = (type: "deposit" | "withdraw") => {
        setTransactionType(type);
        setIsDepositWithdrawOpen(true);
    };

    const handleOpenEditModal = () => {
        setIsEditModalOpen(true);
    };

    const handleConfirmWitdrawDeposit = async (amount: number, type: "deposit" | "withdraw") => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const token = getToken();
        if (!backendUrl) {
          console.error("Backend URL is not defined");
          return;
        }
      
        if (type === "withdraw") {
          if (amount > card.total) {
            console.error("Withdrawal amount exceeds available balance.");
            return;
          }
          if (amount > card.deposited) {
            console.error("Withdrawal amount exceeds deposited amount.");
            return;
          }
        }
      
        try {
          const endpoint = `${backendUrl}/portfolio/${card.portfolioId}/${type}`;
          const body = type === "deposit"
            ? { depositAmount: amount }
            : { withdrawAmount: amount };
      
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            console.error(`Error during ${type}:`, errorData.message || response.statusText);
            return;
          }
      
          const result = await response.json();
          console.log(`${type} successful:`, result);
      
          await refreshPortfolios();
      
        } catch (error) {
          console.error(`Failed to process ${type}:`, error);
        }
      };
      

      const handleConfirmEdit = async (updatedPortfolio: {
        name?: string;
        color?: string;
        targetDate?: string;
        bitcoin_focus?: boolean;
        smallcap_focus?: boolean;
        value_focus?: boolean;
        momentum_focus?: boolean;
      }) => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const token = getToken();
      
        if (!backendUrl) {
          console.error("Backend URL is not defined");
          return;
        }
      
        if (!token) {
          console.error("Auth token missing");
          return;
        }
      
        try {
          const response = await fetch(`${backendUrl}/portfolio/${card.portfolioId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              portfolioName: updatedPortfolio.name,
              color: updatedPortfolio.color,
              targetDate: updatedPortfolio.targetDate ? new Date(updatedPortfolio.targetDate) : undefined,
              bitcoin_focus: updatedPortfolio.bitcoin_focus,
              smallcap_focus: updatedPortfolio.smallcap_focus,
              value_focus: updatedPortfolio.value_focus,
              momentum_focus: updatedPortfolio.momentum_focus,
            }),
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error updating portfolio:", errorData.message || response.statusText);
            return;
          }
      
          const updated = await response.json();
          console.log("Updated portfolio:", updated);
      
          await refreshPortfolios();
      
        } catch (error) {
          console.error("Failed to update portfolio:", error);
        }
      };
      
    
      const handleDelete = async (portfolioId: number) => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const token = getToken();
      
        if (!backendUrl) {
          console.error("Backend URL is not defined");
          return;
        }
      
        if (!token) {
          console.error("Auth token is missing");
          return;
        }
      
        try {
          const response = await fetch(`${backendUrl}/portfolio/${portfolioId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
      
          if (!response.ok) {
            throw new Error(`Error deleting portfolio: ${response.statusText}`);
          }
      
          await refreshPortfolios();
        } catch (error) {
          console.error("Failed to delete portfolio:", error);
        }
        router.push('/user/portfolios');
      };

      useEffect(() => {
        const fetchInvestments = async () => {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
          const token = getToken();
      
          if (!token || !backendUrl) return;
      
          try {
            const response = await fetch(`${backendUrl}/portfolio/${card.portfolioId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
      
            const data = await response.json();
            if (data.investments) {
              setInvestments(data.investments);
            }
          } catch (err) {
            console.error("Error fetching investments", err);
          }
        };
      
        fetchInvestments();
      }, [card.portfolioId]);
      
      const investmentChartData = investments.map((inv) => {
        const value = parseFloat(inv.current_price) * parseFloat(inv.quantity_owned);
        return {
          label: inv.ticker,
          value: parseFloat(value.toFixed(2)),
        };
      });
    

    return (
        <div className="h-full border-1 rounded-3xl px-8 py-7 flex flex-col items-center" style={{ borderColor: card.color }}>
            {/* Top Section */}
            <div className="w-full flex items-center justify-between relative">
                <button className="text-xl cursor-pointer" onClick={onDeselectCard}>{'<'}</button>
                <h1 className="text-2xl text-center flex-1 absolute left-1/2 -translate-x-1/2">{card.name}</h1>
                <button className="flex items-center gap-1 cursor-pointer" onClick={() => handleOpenEditModal()}>
                    <span>Edit</span>
                    <img src="/editIcon.svg" alt="Edit Icon" className="w-5 h-5" />
                </button>
            </div>

            {/* Card total */}
            <div className="my-8 mt-10 font-roboto text-4xl" style={{ color: card.color }}>
                ${card.total.toLocaleString()}
            </div>

            {/* Deposit and Withdraw */}
            <div className="mt-4 flex gap-4 text-xl w-full button-container">
                <button onClick={() => handleOpenDepositWithdrawModal("deposit")} className="flex-1 py-4 border border-gray-500 text-center cursor-pointer transition-colors duration-300 ease-in-out">
                    Deposit
                </button>
                <button onClick={() => handleOpenDepositWithdrawModal("withdraw")} className="flex-1 py-4 border border-gray-500 text-center cursor-pointer transition-colors duration-300 ease-in-out">
                    Withdraw
                </button>
            </div>

            <style jsx>{`
                .button-container button:hover {
                    background-color: ${card.color};
                    color: white;
                }
            `}</style>

            {/* Divider line */}
            <hr className="w-full my-4 border-gray-300" />

            {/* Holdings title */}
            <div className="w-full flex flex-col items-center justify-around flex-1">
                <h2 className="text-center">Holdings</h2>
                <div className="max-w-3/4 flex-1 max-h-4/5">
                    <PieChart data={investmentChartData} showLegend={true} />
                </div>
            </div>

            {/* Deposit/Withdraw Modal */}
            <DepositWithdrawModal 
                isOpen={isDepositWithdrawOpen} 
                onClose={() => setIsDepositWithdrawOpen(false)} 
                onConfirm={handleConfirmWitdrawDeposit} 
                type={transactionType as "deposit" | "withdraw"} 
            />

            {/* Edit Portfolio Modal */}
            <EditPortfolioModal
                card={card}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onConfirm={handleConfirmEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default PortfolioSelection;
