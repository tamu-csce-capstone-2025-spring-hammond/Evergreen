interface Portfolio {
    name: string;
  }

const PortfolioCard: React.FC<Portfolio> = ({ name }) => {
    return (
      <div className="p-4">
        <h3 className="text-lg">{name}</h3>
      </div>
    );
  };
  
  export default PortfolioCard;
  