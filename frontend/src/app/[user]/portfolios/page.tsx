"use client";

import { useState, useEffect } from "react";
import PortfolioList from "@/components/user/portfolio/portfolioList";
import Sidebar from "@/components/user/sidebar";
import Header from "@/components/user/header";
import PortfolioSelection from "@/components/user/portfolio/portfolioSelection";
import PieChart from "@/components/user/pieChart";
import { useRouter, useSearchParams } from "next/navigation";
import CreatePortfolioModal from "@/components/user/portfolio/createPortfolioModal";
import useJwtStore from "@/store/jwtStore";
import { 
  PortfolioCardProps, 
  createPortfolio, 
  getAllPortfolios, 
  PortfolioDto,
  calculatePortfolioStats
} from "@/components/api/portfolio";

export default function Portfolios() {
  const [selectedCard, setSelectedCard] = useState<PortfolioCardProps | undefined>(undefined);
  const [portfolios, setPortfolios] = useState<PortfolioCardProps[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState("");
  const { getToken } = useJwtStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const portfolioId = searchParams.get("portfolioId");

  useEffect(() => {
    if (portfolioId) {
      const selectedCard = portfolios.find(
        (card) => card.portfolioId === parseInt(portfolioId)
      );
      setSelectedCard(selectedCard);
    }
  }, [portfolioId, portfolios]);

  const fetchPortfolios = async () => {
    const token = getToken();
    if (!token) {
      setError("User is not authenticated");
      return;
    }
    try {
      const formattedPortfolios = await getAllPortfolios(token);
      setPortfolios(formattedPortfolios);
    } catch (err: any) {
      console.error("Error fetching portfolios:", err);
      setError(err.message || "An error occurred while fetching portfolios");
    }
  };  

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const { totalDeposited, totalGained, netReturn, netReturnSymbol, feedbackColor } = calculatePortfolioStats(portfolios);

  const selectCard = (card: PortfolioCardProps) => {
    router.push(`/user/portfolios?portfolioId=${card.portfolioId}`);
  };
  const deselectCard = () => {
    setSelectedCard(undefined);
    router.push("/user/portfolios");
  };
  const refreshPortfolios = async () => {
    await fetchPortfolios();
  };

  const handleCreatePortfolio = async (
    name: string,
    depositedCash: number,
    targetDate: string,
    color: string,
    riskAptitude: number,
    focuses?: {
      bitcoin_focus?: boolean;
      smallcap_focus?: boolean;
      value_focus?: boolean;
      momentum_focus?: boolean;
    }
  ) => {
    const token = getToken();
    if (!token) {
      console.error("Auth token is missing");
      return;
    }
    const payload: PortfolioDto = {
      portfolioName: name,
      color,
      createdDate: new Date(),
      targetDate: new Date(targetDate),
      initial_deposit: depositedCash,
      risk_aptitude: riskAptitude,
      bitcoin_focus: focuses?.bitcoin_focus ?? false,
      smallcap_focus: focuses?.smallcap_focus ?? false,
      value_focus: focuses?.value_focus ?? false,
      momentum_focus: focuses?.momentum_focus ?? false,
    };
    try {
      await createPortfolio(token, payload);
      setIsModalOpen(false);
      refreshPortfolios();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="flex dark:bg-evergray-700 dark:text-evergray-100 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex h-full pb-12">
          <div className="p-4 pb-0 space-y-4 flex-2">
            <div className="px-4 mr-2 pt-4 flex justify-between items-end">
              <h2 className="text-xl text-evergray-500">Your Portfolios</h2>
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              >
                Create New
                <span className="ml-2 material-symbols-outlined outline-2 -outline-offset-3 aspect-square rounded-md !py-[0.1rem]">
                  add
                </span>
              </button>
            </div>
            <PortfolioList
              home={false}
              cards={portfolios}
              onCardClick={selectCard}
              selectedCardName={selectedCard?.name}
            />
          </div>
          <div className="flex-1 pt-8 pr-8 pb-8 h-full">
            <div className="h-full border-1 border-evergray-300 rounded-3xl mb-4">
              {selectedCard ? (
                <PortfolioSelection
                  card={selectedCard}
                  onDeselectCard={deselectCard}
                  refreshPortfolios={refreshPortfolios}
                />
              ) : (
                <div className="px-8 py-7 flex flex-col h-full justify-between items-center">
                  <h2 className="text-2xl text-center">Total Distribution</h2>
                  <div className="max-w-3/4 flex-1 max-h-1/2">
                    <PieChart portfolios={portfolios} showLegend={false} />
                  </div>
                  <div className="text-evergray-500 text-md space-y-6">
                    <p>
                      Total Deposited:<br />
                      <span className="text-evergray-600 font-roboto text-3xl">
                        ${totalDeposited}
                      </span>
                    </p>
                    <p>
                      Total Gained:<br />
                      <span className={`text-evergray-600 font-roboto text-3xl ${feedbackColor}`}>
                        ${totalGained}
                      </span>
                    </p>
                    <p>
                      Net Return:<br />
                      <span className={`text-evergray-600 font-roboto text-3xl ${feedbackColor}`}>
                        {netReturnSymbol + netReturn}%
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <CreatePortfolioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCreatePortfolio}
      />
    </div>
  );
}
