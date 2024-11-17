import { useState, useEffect } from 'react';
import { Position } from '../types';

export function usePositions(userDB: any) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (userDB) {
      loadPositions();
    }
  }, [userDB]);

  const loadPositions = async () => {
    if (!userDB) return;
    
    try {
      const data = await userDB.getAllPositions();
      setPositions(data);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!userDB) return false;
    
    try {
      await userDB.clearData();
      setPositions([]);
      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const addPosition = async (position: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userDB) return;
    
    try {
      const newPosition = await userDB.addPosition(position);
      setPositions(prev => [newPosition, ...prev]);
      return newPosition;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updatePosition = async (id: number, updates: Partial<Position>) => {
    if (!userDB) return false;
    
    try {
      const success = await userDB.updatePosition(id, updates);
      if (success) {
        setPositions(prev =>
          prev.map(pos => (pos.id === id ? { ...pos, ...updates } : pos))
        );
      }
      return success;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deletePosition = async (id: number) => {
    if (!userDB) return false;
    
    try {
      const success = await userDB.deletePosition(id);
      if (success) {
        setPositions(prev => prev.filter(pos => pos.id !== id));
      }
      return success;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    positions,
    loading,
    error,
    addPosition,
    updatePosition,
    deletePosition,
    clearAllData,
    refresh: loadPositions,
  };
}