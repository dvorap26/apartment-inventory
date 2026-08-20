import { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedLayout } from './components/ProtectedLayout';
import { useAuth } from './contexts/AuthContext';
import { Empty, Spin } from 'antd';
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
      <Empty description="Application loading..." />
    </ProtectedLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;