import PortfolioCard from "./portfolioCard";

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
  home: boolean;
  cards: PortfolioCardProps[];
  selectedCardName: string | undefined;
  onCardClick?: (card: PortfolioCardProps) => void;
}

  const PortfolioList: React.FC<Portfolio> = ({ home, cards, selectedCardName, onCardClick = () => {} }) => {
    return (
      <div className="px-4 flex-1 overflow-y-auto space-y-4">
        {cards.map((card, index) => (
          <PortfolioCard
            key={index}
            {...card}
            home={home}
            selectedCardName={selectedCardName}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
          />
        ))}
      </div>
    );
};
  
export default PortfolioList;