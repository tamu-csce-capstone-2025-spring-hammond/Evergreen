"use client"

import { useEffect, useState } from "react";
import DepositWithdrawModal from "./depositWithdrawModal";
import EditPortfolioModal from "./editPortfolioModal";
import useJwtStore from "@/store/jwtStore";
import { useRouter } from "next/navigation";
import PieChart from "@/components/user/pieChart";
import {
  PortfolioCardProps,
  depositToPortfolio,
  withdrawFromPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolio
} from "@/components/api/portfolio";

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
  const { getToken } = useJwtStore();
  const router = useRouter();

  const handleOpenDepositWithdrawModal = (type: "deposit" | "withdraw") => {
    setTransactionType(type);
    setIsDepositWithdrawOpen(true);
  };

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const handleConfirmWitdrawDeposit = async (amount: number, type: "deposit" | "withdraw") => {
    const token = getToken();
    if (!token) return;

    if (type === "withdraw") {
      if (amount > card.total || amount > card.deposited) {
        console.error("Withdrawal amount is too high.");
        return;
      }
    }

    try {
      if (type === "deposit") {
        await depositToPortfolio(token, card.portfolioId, amount);
      } else {
        await withdrawFromPortfolio(token, card.portfolioId, amount);
      }
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
    const token = getToken();
    if (!token) return;

    try {
      await updatePortfolio(token, card.portfolioId, {
        portfolioName: updatedPortfolio.name,
        color: updatedPortfolio.color,
        targetDate: updatedPortfolio.targetDate ? new Date(updatedPortfolio.targetDate) : undefined,
        bitcoin_focus: updatedPortfolio.bitcoin_focus,
        smallcap_focus: updatedPortfolio.smallcap_focus,
        value_focus: updatedPortfolio.value_focus,
        momentum_focus: updatedPortfolio.momentum_focus,
      });
      await refreshPortfolios();
    } catch (error) {
      console.error("Failed to update portfolio:", error);
    }
  };

  const handleDelete = async (portfolioId: number) => {
    const token = getToken();
    if (!token) return;

    try {
      await deletePortfolio(token, portfolioId);
      await refreshPortfolios();
      router.push("/user/portfolios");
    } catch (error) {
      console.error("Failed to delete portfolio:", error);
    }
  };

  useEffect(() => {
    const fetchInvestments = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const data = await getPortfolio(token, card.portfolioId);
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
      <div className="w-full flex items-center justify-between relative">
        <button className="text-xl cursor-pointer hover:bg-evergray-200/90 transition rounded-full px-[9px] pb-[2px]" onClick={onDeselectCard}>{'<'}</button>
        <h1 className="text-2xl text-center flex-1 absolute left-1/2 -translate-x-1/2">{card.name}</h1>
        <button className="flex items-center gap-1 cursor-pointer hover:bg-evergray-200/90 transition py-2 pl-3 pr-2 rounded-lg translate-x-2" onClick={handleOpenEditModal}>
          <span>Edit</span>
          <img src="/editIcon.svg" alt="Edit Icon" className="w-5 h-5" />
        </button>
      </div>

      <div className="my-8 mt-10 font-roboto text-4xl" style={{ color: card.color }}>
        ${card.total.toLocaleString()}
      </div>

      <div className="mt-4 flex gap-4 text-xl w-full button-container text-evergray-700">
        <button onClick={() => handleOpenDepositWithdrawModal("deposit")} className="rounded-lg flex-1 py-4 border border-evergray-500 text-center cursor-pointer transition-colors duration-300 ease-in-out">
          Deposit
        </button>
        <button onClick={() => handleOpenDepositWithdrawModal("withdraw")} className="rounded-lg flex-1 py-4 border border-evergray-500 text-center cursor-pointer transition-colors duration-300 ease-in-out">
          Withdraw
        </button>
      </div>

      <style jsx>{`
        .button-container button:hover {
          background-color: color-mix(in srgb, ${card.color} 20%, transparent 80%);
        }
      `}</style>

      <hr className="w-full my-4 border-gray-300" />

      <div className="w-full flex flex-col items-center justify-around flex-1">
        <h2 className="text-center">Holdings</h2>
        <div className="max-w-3/4 flex-1 max-h-4/5">
          <PieChart data={investmentChartData} showLegend={true} />
        </div>
      </div>

      <DepositWithdrawModal 
        isOpen={isDepositWithdrawOpen} 
        onClose={() => setIsDepositWithdrawOpen(false)} 
        onConfirm={handleConfirmWitdrawDeposit} 
        type={transactionType as "deposit" | "withdraw"} 
      />

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
