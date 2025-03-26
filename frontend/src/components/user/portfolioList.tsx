import PortfolioCard from "./portfolioCard";

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
    home: boolean;
    cards: PortfolioCardProps[];
}

const PortfolioList: React.FC<Portfolio> = ({ home, cards }) => {
    return (
      <div className="px-4 flex-1 overflow-y-auto space-y-4">
        {cards.map((card, index) => (
          <PortfolioCard
            key={index}
            name={card.name}
            color={card.color}
            total={card.total}
            percent={card.percent}
            home={home}
            startDate={card.startDate}
            endDate={card.endDate}
            deposited={card.deposited}
          />
        ))}
      </div>
    );
};
  
export default PortfolioList;