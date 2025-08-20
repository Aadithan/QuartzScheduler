import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Typography, Space, Modal, Dropdown, MenuProps, App, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchCalendars, 
  deleteCalendar, 
  clearError,
  Calendar 
} from '../store/slices/calendarsSlice';
import CalendarForm from '../components/CalendarForm';

const { Title } = Typography;
const { confirm } = Modal;

const Calendars: React.FC = () => {
  const { message } = App.useApp();
  const dispatch = useDispatch<AppDispatch>();
  const { calendars, loading, error, operationLoading } = useSelector((state: RootState) => state.calendars);
  const [showCalendarForm, setShowCalendarForm] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<Calendar | undefined>(undefined);
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
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const getUniqueValues = (data: any[], key: string) => {
    const values = Array.from(new Set(data.map(item => item[key]).filter(Boolean)));
    return values.map(value => ({ text: value, value }));
  };

  useEffect(() => {
    dispatch(fetchCalendars());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch, message]);

  const handleDelete = (calendar: Calendar) => {
    confirm({
      title: 'Delete Calendar',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete calendar "${calendar.name}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        dispatch(deleteCalendar(calendar.name))
          .unwrap()
          .then(() => {
            message.success('Calendar deleted successfully');
          })
          .catch((error) => {
            message.error(`Failed to delete calendar: ${error}`);
          });
      },
    });
  };

  const handleEdit = (calendar: Calendar) => {
    setEditingCalendar(calendar);
    setShowCalendarForm(true);
  };

  const handleNew = () => {
    setEditingCalendar(undefined);
    setShowCalendarForm(true);
  };

  const handleFormClose = () => {
    setShowCalendarForm(false);
    setEditingCalendar(undefined);
  };

  const getActionItems = (calendar: Calendar): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => handleEdit(calendar),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(calendar),
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Calendar, b: Calendar) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name', 'calendar name'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description || '-',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: (a: Calendar, b: Calendar) => a.type.localeCompare(b.type),
      filters: getUniqueValues(calendars, 'type'),
      onFilter: (value: any, record: any) => record.type === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, calendar: Calendar) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(calendar)}
            size="small"
          />
          <Dropdown 
            menu={{ items: getActionItems(calendar) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="link"
              icon={<MoreOutlined />}
              size="small"
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Calendars</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleNew}
          loading={operationLoading}
        >
          New
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={calendars}
        rowKey="name"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} calendars`,
        }}
        size="small"
      />

      <Modal
        title={editingCalendar ? 'Edit Calendar' : 'Add Calendar'}
        open={showCalendarForm}
        onCancel={handleFormClose}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <CalendarForm
          calendar={editingCalendar}
          onSuccess={handleFormClose}
          onCancel={handleFormClose}
        />
      </Modal>
    </div>
  );
};

export default Calendars;