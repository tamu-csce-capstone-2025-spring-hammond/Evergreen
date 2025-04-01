"use client"

import { useEffect, useState } from "react";
import DepositWithdrawModal from "./depositWithdrawModal";
import EditPortfolioModal from "./editPortfolioModal";

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

const PortfolioSelection: React.FC<Portfolio> = ({ card, onDeselectCard, refreshPortfolios }) => {
    const [isDepositWithdrawOpen, setIsDepositWithdrawOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [transactionType, setTransactionType] = useState<"deposit" | "withdraw" | null>(null);

    const handleOpenDepositWithdrawModal = (type: "deposit" | "withdraw") => {
        setTransactionType(type);
        setIsDepositWithdrawOpen(true);
    };

    const handleOpenEditModal = () => {
        setIsEditModalOpen(true);
    };

    const handleConfirmWitdrawDeposit = async (amount: number, type: "deposit" | "withdraw") => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
        if (!backendUrl) {
            console.error("Backend URL is not defined");
            return;
        }

        if (type === "withdraw" && amount > card.total) {
            console.error("Withdrawal amount exceeds available balance.");
            return;
        }
        if (type === "withdraw" && amount > card.deposited) {
            console.error("Withdrawal amount exceeds deposited amount.");
            return;
        }
        
        console.log("total: " + card.total + " " + type + ": " + amount);
        const updatedCash = type === "deposit" ? card.total + amount : card.total - amount;
        const updatedDeposit = type === "deposit" ? card.deposited + amount : card.deposited - amount;

        console.log("Updated cash: " + updatedCash);

        
        try {
            const response = await fetch(`${backendUrl}/portfolio/${card.portfolioId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ depositedCash: updatedDeposit,cash: updatedCash }),
            });
    
            if (!response.ok) {
                throw new Error(`Error updating portfolio: ${response.statusText}`);
            }
    
            await refreshPortfolios();
    
        } catch (error) {
            console.error("Failed to update portfolio:", error);
        }
    };

    const handleConfirmEdit = async (updatedPortfolio : {name?: string, color?: string, targetDate?: string}) => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        console.log(updatedPortfolio.targetDate);
        if (!backendUrl) {
            console.error("Backend URL is not defined");
            return;
        }
        
        try {
            const response = await fetch(`${backendUrl}/portfolio/${card.portfolioId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ portfolioName: updatedPortfolio.name, color: updatedPortfolio.color, targetDate: updatedPortfolio.targetDate }),
            });
            console.log(response)
            if (!response.ok) {
                throw new Error(`Error updating portfolio: ${response.statusText}`);
            }
    
            await refreshPortfolios();
    
        } catch (error) {
            console.error("Failed to update portfolio:", error);
        }
    };
    

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
            <h2 className="text-center">Holdings</h2>

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
                onDelete={() => setIsEditModalOpen(false)}
            />
        </div>
    );
};

export default PortfolioSelection;
