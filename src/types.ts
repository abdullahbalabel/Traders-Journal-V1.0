export interface Position {
  id?: number;
  symbol: string;
  type: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  exitPrice?: number | null;
  stopLoss: number;
  takeProfit: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RiskMetrics {
  riskPerTrade: number;
  accountBalance: number;
  maxDrawdown: number;
  winRate: number;
}

export interface PortfolioStats {
  totalValue: number;
  dailyPnL: number;
  totalPnL: number;
  openPositions: number;
}