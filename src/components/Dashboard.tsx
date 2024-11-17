import React, { useState, useEffect } from 'react';
import { TrendingUp, User } from 'lucide-react';
import { usePositions } from '../hooks/usePositions';
import { useAccountValue } from '../hooks/useAccountValue';
import { useSettings } from '../hooks/useSettings';
import { populateSampleData } from '../utils/sampleData';
import PortfolioOverview from './PortfolioOverview';
import PositionsList from './PositionsList';
import PositionSizer from './PositionSizer';
import NewTradeModal from './NewTradeModal';
import AccountConfig from './AccountConfig';
import MenuDropdown from './MenuDropdown';
import Navigation from './Navigation';
import MyJournal from './MyJournal';
import TradingStats from './TradingStats';
import SetupGuide from './SetupGuide';
import ImportExcel from './ImportExcel';
import { exportToExcel } from './ExportExcel';

interface DashboardProps {
  user: {
    id: number;
    email: string;
    name: string;
  };
  userDB: any;
  onLogout: () => void;
}

export default function Dashboard({ user, userDB, onLogout }: DashboardProps) {
  const [isNewTradeModalOpen, setIsNewTradeModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'overview' | 'journal'>('overview');
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const { positions, loading, addPosition, clearAllData, refresh: refreshPositions } = usePositions(userDB);
  const { baseAccountValue, currentAccountValue, updateAccountValue, calculateCurrentValue } = useAccountValue(userDB);
  const { profitRiskRatio, riskPercentage, updateProfitRiskRatio, updateRiskPercentage, refresh: refreshSettings } = useSettings(userDB);

  // Check if setup is completed when component mounts
  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const settings = await userDB.getSettings();
        setShowSetupGuide(!settings.setupCompleted);
      } catch (error) {
        console.error('Failed to check setup status:', error);
      }
    };
    checkSetupStatus();
  }, [userDB]);

  useEffect(() => {
    calculateCurrentValue(positions);
  }, [positions, calculateCurrentValue]);

  const handleSetupComplete = async (values: { accountValue: number; riskPercentage: number; profitRiskRatio: number }) => {
    try {
      await updateAccountValue(values.accountValue);
      await updateRiskPercentage(values.riskPercentage);
      await updateProfitRiskRatio(values.profitRiskRatio);
      
      // Update setupCompleted flag
      await userDB.updateSettings({
        setupCompleted: true,
        updatedAt: new Date().toISOString()
      });
      
      setShowSetupGuide(false);
      refreshSettings();
    } catch (error) {
      console.error('Failed to save setup values:', error);
    }
  };

  const handleNewTrade = async (trade: any) => {
    try {
      await addPosition({
        ...trade,
        currentPrice: trade.entryPrice,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setIsNewTradeModalOpen(false);
    } catch (error) {
      console.error('Failed to add trade:', error);
    }
  };

  const handleImportTrades = async (trades: any[]) => {
    try {
      for (const trade of trades) {
        await addPosition({
          ...trade,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      setIsImportModalOpen(false);
      refreshPositions();
    } catch (error) {
      console.error('Failed to import trades:', error);
    }
  };

  const handleAddSampleData = async () => {
    try {
      await populateSampleData(userDB);
      refreshPositions();
    } catch (error) {
      console.error('Failed to add sample data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold">TradersJournal</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-400">
              <User className="h-5 w-5" />
              <span>{user.name}</span>
            </div>
            <button
              onClick={() => setIsNewTradeModalOpen(true)}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Trade
            </button>
            <MenuDropdown 
              userId={user.id}
              userDB={userDB}
              onLogout={onLogout}
              onImport={() => setIsImportModalOpen(true)}
              onExport={() => exportToExcel(positions)}
              onClearData={clearAllData}
              onAddSampleData={handleAddSampleData}
              onChangePassword={async (currentPassword: string, newPassword: string) => {
                await userDB.updateSettings({ password: newPassword });
              }}
              onSettingsUpdate={refreshSettings}
            />
          </div>
        </div>
      </nav>

      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="p-6">
        {currentPage === 'overview' ? (
          <>
            <AccountConfig 
              initialAccountValue={baseAccountValue}
              currentAccountValue={currentAccountValue}
              onUpdateAccountValue={updateAccountValue}
            />
            <div className="space-y-6">
              <PortfolioOverview 
                positions={positions} 
                loading={loading}
                accountValue={baseAccountValue}
                currentAccountValue={currentAccountValue}
              />
              <TradingStats positions={positions} loading={loading} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PositionSizer 
                  initialAccountValue={baseAccountValue}
                  riskPercentage={riskPercentage}
                  profitRiskRatio={profitRiskRatio}
                />
              </div>
            </div>
          </>
        ) : (
          <MyJournal positions={positions} loading={loading} />
        )}
      </main>

      <NewTradeModal
        isOpen={isNewTradeModalOpen}
        onClose={() => setIsNewTradeModalOpen(false)}
        onSubmit={handleNewTrade}
        profitRiskRatio={profitRiskRatio}
      />

      <ImportExcel
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportTrades}
      />

      <SetupGuide
        isOpen={showSetupGuide}
        onComplete={handleSetupComplete}
      />
    </div>
  );
}