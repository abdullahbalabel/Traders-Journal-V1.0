import React, { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, AlertOctagon } from 'lucide-react';
import { mainDB } from '../../lib/db';

interface LoginFormProps {
  onSuccess: (user: { id: number; email: string; name: string }) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuspended, setIsSuspended] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSuspended(false);
    setIsLoading(true);

    try {
      const user = await mainDB.authenticateUser(email, password);
      if (!user) {
        setError('Invalid email or password');
        return;
      }

      const { password: _, ...safeUser } = user;
      onSuccess(safeUser as { id: number; email: string; name: string });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      if (errorMessage.includes('suspended')) {
        setIsSuspended(true);
      } else {
        setError(errorMessage);
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 text-red-500 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isSuspended && (
        <div className="bg-yellow-500/10 text-yellow-500 px-4 py-3 rounded-lg flex items-start">
          <AlertOctagon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium">Account Suspended</p>
            <p className="text-sm">Your account has been suspended. Please contact support for assistance with reactivating your account.</p>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-300">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-300">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>
    </form>
  );
}