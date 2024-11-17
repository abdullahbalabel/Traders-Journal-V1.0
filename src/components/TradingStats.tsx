import React from 'react';
import { Position } from '../types';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface TradingStatsProps {
  positions: Position[];
  loading: boolean;
}

interface ProfitPeriod {
  period: string;
  profit: number;
}

export default function TradingStats({ positions, loading }: TradingStatsProps) {
  const calculatePnL = (position: Position): number => {
    const priceToUse = position.exitPrice || position.currentPrice;
    const multiplier = position.type === 'long' ? 1 : -1;
    return (Number(priceToUse) - Number(position.entryPrice)) * Number(position.quantity) * multiplier;
  };

  // Get today's trades
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTrades = positions.filter(position => {
    const tradeDate = new Date(position.createdAt || 0);
    return tradeDate >= today;
  });

  // Calculate top gainers and losers
  const tradesWithPnL = positions.map(position => ({
    ...position,
    pnl: calculatePnL(position)
  })).sort((a, b) => b.pnl - a.pnl);

  const topGainers = tradesWithPnL.filter(trade => trade.pnl > 0).slice(0, 5);
  const topLosers = tradesWithPnL.filter(trade => trade.pnl < 0).slice(-5).reverse();

  // Helper function to get week number
  const getWeekNumber = (date: Date): string => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `Week ${weekNumber}, ${date.getFullYear()}`;
  };

  // Calculate profits by period
  const calculatePeriodProfits = () => {
    return positions.reduce((acc, position) => {
      const date = new Date(position.createdAt || 0);
      const pnl = calculatePnL(position);

      // Monthly
      const monthKey = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      acc.months.set(monthKey, (acc.months.get(monthKey) || 0) + pnl);

      // Weekly
      const weekKey = getWeekNumber(date);
      acc.weeks.set(weekKey, (acc.weeks.get(weekKey) || 0) + pnl);

      // Daily
      const dayKey = date.toLocaleDateString();
      acc.days.set(dayKey, (acc.days.get(dayKey) || 0) + pnl);

      return acc;
    }, {
      months: new Map<string, number>(),
      weeks: new Map<string, number>(),
      days: new Map<string, number>()
    });
  };

  const periodProfits = calculatePeriodProfits();
  const monthlyProfits = findMostLeastProfitable(periodProfits.months);
  const weeklyProfits = findMostLeastProfitable(periodProfits.weeks);
  const dailyProfits = findMostLeastProfitable(periodProfits.days);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Trades</h2>
        <div className="space-y-4">
          {todayTrades.length === 0 ? (
            <p className="text-gray-400">No trades today</p>
          ) : (
            todayTrades.map(trade => {
              const pnl = calculatePnL(trade);
              return (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{trade.symbol}</span>
                      <span className={trade.type === 'long' ? 'text-green-500' : 'text-red-500'}>
                        {trade.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(trade.createdAt || 0).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className={`flex items-center ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {pnl >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {formatCurrency(Math.abs(pnl))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Top 5 Gainers</h2>
        <div className="space-y-4">
          {topGainers.length === 0 ? (
            <p className="text-gray-400">No profitable trades</p>
          ) : (
            topGainers.map(trade => (
              <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{trade.symbol}</span>
                    <span className={trade.type === 'long' ? 'text-green-500' : 'text-red-500'}>
                      {trade.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-green-500 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {formatCurrency(trade.pnl)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Top 5 Losers</h2>
        <div className="space-y-4">
          {topLosers.length === 0 ? (
            <p className="text-gray-400">No unprofitable trades</p>
          ) : (
            topLosers.map(trade => (
              <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{trade.symbol}</span>
                    <span className={trade.type === 'long' ? 'text-green-500' : 'text-red-500'}>
                      {trade.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-red-500 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  {formatCurrency(Math.abs(trade.pnl))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Profit Analysis</h2>
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Monthly</h3>
              {monthlyProfits.most && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400">Most Profitable</div>
                  <div className="font-semibold">{monthlyProfits.most.period}</div>
                  <div className="text-green-500">{formatCurrency(monthlyProfits.most.profit)}</div>
                </div>
              )}
              {monthlyProfits.least && (
                <div>
                  <div className="text-sm text-gray-400">Least Profitable</div>
                  <div className="font-semibold">{monthlyProfits.least.period}</div>
                  <div className="text-red-500">{formatCurrency(monthlyProfits.least.profit)}</div>
                </div>
              )}
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Weekly</h3>
              {weeklyProfits.most && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400">Most Profitable</div>
                  <div className="font-semibold">{weeklyProfits.most.period}</div>
                  <div className="text-green-500">{formatCurrency(weeklyProfits.most.profit)}</div>
                </div>
              )}
              {weeklyProfits.least && (
                <div>
                  <div className="text-sm text-gray-400">Least Profitable</div>
                  <div className="font-semibold">{weeklyProfits.least.period}</div>
                  <div className="text-red-500">{formatCurrency(weeklyProfits.least.profit)}</div>
                </div>
              )}
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Daily</h3>
              {dailyProfits.most && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400">Most Profitable</div>
                  <div className="font-semibold">{dailyProfits.most.period}</div>
                  <div className="text-green-500">{formatCurrency(dailyProfits.most.profit)}</div>
                </div>
              )}
              {dailyProfits.least && (
                <div>
                  <div className="text-sm text-gray-400">Least Profitable</div>
                  <div className="font-semibold">{dailyProfits.least.period}</div>
                  <div className="text-red-500">{formatCurrency(dailyProfits.least.profit)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const findMostLeastProfitable = (map: Map<string, number>) => {
  if (map.size === 0) return { most: null, least: null };

  let most: ProfitPeriod | null = null;
  let least: ProfitPeriod | null = null;

  // Convert map to array and sort by profit
  const sortedPeriods = Array.from(map.entries())
    .map(([period, profit]) => ({ period, profit }))
    .sort((a, b) => b.profit - a.profit);

  if (sortedPeriods.length > 0) {
    // Most profitable is always the first after sorting
    most = sortedPeriods[0];
    
    // For least profitable:
    // If we have multiple periods, take the lowest profit
    // If all profits are positive, take the lowest positive
    // If all profits are negative, take the most negative
    least = sortedPeriods[sortedPeriods.length - 1];

    // If we only have one period, handle it appropriately
    if (sortedPeriods.length === 1) {
      if (most.profit >= 0) {
        // If it's profitable, show as most profitable only
        least = null;
      } else {
        // If it's unprofitable, show as least profitable only
        least = most;
        most = null;
      }
    }
  }

  return { most, least };
};