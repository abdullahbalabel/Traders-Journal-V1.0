import { useState, useEffect, useCallback } from 'react';
import { Position } from '../types';

export function useAccountValue(userDB: any) {
  const [baseAccountValue, setBaseAccountValue] = useState<number>(100000);
  const [currentAccountValue, setCurrentAccountValue] = useState<number>(100000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userDB) {
      loadAccountValue();
    }
  }, [userDB]);

  const loadAccountValue = async () => {
    if (!userDB) return;
    
    try {
      const value = await userDB.getAccountValue();
      setBaseAccountValue(Number(value) || 100000);
      setCurrentAccountValue(Number(value) || 100000);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load account value:', error);
      setLoading(false);
    }
  };

  const updateAccountValue = async (value: number) => {
    if (!userDB) return false;
    
    try {
      const numericValue = Number(value) || 100000;
      await userDB.updateAccountValue(numericValue);
      await loadAccountValue();
      return true;
    } catch (error) {
      console.error('Failed to update account value:', error);
      return false;
    }
  };

  const calculateCurrentValue = useCallback((positions: Position[]) => {
    if (!positions || positions.length === 0) {
      setCurrentAccountValue(baseAccountValue);
      return;
    }

    const totalPnL = positions.reduce((sum, position) => {
      if (!position) return sum;
      
      const priceToUse = position.exitPrice || position.currentPrice;
      const entryPrice = Number(position.entryPrice) || 0;
      const quantity = Number(position.quantity) || 0;
      const price = Number(priceToUse) || 0;
      const multiplier = position.type === 'long' ? 1 : -1;
      
      const pnl = (price - entryPrice) * quantity * multiplier;
      return sum + (isNaN(pnl) ? 0 : pnl);
    }, 0);

    const newValue = baseAccountValue + totalPnL;
    setCurrentAccountValue(isNaN(newValue) ? baseAccountValue : newValue);
  }, [baseAccountValue]);

  return {
    baseAccountValue,
    currentAccountValue,
    loading,
    updateAccountValue,
    calculateCurrentValue,
    refresh: loadAccountValue
  };
}