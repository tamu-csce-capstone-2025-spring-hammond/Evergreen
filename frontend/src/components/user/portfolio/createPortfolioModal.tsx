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
  const [step, setStep] = useState<"form" | "preview">("form");

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
    setStep("form");
  };

  const onCancel = () => {
    onClose();
    clearModal();
  }

  const onNext = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Portfolio name is required.";
    if (depositedCash === null || depositedCash <= 0)
      newErrors.depositedCash = "Initial deposit must be greater than 0.";
    if (!targetDate) newErrors.targetDate = "Target date is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStep("preview");
  };

  const handleFinalConfirm = () => {
    onConfirm(name, depositedCash!, targetDate, color, riskAptitude, {
      bitcoin_focus: bitcoinFocus,
      smallcap_focus: smallcapFocus,
      value_focus: valueFocus,
      momentum_focus: momentumFocus,
    });
    clearModal();
    onClose();
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur bg-opacity-1 z-50"
      onClick={onCancel}
    >
      <div
        className="relative w-[28rem] h-[50rem] bg-white rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Form Step - always visible */}
        <div className="absolute top-0 left-0 w-full h-full p-6 z-0">
          <h2 className="text-xl font-semibold mb-4">Create New Portfolio</h2>

          <label className="block mb-1">Portfolio Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded mb-1"
            placeholder="Enter Portfolio Name"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          <label className="block mt-3 mb-1">Initial Deposit ($)</label>
          <input
            type="number"
            value={depositedCash ?? ""}
            onChange={(e) => setDepositedCash(parseFloat(e.target.value) || null)}
            className="w-full p-2 border rounded mb-1"
            placeholder="Enter Initial Deposit"
          />
          {errors.depositedCash && (
            <p className="text-red-500 text-sm">{errors.depositedCash}</p>
          )}

          <label className="block mt-3 mb-1">Target Date</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full p-2 border rounded mb-1"
            min={getTomorrowDate()}
          />
          {errors.targetDate && (
            <p className="text-red-500 text-sm">{errors.targetDate}</p>
          )}

          <label className="block mt-3 mb-1">Portfolio Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 border rounded mb-3 cursor-pointer"
          />

          <label className="block mb-1">Risk Aptitude (1-5)</label>
          <input
            type="range"
            min="1"
            max="5"
            value={riskAptitude}
            onChange={(e) => setRiskAptitude(parseInt(e.target.value))}
            className="w-full mb-2"
          />
          <span className="block text-center mb-3">{riskAptitude}</span>

          <div className="space-y-2 mb-6">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={bitcoinFocus} onChange={(e) => setBitcoinFocus(e.target.checked)} />
              <span>Bitcoin Focus</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={smallcapFocus} onChange={(e) => setSmallcapFocus(e.target.checked)} />
              <span>Small-Cap Focus</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={valueFocus} onChange={(e) => setValueFocus(e.target.checked)} />
              <span>Value Focus</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={momentumFocus} onChange={(e) => setMomentumFocus(e.target.checked)} />
              <span>Momentum Focus</span>
            </label>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded">
              Cancel
            </button>
            <button onClick={onNext} className="bg-green-500 text-white px-4 py-2 rounded">
              Next
            </button>
          </div>
        </div>

        {/* Preview Step - slides over the form */}
        <div
          className={`absolute top-0 left-0 w-full h-full p-6 bg-white transition-transform duration-500 ease-in-out z-10 shadow-md ${
            step === "preview" ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4">Confirm Your Portfolio</h2>
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Deposit:</strong> ${depositedCash}</p>
          <p><strong>Target Date:</strong> {targetDate}</p>
          <p><strong>Color:</strong> <span className="inline-block w-6 h-6 rounded border" style={{ backgroundColor: color }} /></p>
          <p><strong>Risk Level:</strong> {riskAptitude}</p>
          <p><strong>Focuses:</strong> {
            [bitcoinFocus && "Bitcoin", smallcapFocus && "Small-Cap", valueFocus && "Value", momentumFocus && "Momentum"]
              .filter(Boolean)
              .join(", ") || "None"
          }</p>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={() => setStep("form")}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Back
            </button>
            <button
              onClick={handleFinalConfirm}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePortfolioModal;
