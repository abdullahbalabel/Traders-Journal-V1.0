import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Position } from '../types';

interface PositionsListProps {
  positions: Position[];
  loading: boolean;
}

type SortField = 'date' | 'symbol' | 'type' | 'quantity' | 'entryPrice' | 'currentPrice' | 'pnl';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function PositionsList({ positions, loading }: PositionsListProps) {
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'date', direction: 'desc' });

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const calculatePnL = (position: Position) => {
    const entryPrice = Number(position.entryPrice) || 0;
    const currentPrice = Number(position.exitPrice || position.currentPrice) || 0;
    const quantity = Number(position.quantity) || 0;
    const multiplier = position.type === 'long' ? 1 : -1;

    if (entryPrice <= 0 || quantity <= 0) {
      return { pnl: 0, pnlPercent: 0 };
    }

    const pnl = (currentPrice - entryPrice) * quantity * multiplier;
    const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100 * multiplier;

    return {
      pnl: isNaN(pnl) ? 0 : pnl,
      pnlPercent: isNaN(pnlPercent) ? 0 : pnlPercent
    };
  };

  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-4 w-4 text-blue-500" /> : 
      <ArrowDown className="h-4 w-4 text-blue-500" />;
  };

  // Sort positions
  const sortedPositions = [...positions].sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;

    switch (sortConfig.field) {
      case 'date':
        return (new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()) * direction;
      case 'symbol':
        return a.symbol.localeCompare(b.symbol) * direction;
      case 'type':
        return a.type.localeCompare(b.type) * direction;
      case 'quantity':
        return (Number(a.quantity) - Number(b.quantity)) * direction;
      case 'entryPrice':
        return (Number(a.entryPrice) - Number(b.entryPrice)) * direction;
      case 'currentPrice': {
        const aPrice = Number(a.exitPrice || a.currentPrice);
        const bPrice = Number(b.exitPrice || b.currentPrice);
        return (aPrice - bPrice) * direction;
      }
      case 'pnl': {
        const aPnL = calculatePnL(a).pnl;
        const bPnL = calculatePnL(b).pnl;
        return (aPnL - bPnL) * direction;
      }
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedPositions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPositions = sortedPositions.slice(startIndex, startIndex + itemsPerPage);

  const formatNumber = (value: number, decimals: number = 2): string => {
    if (isNaN(value) || value === null || value === undefined) return '0.00';
    return value.toFixed(decimals);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Positions</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-gray-700 rounded-lg py-1 px-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm">
                <th className="text-left pb-4">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center space-x-1 hover:text-white"
                  >
                    <span>Date</span>
                    {getSortIcon('date')}
                  </button>
                </th>
                <th className="text-left pb-4">
                  <button
                    onClick={() => handleSort('symbol')}
                    className="flex items-center space-x-1 hover:text-white"
                  >
                    <span>Symbol</span>
                    {getSortIcon('symbol')}
                  </button>
                </th>
                <th className="text-right pb-4">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center space-x-1 hover:text-white ml-auto"
                  >
                    <span>Type</span>
                    {getSortIcon('type')}
                  </button>
                </th>
                <th className="text-right pb-4">
                  <button
                    onClick={() => handleSort('quantity')}
                    className="flex items-center space-x-1 hover:text-white ml-auto"
                  >
                    <span>Quantity</span>
                    {getSortIcon('quantity')}
                  </button>
                </th>
                <th className="text-right pb-4">
                  <button
                    onClick={() => handleSort('entryPrice')}
                    className="flex items-center space-x-1 hover:text-white ml-auto"
                  >
                    <span>Entry</span>
                    {getSortIcon('entryPrice')}
                  </button>
                </th>
                <th className="text-right pb-4">
                  <button
                    onClick={() => handleSort('currentPrice')}
                    className="flex items-center space-x-1 hover:text-white ml-auto"
                  >
                    <span>Current/Exit</span>
                    {getSortIcon('currentPrice')}
                  </button>
                </th>
                <th className="text-right pb-4">
                  <button
                    onClick={() => handleSort('pnl')}
                    className="flex items-center space-x-1 hover:text-white ml-auto"
                  >
                    <span>P&L</span>
                    {getSortIcon('pnl')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPositions.map((position) => {
                const { pnl, pnlPercent } = calculatePnL(position);
                const priceToShow = position.exitPrice || position.currentPrice;
                const date = position.createdAt ? 
                  new Date(position.createdAt).toLocaleString() : 
                  'Unknown Date';

                return (
                  <tr key={position.id} className="border-t border-gray-700">
                    <td className="py-4">{date}</td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <span className="font-semibold">{position.symbol}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className={position.type === 'long' ? 'text-green-500' : 'text-red-500'}>
                        {position.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right">{formatNumber(position.quantity, 0)}</td>
                    <td className="text-right">${formatNumber(position.entryPrice)}</td>
                    <td className="text-right">
                      ${formatNumber(priceToShow)}
                      {position.exitPrice && (
                        <span className="text-gray-400 text-sm ml-1">(Closed)</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className={`flex items-center justify-end ${
                        pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {pnl >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        ${formatNumber(Math.abs(pnl))}
                        <span className="text-sm ml-1">
                          ({pnlPercent > 0 ? '+' : ''}{formatNumber(pnlPercent)}%)
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-gray-700 rounded-lg">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}