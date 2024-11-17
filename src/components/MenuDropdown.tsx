import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, X, FileSpreadsheet, Trash2, Menu, Database, Loader2, LogOut, User, Sliders } from 'lucide-react';
import UserSettings from './auth/UserSettings';
import RiskSettingsModal from './RiskSettingsModal';
import { mainDB } from '../lib/db';

interface MenuDropdownProps {
  onImport: () => void;
  onExport: () => void;
  onClearData: () => void;
  onAddSampleData: () => void;
  onLogout: () => void;
  userId: number;
  userDB: any;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onSettingsUpdate: () => void;
}

export default function MenuDropdown({
  onImport,
  onExport,
  onClearData,
  onAddSampleData,
  onLogout,
  userId,
  userDB,
  onChangePassword,
  onSettingsUpdate
}: MenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
  const [isRiskSettingsOpen, setIsRiskSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    profitRiskRatio: 2,
    lossRiskRatio: 1,
    riskPercentage: 1
  });

  // Load settings when component mounts
  useEffect(() => {
    loadSettings();
  }, [userDB]);

  const loadSettings = async () => {
    try {
      const userSettings = await userDB.getSettings();
      setSettings({
        profitRiskRatio: userSettings.profitRiskRatio,
        lossRiskRatio: userSettings.lossRiskRatio,
        riskPercentage: userSettings.riskPercentage
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleClearData = async () => {
    setIsLoading(true);
    try {
      await onClearData();
      setIsConfirmOpen(false);
      setIsOpen(false);
      setIsUserSettingsOpen(false);
    } catch (error) {
      console.error('Failed to clear data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await mainDB.deleteUser(userId);
      onLogout();
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  };

  if (isConfirmOpen) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4">Clear All Data?</h3>
          <p className="text-gray-400 mb-6">
            This action will permanently delete all your trading data. This cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClearData}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-lg py-2 z-50">
          <button
            onClick={() => {
              setIsUserSettingsOpen(true);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-700"
          >
            <User className="h-4 w-4 mr-2" />
            Account Settings
          </button>

          <button
            onClick={() => {
              setIsRiskSettingsOpen(true);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-700"
          >
            <Sliders className="h-4 w-4 mr-2" />
            Risk Settings
          </button>

          <button
            onClick={() => {
              onImport();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-700"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import Trades
          </button>

          <button
            onClick={() => {
              onExport();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-700"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel
          </button>

          <button
            onClick={() => {
              onAddSampleData();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-700"
          >
            <Database className="h-4 w-4 mr-2" />
            Add Sample Data
          </button>

          <button
            onClick={() => {
              setIsConfirmOpen(true);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-700 text-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </button>

          <div className="border-t border-gray-700 my-2"></div>

          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </button>
        </div>
      )}

      <UserSettings
        isOpen={isUserSettingsOpen}
        onClose={() => setIsUserSettingsOpen(false)}
        onDeleteAccount={handleDeleteAccount}
        onChangePassword={onChangePassword}
      />

      <RiskSettingsModal
        isOpen={isRiskSettingsOpen}
        onClose={() => setIsRiskSettingsOpen(false)}
        userDB={userDB}
        initialSettings={settings}
        onUpdate={loadSettings}
      />
    </div>
  );
}