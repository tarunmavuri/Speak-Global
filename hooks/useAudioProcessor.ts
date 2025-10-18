import { useState, useRef, useCallback } from 'react';

const SAMPLE_RATE = 16000;

interface UseAudioProcessorProps {
  onAudioData: (data: ArrayBuffer) => void;
  onEndOfUtterance: () => void;
}

export const useAudioProcessor = ({ onAudioData, onEndOfUtterance }: UseAudioProcessorProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const initialize = useCallback(async () => {
    if (isInitialized) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;

      sourceNodeRef.current = audioContext.createMediaStreamSource(stream);
      scriptProcessorRef.current = audioContext.createScriptProcessor(4096, 1, 1);
      
      scriptProcessorRef.current.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        
        // Convert to 16-bit PCM and send
        const pcm = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
            pcm[i] = inputData[i] * 32768;
        }
        onAudioData(pcm.buffer);
      };
      
      setIsInitialized(true);
    } catch (err) {
      console.error('Error initializing audio processor:', err);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        throw new Error('Microphone permission denied. Please allow microphone access in your browser settings.');
      }
      throw new Error('Failed to access microphone.');
    }
  }, [isInitialized, onAudioData]);
  
  const startProcessing = useCallback(() => {
    if (!isInitialized || isProcessing || !sourceNodeRef.current || !scriptProcessorRef.current || !audioContextRef.current) return;
    sourceNodeRef.current.connect(scriptProcessorRef.current);
    scriptProcessorRef.current.connect(audioContextRef.current.destination);
    setIsProcessing(true);
  }, [isInitialized, isProcessing]);

  const stopProcessing = useCallback(() => {
    if (!isProcessing || !sourceNodeRef.current || !scriptProcessorRef.current) return;
    sourceNodeRef.current.disconnect();
    scriptProcessorRef.current.disconnect();
    
    // Signal the end of a "push-to-talk" utterance.
    onEndOfUtterance(); 
    
    setIsProcessing(false);
  }, [isProcessing, onEndOfUtterance]);

  const cleanup = useCallback(() => {
    if (isProcessing) {
        stopProcessing();
    }
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();
    setIsInitialized(false);
  }, [isProcessing, stopProcessing]);

  return { isInitialized, isProcessing, initialize, startProcessing, stopProcessing, cleanup };
};
