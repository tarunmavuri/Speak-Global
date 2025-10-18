import { useState, useRef, useCallback, useEffect } from 'react';

const SAMPLE_RATE = 16000;
const BUFFER_SIZE = 4096; // A common buffer size for audio processing

interface UseAudioProcessorProps {
  onAudioData: (data: ArrayBuffer) => void;
  onEndOfUtterance: () => void;
}

export const useAudioProcessor = ({ onAudioData, onEndOfUtterance }: UseAudioProcessorProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // A ref is used for the processing state to avoid stale closures in callbacks.
  const isProcessingRef = useRef(isProcessing);
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);
  
  // Refs are used for callbacks to ensure the latest functions are used inside event handlers like onaudioprocess.
  const onAudioDataRef = useRef(onAudioData);
  const onEndOfUtteranceRef = useRef(onEndOfUtterance);
  useEffect(() => {
    onAudioDataRef.current = onAudioData;
    onEndOfUtteranceRef.current = onEndOfUtterance;
  }, [onAudioData, onEndOfUtterance]);


  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const cleanup = useCallback(() => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsProcessing(false);
    setIsInitialized(false);
  }, []);

  const initialize = useCallback(async () => {
    if (isInitialized) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;
      
      // The audio context may start in a suspended state. It must be resumed to start processing.
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      sourceNodeRef.current = audioContext.createMediaStreamSource(stream);
      scriptProcessorRef.current = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

      scriptProcessorRef.current.onaudioprocess = (event: AudioProcessingEvent) => {
        if (!isProcessingRef.current) return;
        
        const inputData = event.inputBuffer.getChannelData(0);
        const buffer = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
            buffer[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        onAudioDataRef.current(buffer.buffer);
      };

      sourceNodeRef.current.connect(scriptProcessorRef.current);
      // Connect the processor to the destination so onaudioprocess fires.
      // No audible output occurs because we do not write to the output buffer.
      scriptProcessorRef.current.connect(audioContext.destination);
      
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to initialize audio processor:', err);
      cleanup();
      throw err;
    }
  }, [isInitialized, cleanup]);

  const startProcessing = useCallback(async () => {
    if (!isInitialized || isProcessing) return;
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    setIsProcessing(true);
  }, [isInitialized, isProcessing]);

  const stopProcessing = useCallback(() => {
    if (!isProcessing) return;
    setIsProcessing(false);
    onEndOfUtteranceRef.current();
  }, [isProcessing]);


  return { isInitialized, isProcessing, initialize, startProcessing, stopProcessing, cleanup };
};