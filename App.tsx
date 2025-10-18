import React from 'react';
import { useCallManager } from './hooks/useCallManager';
import { JoinScreen } from './components/JoinScreen';
import { ConnectingScreen } from './components/ConnectingScreen';
import { CallScreen } from './components/CallScreen';
import { ErrorDisplay } from './components/ErrorDisplay';

const App: React.FC = () => {
  const {
    appState,
    selectedLanguage,
    captions,
    error,
    isProcessing,
    setSelectedLanguage,
    startCall,
    endCall,
    retry,
    startAudioProcessing,
    stopAudioProcessing,
  } = useCallManager();

  const renderContent = () => {
    switch (appState) {
      case 'joining':
        return (
          <JoinScreen
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            onJoinCall={startCall}
          />
        );
      case 'connecting':
        return <ConnectingScreen />;
      case 'in_call':
        return (
          <CallScreen 
            captions={captions} 
            onEndCall={endCall}
            isProcessing={isProcessing}
            onStartAudioProcessing={startAudioProcessing}
            onStopAudioProcessing={stopAudioProcessing}
          />
        );
      case 'error':
        return <ErrorDisplay error={error} onRetry={retry} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Speak Global
          </h1>
          <p className="text-gray-600 mt-2">Real-time multilingual captioning for global conversations.</p>
        </header>

        <main className="flex-grow flex flex-col bg-white/60 backdrop-blur-md border border-gray-200 rounded-lg shadow-2xl p-6 min-h-[450px]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;