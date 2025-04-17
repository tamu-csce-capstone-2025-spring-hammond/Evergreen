import PortfolioCard from "./portfolioCard";
import { PortfolioCardProps } from "@/components/api/portfolio";


interface Portfolio {
  home: boolean;
  cards: PortfolioCardProps[];
  selectedCardName: string | undefined;
  onCardClick?: (card: PortfolioCardProps) => void;
}

  const PortfolioList: React.FC<Portfolio> = ({ home, cards, selectedCardName, onCardClick = () => {} }) => {
    return (
        <div className={`px-4 flex-1 overflow-y-auto space-y-4 h-full ${home ? "pb-4" : "pb-20" }`}>
            {cards && cards.length > 0 ? (
                cards.map((card, index) => (
                    <PortfolioCard
                        key={index}
                        {...card}
                        home={home}
                        selectedCardName={selectedCardName}
                        onClick={onCardClick ? () => onCardClick(card) : undefined}
                    />
                ))
            ) : (
                <p className="text-evergray-400 text-center">No portfolios available to display.</p>
            )}
        </div>
    );
};
  
export default PortfolioList;