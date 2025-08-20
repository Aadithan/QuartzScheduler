import React from 'react';
import { Card, Switch, Typography, Space, InputNumber, Select } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setTheme, setLanguage, setNotifications, setAutoRefresh, setRefreshInterval } from '../store/slices/settingsSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);

  return (
    <div>
      <Title level={2}>Settings</Title>
      
      <Card title="Appearance">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text>Theme: </Text>
            <Select
              value={settings.theme}
              onChange={(value) => dispatch(setTheme(value))}
              style={{ width: 120, marginLeft: 8 }}
            >
              <Option value="light">Light</Option>
              <Option value="dark">Dark</Option>
            </Select>
          </div>
          
          <div>
            <Text>Language: </Text>
            <Select
              value={settings.language}
              onChange={(value) => dispatch(setLanguage(value))}
              style={{ width: 120, marginLeft: 8 }}
            >
              <Option value="en">English</Option>
            </Select>
          </div>
        </Space>
      </Card>

      <Card title="Notifications" style={{ marginTop: 16 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text>Enable Notifications: </Text>
            <Switch
              checked={settings.notifications}
              onChange={(checked) => dispatch(setNotifications(checked))}
            />
          </div>
        </Space>
      </Card>

      <Card title="Auto Refresh" style={{ marginTop: 16 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text>Auto Refresh: </Text>
            <Switch
              checked={settings.autoRefresh}
              onChange={(checked) => dispatch(setAutoRefresh(checked))}
            />
          </div>
          
          <div>
            <Text>Refresh Interval (seconds): </Text>
            <InputNumber
              min={5}
              max={300}
              value={settings.refreshInterval}
              onChange={(value) => dispatch(setRefreshInterval(value || 30))}
              disabled={!settings.autoRefresh}
            />
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Settings; 