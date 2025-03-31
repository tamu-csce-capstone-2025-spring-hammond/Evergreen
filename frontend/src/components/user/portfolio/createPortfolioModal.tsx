import { useState } from "react";

interface CreatePortFolioModal {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deposited_cash: number, target_date: string, color: string, risk_aptitude: number) => void;
}

const DepositWithdrawModal: React.FC<CreatePortFolioModal> = ({ isOpen, onClose, onConfirm }) => {

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur bg-opacity-1 z-50">
      
    </div>
  );
};

export default CreatePortFolioModal;
