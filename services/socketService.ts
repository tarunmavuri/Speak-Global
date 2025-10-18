import type { Language, SocketEventPayloads } from '../types';

/**
 * NOTE: The live backend connection has been replaced with a mock service
 * to allow the application to run properly in this self-contained environment.
 * This mock simulates the entire backend flow: receiving audio signals,
 * sending back transcription updates, and finally providing a translation.
 */

// A simple event emitter to stand in for a real Socket.IO client.
type Listener<T> = (data: T) => void;
class MockSocket {
  private listeners: { [key: string]: Listener<any>[] } = {};
  private captionIdCounter = 0;
  private mockPhrases = [
    { source: "Hello, how are you doing today?", translation: "[Spanish] Hola, ¿cómo estás hoy?" },
    { source: "This is a real-time captioning demonstration.", translation: "[French] Ceci est une démonstration de sous-titrage en temps réel." },
    { source: "The weather looks great for a walk in the park.", translation: "[German] Das Wetter sieht super für einen Spaziergang im Park aus." },
    { source: "Click the button to toggle the microphone on and off.", translation: "[Japanese] ボタンをクリックしてマイクのオンとオフを切り替えます。" },
  ];

  on<K extends keyof SocketEventPayloads>(event: K, listener: Listener<SocketEventPayloads[K]>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  // Method for the mock server to trigger events on the client
  private _trigger<K extends keyof SocketEventPayloads>(event: K, data: SocketEventPayloads[K]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(data));
    }
  }
  
  // Method for the client to emit events to the mock server
  emit<K extends keyof SocketEventPayloads>(event: K, data?: SocketEventPayloads[K]) {
    console.log(`MockSocket received emit: ${event}`, data);
    if (event === 'end-of-utterance') {
      this._simulateBackendProcessing();
    }
  }

  disconnect() {
    this.listeners = {};
    console.log('MockSocket disconnected');
  }

  private _simulateBackendProcessing() {
    const id = ++this.captionIdCounter;
    const phrase = this.mockPhrases[(id - 1) % this.mockPhrases.length];

    // 1. Simulate final transcription directly for a more stable UI.
    setTimeout(() => {
        this._trigger('transcription-update', { id, sourceText: phrase.source, isFinal: true });
    }, 400);

    // 2. Simulate final translation with a faster turnaround.
    setTimeout(() => {
        this._trigger('translation-complete', { id, translatedText: phrase.translation });
    }, 800);
  }
}

class SocketService {
  private socket: MockSocket | null = null;

  connect(
    onTranscriptionUpdate: (data: SocketEventPayloads['transcription-update']) => void,
    onTranslationComplete: (data: SocketEventPayloads['translation-complete']) => void,
    onError: (data: SocketEventPayloads['error']) => void,
  ): Promise<void> {
    return new Promise((resolve) => {
      // Simulate a faster network delay for connecting
      setTimeout(() => {
        this.socket = new MockSocket();
        console.log('Mock Socket connected');
        
        this.socket.on('transcription-update', onTranscriptionUpdate);
        this.socket.on('translation-complete', onTranslationComplete);
        this.socket.on('error', onError);
        
        resolve();
      }, 1000); // A 1 second delay to show the "Connecting..." screen
    });
  }

  joinCall(language: Language) {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('join-call', { language });
  }

  sendAudioChunk(chunk: ArrayBuffer) {
    // In the mock, we don't need to process the audio chunk.
  }

  sendEndOfUtterance() {
    if (!this.socket) return;
    this.socket.emit('end-of-utterance');
  }

  leaveCall() {
    if (!this.socket) return;
    this.socket.emit('leave-call');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Export a singleton instance of the service
export const socketService = new SocketService();