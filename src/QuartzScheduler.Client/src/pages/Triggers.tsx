import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Space, message, Modal, Tag, Dropdown, MenuProps, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, MoreOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchTriggers, deleteTrigger, pauseTrigger, resumeTrigger } from '../store/slices/triggersSlice';
import TriggerForm from '../components/TriggerForm';

interface Trigger {
  key?: string;
  name: string;
  group: string;
  schedule: string;
  scheduleType: 'Cron' | 'Simple' | 'Daily' | 'Calendar' | 'Unknown';
  startTime: string;
  endTime: string;
  lastFireTime?: string;
  nextFireTime?: string;
  state: string;
  jobName: string;
  jobGroup: string;
  priority: number;
  description?: string;
  triggerName?: string;
  triggerGroup?: string;
}

interface JobWithTriggers {
  key: string;
  jobName: string;
  jobGroup: string;
  triggers: Trigger[];
}

const Triggers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { triggers, loading } = useSelector((state: RootState) => state.triggers);
  const [showTriggerForm, setShowTriggerForm] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | undefined>();
  const searchInput = useRef<any>(null);

  // Filter helper functions
  const getColumnSearchProps = (dataIndex: string, placeholder: string = 'Search') => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${placeholder}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  const getUniqueValues = (data: any[], key: string) => {
    const values = Array.from(new Set(data.map(item => item[key]).filter(Boolean)));
    return values.map(value => ({ text: value, value }));
  };

  useEffect(() => {
    // Fetch triggers when component mounts
    dispatch(fetchTriggers());
  }, [dispatch]);

  const handleCreateTrigger = () => {
    setEditingTrigger(undefined);
    setShowTriggerForm(true);
  };

  const handleEditTrigger = (trigger: Trigger) => {
    setEditingTrigger(trigger);
    setShowTriggerForm(true);
  };

  const handleCloseTriggerForm = () => {
    setShowTriggerForm(false);
    setEditingTrigger(undefined);
  };

  const handleTriggerFormSuccess = () => {
    // Refresh triggers list after successful create/update
    dispatch(fetchTriggers());
    // Close the form
    setShowTriggerForm(false);
    setEditingTrigger(undefined);
  };

  const handleRefresh = () => {
    dispatch(fetchTriggers());
    message.success('Triggers refreshed');
  };





    const handleDeleteTrigger = (trigger: Trigger) => {
    const triggerName = trigger.triggerName || trigger.name;
    const triggerGroup = trigger.triggerGroup || trigger.group;
    
    Modal.confirm({
      title: 'Delete Trigger',
      content: `Are you sure you want to delete trigger "${triggerName}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        dispatch(deleteTrigger({ name: triggerName, group: triggerGroup }))
          .unwrap()
          .then(() => {
            message.success('Trigger deleted successfully');
          })
          .catch((error) => {
            message.error(`Failed to delete trigger: ${error}`);
          });
      },
    });
  };

  const handlePauseTrigger = (trigger: Trigger) => {
    const triggerName = trigger.triggerName || trigger.name;
    const triggerGroup = trigger.triggerGroup || trigger.group;
    
    dispatch(pauseTrigger({ name: triggerName, group: triggerGroup }))
      .unwrap()
      .then(() => {
        message.success('Trigger paused successfully');
        dispatch(fetchTriggers()); // Refresh to show updated state
      })
      .catch((error) => {
        message.error(`Failed to pause trigger: ${error}`);
      });
  };

  const handleResumeTrigger = (trigger: Trigger) => {
    const triggerName = trigger.triggerName || trigger.name;
    const triggerGroup = trigger.triggerGroup || trigger.group;
    
    dispatch(resumeTrigger({ name: triggerName, group: triggerGroup }))
      .unwrap()
      .then(() => {
        message.success('Trigger resumed successfully');
        dispatch(fetchTriggers()); // Refresh to show updated state
      })
      .catch((error) => {
        message.error(`Failed to resume trigger: ${error}`);
      });
  };

  const getTriggerActions = (trigger: Trigger): MenuProps['items'] => {
    const isPaused = trigger.state === 'Paused';
    
    return [
      {
        key: 'edit',
        label: 'Edit',
        icon: <EditOutlined />,
        onClick: () => handleEditTrigger(trigger),
      },
      {
        key: 'pause-resume',
        label: isPaused ? 'Resume' : 'Pause',
        icon: isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />,
        onClick: () => isPaused ? handleResumeTrigger(trigger) : handlePauseTrigger(trigger),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteTrigger(trigger),
      },
    ];
  };

  const getScheduleTag = (scheduleType: string) => {
    const colors = {
      'Cron': 'blue',
      'Simple': 'green', 
      'Daily': 'orange',
      'Calendar Interval': 'purple'
    };
    return <Tag color={colors[scheduleType as keyof typeof colors]}>{scheduleType}</Tag>;
  };

  // Group triggers by job
  const groupedData = React.useMemo(() => {
    const jobMap = new Map<string, JobWithTriggers>();
    
    triggers.forEach(trigger => {
      const jobKey = `${trigger.jobName || 'Unknown'}-${trigger.jobGroup || 'Unknown'}`;
      
      if (!jobMap.has(jobKey)) {
        jobMap.set(jobKey, {
          key: jobKey,
          jobName: trigger.jobName || 'Unknown',
          jobGroup: trigger.jobGroup || 'Unknown',
          triggers: []
        });
      }
      
      const triggerData: Trigger = {
        key: `${trigger.triggerName}-${trigger.triggerGroup}`,
        name: trigger.triggerName || 'Unknown',
        group: trigger.triggerGroup || 'Unknown',
        schedule: trigger.type || 'Unknown',
        scheduleType: trigger.type as 'Cron' | 'Simple' | 'Daily' | 'Calendar Interval' || 'Cron',
        startTime: trigger.startTime || 'N/A',
        endTime: trigger.endTime || 'N/A',
        lastFireTime: trigger.lastFireTime || 'N/A',
        nextFireTime: trigger.nextFireTime || 'N/A',
        state: trigger.state || 'Unknown',
        jobName: trigger.jobName || 'Unknown',
        jobGroup: trigger.jobGroup || 'Unknown',
        priority: 5,
        description: trigger.description,
        triggerName: trigger.triggerName,
        triggerGroup: trigger.triggerGroup
      };
      
      jobMap.get(jobKey)!.triggers.push(triggerData);
    });
    
    return Array.from(jobMap.values());
  }, [triggers]);

  const jobColumns = [
    {
      title: 'Job Name',
      dataIndex: 'jobName',
      key: 'jobName',
      width: 250,
      ...getColumnSearchProps('jobName', 'job name'),
      render: (jobName: string, record: JobWithTriggers) => (
        <div style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '16px' }}>
          {jobName}
        </div>
      ),
    },
    {
      title: 'Group',
      dataIndex: 'jobGroup',
      key: 'jobGroup',
      width: 120,
      filters: getUniqueValues(groupedData, 'jobGroup'),
      onFilter: (value: any, record: any) => record.jobGroup === value,
    },

    {
      title: 'Active Triggers',
      key: 'activeTriggers',
      width: 120,
      render: (_: any, record: JobWithTriggers) => {
        const activeTriggers = record.triggers.filter(t => t.state !== 'Paused').length;
        const totalTriggers = record.triggers.length;
        return (
          <span style={{ 
            color: activeTriggers === totalTriggers ? '#52c41a' : activeTriggers > 0 ? '#faad14' : '#f5222d' 
          }}>
            {activeTriggers}/{totalTriggers}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: JobWithTriggers) => (
        <Space>
          <Button 
            size="small" 
            icon={<PlayCircleOutlined />} 
            title="Resume All Triggers"
            onClick={() => {
              record.triggers.forEach(trigger => {
                if (trigger.state === 'Paused') {
                  handleResumeTrigger(trigger);
                }
              });
            }}
          />
          <Button 
            size="small" 
            icon={<PauseCircleOutlined />} 
            title="Pause All Triggers"
            onClick={() => {
              record.triggers.forEach(trigger => {
                if (trigger.state !== 'Paused') {
                  handlePauseTrigger(trigger);
                }
              });
            }}
          />
        </Space>
      ),
    },
  ];

  const triggerColumns = [
    {
      title: 'Trigger Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ...getColumnSearchProps('name', 'trigger name'),
      render: (name: string, record: Trigger) => (
        <div style={{ paddingLeft: '20px', fontWeight: 'bold' }}>
          {name}
        </div>
      ),
    },
    {
      title: 'Schedule',
      dataIndex: 'scheduleType',
      key: 'schedule',
      width: 120,
      filters: [
        { text: 'Cron', value: 'Cron' },
        { text: 'Simple', value: 'Simple' },
        { text: 'Daily', value: 'Daily' },
        { text: 'Calendar', value: 'Calendar' },
        { text: 'Unknown', value: 'Unknown' },
      ],
      onFilter: (value: any, record: any) => record.scheduleType === value,
      render: (scheduleType: string) => {
        if (!scheduleType) return <span>-</span>;
        
        // Quartzmin approach - use direct mapping
        const scheduleMap: Record<string, string> = {
          'Cron': 'Cron',
          'Simple': 'Simple', 
          'Daily': 'Daily',
          'Calendar': 'Calendar',
          'Unknown': 'Unknown'
        };
        
        return <span>{scheduleMap[scheduleType] || scheduleType}</span>;
      },
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (time: string) => {
        if (!time || time.trim() === '') return '';
        try {
          const date = new Date(time);
          if (isNaN(date.getTime())) return '';
          return date.toLocaleString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        } catch {
          return '';
        }
      },
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 150,
      render: (time: string) => {
        if (!time || time.trim() === '') return '';
        try {
          const date = new Date(time);
          if (isNaN(date.getTime())) return '';
          return date.toLocaleString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        } catch {
          return '';
        }
      },
    },
    {
      title: 'Last Fire Time',
      dataIndex: 'lastFireTime',
      key: 'lastFireTime',
      width: 150,
      render: (time: string) => {
        if (!time || time.trim() === '') return '';
        try {
          const date = new Date(time);
          if (isNaN(date.getTime())) return '';
          return date.toLocaleString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        } catch {
          return '';
        }
      },
    },
    {
      title: 'Next Fire Time',
      dataIndex: 'nextFireTime',
      key: 'nextFireTime',
      width: 150,
      render: (time: string) => {
        if (!time || time.trim() === '') return '';
        try {
          const date = new Date(time);
          if (isNaN(date.getTime())) return '';
          return date.toLocaleString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        } catch {
          return '';
        }
      },
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      filters: [
        { text: 'Normal', value: 'Normal' },
        { text: 'Paused', value: 'Paused' },
        { text: 'Blocked', value: 'Blocked' },
        { text: 'Error', value: 'Error' },
      ],
      onFilter: (value: any, record: any) => record.state === value,
      render: (state: string) => (
        <Tag color={state === 'Normal' ? 'green' : state === 'Paused' ? 'orange' : 'red'}>
          {state}
        </Tag>
      ),
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Trigger) => (
        <Dropdown
          menu={{ items: getTriggerActions(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Triggers</h2>
        <Space>
          <Button 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading.list}
          >
            Refresh
          </Button>


          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTrigger}>
            Add Trigger
          </Button>
        </Space>
      </div>

      <Table
        columns={jobColumns}
        dataSource={groupedData}
        expandable={{
          expandedRowRender: (record: JobWithTriggers) => (
            <Table
              columns={triggerColumns}
              dataSource={record.triggers}
              pagination={false}
              showHeader={true}
              size="small"
              rowKey={trigger => trigger.key || `${trigger.name}-${trigger.group}`}
            />
          ),
          rowExpandable: (record: JobWithTriggers) => record.triggers.length > 0,
          defaultExpandedRowKeys: groupedData.length > 0 ? [groupedData[0].key] : [],
        }}
        rowKey={record => record.key}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} jobs`,
        }}
        scroll={{ x: 1000 }}
        size="middle"
      />

      <TriggerForm
        visible={showTriggerForm}
        onCancel={handleCloseTriggerForm}
        editingTrigger={editingTrigger}
        onSuccess={handleTriggerFormSuccess}
      />
    </div>
  );
};

export default Triggers;