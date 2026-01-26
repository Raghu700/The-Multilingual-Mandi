import { Header, Footer, TabNavigation } from './components';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-saffron/10 via-white to-green/10">
        {/* Header Component */}
        <Header />
        
        {/* Tab Navigation with Three Main Modules */}
        <TabNavigation />

        {/* Footer Component */}
        <Footer />
      </div>
    </LanguageProvider>
  )
}

export default App
