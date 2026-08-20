import { Button, Layout, Typography, Spin, message, Select } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  title: string;
}

export const AppHeader = ({ title }: AppHeaderProps) => {
  const { isAuthenticated, account, logout, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = async () => {
    try {
      await logout();
      message.success(t('loggedOut'));
    } catch (error) {
      message.error(t('logoutFailed'));
      console.error(error);
    }
  };

  return (
    <Header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#001529',
        color: '#fff',
        padding: '0 24px'
      }}
    >
      <Typography.Title level={3} style={{ color: '#fff', margin: 0 }}>
        {title}
      </Typography.Title>
      {isAuthenticated && !isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Text style={{ color: '#fff' }}>
            {account?.name}
          </Text>
          <Select
            aria-label={t('language')}
            value={language}
            onChange={setLanguage}
            style={{ width: 110 }}
            options={[
              { value: 'en', label: t('english') },
              { value: 'cs', label: t('czech') },
            ]}
          />
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            {t('logout')}
          </Button>
        </div>
      )}
      {isLoading && <Spin style={{ color: '#fff' }} />}
    </Header>
  );
};