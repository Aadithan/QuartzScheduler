import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider, theme, App as AntApp } from 'antd';
import { useSelector } from 'react-redux';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Triggers from './pages/Triggers';
import Calendars from './pages/Calendars';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PageTabs from './components/PageTabs';
import { RootState } from './store';
import './App.css';
import './styles/tabs.css';

const { Content } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { theme: currentTheme } = useSelector((state: RootState) => state.settings);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorBgBase: currentTheme === 'dark' ? '#141414' : '#ffffff',
          colorTextBase: currentTheme === 'dark' ? '#ffffff' : '#000000',
          colorBorder: currentTheme === 'dark' ? '#303030' : '#d9d9d9',
          colorBgContainer: currentTheme === 'dark' ? '#1f1f1f' : '#ffffff',
          colorBgElevated: currentTheme === 'dark' ? '#262626' : '#ffffff',
        },
      }}
    >
      <AntApp>
        <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
          <Sidebar collapsed={collapsed} />
          <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s', height: '100vh', overflow: 'hidden' }}>
            <Header collapsed={collapsed} onToggleCollapse={toggleCollapse} />
            <PageTabs />
            <Content 
              style={{ 
                margin: '0', 
                padding: '0 24px 24px 24px', // Remove top padding
                background: currentTheme === 'dark' ? '#141414' : '#f0f2f5',
                height: 'calc(100vh - 112px)', // 64px header + 48px tabs
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <div 
                className="content-area"
                style={{
                  background: currentTheme === 'dark' ? '#1f1f1f' : '#fff',
                  padding: '24px',
                  borderRadius: '0 0 6px 6px', // Only bottom corners rounded
                  height: '100%',
                  overflow: 'auto',
                  marginTop: '-2px', // Larger overlap to ensure seamless connection
                  border: `1px solid ${currentTheme === 'dark' ? '#303030' : '#d9d9d9'}`,
                  borderTop: 'none', // Remove top border to connect with tabs
                }}
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/triggers" element={<Triggers />} />
                  <Route path="/calendars" element={<Calendars />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </div>
            </Content>
          </Layout>
        </Layout>
      </AntApp>
    </ConfigProvider>
  );
};

export default App; 