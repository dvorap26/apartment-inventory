import { Alert, Layout, Button, Empty, Spin } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './WelcomePage.css';

const { Content } = Layout;

export const WelcomePage = () => {
  const { authError, isLoading, isLoggingIn, login } = useAuth();
  const { t } = useLanguage();

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
            description={t('loginWelcome')}
            style={{ marginBottom: '32px' }}
          >
            <p style={{ fontSize: '16px', marginBottom: '24px', color: '#666' }}>
              {t('loginPrompt')}
            </p>
            {authError && (
              <Alert
                message={t('error')}
                description={authError}
                type="error"
                showIcon
                style={{ marginBottom: '24px', textAlign: 'left' }}
              />
            )}
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              onClick={handleLogin}
              loading={isLoggingIn}
              disabled={isLoggingIn}
            >
              {t('signIn')}
            </Button>
          </Empty>
        </div>
      </Content>
    </Layout>
  );
};