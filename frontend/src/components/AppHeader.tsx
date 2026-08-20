import { Button, Layout, Typography, Spin, message } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  title: string;
}

export const AppHeader = ({ title }: AppHeaderProps) => {
  const { isAuthenticated, account, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      message.success('Logged out successfully');
    } catch (error) {
      message.error('Logout failed');
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
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      )}
      {isLoading && <Spin style={{ color: '#fff' }} />}
    </Header>
  );
};