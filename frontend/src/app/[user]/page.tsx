"use client";

import Sidebar from "../../components/user/sidebar";
import PortfolioCard from "../../components/user/portfolioCard";
import Watchlist from "../../components/user/watchlist";
import Chart from "../../components/user/chart";
import News from "../../components/user/news";
import Header from "../../components/user/header";


export default function Dashboard() {
  return (
    <div className="flex dark:bg-evergray-700 dark:text-evergray-100 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex-1 grid grid-rows-[450px_1fr] grid-cols-[3fr_2fr] gap-4 p-4 overflow-hidden min-h-">
            <Chart />
            <Watchlist />
            <div className="bg-evergray-400 overflow-y-auto">
              <div className="p-4 space-y-4">
                <PortfolioCard name="Retirement" />
                <PortfolioCard name="House" />
                <PortfolioCard name="School"/>
              </div>
            </div>
            <News />
        </div>
      </div>
    </div>
  );
}