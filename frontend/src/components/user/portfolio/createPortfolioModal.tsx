"use client"

import { useState } from "react";

interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deposited_cash: number, target_date: string, color: string, risk_aptitude: number) => void;
}

const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [depositedCash, setDepositedCash] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState<string>("");
  const [color, setColor] = useState<string>("#000000");
  const [riskAptitude, setRiskAptitude] = useState<number>(3);

  const [errors, setErrors] = useState<{ depositedCash?: string; targetDate?: string }>({});

  const clearModal = () => {
    setDepositedCash(null);
    setTargetDate("");
    setColor("#000000");
    setRiskAptitude(3);
    setErrors({});
  };

  const onSubmit = () => {
    const newErrors: { depositedCash?: string; targetDate?: string } = {};
    
    if (depositedCash === null || depositedCash <= 0) {
      newErrors.depositedCash = "Initial deposit is required and must be greater than 0.";
    }
    
    if (!targetDate) {
      newErrors.targetDate = "Target date is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm(depositedCash as number, targetDate, color, riskAptitude);
    clearModal();
  };

  const onCancel = () => {
    onClose();
    clearModal();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center backdrop-blur bg-opacity-1 z-50"
      onClick={onCancel}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-lg w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Create New Portfolio</h2>

        {/* Initial Deposit */}
        <label className="block mb-2">Initial Deposit ($)</label>
        <input 
          type="number"
          value={depositedCash ?? ""}
          onChange={(e) => setDepositedCash(parseFloat(e.target.value) || null)}
          className="w-full p-2 border rounded mb-1"
        />
        {errors.depositedCash && <p className="text-red-500 text-sm">{errors.depositedCash}</p>}

        {/* Target Date */}
        <label className="block mt-4 mb-2">Target Date</label>
        <input 
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full p-2 border rounded mb-1 cursor-pointer"
        />
        {errors.targetDate && <p className="text-red-500 text-sm">{errors.targetDate}</p>}

        {/* Color Picker */}
        <label className="block mt-4 mb-2">Select Portfolio Color</label>
        <input 
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-10 border rounded mb-4 cursor-pointer"
        />

        {/* Risk Aptitude */}
        <label className="block mb-2">Risk Aptitude (1-5)</label>
        <input 
          type="range"
          min="1"
          max="5"
          value={riskAptitude}
          onChange={(e) => setRiskAptitude(parseInt(e.target.value))}
          className="w-full mb-4"
        />
        <span className="block text-center mb-4">{riskAptitude}</span>

        {/* Buttons */}
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded cursor-pointer">Cancel</button>
          <button 
            onClick={onSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePortfolioModal;
