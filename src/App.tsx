
import React, { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import { GameSettings, GameSession, ScreenView, } from './types'; // Added Difficulty, ProblemDigits for default
import { APP_TITLE } from './constants';
import ReloadPrompt from './components/ReloadPrompt'; // Import ReloadPrompt

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ScreenView>('home');
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);

  useEffect(() => {
    document.title = `${APP_TITLE} - ${currentView.charAt(0).toUpperCase() + currentView.slice(1)}`;
  }, [currentView]);

  const handleStartGame = (settings: GameSettings) => {
    setGameSettings(settings);
    setCurrentView('game');
    setGameSession(null); // Clear previous session
  };

  const handleGameEnd = (sessionData: GameSession) => {
    setGameSession(sessionData);
    setCurrentView('results');
  };

  const handleRestart = () => {
    // GameScreen's useEffect on `settings` prop (if GameSettings object reference changes or a key is used)
    // will re-initialize the game. If settings object doesn't change, we need to ensure GameScreen resets.
    // The current GameScreen useEffect depends on `settings` object.
    // To ensure a full reset even with same settings, we can temporarily set settings to null then back.
    // Or, GameScreen could accept a key prop that changes.
    // For now, let's assume if gameSettings is not null, GameScreen's useEffect will re-trigger.
    if (gameSettings) {
        setCurrentView('game');
        setGameSession(null);
        // To force re-initialization in GameScreen if settings object instance doesn't change:
        // setGameSettings(prev => prev ? { ...prev } : null); // Create new object instance
    } else {
        // Fallback if settings are somehow lost

        console.warn("Attempted to restart without game settings. Returning to home.");
        setCurrentView('home');
    }
  };

  const handleGoHome = () => {
    setCurrentView('home');
    setGameSettings(null);
    setGameSession(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeScreen onStartGame={handleStartGame} />;
      case 'game':
        if (gameSettings) {
          // Key prop can be used to force a remount and full reset of GameScreen if needed:
          // return <GameScreen key={Date.now()} settings={gameSettings} onGameEnd={handleGameEnd} />;
          return <GameScreen settings={gameSettings} onGameEnd={handleGameEnd} />;
        }
        // Fallback to home if settings are missing
        console.warn("Game settings missing when trying to render GameScreen. Returning to home.");
        setCurrentView('home'); 
        return <HomeScreen onStartGame={handleStartGame} />;
      case 'results':
        if (gameSession) {
          return <ResultsScreen session={gameSession} onRestart={handleRestart} onGoHome={handleGoHome} />;
        }
        console.warn("Game session missing when trying to render ResultsScreen. Returning to home.");
        setCurrentView('home');
        return <HomeScreen onStartGame={handleStartGame} />;
      default:
        // Default to home screen if view is unrecognized
        setCurrentView('home');
        return <HomeScreen onStartGame={handleStartGame} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
      {renderView()}
      <ReloadPrompt /> {/* Add ReloadPrompt here */}
    </div>
  );
};

export default App;


