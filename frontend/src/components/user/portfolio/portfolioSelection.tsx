import { useState } from "react";
import Image from "next/image";
import DepositWithdrawModal from "./depositWithdrawModal";

interface PortfolioCardProps {
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
}

const PortfolioSelection: React.FC<Portfolio> = ({ card }) => {
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
        <div className="h-full border-1 rounded-3xl p-6 flex flex-col items-center" style={{ borderColor: card.color }}>
            {/* Top Section */}
            <div className="w-full flex items-center justify-between">
                <button className="text-xl cursor-pointer">{'<'}</button>
                <h1 className="text-lg font-medium text-center flex-1">{card.name}</h1>
                <button className="flex items-center gap-1 cursor-pointer">
                    <span>Edit</span>
                    <img src="/editIcon.svg" alt="Edit Icon" className="w-5 h-5" />
                </button>
            </div>

            {/* Card total */}
            <div className="mt-4 font-mono text-[48px] font-normal" style={{ color: card.color }}>
                ${card.total.toLocaleString()}
            </div>

            {/* Deposit and Withdraw */}
            <div className="mt-4 flex gap-10 text-[28px] w-full">
                <button onClick={() => handleOpenModal("deposit")} className="flex-1 py-2 border border-gray-500 text-center cursor-pointer transition-colors duration-300 ease-in-out">
                    Deposit
                </button>
                <button onClick={() => handleOpenModal("withdraw")} className="flex-1 py-2 border border-gray-500 text-center cursor-pointer transition-colors duration-300 ease-in-out">
                    Withdraw
                </button>
            </div>

            <style jsx>{`
                button:hover {
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
