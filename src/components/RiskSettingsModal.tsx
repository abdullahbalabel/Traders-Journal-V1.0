import React, { useState, useEffect } from 'react';
import { X, Settings, Percent } from 'lucide-react';

interface RiskSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userDB: any; // We'll properly type this later
  initialSettings: {
    profitRiskRatio: number;
    lossRiskRatio: number;
    riskPercentage: number;
  };
  onUpdate: () => void;
}

export default function RiskSettingsModal({
  isOpen,
  onClose,
  userDB,
  initialSettings,
  onUpdate
}: RiskSettingsModalProps) {
  const [profitRiskRatio, setProfitRiskRatio] = useState(initialSettings.profitRiskRatio);
  const [lossRiskRatio, setLossRiskRatio] = useState(initialSettings.lossRiskRatio);
  const [riskPercentage, setRiskPercentage] = useState(initialSettings.riskPercentage);

  // Update state when initialSettings change
  useEffect(() => {
    setProfitRiskRatio(initialSettings.profitRiskRatio);
    setLossRiskRatio(initialSettings.lossRiskRatio);
    setRiskPercentage(initialSettings.riskPercentage);
  }, [initialSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userDB.updateSettings({
        profitRiskRatio,
        lossRiskRatio,
        riskPercentage,
        updatedAt: new Date().toISOString()
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update risk settings:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Risk/Reward Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Profit/Risk Ratio</label>
            <div className="relative">
              <input
                type="number"
                value={profitRiskRatio}
                onChange={(e) => setProfitRiskRatio(Number(e.target.value))}
                className="w-full bg-gray-700 rounded-lg py-2 px-3 text-gray-100"
                min="0.1"
                step="0.1"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Target profit relative to risk (e.g., 2 means target 2x the risk)</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Loss/Risk Ratio</label>
            <div className="relative">
              <input
                type="number"
                value={lossRiskRatio}
                onChange={(e) => setLossRiskRatio(Number(e.target.value))}
                className="w-full bg-gray-700 rounded-lg py-2 px-3 text-gray-100"
                min="0.1"
                step="0.1"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Stop loss relative to risk (usually 1)</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Risk Percentage</label>
            <div className="relative">
              <input
                type="number"
                value={riskPercentage}
                onChange={(e) => setRiskPercentage(Number(e.target.value))}
                className="w-full bg-gray-700 rounded-lg py-2 px-3 text-gray-100"
                min="0.1"
                max="100"
                step="0.1"
                required
              />
              <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Percentage of account to risk per trade</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-6"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}