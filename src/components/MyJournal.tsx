import React, { useState } from 'react';
import { Position } from '../types';
import PositionsList from './PositionsList';
import { Filter, Calendar, Search, X } from 'lucide-react';

interface MyJournalProps {
  positions: Position[];
  loading: boolean;
}

interface Filters {
  symbol: string;
  type: 'all' | 'long' | 'short';
  status: 'all' | 'open' | 'closed';
  dateRange: {
    start: string;
    end: string;
  };
  profitability: 'all' | 'profitable' | 'unprofitable';
}

export default function MyJournal({ positions, loading }: MyJournalProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    symbol: '',
    type: 'all',
    status: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    profitability: 'all'
  });

  const calculatePnL = (position: Position): number => {
    const priceToUse = position.exitPrice || position.currentPrice;
    const multiplier = position.type === 'long' ? 1 : -1;
    return (Number(priceToUse) - Number(position.entryPrice)) * Number(position.quantity) * multiplier;
  };

  const filteredPositions = positions.filter(position => {
    // Symbol filter
    if (filters.symbol && !position.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
      return false;
    }

    // Type filter
    if (filters.type !== 'all' && position.type !== filters.type) {
      return false;
    }

    // Status filter
    if (filters.status === 'open' && position.exitPrice) {
      return false;
    }
    if (filters.status === 'closed' && !position.exitPrice) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.start && new Date(position.createdAt!) < new Date(filters.dateRange.start)) {
      return false;
    }
    if (filters.dateRange.end && new Date(position.createdAt!) > new Date(filters.dateRange.end)) {
      return false;
    }

    // Profitability filter
    if (filters.profitability !== 'all') {
      const pnl = calculatePnL(position);
      if (filters.profitability === 'profitable' && pnl <= 0) {
        return false;
      }
      if (filters.profitability === 'unprofitable' && pnl >= 0) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setFilters({
      symbol: '',
      type: 'all',
      status: 'all',
      dateRange: {
        start: '',
        end: ''
      },
      profitability: 'all'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (typeof value === 'object') {
      return Object.values(value).some(v => v !== '');
    }
    return value !== 'all' && value !== '';
  }).length;

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">My Trading Journal</h1>
            <p className="text-gray-400">Track and analyze your trading history</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filter Trades</h2>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Symbol</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.symbol}
                    onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}
                    placeholder="Search symbol..."
                    className="w-full bg-gray-700 rounded-lg py-2 pl-10 pr-3 text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value as Filters['type'] })}
                  className="w-full bg-gray-700 rounded-lg py-2 px-3 text-gray-100"
                >
                  <option value="all">All Types</option>
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as Filters['status'] })}
                  className="w-full bg-gray-700 rounded-lg py-2 px-3 text-gray-100"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Profitability</label>
                <select
                  value={filters.profitability}
                  onChange={(e) => setFilters({ ...filters, profitability: e.target.value as Filters['profitability'] })}
                  className="w-full bg-gray-700 rounded-lg py-2 px-3 text-gray-100"
                >
                  <option value="all">All Trades</option>
                  <option value="profitable">Profitable</option>
                  <option value="unprofitable">Unprofitable</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                    className="w-full bg-gray-700 rounded-lg py-2 pl-10 pr-3 text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                    className="w-full bg-gray-700 rounded-lg py-2 pl-10 pr-3 text-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <PositionsList 
        positions={filteredPositions} 
        loading={loading}
      />
    </div>
  );
}