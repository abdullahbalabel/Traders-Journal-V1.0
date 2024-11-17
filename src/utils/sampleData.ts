import { Position } from '../types';

const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD', 'JPM', 'BAC'];

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generatePrice(): number {
  return Math.round(randomInRange(50, 500) * 100) / 100;
}

function generateTrade(date: Date): Omit<Position, 'id'> {
  const type = Math.random() > 0.5 ? 'long' : 'short';
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const entryPrice = generatePrice();
  const quantity = Math.floor(randomInRange(10, 100));
  
  // Generate realistic price movements
  const priceChange = entryPrice * randomInRange(-0.05, 0.05); // ±5% price movement
  const currentPrice = Math.round((entryPrice + priceChange) * 100) / 100;
  
  // Set stop loss and take profit based on position type
  let stopLoss, takeProfit;
  if (type === 'long') {
    stopLoss = Math.round((entryPrice * 0.98) * 100) / 100; // 2% below entry
    takeProfit = Math.round((entryPrice * 1.04) * 100) / 100; // 4% above entry
  } else {
    stopLoss = Math.round((entryPrice * 1.02) * 100) / 100; // 2% above entry
    takeProfit = Math.round((entryPrice * 0.96) * 100) / 100; // 4% below entry
  }

  // Determine if trade should be closed
  const shouldClose = Math.random() > 0.3; // 70% chance of trade being closed
  let exitPrice = null;
  if (shouldClose) {
    if (type === 'long') {
      exitPrice = Math.random() > 0.6 ? // 60% win rate
        randomInRange(entryPrice, takeProfit) : // winning trade
        randomInRange(stopLoss, entryPrice); // losing trade
    } else {
      exitPrice = Math.random() > 0.6 ? // 60% win rate
        randomInRange(takeProfit, entryPrice) : // winning trade
        randomInRange(entryPrice, stopLoss); // losing trade
    }
    exitPrice = Math.round(exitPrice * 100) / 100;
  }

  const timestamp = date.toISOString();

  return {
    symbol,
    type,
    quantity,
    entryPrice,
    currentPrice: exitPrice || currentPrice,
    exitPrice,
    stopLoss,
    takeProfit,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export async function populateSampleData(userDB: any) {
  try {
    // Clear existing data
    await userDB.clearData();
    
    // Generate 3 months of trades
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    startDate.setHours(0, 0, 0, 0);

    // Create an array of dates for the past 3 months
    const dates: Date[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Skip weekends
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate trades for each date
    for (const date of dates) {
      // Vary trading frequency based on the month
      const monthDiff = endDate.getMonth() - date.getMonth() + 
        (12 * (endDate.getFullYear() - date.getFullYear()));
      
      let tradesPerDay;
      // First month: Light trading (1-2 trades per day)
      if (monthDiff >= 2) {
        tradesPerDay = Math.floor(randomInRange(1, 3));
      }
      // Second month: Medium trading (2-3 trades per day)
      else if (monthDiff >= 1) {
        tradesPerDay = Math.floor(randomInRange(2, 4));
      }
      // Third month: Heavy trading (3-5 trades per day)
      else {
        tradesPerDay = Math.floor(randomInRange(3, 6));
      }

      // Generate trades for the day
      const tradeTimes = Array.from({ length: tradesPerDay }, () => {
        // Trading hours between 9:30 AM and 4:00 PM
        const hour = Math.floor(randomInRange(9, 16)); // 9 AM to 4 PM
        const minute = Math.floor(randomInRange(0, 60));
        return { hour, minute };
      }).sort((a, b) => a.hour - b.hour || a.minute - b.minute); // Sort by time

      for (const { hour, minute } of tradeTimes) {
        const tradeDate = new Date(date);
        tradeDate.setHours(hour, minute, 0, 0);
        
        // Only generate trade if it's not in the future
        if (tradeDate <= endDate) {
          const trade = generateTrade(tradeDate);
          
          // Add some variance to win rates based on the time of day
          if (hour < 11) { // Morning trades
            trade.exitPrice = trade.exitPrice && Math.random() > 0.4 ? trade.exitPrice : null;
          } else if (hour > 14) { // Afternoon trades
            trade.exitPrice = trade.exitPrice && Math.random() > 0.5 ? trade.exitPrice : null;
          }
          
          await userDB.addPosition(trade);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to populate sample data:', error);
    throw error;
  }
}