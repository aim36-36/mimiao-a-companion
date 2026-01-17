import React, { useState } from 'react';
import { Tab } from './types';
import ChatScreen from './screens/ChatScreen';
import MomentsScreen from './screens/MomentsScreen';
import GameScreen from './screens/GameScreen';
import StoryScreen from './screens/StoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('story');
  const { user, loading } = useAuth();

  const renderScreen = () => {
    switch (activeTab) {
      case 'chat': return <ChatScreen />;
      case 'moments': return <MomentsScreen />;
      case 'game': return <GameScreen />;
      case 'story': return <StoryScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <StoryScreen />;
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="h-[100dvh] w-full max-w-md mx-auto flex items-center justify-center bg-paper">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ink/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink/60 font-medium">正在连接米缪OS...</p>
        </div>
      </div>
    );
  }

  // 未登录显示认证模态框
  if (!user) {
    return <AuthModal />;
  }

  // 已登录显示应用
  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto relative flex flex-col bg-paper text-ink font-sans overflow-hidden shadow-2xl sm:h-[calc(100vh-2rem)] sm:my-4 sm:rounded-[30px] sm:border-4 sm:border-ink transition-colors duration-300">

      {/* Dynamic Screen Content */}
      <main className="flex-1 overflow-hidden relative">
        {renderScreen()}
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Vignette Overlay for retro feel */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-ink/5 z-40 rounded-[30px]"></div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}