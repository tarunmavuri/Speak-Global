import { useState, useRef, useCallback, useEffect } from 'react';
import type { AppState, Caption, Language } from '../types';
import { useAudioProcessor } from './useAudioProcessor';
import { socketService } from '../services/socketService';
import { LANGUAGES } from '../constants';

export const useCallManager = () => {
  const [appState, setAppState] = useState<AppState>('joining');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    LANGUAGES.find(l => l.code === 'en') || LANGUAGES[0]
  );
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleTranscriptionUpdate = useCallback(({ id, sourceText, isFinal }: { id: number; sourceText: string; isFinal: boolean }) => {
    setCaptions(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing) {
        return prev.map(c => c.id === id ? { ...c, sourceText, isFinal } : c);
      } else {
        return [...prev, { id, sourceText, isFinal, translatedText: '...' }];
      }
    });
  }, []);
  
  const handleTranslationComplete = useCallback(({ id, translatedText }: { id: number; translatedText: string }) => {
    setCaptions(prev => 
      prev.map(c => c.id === id ? { ...c, translatedText, isFinal: true } : c)
    );
  }, []);

  const handleError = useCallback(({ message }: { message: string }) => {
    setError(message);
    setAppState('error');
    // Cleanup will be handled by the endCall/retry flows
  }, []);
  
  const audioProcessor = useAudioProcessor({
    onAudioData: (data) => socketService.sendAudioChunk(data),
    onEndOfUtterance: () => {
      socketService.sendEndOfUtterance();
    },
  });

  const startCall = useCallback(async () => {
    setAppState('connecting');
    setError(null);
    setCaptions([]);

    try {
        await socketService.connect(
            handleTranscriptionUpdate,
            handleTranslationComplete,
            handleError
        );
        socketService.joinCall(selectedLanguage);
        await audioProcessor.initialize();
        setAppState('in_call');
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        handleError({ message });
        audioProcessor.cleanup();
        socketService.disconnect();
    }
  }, [selectedLanguage, handleTranscriptionUpdate, handleTranslationComplete, handleError, audioProcessor]);

  const endCall = useCallback(() => {
    audioProcessor.cleanup();
    socketService.leaveCall();
    socketService.disconnect();
    setAppState('joining');
  }, [audioProcessor]);
  
  const retry = useCallback(() => {
    setError(null);
    setAppState('joining');
    // Ensure cleanup happens if retrying from an error state during a call
    audioProcessor.cleanup();
    socketService.disconnect();
  }, [audioProcessor]);


  useEffect(() => {
    // Cleanup on unmount
    return () => {
      audioProcessor.cleanup();
      socketService.disconnect();
    };
  }, [audioProcessor]);

  return {
    appState,
    selectedLanguage,
    captions,
    error,
    isProcessing: audioProcessor.isProcessing,
    setSelectedLanguage,
    startCall,
    endCall,
    retry,
    startAudioProcessing: audioProcessor.startProcessing,
    stopAudioProcessing: audioProcessor.stopProcessing,
  };
};