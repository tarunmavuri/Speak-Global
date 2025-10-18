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
      className="bg-gray-700 border border-gray-600 rounded-lg p-3 text-lg mb-6 w-full max-w-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
      aria-label="Select caption language"
    >
      {LANGUAGES.map(lang => (
        <option key={lang.code} value={lang.code}>{lang.name}</option>
      ))}
    </select>
    <button
      onClick={onJoinCall}
      className="bg-cyan-600 hover:bg-cyan-700 transition-colors text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg"
    >
      Join Call
    </button>
  </div>
);
