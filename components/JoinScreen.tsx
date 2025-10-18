import React from 'react';
import { LANGUAGES } from '../constants';
import type { Language } from '../types';

interface JoinScreenProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  onJoinCall: () => void;
}

export const JoinScreen: React.FC<JoinScreenProps> = ({ selectedLanguage, onLanguageChange, onJoinCall }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h2 className="text-2xl font-semibold mb-4">Select Your Caption Language</h2>
    <select
      value={selectedLanguage.code}
      onChange={(e) => {
        const lang = LANGUAGES.find(l => l.code === e.target.value);
        if (lang) onLanguageChange(lang);
      }}
      className="bg-white border border-gray-300 text-gray-800 rounded-lg p-3 text-lg mb-6 w-full max-w-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
      aria-label="Select caption language"
    >
      {LANGUAGES.map(lang => (
        <option key={lang.code} value={lang.code}>{lang.name}</option>
      ))}
    </select>
    <button
      onClick={onJoinCall}
      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg shadow-purple-500/20"
    >
      Join Call
    </button>
  </div>
);