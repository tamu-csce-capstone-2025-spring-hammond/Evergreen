"use client";

import { useEffect, useState } from "react";
import useJwtStore from "@/store/jwtStore";
import {
  getAllPortfolios,
  calculatePortfolioStats,
  PortfolioCardProps,
} from "../api/portfolio";

const Header = () => {
  const { getPayload, getToken } = useJwtStore();

  const [name, setName] = useState<string>("");
  const [portfolios, setPortfolios] = useState<PortfolioCardProps[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchedName = getPayload("name");
    if (fetchedName) setName(fetchedName);

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

    fetchPortfolios();
  }, []);

  const {
    netReturn,
    netReturnSymbol,
    feedbackColor,
    totalValue,
  } = calculatePortfolioStats(portfolios);

  return (
    <div className="flex items-center justify-between border-b-2 p-6 pb-5 border-evergray-200 dark:border-evergray-500">
      <h2 className="text-2xl align-middle">
        Total Investments:&nbsp;
        <span className="font-mono text-3xl">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className={`font-mono ${feedbackColor}`}>
          {netReturnSymbol}
          {Math.abs(netReturn).toFixed(2)}%
        </span>
      </h2>
      <div className="flex items-center gap-2">
        <p className="text-2xl">{name || "Loading..."}</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          className="fill-evergray-800 size-8 dark:fill-evergray-100"
        >
          <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Z" />
        </svg>
      </div>
    </div>
  );
};

export default Header;
