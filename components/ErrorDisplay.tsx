import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <p className="text-red-500 text-xl font-semibold mb-4">An Error Occurred</p>
    <p className="text-gray-600 mb-6">{error}</p>
    <button
      onClick={onRetry}
      className="bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 font-bold py-2 px-6 rounded-lg"
    >
      Try Again
    </button>
  </div>
);