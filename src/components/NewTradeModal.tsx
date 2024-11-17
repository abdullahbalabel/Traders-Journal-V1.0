import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Position } from '../types';

interface NewTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trade: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>) => void;
  profitRiskRatio: number;
}

export default function NewTradeModal({ isOpen, onClose, onSubmit, profitRiskRatio }: NewTradeModalProps) {
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'long' as const,
    quantity: '',
    entryPrice: '',
    exitPrice: '',
    stopLoss: '',
    takeProfit: '',
  });

  // Calculate take profit based on stop loss and profit/risk ratio
  useEffect(() => {
    if (formData.entryPrice && formData.stopLoss) {
      const entry = Number(formData.entryPrice);
      const stop = Number(formData.stopLoss);
      const riskAmount = Math.abs(entry - stop);
      const profitAmount = riskAmount * profitRiskRatio;
      
      let takeProfit;
      if (formData.type === 'long') {
        takeProfit = entry + profitAmount;
      } else {
        takeProfit = entry - profitAmount;
      }
      
      setFormData(prev => ({
        ...prev,
        takeProfit: takeProfit.toString()
      }));
    }
  }, [formData.entryPrice, formData.stopLoss, formData.type, profitRiskRatio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure all numeric values are properly converted
    const numericData = {
      symbol: formData.symbol.toUpperCase(),
      type: formData.type,
      quantity: Number(formData.quantity),
      entryPrice: Number(formData.entryPrice),
      currentPrice: Number(formData.entryPrice), // Set current price to entry price initially
      stopLoss: Number(formData.stopLoss),
      takeProfit: Number(formData.takeProfit),
      exitPrice: formData.exitPrice ? Number(formData.exitPrice) : null
    };

    // Validate numeric values
    if (isNaN(numericData.quantity) || numericData.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (isNaN(numericData.entryPrice) || numericData.entryPrice <= 0) {
      alert('Please enter a valid entry price');
      return;
    }

    if (isNaN(numericData.stopLoss) || numericData.stopLoss <= 0) {
      alert('Please enter a valid stop loss');
      return;
    }

    if (isNaN(numericData.takeProfit) || numericData.takeProfit <= 0) {
      alert('Please enter a valid take profit');
      return;
    }

    // Validate stop loss and take profit based on position type
    if (formData.type === 'long') {
      if (numericData.stopLoss >= numericData.entryPrice) {
        alert('Stop loss must be below entry price for long positions');
        return;
      }
      if (numericData.takeProfit <= numericData.entryPrice) {
        alert('Take profit must be above entry price for long positions');
        return;
      }
    } else {
      if (numericData.stopLoss <= numericData.entryPrice) {
        alert('Stop loss must be above entry price for short positions');
        return;
      }
      if (numericData.takeProfit >= numericData.entryPrice) {
        alert('Take profit must be below entry price for short positions');
        return;
      }
    }

    onSubmit(numericData);
    onClose();
    setFormData({
      symbol: '',
      type: 'long',
      quantity: '',
      entryPrice: '',
      exitPrice: '',
      stopLoss: '',
      takeProfit: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">New Trade</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Symbol</label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              className="w-full bg-gray-700 rounded-lg py-2 px-3 text-gray-100"
              placeholder="AAPL"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'long' | 'short' })}
              className="w-full bg-gray-700 rounded-lg py-2 px-3 text-gray-100"
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-gray-700 rounded-lg py-2 px-3 text-gray-100"
                min="0.000001"
                step="any"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Entry Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="number"
                  value={formData.entryPrice}
                  onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg py-2 pl-10 pr-3 text-gray-100"
                  min="0.000001"
                  step="any"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Exit Price (Optional)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="number"
                value={formData.exitPrice}
                onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                className="w-full bg-gray-700 rounded-lg py-2 pl-10 pr-3 text-gray-100"
                min="0.000001"
                step="any"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Stop Loss</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="number"
                  value={formData.stopLoss}
                  onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg py-2 pl-10 pr-3 text-gray-100"
                  min="0.000001"
                  step="any"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Take Profit (Auto)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="number"
                  value={formData.takeProfit}
                  onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg py-2 pl-10 pr-3 text-gray-100"
                  min="0.000001"
                  step="any"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Based on {profitRiskRatio}:1 profit/risk ratio</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-6"
          >
            Place Trade
          </button>
        </form>
      </div>
    </div>
  );
}