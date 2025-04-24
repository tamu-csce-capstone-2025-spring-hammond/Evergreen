"use client"

import { useState } from "react";
import { DepositWithdrawModalProps } from "@/components/api/portfolio";



const DepositWithdrawModal: React.FC<DepositWithdrawModalProps> = ({ isOpen, onClose, onConfirm, type }) => {
  const [amount, setAmount] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setAmount("");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur bg-opacity-1 z-50" onClick={handleClose}>
      <div className="bg-white dark:bg-evergray-800 p-6 rounded-lg shadow-lg w-96" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-center mb-4">
          {type === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
        </h2>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded-md dark:bg-evergray-700 dark:text-white"
        />
        <div className="flex justify-between mt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-evergray-200 dark:bg-evergray-600 rounded-md cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (amount) onConfirm(parseFloat(amount), type);
              setAmount("")
              onClose();
            }}
            className="px-4 py-2 bg-evergreen-500 text-white rounded-md cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositWithdrawModal;
