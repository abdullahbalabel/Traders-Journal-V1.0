import React, { useRef } from 'react';
import { FileSpreadsheet, Upload, AlertCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Position } from '../types';

interface ImportExcelProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (positions: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
}

export default function ImportExcel({ isOpen, onClose, onImport }: ImportExcelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const positions = jsonData.map((row: any) => ({
          symbol: String(row.Symbol || row.symbol || '').toUpperCase(),
          type: (row.Type || row.type || 'long').toLowerCase() as 'long' | 'short',
          quantity: Number(row.Quantity || row.quantity || 0),
          entryPrice: Number(row.EntryPrice || row['Entry Price'] || row.entryPrice || 0),
          currentPrice: Number(row.CurrentPrice || row['Current Price'] || row.currentPrice || 0),
          exitPrice: row.ExitPrice || row['Exit Price'] || row.exitPrice ? 
            Number(row.ExitPrice || row['Exit Price'] || row.exitPrice) : undefined,
          stopLoss: Number(row.StopLoss || row['Stop Loss'] || row.stopLoss || 0),
          takeProfit: Number(row.TakeProfit || row['Take Profit'] || row.takeProfit || 0),
        }));

        onImport(positions);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing Excel file. Please check the format and try again.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <FileSpreadsheet className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold">Import Trades</h2>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Excel File
            </button>
            <p className="text-gray-400 text-sm mt-2">
              Upload your Excel file containing trade data
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-400">
                <p className="font-semibold text-gray-300 mb-1">Required Excel Format:</p>
                <p>Your Excel file should include these columns:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Symbol</li>
                  <li>Type (long/short)</li>
                  <li>Quantity</li>
                  <li>Entry Price</li>
                  <li>Current Price</li>
                  <li>Exit Price (optional)</li>
                  <li>Stop Loss</li>
                  <li>Take Profit</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}