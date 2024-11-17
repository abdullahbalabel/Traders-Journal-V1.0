import React from 'react';
import { Position } from '../types';
import * as XLSX from 'xlsx';

export function exportToExcel(positions: Position[]) {
  const data = positions.map(position => ({
    Symbol: position.symbol,
    Type: position.type,
    Quantity: position.quantity,
    'Entry Price': position.entryPrice,
    'Current Price': position.currentPrice,
    'Exit Price': position.exitPrice || '',
    'Stop Loss': position.stopLoss,
    'Take Profit': position.takeProfit,
    'Created At': position.createdAt ? new Date(position.createdAt).toLocaleString() : '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Trades');
  
  // Generate file name with current date
  const fileName = `trades_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Save the file
  XLSX.writeFile(wb, fileName);
}