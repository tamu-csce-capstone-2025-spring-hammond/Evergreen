import Sidebar from "../../components/user/sidebar";
import PortfolioCard from "../../components/user/portfolioCard";
import Watchlist from "../../components/user/watchlist";
import Chart from "../../components/user/chart";
import News from "../../components/user/news";
import Header from "../../components/user/header";


export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header/>
        <div className="flex-1 grid grid-rows-[5fr_4fr] grid-cols-[3fr_2fr] gap-4">
            <Chart />
            <Watchlist />
            <div className="p-4 bg-evergray-400">
              <PortfolioCard name="Retirement" />
              <PortfolioCard name="House" />
              <PortfolioCard name="School"/>
            </div>
            <News />
        </div>
      </div>
    </div>
  );
}
