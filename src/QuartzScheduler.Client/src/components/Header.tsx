import React from 'react';
import { Layout, Avatar, Dropdown, Badge, Button, Space, Typography } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setTheme } from '../store/slices/settingsSlice';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onToggleCollapse }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.settings);

  const notificationItems = [
    {
      key: '1',
      label: (
        <div style={{ padding: '8px 0' }}>
          <Text strong>New report generated</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>2 minutes ago</Text>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div style={{ padding: '8px 0' }}>
          <Text strong>Scheduler status changed</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>5 minutes ago</Text>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div style={{ padding: '8px 0' }}>
          <Text strong>Job execution failed</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>10 minutes ago</Text>
        </div>
      ),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const handleThemeToggle = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: theme === 'light' ? '#fff' : '#141414',
        borderBottom: `1px solid ${theme === 'light' ? '#f0f0f0' : '#303030'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleCollapse}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
          }}
        />
        <Text strong style={{ fontSize: '20px', marginLeft: '16px', color: theme === 'light' ? '#000' : '#fff' }}>
          Quartz Scheduler
        </Text>
      </div>

      <Space size="middle">
        <Button
          type="text"
          icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
          onClick={handleThemeToggle}
          style={{ fontSize: '16px' }}
        />
        
        <Dropdown
          menu={{
            items: notificationItems,
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Badge count={3} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ fontSize: '16px' }}
            />
          </Badge>
        </Dropdown>

        <Dropdown
          menu={{
            items: userMenuItems,
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <Text style={{ color: theme === 'light' ? '#000' : '#fff' }}>Admin</Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
