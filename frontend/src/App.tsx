import { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { StorageProvider } from './contexts/StorageContext';
import { ProtectedLayout } from './components/ProtectedLayout';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Spin } from 'antd';
import 'antd/dist/reset.css';
import './App.css';

function AppContent() {
  const { isLoading } = useAuth();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ProtectedLayout title={t('appTitle')}>
      <Dashboard />
    </ProtectedLayout>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StorageProvider>
          <AppContent />
        </StorageProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;