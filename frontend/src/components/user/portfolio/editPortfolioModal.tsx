"use client";

import { useState, useEffect } from "react";
import { PortfolioCardProps, EditPortfolioModalProps } from "@/components/api/portfolio";

const EditPortfolioModal: React.FC<EditPortfolioModalProps> = ({ isOpen, onClose, onConfirm, onDelete, card }) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState(card.color);
  const [targetDate, setTargetDate] = useState(card.endDate);

  

  const handleConfirm = () => {
    if (name === "" && color === card.color && targetDate === card.endDate){
    } else if (name === "" && (color !== card.color || targetDate !== card.endDate)) {
      onConfirm({ name: card.name, color, targetDate});
    } else {
      onConfirm({ name, color, targetDate });
    }
    onClose();
    return
  };

  const handleClose = () => {
    setName("");
    setColor(card.color);
    setTargetDate(card.endDate);
    onClose();
  }

  const handleDelete = () => {
    onDelete(card.portfolioId);
    onClose();
  }

  useEffect(() => {
    setName("");
    setColor(card.color);
    setTargetDate(card.endDate);
  }, [card]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur bg-opacity-1 z-50" onClick={handleClose}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-96" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl mb-4">Edit Portfolio</h2>
        
        {/* Name */}
        <label className="block mb-2">Name:</label>
        <input 
            type="text" 
            placeholder={card.name}
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full p-2 border rounded mb-4" 
        />
        
        {/* Color */}
        <label className="block mb-2">Color:</label>
        <input 
            type="color" 
            placeholder={card.color}
            value={color} 
            onChange={(e) => setColor(e.target.value)} 
            className="w-full h-10 border rounded mb-4" 
        />
        
        {/* Target Date */}
        <label className="block mb-2">Target Date:</label>
        <input 
            type="date" 
            placeholder={card.endDate}
            value={targetDate} 
            onChange={(e) => setTargetDate(e.target.value)} 
            className="w-full p-2 border rounded mb-4  cursor-pointer" 
        />
        
        <div className="flex justify-between mt-4">
          <button onClick={handleConfirm} className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">Save</button>
          <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default EditPortfolioModal;
