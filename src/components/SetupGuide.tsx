import React, { useState } from 'react';
import { DollarSign, Shield, ChevronRight, ChevronLeft } from 'lucide-react';

interface SetupGuideProps {
  isOpen: boolean;
  onComplete: (values: {
    accountValue: number;
    riskPercentage: number;
    profitRiskRatio: number;
  }) => void;
}

export default function SetupGuide({ isOpen, onComplete }: SetupGuideProps) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({
    accountValue: 10000,
    riskPercentage: 1,
    profitRiskRatio: 2
  });

  const totalSteps = 2;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(values);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to TradersJournal</h2>
          <p className="text-gray-400">Let's set up your account</p>
        </div>

        <div className="mb-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Account Setup</h3>
                  <p className="text-gray-400 text-sm">Set your initial account value</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Initial Account Value</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={values.accountValue}
                    onChange={(e) => setValues({ ...values, accountValue: Number(e.target.value) })}
                    className="w-full bg-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-100"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Enter the total amount you plan to trade with
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Risk Management</h3>
                  <p className="text-gray-400 text-sm">Configure your risk parameters</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Risk Per Trade (%)</label>
                <input
                  type="number"
                  value={values.riskPercentage}
                  onChange={(e) => setValues({ ...values, riskPercentage: Number(e.target.value) })}
                  className="w-full bg-gray-700 rounded-lg py-3 px-4 text-gray-100"
                  min="0.1"
                  max="100"
                  step="0.1"
                  required
                />
                <p className="text-xs text-gray-400 mt-2">
                  Recommended: 1-2% of your account per trade
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Profit/Risk Ratio</label>
                <input
                  type="number"
                  value={values.profitRiskRatio}
                  onChange={(e) => setValues({ ...values, profitRiskRatio: Number(e.target.value) })}
                  className="w-full bg-gray-700 rounded-lg py-3 px-4 text-gray-100"
                  min="0.1"
                  step="0.1"
                  required
                />
                <p className="text-xs text-gray-400 mt-2">
                  Recommended: 2 or higher (2 means targeting 2x the risk as profit)
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            {step === totalSteps ? 'Complete Setup' : 'Next'}
            {step !== totalSteps && <ChevronRight className="h-5 w-5 ml-1" />}
          </button>
        </div>

        <div className="mt-6 flex justify-center space-x-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full ${
                i + 1 === step ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}