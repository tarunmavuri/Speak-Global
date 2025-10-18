import React from 'react';
import type { Caption } from '../types';
import { MICROPHONE_ICON_PATH } from '../constants';

interface CallScreenProps {
  captions: Caption[];
  onEndCall: () => void;
  isProcessing: boolean;
  onStartAudioProcessing: () => void;
  onStopAudioProcessing: () => void;
}

interface MicrophoneButtonProps {
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({ isProcessing, onStart, onStop }) => {
  const handleClick = () => {
    if (isProcessing) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`touch-none flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400/50 ${isProcessing ? 'bg-gradient-to-br from-pink-500 to-orange-400 scale-110 ring-4 ring-pink-500/50' : 'bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl'}`}
      aria-label={isProcessing ? 'Mute microphone' : 'Unmute microphone'}
    >
      <svg
        className={`w-10 h-10 text-white transition-transform duration-200 ${isProcessing ? 'scale-110' : ''}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d={MICROPHONE_ICON_PATH}></path>
      </svg>
    </button>
  );
};


export const CallScreen: React.FC<CallScreenProps> = ({ captions, onEndCall, isProcessing, onStartAudioProcessing, onStopAudioProcessing }) => (
  <div className="flex flex-col h-full">
    <div className="flex-grow bg-gray-200/50 rounded-lg p-4 overflow-y-auto mb-4 min-h-[300px]" aria-live="polite" aria-atomic="false">
      {captions.length === 0 ? (
        <p className="text-gray-500 text-center text-lg h-full flex items-center justify-center">Click the microphone button to toggle your mic.</p>
      ) : (
        captions.map(caption => (
          <div key={caption.id} className={`mb-4 p-3 rounded-lg transition-opacity duration-300 ${caption.isFinal ? 'opacity-100' : 'opacity-70'}`}>
            <p className="text-gray-700 text-lg">{caption.sourceText}</p>
            <p className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{caption.translatedText}</p>
          </div>
        ))
      )}
    </div>
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={onEndCall}
        className="bg-gray-200 hover:bg-red-500 hover:text-white transition-colors text-gray-800 font-bold py-3 px-8 rounded-lg text-xl"
      >
        End Call
      </button>
      <MicrophoneButton isProcessing={isProcessing} onStart={onStartAudioProcessing} onStop={onStopAudioProcessing} />
    </div>
  </div>
);