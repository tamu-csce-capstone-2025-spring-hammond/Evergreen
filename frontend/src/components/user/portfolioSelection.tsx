import Image from "next/image";

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

const PortfolioSelcetion: React.FC<Portfolio> = ({ card }) => {
    return (
        <div
            className="h-full border-1 rounded-3xl px-8 py-7 flex flex-col items-center"
            style={{ borderColor: card.color }}
        >
            {/* Top Section*/}
            <div className="w-full flex items-center justify-between relative">
                <button className="text-xl cursor-pointer">{'<'}</button> {/* TODO: Make this btn clear the current selection */}
                <h1 className="text-2xl text-center flex-1 absolute left-1/2 -translate-x-1/2">{card.name}</h1>
                <button className="flex items-center gap-1 cursor-pointer">
                    <span>Edit</span>
                    <img src="/editIcon.svg" alt="Edit Icon" className="w-5 h-5" />
                </button>
            </div>

            {/* Card total */}
            <div
                className="my-8 mt-10 font-mono text-4xl"
                style={{ color: card.color }}
            >
                ${card.total.toLocaleString()}
            </div>

            {/* Deposit and Withdraw */}
            <div className="mt-4 flex gap-4 text-xl w-full">
                <button className="flex-1 py-4 border border-gray-500 text-center cursor-pointer">Deposit</button>
                <button className="flex-1 py-4 border border-gray-500 text-center cursor-pointer">Withdraw</button>
            </div>


            {/* Divider line */}
            <hr className="w-full my-4 border-gray-300" />

            {/* Holdings title */}
            <h2 className="text-center">Holdings</h2>
        </div>
    );
};

export default PortfolioSelcetion;

