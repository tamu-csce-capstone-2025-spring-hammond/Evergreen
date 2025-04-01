"use client"

import { useState } from "react";

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
interface EditPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onDelete: (portfolioId: number) => void
  card: PortfolioCardProps
}

const CreatePortfolioModal: React.FC<EditPortfolioModalProps> = ({ isOpen, onClose, onConfirm, onDelete, card }) => {


  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center backdrop-blur bg-opacity-1 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-lg w-96"
        onClick={(e) => e.stopPropagation()}
      >
        
      </div>
    </div>
  );
};

export default CreatePortfolioModal;
