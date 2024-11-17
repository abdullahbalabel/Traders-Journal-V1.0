import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Shield, AlertTriangle } from 'lucide-react';
import { Position } from '../types';

interface RiskAnalyzerProps {
  positions: Position[];
}

export default function RiskAnalyzer({ positions }: RiskAnalyzerProps) {
  // Calculate actual risk metrics
  const calculateRiskMetrics = () => {
    if (positions.length === 0) {
      return {
        lowRisk: 0,
        mediumRisk: 0,
        highRisk: 0,
        avgRiskPerTrade: 0,
        portfolioHeat: 0,
        winRate: 0
      };
    }

    // Calculate P&L for each position
    const positionsWithPnL = positions.map(position => {
      const priceToUse = position.exitPrice || position.currentPrice;
      const multiplier = position.type === 'long' ? 1 : -1;
      const pnl = (priceToUse - position.entryPrice) * position.quantity * multiplier;
      const riskAmount = Math.abs(position.entryPrice - position.stopLoss) * position.quantity;
      const positionValue = position.quantity * position.entryPrice;
      
      return {
        ...position,
        pnl,
        riskAmount,
        positionValue
      };
    }).filter(p => p.positionValue > 0); // Filter out invalid positions

    if (positionsWithPnL.length === 0) {
      return {
        lowRisk: 0,
        mediumRisk: 0,
        highRisk: 0,
        avgRiskPerTrade: 0,
        portfolioHeat: 0,
        winRate: 0
      };
    }

    // Calculate win rate
    const winningTrades = positionsWithPnL.filter(p => p.pnl > 0).length;
    const winRate = (winningTrades / positionsWithPnL.length) * 100;

    // Calculate average risk per trade as a percentage of position size
    const riskPercentages = positionsWithPnL.map(p => 
      (p.riskAmount / p.positionValue) * 100
    );
    const avgRiskPerTrade = riskPercentages.reduce((sum, risk) => sum + risk, 0) / positionsWithPnL.length;

    // Calculate portfolio heat (percentage of positions at risk)
    const totalPositionValue = positionsWithPnL.reduce((sum, p) => sum + p.positionValue, 0);
    const totalRiskAmount = positionsWithPnL.reduce((sum, p) => sum + p.riskAmount, 0);
    const portfolioHeat = totalPositionValue > 0 ? (totalRiskAmount / totalPositionValue) * 100 : 0;

    // Categorize risk levels based on multiple factors
    const riskCategories = positionsWithPnL.reduce((acc, position) => {
      const riskPercent = (position.riskAmount / position.positionValue) * 100;
      if (riskPercent <= 1) {
        acc.low++;
      } else if (riskPercent <= 2) {
        acc.medium++;
      } else {
        acc.high++;
      }
      return acc;
    }, { low: 0, medium: 0, high: 0 });

    // Convert to percentages
    const total = positionsWithPnL.length;
    const lowRisk = (riskCategories.low / total) * 100;
    const mediumRisk = (riskCategories.medium / total) * 100;
    const highRisk = (riskCategories.high / total) * 100;

    return {
      lowRisk,
      mediumRisk,
      highRisk,
      avgRiskPerTrade,
      portfolioHeat,
      winRate
    };
  };

  const metrics = calculateRiskMetrics();

  const riskData = [
    { name: 'Low Risk', value: metrics.lowRisk || 0 },
    { name: 'Medium Risk', value: metrics.mediumRisk || 0 },
    { name: 'High Risk', value: metrics.highRisk || 0 },
  ].filter(item => item.value > 0);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  // Calculate overall risk score (0-100)
  const riskScore = Math.round(
    100 - (
      (metrics.lowRisk * 0.8) +
      (metrics.mediumRisk * 0.5) +
      (metrics.highRisk * 0.2)
    )
  ) || 0;

  const getRiskLevel = (score: number) => {
    if (score <= 33) return { text: 'Low', color: 'text-green-500 bg-green-500/20' };
    if (score <= 66) return { text: 'Medium', color: 'text-yellow-500 bg-yellow-500/20' };
    return { text: 'High', color: 'text-red-500 bg-red-500/20' };
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Risk Analysis</h2>
        <Shield className="h-5 w-5 text-blue-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Avg. Risk per Trade</span>
              <AlertTriangle className={`h-4 w-4 ${
                metrics.avgRiskPerTrade <= 1 ? 'text-green-500' :
                metrics.avgRiskPerTrade <= 2 ? 'text-yellow-500' : 'text-red-500'
              }`} />
            </div>
            <span className="text-xl font-bold">{metrics.avgRiskPerTrade.toFixed(1)}%</span>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Portfolio Heat</span>
              <div className="h-2 w-24 bg-gray-600 rounded-full">
                <div 
                  className={`h-2 rounded-full ${
                    metrics.portfolioHeat <= 15 ? 'bg-green-500' :
                    metrics.portfolioHeat <= 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, metrics.portfolioHeat)}%` }}
                ></div>
              </div>
            </div>
            <span className="text-xl font-bold">{metrics.portfolioHeat.toFixed(1)}%</span>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Risk Score</span>
              <span className={`px-2 py-1 ${riskLevel.color} rounded-md text-sm`}>
                {riskLevel.text}
              </span>
            </div>
            <span className="text-xl font-bold">{riskScore}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}