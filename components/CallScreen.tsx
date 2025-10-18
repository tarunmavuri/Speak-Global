import React, { useState } from 'react';
import type { Caption } from '../types';
import { MICROPHONE_ICON_PATH } from '../constants';

interface CallScreenProps {
  captions: Caption[];
  onEndCall: () => void;
  onStartAudioProcessing: () => void;
  onStopAudioProcessing: () => void;
}

const MicrophoneButton: React.FC<{
  onStart: () => void;
  onStop: () => void;
}> = ({ onStart, onStop }) => {
  const [isListening, setIsListening] = useState(false);

  const handlePointerDown = () => {
    setIsListening(true);
    onStart();
  };

  const handlePointerUp = () => {
    setIsListening(false);
    onStop();
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={isListening ? handlePointerUp : undefined} // Stop if mouse leaves button while pressed
      className={`touch-none flex items-center justify-center w-24 h-24 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 ${isListening ? 'bg-cyan-500 scale-110' : 'bg-cyan-600 hover:bg-cyan-700'}`}
      aria-label={isListening ? 'Stop speaking' : 'Start speaking'}
    >
      <svg
        className={`w-10 h-10 text-white transition-transform duration-200 ${isListening ? 'scale-110' : ''}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d={MICROPHONE_ICON_PATH}></path>
      </svg>
    </button>
  );
};


export const CallScreen: React.FC<CallScreenProps> = ({ captions, onEndCall, onStartAudioProcessing, onStopAudioProcessing }) => (
  <div className="flex flex-col h-full">
    <div className="flex-grow bg-gray-900 rounded-lg p-4 overflow-y-auto mb-4 min-h-[300px]" aria-live="polite" aria-atomic="false">
      {captions.length === 0 ? (
        <p className="text-gray-400 text-center text-lg h-full flex items-center justify-center">Press and hold the microphone button to speak.</p>
      ) : (
        captions.map(caption => (
          <div key={caption.id} className={`mb-4 p-3 rounded-lg transition-opacity duration-300 ${caption.isFinal ? 'opacity-100' : 'opacity-70'}`}>
            <p className="text-gray-300 text-lg">{caption.sourceText}</p>
            <p className="text-cyan-300 font-semibold text-xl">{caption.translatedText}</p>
          </div>
        ))
      )}
    </div>
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={onEndCall}
        className="bg-red-600 hover:bg-red-700 transition-colors text-white font-bold py-3 px-8 rounded-lg text-xl"
      >
        End Call
      </button>
      <MicrophoneButton onStart={onStartAudioProcessing} onStop={onStopAudioProcessing} />
    </div>
  </div>
);
