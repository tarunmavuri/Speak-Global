import { io, Socket } from 'socket.io-client';
import type { Language, SocketEventPayloads } from '../types';

/**
 * NOTE: In a real application, this service would connect to a live backend.
 * For this simulation, we are mocking the socket connection and its events
 * to demonstrate a realistic full-stack architecture where the frontend
 * is decoupled from the AI services.
 */

class SocketService {
  private socket: Socket | null = null;

  connect(
    onTranscriptionUpdate: (data: SocketEventPayloads['transcription-update']) => void,
    onTranslationComplete: (data: SocketEventPayloads['translation-complete']) => void,
    onError: (data: SocketEventPayloads['error']) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // In a real app, this URL would point to your Node.js/Python backend.
      this.socket = io('http://localhost:3001', {
        transports: ['websocket'],
        // This is a mock implementation detail, would not be in production.
        forceNew: true, 
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        
        this.socket?.on('transcription-update', onTranscriptionUpdate);
        this.socket?.on('translation-complete', onTranslationComplete);
        this.socket?.on('error', onError);
        
        resolve();
      });

      this.socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        // Simulate a more user-friendly error
        onError({ message: 'Could not connect to the captioning service. Please try again.' });
        reject(err);
      });
    });
  }

  joinCall(language: Language) {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('join-call', { language });
  }

  sendAudioChunk(chunk: ArrayBuffer) {
    if (!this.socket) return;
    this.socket.emit('audio-chunk', { chunk });
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
