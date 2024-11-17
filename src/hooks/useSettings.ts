import { useState, useEffect } from 'react';

export function useSettings(userDB: any) {
  const [profitRiskRatio, setProfitRiskRatio] = useState<number>(2);
  const [lossRiskRatio, setLossRiskRatio] = useState<number>(1);
  const [riskPercentage, setRiskPercentage] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userDB) {
      loadSettings();
    }
  }, [userDB]);

  const loadSettings = async () => {
    if (!userDB) return;
    
    try {
      const settings = await userDB.getSettings();
      setProfitRiskRatio(settings.profitRiskRatio);
      setLossRiskRatio(settings.lossRiskRatio);
      setRiskPercentage(settings.riskPercentage);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setLoading(false);
    }
  };

  const updateProfitRiskRatio = async (ratio: number) => {
    if (!userDB) return false;
    
    try {
      await userDB.updateSettings({ profitRiskRatio: ratio });
      setProfitRiskRatio(ratio);
      return true;
    } catch (error) {
      console.error('Failed to update profit/risk ratio:', error);
      return false;
    }
  };

  const updateLossRiskRatio = async (ratio: number) => {
    if (!userDB) return false;
    
    try {
      await userDB.updateSettings({ lossRiskRatio: ratio });
      setLossRiskRatio(ratio);
      return true;
    } catch (error) {
      console.error('Failed to update loss/risk ratio:', error);
      return false;
    }
  };

  const updateRiskPercentage = async (percentage: number) => {
    if (!userDB) return false;
    
    try {
      await userDB.updateSettings({ riskPercentage: percentage });
      setRiskPercentage(percentage);
      return true;
    } catch (error) {
      console.error('Failed to update risk percentage:', error);
      return false;
    }
  };

  return {
    profitRiskRatio,
    lossRiskRatio,
    riskPercentage,
    loading,
    updateProfitRiskRatio,
    updateLossRiskRatio,
    updateRiskPercentage,
    refresh: loadSettings
  };
}