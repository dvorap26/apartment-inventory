import { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { StorageProvider } from './contexts/StorageContext';
import { ProtectedLayout } from './components/ProtectedLayout';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './contexts/AuthContext';
import { Spin } from 'antd';
import 'antd/dist/reset.css';
import './App.css';

function AppContent() {
  const { isLoading } = useAuth();
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
    <ProtectedLayout title="Apartment Inventory">
      <Dashboard />
    </ProtectedLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <StorageProvider>
        <AppContent />
      </StorageProvider>
    </AuthProvider>
  );
}

export default App;