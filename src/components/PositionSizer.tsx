import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, ArrowDown, ArrowUp } from 'lucide-react';

interface PositionSizerProps {
  initialAccountValue: number;
  riskPercentage: number;
  profitRiskRatio: number;
}

export default function PositionSizer({ 
  initialAccountValue, 
  riskPercentage,
  profitRiskRatio = 2
}: PositionSizerProps) {
  const [entryPrice, setEntryPrice] = useState<string>('0');
  const [positionType, setPositionType] = useState<'long' | 'short'>('long');
  const [stopLoss, setStopLoss] = useState<string>('0');
  const [takeProfit, setTakeProfit] = useState<string>('0');

  // Recalculate when any prop changes
  useEffect(() => {
    if (entryPrice && Number(entryPrice) > 0) {
      calculatePositionSizes();
    }
  }, [entryPrice, positionType, initialAccountValue, riskPercentage, profitRiskRatio]);

  const calculatePositionSizes = () => {
    const entry = Number(entryPrice);
    const riskAmount = (initialAccountValue * riskPercentage) / 100;
    const maxShares = Math.floor(initialAccountValue / entry);
    const riskPerShare = riskAmount / maxShares;

    let newStopLoss: number;
    let newTakeProfit: number;

    if (positionType === 'long') {
      newStopLoss = entry - riskPerShare;
      newTakeProfit = entry + (riskPerShare * profitRiskRatio);
    } else {
      newStopLoss = entry + riskPerShare;
      newTakeProfit = entry - (riskPerShare * profitRiskRatio);
    }

    setStopLoss(Math.max(0, newStopLoss).toFixed(2));
    setTakeProfit(Math.max(0, newTakeProfit).toFixed(2));
  };

  const calculatePosition = () => {
    const entry = Number(entryPrice);
    const stop = Number(stopLoss);
    const riskAmount = (initialAccountValue * riskPercentage) / 100;
    const riskPerShare = Math.abs(entry - stop);
    const shares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
    const totalPosition = shares * entry;
    
    return {
      shares,
      totalPosition,
      riskAmount,
    };
  };

  const position = calculatePosition();

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Position Sizer</h2>
        <Calculator className="h-5 w-5 text-blue-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Account Value</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={initialAccountValue.toLocaleString()}
              disabled
              className="w-full bg-gray-700/50 rounded-lg py-2 pl-10 pr-3 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Risk Per Trade</label>
          <div className="relative">
            <input
              type="text"
              value={`${riskPercentage}%`}
              disabled
              className="w-full bg-gray-700/50 rounded-lg py-2 px-3 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Position Type</label>
          <select
            value={positionType}
            onChange={(e) => setPositionType(e.target.value as 'long' | 'short')}
            className="w-full bg-gray-700 rounded-lg py-2 px-3 text-gray-100"
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Entry Price</label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            className="w-full bg-gray-700 rounded-lg py-2 px-3 text-gray-100"
            min="0.000001"
            step="any"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Stop Loss (Auto)</label>
          <div className="relative">
            <input
              type="number"
              value={stopLoss}
              readOnly
              className="w-full bg-gray-700/50 rounded-lg py-2 px-3 text-gray-400 cursor-not-allowed"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {positionType === 'long' ? (
                <ArrowDown className="h-4 w-4 text-red-500" />
              ) : (
                <ArrowUp className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Take Profit (Auto)</label>
          <div className="relative">
            <input
              type="number"
              value={takeProfit}
              readOnly
              className="w-full bg-gray-700/50 rounded-lg py-2 px-3 text-gray-400 cursor-not-allowed"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {positionType === 'long' ? (
                <ArrowUp className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Shares to Buy</span>
          <span className="font-semibold">{position.shares.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Position Size</span>
          <span className="font-semibold">${position.totalPosition.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Dollar Risk</span>
          <span className="font-semibold">${position.riskAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}