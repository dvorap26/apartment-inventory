import { Layout, Button, Empty, Spin } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import './WelcomePage.css';

const { Content } = Layout;

export const WelcomePage = () => {
  const { isLoading, isLoggingIn, login } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="welcome-container">
          <Empty
            description="Welcome to Apartment Inventory"
            style={{ marginBottom: '32px' }}
          >
            <p style={{ fontSize: '16px', marginBottom: '24px', color: '#666' }}>
              Please sign in with your work account to continue
            </p>
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              onClick={handleLogin}
              loading={isLoggingIn}
              disabled={isLoggingIn}
            >
              Sign in with Microsoft
            </Button>
          </Empty>
        </div>
      </Content>
    </Layout>
  );
};