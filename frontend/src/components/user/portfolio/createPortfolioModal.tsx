"use client";

import { useState } from "react";

interface CreatePortfolioModalProps {
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

const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState("");
  const [depositedCash, setDepositedCash] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState("");
  const [color, setColor] = useState("#000000");
  const [riskAptitude, setRiskAptitude] = useState(3);

  const [bitcoinFocus, setBitcoinFocus] = useState(false);
  const [smallcapFocus, setSmallcapFocus] = useState(false);
  const [valueFocus, setValueFocus] = useState(false);
  const [momentumFocus, setMomentumFocus] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    depositedCash?: string;
    targetDate?: string;
  }>({});

  const clearModal = () => {
    setName("");
    setDepositedCash(null);
    setTargetDate("");
    setColor("#000000");
    setRiskAptitude(3);
    setBitcoinFocus(false);
    setSmallcapFocus(false);
    setValueFocus(false);
    setMomentumFocus(false);
    setErrors({});
  };

  const onSubmit = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Portfolio name is required.";
    if (depositedCash === null || depositedCash <= 0)
      newErrors.depositedCash = "Initial deposit must be greater than 0.";
    if (!targetDate) newErrors.targetDate = "Target date is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm(name, depositedCash!, targetDate, color, riskAptitude, {
      bitcoin_focus: bitcoinFocus,
      smallcap_focus: smallcapFocus,
      value_focus: valueFocus,
      momentum_focus: momentumFocus,
    });

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

        {/* Portfolio Name */}
        <label className="block mb-2">Portfolio Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mb-1"
          placeholder="Enter portfolio name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name}</p>
        )}

        {/* Initial Deposit */}
        <label className="block mt-4 mb-2">Initial Deposit ($)</label>
        <input
          type="number"
          value={depositedCash ?? ""}
          onChange={(e) =>
            setDepositedCash(parseFloat(e.target.value) || null)
          }
          className="w-full p-2 border rounded mb-1"
        />
        {errors.depositedCash && (
          <p className="text-red-500 text-sm">{errors.depositedCash}</p>
        )}

        {/* Target Date */}
        <label className="block mt-4 mb-2">Target Date</label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full p-2 border rounded mb-1"
        />
        {errors.targetDate && (
          <p className="text-red-500 text-sm">{errors.targetDate}</p>
        )}

        {/* Color */}
        <label className="block mt-4 mb-2">Portfolio Color</label>
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
          className="w-full mb-2"
        />
        <span className="block text-center mb-4">{riskAptitude}</span>

        {/* Focus Checkboxes */}
        <div className="mb-4 space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={bitcoinFocus}
              onChange={(e) => setBitcoinFocus(e.target.checked)}
            />
            <span>Bitcoin Focus</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={smallcapFocus}
              onChange={(e) => setSmallcapFocus(e.target.checked)}
            />
            <span>Small-Cap Focus</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={valueFocus}
              onChange={(e) => setValueFocus(e.target.checked)}
            />
            <span>Value Focus</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={momentumFocus}
              onChange={(e) => setMomentumFocus(e.target.checked)}
            />
            <span>Momentum Focus</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePortfolioModal;
