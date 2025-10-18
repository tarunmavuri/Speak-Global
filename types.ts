export interface Language {
  code: string;
  name: string;
}

export interface Caption {
  id: number;
  sourceText: string;
  translatedText: string;
  isFinal: boolean;
}

export type AppState = 'joining' | 'connecting' | 'in_call' | 'error';

// Represents the data structures for events sent between client and server.
export interface SocketEventPayloads {
  'join-call': { language: Language };
  'audio-chunk': { chunk: ArrayBuffer };
  'transcription-update': { id: number; sourceText: string; isFinal: boolean };
  'translation-complete': { id: number; translatedText: string };
  'error': { message: string };
}
