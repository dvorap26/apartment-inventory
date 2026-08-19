import { Layout, Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { WelcomePage } from './WelcomePage';
import { AppHeader } from './AppHeader';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const ProtectedLayout = ({ children, title }: ProtectedLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Layout.Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Spin size="large" />
        </Layout.Content>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <WelcomePage />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader title={title} />
      <Layout.Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {children}
      </Layout.Content>
    </Layout>
  );
};
