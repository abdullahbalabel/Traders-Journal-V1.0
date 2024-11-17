import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, RefreshCw, Shield, LogOut, Plus, UserPlus } from 'lucide-react';
import { mainDB } from '../../lib/db';
import CreateAdminModal from './CreateAdminModal';

interface User {
  id?: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'deleted';
  subscription?: {
    type: 'free' | 'premium';
    expiresAt: string;
  };
  createdAt: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await mainDB.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: number | undefined, status: 'active' | 'suspended') => {
    if (!userId) return;
    
    try {
      await mainDB.updateUserStatus(userId, status);
      await loadUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update user status');
    }
  };

  const handleSubscriptionUpdate = async (
    userId: number | undefined,
    type: 'free' | 'premium',
    autoRenew: boolean
  ) => {
    if (!userId) return;

    try {
      await mainDB.updateUserSubscription(userId, type, autoRenew);
      await loadUsers();
    } catch (error) {
      console.error('Failed to update subscription:', error);
      alert(error instanceof Error ? error.message : 'Failed to update subscription');
    }
  };

  const handleCreateAdmin = async (email: string, password: string, name: string) => {
    try {
      await mainDB.createAdminUser(email, password, name);
      await loadUsers();
      setIsCreateAdminModalOpen(false);
    } catch (error) {
      console.error('Failed to create admin:', error);
      throw error;
    }
  };

  const handleUpgradeToAdmin = async (userId: number | undefined) => {
    if (!userId) return;
    
    try {
      await mainDB.upgradeToAdmin(userId);
      await loadUsers();
    } catch (error) {
      console.error('Failed to upgrade user to admin:', error);
      alert(error instanceof Error ? error.message : 'Failed to upgrade user to admin');
    }
  };

  const handleRemoveAdmin = async (userId: number | undefined) => {
    if (!userId) return;
    
    try {
      await mainDB.removeAdminRole(userId);
      await loadUsers();
    } catch (error) {
      console.error('Failed to remove admin:', error);
      alert(error instanceof Error ? error.message : 'Failed to remove admin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCreateAdminModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Admin</span>
            </button>
            <button
              onClick={loadUsers}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">User Management</h2>
            <div className="flex items-center space-x-2 text-gray-400">
              <Users className="h-5 w-5" />
              <span>{users.length} Users</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-400">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="pb-4">User</th>
                    <th className="pb-4">Role</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Subscription</th>
                    <th className="pb-4">Joined</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-t border-gray-700">
                      <td className="py-4">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-500'
                            : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'active' 
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div className="font-medium">
                            {user.subscription?.type.toUpperCase() || 'FREE'}
                          </div>
                          <div className="text-sm text-gray-400">
                            Expires: {new Date(user.subscription?.expiresAt || '').toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          {user.role === 'admin' ? (
                            <button
                              onClick={() => handleRemoveAdmin(user.id)}
                              className="px-3 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg text-sm transition-colors"
                            >
                              Remove Admin
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleUpgradeToAdmin(user.id)}
                                className="p-2 text-purple-500 hover:bg-purple-500/20 rounded-lg transition-colors"
                                title="Upgrade to Admin"
                              >
                                <UserPlus className="h-5 w-5" />
                              </button>
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => handleStatusChange(user.id, 'suspended')}
                                  className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                                  title="Suspend User"
                                >
                                  <UserX className="h-5 w-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusChange(user.id, 'active')}
                                  className="p-2 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors"
                                  title="Activate User"
                                >
                                  <UserCheck className="h-5 w-5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleSubscriptionUpdate(user.id, 'premium', true)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                              >
                                Upgrade to Premium
                              </button>
                              <button
                                onClick={() => handleSubscriptionUpdate(user.id, 'free', false)}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                              >
                                Set Free Trial
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CreateAdminModal
        isOpen={isCreateAdminModalOpen}
        onClose={() => setIsCreateAdminModalOpen(false)}
        onSubmit={handleCreateAdmin}
      />
    </div>
  );
}