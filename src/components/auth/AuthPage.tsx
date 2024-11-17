import React, { useState } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthPageProps {
  onAuthSuccess: (user: { id: number; email: string; name: string }) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-12 items-center justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-xl text-white">
          <div className="flex items-center space-x-3 mb-8">
            <TrendingUp className="h-12 w-12" />
            <h1 className="text-4xl font-bold">TradersJournal</h1>
          </div>
          <p className="text-2xl font-light mb-6">
            Your personal trading companion for better decision making and portfolio management
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-center">
              <div className="h-2 w-2 bg-white rounded-full mr-3" />
              Track your trades with precision
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 bg-white rounded-full mr-3" />
              Analyze your performance metrics
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 bg-white rounded-full mr-3" />
              Make data-driven decisions
            </li>
          </ul>
        </div>
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[20%] left-[10%] h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-[30%] right-[20%] h-48 w-48 rounded-full bg-white blur-3xl" />
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-[580px] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-gray-400">
              {isLogin 
                ? 'Sign in to continue your trading journey'
                : 'Start tracking your trades and improve your performance'
              }
            </p>
          </div>

          <div className={`transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            {isLogin ? (
              <LoginForm onSuccess={onAuthSuccess} />
            ) : (
              <RegisterForm onSuccess={onAuthSuccess} />
            )}
          </div>

          <div className="mt-8 text-center lg:text-left">
            <button
              onClick={handleToggle}
              className="text-blue-500 hover:text-blue-400 transition-colors inline-flex items-center text-sm"
            >
              {isLogin ? 'Need an account?' : 'Already have an account?'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {/* Mobile Branding */}
          <div className="mt-12 lg:hidden text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">TradersJournal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}