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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">Speak Global</h1>
          <p className="text-gray-400 mt-2">Real-time multilingual captioning for global conversations.</p>
        </header>

        <main className="flex-grow flex flex-col bg-gray-800 rounded-lg shadow-2xl p-6 min-h-[450px]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;