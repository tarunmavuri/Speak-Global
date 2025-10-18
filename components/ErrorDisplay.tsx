import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <p className="text-red-400 text-xl font-semibold mb-4">An Error Occurred</p>
    <p className="text-gray-300 mb-6">{error}</p>
    <button
      onClick={onRetry}
      className="bg-gray-600 hover:bg-gray-700 transition-colors text-white font-bold py-2 px-6 rounded-lg"
    >
      Try Again
    </button>
  </div>
);
