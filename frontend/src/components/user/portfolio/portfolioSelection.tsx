import { useState } from "react";
import Image from "next/image";
import DepositWithdrawModal from "./depositWithdrawModal";

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
}

const PortfolioSelection: React.FC<Portfolio> = ({ card, onDeselectCard }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<"deposit" | "withdraw" | null>(null);

    const handleOpenModal = (type: "deposit" | "withdraw") => {
        setTransactionType(type);
        setIsModalOpen(true);
    };

    const handleConfirm = (amount: number, type: "deposit" | "withdraw") => {
        console.log(`${type} confirmed: $${amount}`);
    };

    return (
        <div className="h-full border-1 rounded-3xl px-8 py-7 flex flex-col items-center" style={{ borderColor: card.color }}>
            {/* Top Section */}
            <div className="w-full flex items-center justify-between relative">
                <button className="text-xl cursor-pointer" onClick={onDeselectCard}>{'<'}</button>
                <h1 className="text-2xl text-center flex-1 absolute left-1/2 -translate-x-1/2">{card.name}</h1>
                <button className="flex items-center gap-1 cursor-pointer">
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
                <button onClick={() => handleOpenModal("deposit")} className="flex-1 py-4 border border-gray-500 text-center cursor-pointer transition-colors duration-300 ease-in-out">
                    Deposit
                </button>
                <button onClick={() => handleOpenModal("withdraw")} className="flex-1 py-4 border border-gray-500 text-center cursor-pointer transition-colors duration-300 ease-in-out">
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
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onConfirm={handleConfirm} 
                type={transactionType as "deposit" | "withdraw"} 
            />
        </div>
    );
};

export default PortfolioSelection;
