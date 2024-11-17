import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Percent, Loader2, TrendingUp, Shield } from 'lucide-react';
import { Position } from '../types';

interface PortfolioOverviewProps {
  positions: Position[];
  loading: boolean;
  accountValue: number;
  currentAccountValue: number;
}

export default function PortfolioOverview({ 
  positions, 
  loading, 
  accountValue,
  currentAccountValue 
}: PortfolioOverviewProps) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const calculatePositionValue = (position: Position): number => {
    if (!position || !position.quantity || !position.currentPrice) return 0;
    const priceToUse = position.exitPrice || position.currentPrice;
    return Number(position.quantity) * Number(priceToUse);
  };

  const calculatePositionPnL = (position: Position): number => {
    if (!position || !position.quantity || !position.entryPrice) return 0;
    const priceToUse = position.exitPrice || position.currentPrice;
    const multiplier = position.type === 'long' ? 1 : -1;
    return (Number(priceToUse) - Number(position.entryPrice)) * Number(position.quantity) * multiplier;
  };

  const totalValue = positions.reduce(
    (sum, pos) => sum + calculatePositionValue(pos),
    0
  );

  const totalPnL = isNaN(currentAccountValue - accountValue) ? 0 : currentAccountValue - accountValue;
  const pnlPercent = accountValue > 0 ? (totalPnL / accountValue) * 100 : 0;

  // Calculate win/loss metrics
  const positionsWithPnL = positions
    .filter(pos => pos && pos.entryPrice && pos.quantity)
    .map(pos => ({
      ...pos,
      pnl: calculatePositionPnL(pos),
      pnlPercent: pos.entryPrice ? 
        ((Number(pos.exitPrice || pos.currentPrice) - Number(pos.entryPrice)) / Number(pos.entryPrice)) * 100 : 
        0
    }));

  const winningTrades = positionsWithPnL.filter(pos => pos.pnl > 0);
  const losingTrades = positionsWithPnL.filter(pos => pos.pnl < 0);

  const winRate = positions.length > 0
    ? (winningTrades.length / positions.length) * 100
    : 0;

  // Calculate average gains
  const avgGainDollars = winningTrades.length > 0
    ? winningTrades.reduce((sum, pos) => sum + pos.pnl, 0) / winningTrades.length
    : 0;

  const avgGainPercent = winningTrades.length > 0
    ? winningTrades.reduce((sum, pos) => sum + pos.pnlPercent, 0) / winningTrades.length
    : 0;

  // Calculate average loss for Profit Factor
  const avgLoss = losingTrades.length > 0
    ? Math.abs(losingTrades.reduce((sum, pos) => sum + pos.pnl, 0) / losingTrades.length)
    : 0;

  const profitFactor = avgLoss > 0 ? avgGainDollars / avgLoss : 0;

  // Risk Analysis Calculations
  const calculateRiskMetrics = () => {
    if (positions.length === 0) {
      return {
        lowRisk: 0,
        mediumRisk: 0,
        highRisk: 0,
        avgRiskPerTrade: 0,
        portfolioHeat: 0
      };
    }

    const positionsWithRisk = positions.map(position => {
      const riskAmount = Math.abs(position.entryPrice - position.stopLoss) * position.quantity;
      const positionValue = position.quantity * position.entryPrice;
      return { ...position, riskAmount, positionValue };
    }).filter(p => p.positionValue > 0);

    if (positionsWithRisk.length === 0) return { lowRisk: 0, mediumRisk: 0, highRisk: 0, avgRiskPerTrade: 0, portfolioHeat: 0 };

    // Calculate average risk per trade
    const riskPercentages = positionsWithRisk.map(p => (p.riskAmount / p.positionValue) * 100);
    const avgRiskPerTrade = riskPercentages.reduce((sum, risk) => sum + risk, 0) / positionsWithRisk.length;

    // Calculate portfolio heat
    const totalPositionValue = positionsWithRisk.reduce((sum, p) => sum + p.positionValue, 0);
    const totalRiskAmount = positionsWithRisk.reduce((sum, p) => sum + p.riskAmount, 0);
    const portfolioHeat = (totalRiskAmount / totalPositionValue) * 100;

    // Categorize risk levels
    const riskCategories = positionsWithRisk.reduce((acc, position) => {
      const riskPercent = (position.riskAmount / position.positionValue) * 100;
      if (riskPercent <= 1) acc.low++;
      else if (riskPercent <= 2) acc.medium++;
      else acc.high++;
      return acc;
    }, { low: 0, medium: 0, high: 0 });

    const total = positionsWithRisk.length;
    return {
      lowRisk: (riskCategories.low / total) * 100,
      mediumRisk: (riskCategories.medium / total) * 100,
      highRisk: (riskCategories.high / total) * 100,
      avgRiskPerTrade,
      portfolioHeat
    };
  };

  const riskMetrics = calculateRiskMetrics();

  // Chart data calculation
  const chartData = positions
    .filter(p => p && p.createdAt && !isNaN(calculatePositionPnL(p)))
    .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
    .reduce((acc: { date: string; value: number }[], position) => {
      const lastValue = acc.length > 0 ? acc[acc.length - 1].value : accountValue;
      const pnl = calculatePositionPnL(position);
      const date = position.createdAt ? 
        new Date(position.createdAt).toLocaleDateString() : 
        'Unknown';

      if (!isNaN(lastValue + pnl)) {
        acc.push({
          date,
          value: lastValue + pnl
        });
      }
      return acc;
    }, [{ date: 'Start', value: accountValue }]);

  if (chartData.length > 0 && 
      !isNaN(currentAccountValue) && 
      currentAccountValue !== chartData[chartData.length - 1].value) {
    chartData.push({
      date: 'Current',
      value: currentAccountValue
    });
  }

  // Calculate min and max values for chart domain
  const validValues = chartData.map(d => d.value).filter(v => !isNaN(v));
  const maxValue = Math.max(...validValues);
  const minValue = Math.min(...validValues);
  const valueRange = Math.max(Math.abs(maxValue - accountValue), Math.abs(accountValue - minValue));
  const yDomain = [
    Math.floor((accountValue - valueRange) / 100) * 100,
    Math.ceil((accountValue + valueRange) / 100) * 100
  ];

  const formatCurrency = (value: number) => {
    if (isNaN(value)) return '$0.00';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-6">Portfolio Overview</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Value</span>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold">{formatCurrency(currentAccountValue)}</span>
                <div className="flex items-center text-green-500 text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Active</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total P&L</span>
                <Percent className="h-4 w-4 text-blue-500" />
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold">{formatCurrency(totalPnL)}</span>
                <div className={`flex items-center text-sm ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalPnL >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span>{pnlPercent.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  tickFormatter={(value) => value}
                />
                <YAxis 
                  stroke="#6B7280"
                  tickFormatter={(value) => formatCurrency(value)}
                  domain={yDomain}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [
                    formatCurrency(value),
                    'Account Value'
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <ReferenceLine 
                  y={accountValue} 
                  stroke="#6B7280" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: 'Initial Balance', 
                    position: 'right',
                    fill: '#6B7280'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Risk Analysis</h2>
            <Shield className="h-5 w-5 text-blue-500" />
          </div>

          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Avg. Risk per Trade</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  riskMetrics.avgRiskPerTrade <= 1 ? 'bg-green-500/20 text-green-500' :
                  riskMetrics.avgRiskPerTrade <= 2 ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {riskMetrics.avgRiskPerTrade.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Portfolio Heat</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  riskMetrics.portfolioHeat <= 15 ? 'bg-green-500/20 text-green-500' :
                  riskMetrics.portfolioHeat <= 25 ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {riskMetrics.portfolioHeat.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Risk Distribution</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-500">Low Risk:</span>
                  <span className="text-sm">{riskMetrics.lowRisk.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-500">Medium Risk:</span>
                  <span className="text-sm">{riskMetrics.mediumRisk.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-500">High Risk:</span>
                  <span className="text-sm">{riskMetrics.highRisk.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Performance</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Win Rate:</span>
                  <span className="text-sm">{winRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Avg Gain:</span>
                  <span className="text-sm">{formatCurrency(avgGainDollars)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Profit Factor:</span>
                  <span className="text-sm">{profitFactor.toFixed(2)}x</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}