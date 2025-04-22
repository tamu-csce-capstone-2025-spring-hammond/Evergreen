export interface PortfolioCardProps {
    portfolioId: number;
    name: string;
    color: string;
    total: number;
    percent: number;
    startDate: string;
    endDate: string;
    deposited: number;
  }

export interface PortfolioPreviewDto {
  targetDate: Date;
  initial_deposit: number;
  bitcoin_focus: boolean;
  smallcap_focus: boolean;
  value_focus: boolean;
  momentum_focus: boolean;
  risk_aptitude: number;
}

export interface PortfolioDto {
    portfolioName: string;
    color: string;
    createdDate: Date;
    targetDate: Date;
    initial_deposit: number;
    bitcoin_focus?: boolean;
    smallcap_focus?: boolean;
    value_focus?: boolean;
    momentum_focus?: boolean;
    risk_aptitude: number;
  }
  
  export interface UpdatePortfolioDto {
    portfolioName?: string;
    color?: string;
    targetDate?: Date;
    bitcoin_focus?: boolean;
    smallcap_focus?: boolean;
    value_focus?: boolean;
    momentum_focus?: boolean;
  }
  
  export interface DepositDto {
    depositAmount: number;
  }
  
  export interface WithdrawDto {
    withdrawAmount: number;
  }

  export interface PortfolioStats {
    totalDeposited: number;
    totalGained: number;
    totalValue: number;
    netReturn: number;
    netReturnSymbol: string;
    feedbackColor: string;
  }

  export interface InvestmentData {
    label: string;
    value: number;
    color?: string;
  }
  
  export interface CreatePortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (
      name: string,
      deposited_cash: number,
      target_date: string,
      color: string,
      risk_aptitude: number,
      focuses: {
        bitcoin_focus: boolean;
        smallcap_focus: boolean;
        value_focus: boolean;
        momentum_focus: boolean;
      }
    ) => void;
  }

  export interface DepositWithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, type: "deposit" | "withdraw") => void;
    type: "deposit" | "withdraw";
  }

  export interface EditPortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (updatedPortfolio: { name?: string; color?: string; targetDate?: string }) => void;
    onDelete: (portfolioId: number) => void;
    card: PortfolioCardProps;
  }
  
  export interface Portfolio {
    home: boolean;
    cards: PortfolioCardProps[];
    selectedCardName: string | undefined;
    onCardClick?: (card: PortfolioCardProps) => void;
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  
  export const calculatePortfolioStats = (
    portfolios: PortfolioCardProps[]
  ): PortfolioStats => {
    const totalDeposited = portfolios.reduce((sum, card) => sum + card.deposited, 0);
    const totalValue = portfolios.reduce((sum, card) => sum + card.total, 0);
    const totalGained = Number((totalValue - totalDeposited).toFixed(2));
    const netReturn =
      totalDeposited > 0
        ? Number(((totalGained / totalDeposited) * 100).toFixed(2))
        : 0.0;
    const netReturnSymbol = netReturn > 0 ? " ▲ " : netReturn < 0 ? " ▼ " : "";
    const feedbackColor =
      netReturn > 0
        ? "text-evergreen-500"
        : netReturn < 0
        ? "text-everred-500"
        : "text-evergray-500";
  
    return {
      totalDeposited,
      totalGained,
      totalValue,
      netReturn,
      netReturnSymbol,
      feedbackColor,
    };
  };

  const getAuthHeaders = (token: string) => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });
  
  export const createPortfolio = async (token: string, dto: PortfolioDto) => {
    const res = await fetch(`${BACKEND_URL}/portfolio`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to create portfolio");
    return res.json();
  };
  
  export const getPortfolio = async (token: string, id: number) => {
    const res = await fetch(`${BACKEND_URL}/portfolio/${id}`, {
      method: "GET",
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch portfolio");
    return res.json();
  };
  
  export const getAllPortfolios = async (token: string): Promise<PortfolioCardProps[]> => {
    const res = await fetch(`${BACKEND_URL}/portfolio`, {
      method: "GET",
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch portfolios");
  
    const data = await res.json();
  
    return data.map((item: any) => {
      const deposited = Number(item.total_deposited ?? 0);
      const total = Number(item.current_value ?? 0);
      const amountChange = Number(item.amount_change ?? 0);
      const percent = deposited > 0 ? Number(((amountChange / deposited) * 100).toFixed(2)) : 0;
  
      return {
        portfolioId: item.portfolio_id,
        name: item.portfolio_name,
        color: item.color,
        total,
        percent,
        startDate: new Date(item.created_at).toISOString().split("T")[0],
        endDate: new Date(item.target_date).toISOString().split("T")[0],
        deposited,
      } as PortfolioCardProps;
    });
  };
  
  export const updatePortfolio = async (
    token: string,
    id: number,
    dto: UpdatePortfolioDto
  ) => {
    const res = await fetch(`${BACKEND_URL}/portfolio/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to update portfolio");
    return res.json();
  };
  
  export const deletePortfolio = async (token: string, id: number) => {
    const res = await fetch(`${BACKEND_URL}/portfolio/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to delete portfolio");
  };
  
  export const depositToPortfolio = async (
    token: string,
    id: number,
    depositAmount: number
  ) => {
    const res = await fetch(`${BACKEND_URL}/portfolio/${id}/deposit`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ depositAmount }),
    });
    if (!res.ok) throw new Error("Failed to deposit to portfolio");
    return res.json();
  };
  
  export const withdrawFromPortfolio = async (
    token: string,
    id: number,
    withdrawAmount: number
  ) => {
    const res = await fetch(`${BACKEND_URL}/portfolio/${id}/withdraw`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ withdrawAmount }),
    });
    if (!res.ok) throw new Error("Failed to withdraw from portfolio");
    return res.json();
  };
  

  export const previewPortfolio = async (token: string, portfolio: PortfolioPreviewDto) => {
    const res = await fetch(`${BACKEND_URL}/portfolio/preview`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(portfolio),
    });
  
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to preview portfolio: ${res.status} ${errorText}`);
    }
  
    return res.json();
  };
  