import PortfolioList from "@/components/user/portfolioList";
import Sidebar from "@/components/user/sidebar";
import Header from "@/components/user/header";

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
      color: "#4CAF50",
      total: 15000.12,
      percent: 2.34,
      startDate: "2021-05-15",
      endDate: "2026-05-15",
      deposited: 1233.00
    },
    {
      name: "Vacation",
      color: "#4CAF50",
      total: 5000.12,
      percent: 3.54,
      startDate: "2022-03-01",
      endDate: "2027-03-01",
      deposited: 123.56
    },
];  

export default function Portfolios() {
  return (
    <div className="flex dark:bg-evergray-700 dark:text-evergray-100 h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Header />
            <div className="flex">
                <div className="p-4 pb-0 space-y-4 flex-2">
                    <div className="px-4 mr-2 pt-4 flex justify-between items-end">
                        <h2 className="text-xl text-evergray-500">Your Portfolios</h2>
                        <button type="button" className="cursor-pointer">Create New <span className="material-symbols-outlined outline-2 -outline-offset-3 aspect-square rounded-md !py-[0.1rem]">add</span></button>
                    </div>
                    <PortfolioList home={false} cards={exampleCards}/>
                </div>
                {/* TODO */}
                <div className="flex-1 pt-8 pr-8 h-full">
                    <div className="h-full border-1 border-evergray-300 rounded-3xl">
                        <h1>asd</h1>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
