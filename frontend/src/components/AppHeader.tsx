import { Button, Layout, Typography, Spin, message, Select, Tooltip } from 'antd';
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
    <Header className="app-header">
      <Typography.Title className="app-header-title" level={3} style={{ color: '#fff', margin: 0 }}>
        {title}
      </Typography.Title>
      {isAuthenticated && !isLoading && (
        <div className="app-header-actions">
          <Text className="app-header-user" style={{ color: '#fff' }}>
            {account?.name}
          </Text>
          <Select
            aria-label={t('language')}
            value={language}
            onChange={setLanguage}
            className="language-selector"
            style={{ width: 110 }}
            options={[
              {
                value: 'en',
                label: <>
                  <span className="language-label-full">{t('english')}</span>
                  <span className="language-label-short">EN</span>
                </>,
              },
              {
                value: 'cs',
                label: <>
                  <span className="language-label-full">{t('czech')}</span>
                  <span className="language-label-short">CZ</span>
                </>,
              },
            ]}
          />
          <Tooltip title={t('logout')}>
            <Button
              className="logout-button"
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              <span className="button-label">{t('logout')}</span>
            </Button>
          </Tooltip>
        </div>
      )}
      {isLoading && <Spin style={{ color: '#fff' }} />}
    </Header>
  );
};