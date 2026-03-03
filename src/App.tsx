/**
 * App Component - With Authentication
 * Clean layout with proper scrolling and auth protection
 */

import { useState } from 'react';
import { Header, Footer, TabNavigation } from './components';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading EktaMandi...</p>
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

  // Show main app if authenticated
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50/30 via-white to-emerald-50/30">
      {/* Header - Fixed */}
      <Header />

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <TabNavigation />
      </main>

      {/* Footer - Fixed at bottom */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
