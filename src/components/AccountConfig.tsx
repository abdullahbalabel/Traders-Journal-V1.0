import React, { useState, useEffect } from 'react';
import { Settings, Save, TrendingUp, TrendingDown } from 'lucide-react';

interface AccountConfigProps {
  initialAccountValue: number;
  onUpdateAccountValue: (value: number) => void;
  currentAccountValue: number;
}

export default function AccountConfig({ 
  initialAccountValue, 
  onUpdateAccountValue,
  currentAccountValue 
}: AccountConfigProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [accountValue, setAccountValue] = useState(initialAccountValue);

  useEffect(() => {
    setAccountValue(initialAccountValue);
  }, [initialAccountValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateAccountValue(Number(accountValue) || 0);
    setIsEditing(false);
  };

  const pnlAmount = (currentAccountValue - initialAccountValue) || 0;
  const pnlPercentage = initialAccountValue ? (pnlAmount / initialAccountValue) * 100 : 0;

  const formatCurrency = (value: number) => {
    if (isNaN(value) || value === null) return '$0.00';
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}`;
  };

  const formatPercentage = (value: number) => {
    if (isNaN(value) || value === null) return '0.00%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Account Settings</h2>
        <Settings className="h-5 w-5 text-blue-500" />
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Initial Account Value</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={accountValue}
                onChange={(e) => setAccountValue(Number(e.target.value) || 0)}
                className="w-full bg-gray-700 rounded-lg py-2 pl-8 pr-3 text-gray-100"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setAccountValue(initialAccountValue);
                setIsEditing(false);
              }}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-400 text-sm">Initial Account Value</p>
            <p className="text-2xl font-bold">{formatCurrency(initialAccountValue)}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Edit
            </button>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Current Account Value</p>
            <p className="text-2xl font-bold">{formatCurrency(currentAccountValue)}</p>
            <div className={`flex items-center mt-2 ${pnlAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {pnlAmount >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm">
                {formatCurrency(pnlAmount)} ({formatPercentage(pnlPercentage)})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}