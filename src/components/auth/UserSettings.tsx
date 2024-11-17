import React, { useState } from 'react';
import { Lock, AlertCircle, Loader2, X } from 'lucide-react';

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteAccount: () => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export default function UserSettings({ 
  isOpen, 
  onClose, 
  onDeleteAccount,
  onChangePassword 
}: UserSettingsProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate passwords
      if (!newPassword || !confirmPassword) {
        throw new Error('All fields are required');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }

      // Call the password change function with empty current password
      await onChangePassword('', newPassword);

      // Clear form and show success message
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setIsLoading(true);
    try {
      await onDeleteAccount();
      setShowDeleteConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Account Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 px-4 py-3 rounded-lg flex items-start mb-4">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-500 px-4 py-3 rounded-lg flex items-start mb-4">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold">Change Password</h3>

          <div>
            <label className="block text-sm text-gray-400 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-700 rounded-lg py-2 pl-10 pr-3 text-gray-100"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-700 rounded-lg py-2 pl-10 pr-3 text-gray-100"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Changing Password...</span>
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </form>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-red-500 mb-4">Delete Account</h3>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}