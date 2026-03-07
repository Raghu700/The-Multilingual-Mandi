/**
 * App Component - With Authentication & Theme Support
 * Clean layout with proper scrolling, auth protection, and dark/read mode
 */

import { useState, useCallback } from 'react';
import { Header, Footer, TabNavigation } from './components';
import { VoiceAssistant } from './components/VoiceAssistant';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [voiceTab, setVoiceTab] = useState<string | undefined>(undefined);

  const handleVoiceNavigate = useCallback((tab: string) => {
    setVoiceTab(tab);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>Loading EktaMandi...</p>
        </div>
      </div>
    );
  }

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  // Main app
  return (
    <div
      className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <Header />

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <TabNavigation externalActiveTab={voiceTab} onTabChange={() => setVoiceTab(undefined)} />
      </main>

      <Footer />

      <VoiceAssistant onNavigate={handleVoiceNavigate} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
