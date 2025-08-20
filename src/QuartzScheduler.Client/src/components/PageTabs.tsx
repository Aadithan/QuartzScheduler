import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface TabItem {
  key: string;
  label: string;
  closable?: boolean;
}

// Move routeLabels outside component to prevent recreation
const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/jobs': 'Jobs',
  '/triggers': 'Triggers',
  '/calendars': 'Calendars',
  '/settings': 'Settings',
};

const PageTabs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useSelector((state: RootState) => state.settings);
  const [activeKey, setActiveKey] = useState<string>('/');
  const [tabs, setTabs] = useState<TabItem[]>([
    { key: '/', label: 'Dashboard', closable: false },
  ]);

  useEffect(() => {
    const currentPath = location.pathname;
    setActiveKey(currentPath);

    // Add tab if it doesn't exist
    setTabs(prev => {
      const existingTab = prev.find(tab => tab.key === currentPath);
      if (!existingTab) {
        const label = routeLabels[currentPath] || 'Unknown';
        return [
          ...prev,
          { key: currentPath, label, closable: currentPath !== '/' },
        ];
      }
      return prev;
    });
  }, [location.pathname]);

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    navigate(key);
  };

  const handleTabEdit = (targetKey: string | React.MouseEvent | React.KeyboardEvent, action: 'add' | 'remove') => {
    if (action === 'remove' && typeof targetKey === 'string') {
      const newTabs = tabs.filter(tab => tab.key !== targetKey);
      setTabs(newTabs);

      // If we're closing the active tab, switch to the last tab
      if (targetKey === activeKey) {
        const lastTab = newTabs[newTabs.length - 1];
        if (lastTab) {
          navigate(lastTab.key);
        }
      }
    }
  };

  const renderTabBar = (props: any, DefaultTabBar: React.ComponentType<any>) => (
    <div style={{ 
      background: theme === 'light' ? '#f0f2f5' : '#141414', // Match content background
      padding: '0 24px', 
      paddingBottom: '0', // Remove bottom padding for seamless connection
      borderBottom: 'none', // Remove border to allow content to connect
    }}>
      <DefaultTabBar {...props} />
    </div>
  );

  return (
    <div 
      className="page-tabs-container"
      style={{ 
        background: theme === 'light' ? '#f0f2f5' : '#141414',
        marginBottom: 0,
        paddingBottom: 0,
      }}
    >
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        type="editable-card"
        onEdit={handleTabEdit}
        hideAdd
        size="small"
        renderTabBar={renderTabBar}
        items={tabs.map(tab => ({
          key: tab.key,
          label: tab.label,
          closable: tab.closable,
        }))}
        style={{
          margin: 0,
          marginBottom: 0,
          background: theme === 'light' ? '#f0f2f5' : '#141414',
        }}
        tabBarStyle={{
          marginBottom: 0,
          paddingBottom: 0,
          borderBottom: 'none',
        }}
      />
    </div>
  );
};

export default PageTabs;