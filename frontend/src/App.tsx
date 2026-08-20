import { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { StorageProvider } from './contexts/StorageContext';
import { ProtectedLayout } from './components/ProtectedLayout';
import { useAuth } from './contexts/AuthContext';
import { useStorage } from './contexts/StorageContext';
import { Empty, Spin, Alert } from 'antd';
import 'antd/dist/reset.css';
import './App.css';

function AppContent() {
  const { isLoading } = useAuth();
  const { isInitialized, error } = useStorage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading || !isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="Loading storage services..." />
      </div>
    );
  }

  return (
    <ProtectedLayout title="Apartment Inventory">
      {error && (
        <Alert
          message="Storage Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}
      <Empty description="Application ready - Dashboard coming soon" />
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