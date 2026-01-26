/**
 * App Component - Polished
 * Clean layout with proper scrolling
 */

import { Header, Footer, TabNavigation } from './components';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}

export default App;
