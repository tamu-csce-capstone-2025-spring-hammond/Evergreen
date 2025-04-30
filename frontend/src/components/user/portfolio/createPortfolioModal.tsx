"use client";

import { useState } from "react";
import { PortfolioPreviewDto, previewPortfolio, InvestmentData, CreatePortfolioModalProps } from "@/components/api/portfolio";
import useJwtStore from "@/store/jwtStore";
import PieChart from "../pieChart";
import ForecastTrendChart from "../forecastGraph";




const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState<"form" | "preview">("form");
  const { getToken } = useJwtStore();

  const [name, setName] = useState("");
  const [depositedCash, setDepositedCash] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState("");
  const [color, setColor] = useState("#000000");
  const [riskAptitude, setRiskAptitude] = useState(3);
  const [bitcoinFocus, setBitcoinFocus] = useState(false);
  const [smallcapFocus, setSmallcapFocus] = useState(false);
  const [valueFocus, setValueFocus] = useState(false);
  const [momentumFocus, setMomentumFocus] = useState(false);
  const [previewData, setPreviewData] = useState<{ date: string; value: number }[] | null>(null);
  const [previewInvestments, setPreviewInvestments] = useState<InvestmentData[] | null>(null);
  const [forecastSimulations, setForecastSimulations] = useState<number[][] | null>(null);



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


const onNext = async () => {
  const newErrors: typeof errors = {};
  if (!name.trim()) newErrors.name = "Portfolio name is required";
  if (depositedCash === null || depositedCash <= 0)
    newErrors.depositedCash = "Initial deposit must be greater than 0";
  if (!targetDate) newErrors.targetDate = "Target date is required";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    const token = useJwtStore.getState().getToken();
    if (!token) {
      console.error("No auth token found.");
      return;
    }

    const previewDto: PortfolioPreviewDto = {
      targetDate: new Date(targetDate),
      value: depositedCash!,
      bitcoin_focus: bitcoinFocus,
      smallcap_focus: smallcapFocus,
      value_focus: valueFocus,
      momentum_focus: momentumFocus,
      risk_aptitude: riskAptitude,
    };

    const result = await previewPortfolio(token, previewDto);

    const investmentBreakdown: InvestmentData[] = result.investments.map((inv: any, i: number) => ({
      label: inv.ticker,
      value: parseFloat(inv.percent_of_portfolio),
      color: ["#2563eb", "#f97316", "#10b981", "#e11d48", "#a855f7"][i % 5],
    }));

    const historicalFormatted = result.historical_graph.map((point: any) => ({
      date: new Date(point.snapshot_time).toISOString().split("T")[0],
      value: parseFloat(point.snapshot_value),
    }));

    const forecastSimulations: number[][] = result.future_projections.simulations.map(
      (sim: any) => sim.values.map((v: any) => parseFloat(v))
    );

    const createdDate: Date = result.createdDate;

    const targetDate2: Date = result.targetDate;


    setPreviewData(historicalFormatted);
    setForecastSimulations(forecastSimulations);
    setPreviewInvestments(investmentBreakdown);
    setStep("preview");

  } catch (err) {
    console.error("Preview request failed:", err);
    alert("Failed to generate portfolio preview.");
  }
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
        className={`relative max-h-[720px] h-[91vh] ${
          step === "preview" ? "w-[40rem]" : "w-[28rem]"
        } bg-evergray-100 dark:bg-evergray-700 rounded-lg shadow-xl dark:shadow-[#171716] overflow-hidden transition-all duration-500`}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Form Step - always visible */}
        <div className="absolute top-0 left-0 w-full h-full p-6 z-0 dark:[&_input]:border-evergray-500">
          <h2 className="text-xl font-semibold mb-4">Create New Portfolio</h2>

          <label className="block mb-1">Portfolio Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            className={`w-full font-medium p-2 border rounded mb-1 ${errors.name ? "border-red-500" : ""}`}
            placeholder="Enter Portfolio Name"
          />
          {errors.name && <p className="absolute right-6 text-red-500 text-sm">{errors.name}</p>}

          <label className="block mt-4 mb-1">Initial Deposit ($)</label>
          <input
            type="number"
            value={depositedCash ?? ""}
            onChange={(e) => {
                const value = parseFloat(e.target.value) || null;
                setDepositedCash(value);
                if (errors.depositedCash) setErrors((prev) => ({ ...prev, depositedCash: undefined }));
            }}
            className={`w-full font-mono placeholder:font-raleway p-2 border rounded mb-1 ${errors.depositedCash ? "border-red-500" : ""}`}
            placeholder="Enter Initial Deposit"
          />
          {errors.depositedCash && (
            <p className="absolute right-6 text-red-500 text-sm">{errors.depositedCash}</p>
          )}

          <label className="block mt-4 mb-1">Target Date</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => {
                setTargetDate(e.target.value);
                if (errors.targetDate) setErrors((prev) => ({ ...prev, targetDate: undefined }));
            }}
            className={`custom-date-picker w-full p-2 font-mono border rounded mb-1 ${errors.targetDate ? "border-red-500" : ""}`}
            min={getTomorrowDate()}
          />
          {errors.targetDate && (
            <p className="absolute right-6 text-red-500 text-sm">{errors.targetDate}</p>
          )}

          <label className="block mt-4 mb-1">Portfolio Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 border rounded mb-3 cursor-pointer"
          />
          <label className="block mb-1 mt-1">Risk Aptitude
            <span className="font-mono">(1-5)</span>
            <span title="Set your risk aptitude with 1 as very safe and 5 as very risky" className="material-symbols-outlined symbol scale-75 text-evergray-600 dark:text-evergray-300 -translate-x-[2px]">info</span>
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={riskAptitude}
            onChange={(e) => setRiskAptitude(parseInt(e.target.value))}
            className="w-full mb-2"
          />
          <span className="block text-center mb-3 font-mono">{riskAptitude}</span>

          <div className="space-y-2 mb-6">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={bitcoinFocus} onChange={(e) => setBitcoinFocus(e.target.checked)} />
              <span>Bitcoin Focus 
                <span title="Generate portfolio with bitcoin" className="material-symbols-outlined symbol scale-75 text-evergray-600 dark:text-evergray-300 -translate-x-[2px]">info</span>
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={smallcapFocus} onChange={(e) => setSmallcapFocus(e.target.checked)} />
              <span>Small-Cap Focus 
                <span title="Generate portfolio with emphasis on small companies" className="material-symbols-outlined symbol scale-75 text-evergray-600 dark:text-evergray-300 -translate-x-[2px]">info</span>
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={valueFocus} onChange={(e) => setValueFocus(e.target.checked)} />
              <span>Value Focus 
                <span title="Generate portfolio with emphasis on value companies" className="material-symbols-outlined symbol scale-75 text-evergray-600 dark:text-evergray-300 -translate-x-[2px]">info</span>
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={momentumFocus} onChange={(e) => setMomentumFocus(e.target.checked)} />
              <span>Momentum Focus 
                <span title="Generate portfolio with emphasis on companies with upward momentum" className="material-symbols-outlined symbol scale-75 text-evergray-600 dark:text-evergray-300 -translate-x-[2px]">info</span>
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button onClick={onCancel} className="bg-evergray-200 dark:bg-evergray-600 px-4 py-2 rounded cursor-pointer">
              Cancel
            </button>
            <button onClick={onNext} className="bg-evergreen-500 text-white px-4 py-2 rounded cursor-pointer">
              Next
            </button>
          </div>
        </div>

        {/* Preview Step - slides over the form */}
        <div
        className={`absolute top-0 left-0 w-full h-full p-6 bg-evergray-100 dark:bg-evergray-700 transition-transform duration-500 ease-in-out z-10 shadow-md ${
          step === "preview" ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full w-full justify-between gap-4 flex-col">
          {/* Left: Info and PieChart */}
          <div className="flex justify-between">
            <div>
                <h2 className="text-xl font-semibold mb-4">Confirm Your Portfolio</h2>
                <div className="grid grid-cols-[9fr_11fr] gap-x-4 gap-y-2 *:whitespace-nowrap">
                    <p className="font-semibold dark:text-evergray-400 text-evergray-600">Name:</p>
                    <p className="font-medium">{name}</p>

                    <p className="font-semibold dark:text-evergray-400 text-evergray-600">Color:</p>
                    <div className="flex items-center space-x-2">
                    <div
                        className="size-4 rounded border"
                        style={{ backgroundColor: color }}
                    />
                    </div>

                    <p className="font-semibold dark:text-evergray-400 text-evergray-600">Deposit:</p>
                    <p className="font-mono">${depositedCash}</p>

                    <p className="font-semibold dark:text-evergray-400 text-evergray-600">Target Date:</p>
                    <p className="font-mono">{targetDate}</p>

                    <p className="font-semibold dark:text-evergray-400 text-evergray-600">Risk Level:</p>
                    <p className="font-mono">{riskAptitude}</p>

                    <p className="font-semibold dark:text-evergray-400 text-evergray-600">Focuses:</p>
                    <p className="font-medium !whitespace-normal">
                    {
                        [bitcoinFocus && "Bitcoin", smallcapFocus && "Small-Cap", valueFocus && "Value", momentumFocus && "Momentum"]
                        .filter(Boolean)
                        .join(", ") || "None"
                    }
                    </p>
                </div>
            </div>
            {previewInvestments && (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-medium mb-2 text-center flex-3">Investment Allocation</h3>
                <div className="flex-5">
                  <PieChart data={previewInvestments} showLegend={true} />
                </div>
              </div>
            )}
          </div>

          {/* Right: Chart */}
          <div className="w-full">
            <h3 className="text-lg font-medium mb-4">Portfolio Value Forecast</h3>
            <div className="w-full">
              <div className="w-full px-4">
                {previewData && forecastSimulations && (
                  <ForecastTrendChart
                    historical={previewData.slice(-100)}
                    forecast={forecastSimulations}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={() => setStep("form")}
                className="bg-evergray-200 dark:bg-evergray-600 px-4 py-2 rounded cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleFinalConfirm}
                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
              >
                Confirm
              </button>
            </div>
        </div>
      </div>

      </div>
    </div>
  );
};

export default CreatePortfolioModal;
