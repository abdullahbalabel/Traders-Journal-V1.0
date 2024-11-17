import React from 'react';
import { LineChart, BookOpen } from 'lucide-react';

interface NavigationProps {
  currentPage: 'overview' | 'journal';
  onPageChange: (page: 'overview' | 'journal') => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex space-x-4">
          <button
            onClick={() => onPageChange('overview')}
            className={`py-4 px-3 flex items-center space-x-2 border-b-2 transition-colors ${
              currentPage === 'overview'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <LineChart className="h-5 w-5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => onPageChange('journal')}
            className={`py-4 px-3 flex items-center space-x-2 border-b-2 transition-colors ${
              currentPage === 'journal'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>My Journal</span>
          </button>
        </div>
      </div>
    </div>
  );
}