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
  
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  
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
  
  export const getAllPortfolios = async (token: string) => {
    const res = await fetch(`${BACKEND_URL}/portfolio`, {
      method: "GET",
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch portfolios");
    return res.json();
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
  