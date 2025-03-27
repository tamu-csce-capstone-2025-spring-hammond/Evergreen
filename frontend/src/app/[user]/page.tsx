"use client";


import Sidebar from "../../components/user/sidebar";
import PortfolioList from "../../components/user/portfolioList";
import Watchlist from "../../components/user/watchlist";
import Chart from "../../components/user/chart";
import News from "../../components/user/news";
import Header from "../../components/user/header";

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

export default function Dashboard() {
  return (
    <div className="flex dark:bg-evergray-700 dark:text-evergray-100 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex-1 grid grid-rows-[5fr_4fr] grid-cols-[3fr_2fr] gap-4 p-4 overflow-hidden">
            <Chart />
            <Watchlist />
            <div className="overflow-hidden flex flex-col">
                <h2 className="p-4 text-evergray-500">Portfolios</h2>
                <PortfolioList home={true} cards={exampleCards} />
            </div>
            <News />
        </div>
      </div>
    </div>
  );
}