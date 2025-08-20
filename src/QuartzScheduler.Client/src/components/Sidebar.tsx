import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { RootState } from '../store';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useSelector((state: RootState) => state.settings);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/jobs',
      icon: <FileTextOutlined />,
      label: 'Jobs',
    },
    {
      key: '/triggers',
      icon: <ClockCircleOutlined />,
      label: 'Triggers',
    },
    {
      key: '/calendars',
      icon: <CalendarOutlined />,
      label: 'Calendars',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  return (
    <Sider
      width={200}
      collapsible
      collapsed={collapsed}
      trigger={null}
      theme={theme}
      style={{
        overflow: 'hidden',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
        borderRight: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
          backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
          padding: '0 16px',
        }}
      >
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/quartzicon.png" 
              alt="Quartz Scheduler" 
              style={{
                width: 40,
                height: 40,
                marginRight: 8,
              }}
            />
            <span style={{ fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#000' }}>
              Quartz Scheduler
            </span>
          </div>
        ) : (
                    <img 
            src="/quartzicon.png" 
            alt="Quartz Scheduler" 
            style={{
              width: 40,
              height: 40,
            }}
          />
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ 
          height: 'calc(100% - 64px)', 
          borderRight: 0,
          paddingTop: 8,
          backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        theme={theme}
      />
    </Sider>
  );
};

export default Sidebar; 
