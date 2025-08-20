import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space, Row, Col, TimePicker, DatePicker, Checkbox, List, Tag, App } from 'antd';
import { DeleteOutlined, PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { createCalendar, updateCalendar } from '../store/slices/calendarsSlice';
import { CalendarTypes, CreateCalendarRequest, CalendarViewModel } from '../services/calendarsApi';
import dayjs, { Dayjs } from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface CalendarFormProps {
  calendar?: CalendarViewModel;
  onSuccess: () => void;
  onCancel: () => void;
}

const CalendarForm: React.FC<CalendarFormProps> = ({ calendar, onSuccess, onCancel }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('cron');
  const [excludedDays, setExcludedDays] = useState<string[]>([]);
  const [newDay, setNewDay] = useState<string>('');
  const [excludedMonthDays, setExcludedMonthDays] = useState<number[]>([]);
  const [excludedDates, setExcludedDates] = useState<string[]>([]);
  const [excludedWeekDays, setExcludedWeekDays] = useState<number[]>([]);
  const [annualDatePickerValue, setAnnualDatePickerValue] = useState<Dayjs | null>(null);

  const isEditing = !!calendar;

  useEffect(() => {
    if (calendar) {
      // When editing, load the calendar data and normalize case
      const normalizedType = (calendar.type || 'cron').toLowerCase();
      setSelectedType(normalizedType);
      form.setFieldsValue({
        name: calendar.name,
        type: normalizedType,
        description: calendar.description,
        timeZone: calendar.timeZone || 'UTC',
      });
      
      // Load type-specific data from calendar
      if (normalizedType === 'cron') {
        // Handle cron calendar data
        if (calendar.cronExpression) {
          form.setFieldsValue({
            ...form.getFieldsValue(),
            cronExpression: calendar.cronExpression,
          });
        }
      } else if (normalizedType === 'daily') {
        // Handle daily calendar data
        if (calendar.startingTime || calendar.endingTime) {
          form.setFieldsValue({
            ...form.getFieldsValue(),
            startingTime: calendar.startingTime ? dayjs(calendar.startingTime, 'HH:mm:ss') : null,
            endingTime: calendar.endingTime ? dayjs(calendar.endingTime, 'HH:mm:ss') : null,
            invertTimeRange: calendar.invertTimeRange || false,
          });
        }
      } else if (normalizedType === 'weekly') {
        // Handle weekly calendar data - daysExcluded array
        if (calendar.daysExcluded) {
          const excludedWeekDays: number[] = [];
          calendar.daysExcluded.forEach((excluded, index) => {
            if (excluded) {
              excludedWeekDays.push(index);
            }
          });
          setExcludedWeekDays(excludedWeekDays);
        }
      } else if (normalizedType === 'monthly') {
        // Handle monthly calendar data - daysExcluded array
        if (calendar.daysExcluded) {
          const excludedMonthDays: number[] = [];
          calendar.daysExcluded.forEach((excluded, index) => {
            if (excluded) {
              excludedMonthDays.push(index + 1); // Days are 1-based
            }
          });
          setExcludedMonthDays(excludedMonthDays);
        }
      } else if (normalizedType === 'holiday') {
        // Handle holiday calendar data - dates array
        if (calendar.dates) {
          setExcludedDates(calendar.dates);
        }
      } else if (normalizedType === 'annual') {
        // Handle annual calendar data - days array  
        if (calendar.days) {
          setExcludedDays(calendar.days);
        }
      }
    } else {
      // When creating new, set defaults
      form.setFieldsValue({
        type: 'cron',
        timeZone: 'UTC',
      });
      setSelectedType('cron');
      setExcludedDays([]);
      setExcludedMonthDays([]);
      setExcludedDates([]);
      setExcludedWeekDays([]);
    }
  }, [calendar, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);



      const calendarData: CreateCalendarRequest = {
        name: values.name,
        type: values.type,
        description: values.description || '',
        timeZone: values.timeZone || 'UTC',
      };

      // Only add properties that are relevant for the selected calendar type
      if (selectedType === 'cron') {
        calendarData.cronExpression = values.cronExpression;
      } else if (selectedType === 'daily') {
        calendarData.startingTime = values.startingTime?.format('HH:mm:ss');
        calendarData.endingTime = values.endingTime?.format('HH:mm:ss');
        calendarData.invertTimeRange = values.invertTimeRange || false;
      } else if (selectedType === 'weekly') {
        // Convert array of day numbers to boolean array
        const weeklyDaysExcluded = new Array(7).fill(false);
        excludedWeekDays.forEach(day => {
          if (day >= 0 && day < 7) {
            weeklyDaysExcluded[day] = true;
          }
        });
        calendarData.daysExcluded = weeklyDaysExcluded;
      } else if (selectedType === 'monthly') {
        calendarData.daysExcluded = Array.from({ length: 31 }, (_, index) => excludedMonthDays.includes(index + 1));
      } else if (selectedType === 'annual') {
        calendarData.days = excludedDays;
      } else if (selectedType === 'holiday') {
        calendarData.dates = excludedDates;
      }

      // Validate required fields before sending
      if (!calendarData.name) {
        message.error('Calendar name is required');
        return;
      }
      if (!calendarData.type) {
        message.error('Calendar type is required');
        return;
      }

      if (isEditing) {
        await dispatch(updateCalendar({ 
          name: calendar!.name, 
          calendar: calendarData as CalendarViewModel 
        })).unwrap();
        message.success('Calendar updated successfully');
      } else {
        await dispatch(createCalendar(calendarData)).unwrap();
        message.success('Calendar created successfully');
      }
      
      onSuccess();
    } catch (error) {
      message.error(`Failed to ${isEditing ? 'update' : 'create'} calendar: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    // Clear type-specific fields when type changes
    form.setFieldsValue({
      cronExpression: undefined,
      startingTime: undefined,
      endingTime: undefined,
      invertTimeRange: false,
      days: undefined,
      dates: undefined,
      daysExcluded: undefined,
    });
    // Clear excluded days when changing away from annual
    if (type !== 'annual') {
      setExcludedDays([]);
    }
    // Clear excluded month days when changing away from monthly
    if (type !== 'monthly') {
      setExcludedMonthDays([]);
    }
    // Clear excluded dates when changing away from holiday
    if (type !== 'holiday') {
      setExcludedDates([]);
    }
    // Clear excluded week days when changing away from weekly
    if (type !== 'weekly') {
      setExcludedWeekDays([]);
    }
  };

  const addExcludedDay = () => {
    if (newDay.trim() && !excludedDays.includes(newDay.trim())) {
      setExcludedDays([...excludedDays, newDay.trim()]);
      setNewDay('');
    }
  };

  const addExcludedDayFromDatePicker = (date: Dayjs) => {
    const formattedDate = date.format('MMMM D');
    if (!excludedDays.includes(formattedDate)) {
      setExcludedDays([...excludedDays, formattedDate]);
    }
    setAnnualDatePickerValue(null); // Reset the date picker
  };

  const removeExcludedDay = (dayToRemove: string) => {
    setExcludedDays(excludedDays.filter(day => day !== dayToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExcludedDay();
    }
  };

  const toggleMonthDay = (day: number) => {
    if (excludedMonthDays.includes(day)) {
      setExcludedMonthDays(excludedMonthDays.filter(d => d !== day));
    } else {
      setExcludedMonthDays([...excludedMonthDays, day]);
    }
  };

  const invertMonthDays = () => {
    const allDays = Array.from({ length: 31 }, (_, i) => i + 1);
    const newExcluded = allDays.filter(day => !excludedMonthDays.includes(day));
    setExcludedMonthDays(newExcluded);
  };

  const clearMonthDays = () => {
    setExcludedMonthDays([]);
  };

  const addExcludedDate = (date: string) => {
    if (date && !excludedDates.includes(date)) {
      setExcludedDates([...excludedDates, date]);
    }
  };

  const removeExcludedDate = (dateToRemove: string) => {
    setExcludedDates(excludedDates.filter(date => date !== dateToRemove));
  };

  const toggleWeekDay = (day: number) => {
    if (excludedWeekDays.includes(day)) {
      setExcludedWeekDays(excludedWeekDays.filter(d => d !== day));
    } else {
      setExcludedWeekDays([...excludedWeekDays, day]);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case 'cron':
        return (
          <Form.Item
            label="Cron Expression"
            name="cronExpression"
            rules={[{ required: true, message: 'Please enter cron expression' }]}
            extra={
              <div>
                <p>The calendar excludes the set of times expressed by a given Cron Expression.</p>
                <p>For example, you could use this calendar to exclude all but business hours (8:00 - 17:00) every day using the expression: * * 0-7,18-23 ? * *</p>
                <p>It is important to remember that the cron expression here describes a set of times to be excluded from firing. Whereas the cron expression in Cron Trigger describes a set of times that can be included for firing. Thus, if a Cron Trigger has a given cron expression and is associated with a Cron Calendar with the same expression, the calendar will exclude all the times the trigger includes, and they will cancel each other out.</p>
                <a href="http://cronmaker.com" target="_blank" rel="noopener noreferrer">
                  http://cronmaker.com
                </a>
              </div>
            }
          >
            <Input placeholder="Cron Expression" />
          </Form.Item>
        );

      case 'daily':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Starting Time"
                  name="startingTime"
                  rules={[{ required: true, message: 'Please select starting time' }]}
                >
                  <TimePicker format="HH:mm:ss" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Ending Time"
                  name="endingTime"
                  rules={[{ required: true, message: 'Please select ending time' }]}
                >
                  <TimePicker format="HH:mm:ss" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="invertTimeRange" valuePropName="checked">
              <Checkbox>Invert Time Range</Checkbox>
            </Form.Item>
          </>
        );

      case 'weekly':
        return (
          <Form.Item
            label="Days Excluded"
            name="daysExcluded"
            extra="Click on the days to exclude them from the weekly calendar"
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '8px',
              padding: '16px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              backgroundColor: '#fafafa'
            }}>
              {[
                { value: 0, label: 'Sun' },
                { value: 1, label: 'Mon' },
                { value: 2, label: 'Tue' },
                { value: 3, label: 'Wed' },
                { value: 4, label: 'Thu' },
                { value: 5, label: 'Fri' },
                { value: 6, label: 'Sat' }
              ].map(day => (
                <Button
                  key={day.value}
                  size="small"
                  type={excludedWeekDays.includes(day.value) ? 'primary' : 'default'}
                  danger={excludedWeekDays.includes(day.value)}
                  onClick={() => toggleWeekDay(day.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    fontSize: '12px',
                    backgroundColor: excludedWeekDays.includes(day.value) ? '#ff4d4f' : undefined,
                    borderColor: excludedWeekDays.includes(day.value) ? '#ff4d4f' : undefined,
                    color: excludedWeekDays.includes(day.value) ? '#fff' : undefined,
                  }}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </Form.Item>
        );

      case 'monthly':
        return (
          <Form.Item
            label="Exclude Days"
            extra="Click on the days to exclude them from the monthly calendar"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Button type="link" onClick={invertMonthDays}>
                  Invert
                </Button>
                <span>|</span>
                <Button type="link" onClick={clearMonthDays}>
                  Clear
                </Button>
              </Space>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '8px',
                padding: '16px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                backgroundColor: '#fafafa'
              }}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <Button
                    key={day}
                    size="small"
                    type={excludedMonthDays.includes(day) ? 'primary' : 'default'}
                    danger={excludedMonthDays.includes(day)}
                    onClick={() => toggleMonthDay(day)}
                    style={{
                      width: '40px',
                      height: '32px',
                      fontSize: '12px',
                      backgroundColor: excludedMonthDays.includes(day) ? '#ff4d4f' : undefined,
                      borderColor: excludedMonthDays.includes(day) ? '#ff4d4f' : undefined,
                      color: excludedMonthDays.includes(day) ? '#fff' : undefined,
                    }}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </Space>
          </Form.Item>
        );

      case 'annual':
        return (
          <Form.Item
            label="Exclude Days"
            extra="Enter days in format 'Month Day' (e.g., January 1, December 25)"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '12px',
                alignItems: 'center'
              }}>
                {excludedDays.map((day) => (
                  <div
                    key={day}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                      backgroundColor: '#fff',
                      minWidth: '140px',
                      position: 'relative'
                    }}
                  >
                    <CalendarOutlined 
                      style={{ 
                        color: '#8c8c8c', 
                        marginRight: '8px',
                        fontSize: '14px'
                      }} 
                    />
                    <span style={{ fontSize: '14px', color: '#262626' }}>
                      {day}
                    </span>
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => removeExcludedDay(day)}
                      danger
                      size="small"
                      style={{
                        position: 'absolute',
                        right: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '2px',
                        height: '20px',
                        width: '20px'
                      }}
                    />
                  </div>
                ))}
                <DatePicker
                  placeholder="Select a day to exclude"
                  format="MMMM D"
                  onChange={(date: Dayjs | null) => {
                    setAnnualDatePickerValue(date);
                    if (date) {
                      addExcludedDayFromDatePicker(date);
                    }
                  }}
                  value={annualDatePickerValue}
                  style={{ width: '200px' }}
                />
              </div>
            </Space>
          </Form.Item>
        );

      case 'holiday':
        return (
          <Form.Item
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>Exclude Dates</span>
                <DatePicker
                  placeholder="Select a date to exclude"
                  format="DD.MM.YYYY"
                  onChange={(date: Dayjs | null) => {
                    if (date) {
                      addExcludedDate(date.format('DD.MM.YYYY'));
                    }
                  }}
                  value={null}
                  style={{ width: '200px' }}
                />
              </div>
            }
            extra="Select specific holiday dates to exclude"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {excludedDates.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px',
                  padding: '8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  backgroundColor: '#fafafa',
                  minHeight: '40px'
                }}>
                  {excludedDates.map((date) => (
                    <Tag
                      key={date}
                      closable
                      onClose={() => removeExcludedDate(date)}
                      style={{
                        fontSize: '12px',
                        padding: '2px 8px',
                        height: '24px',
                        lineHeight: '20px'
                      }}
                    >
                      {date}
                    </Tag>
                  ))}
                </div>
              )}
            </Space>
          </Form.Item>
        );

      default:
        return null;
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        type: 'cron',
        timeZone: 'UTC',
        invertTimeRange: false,
      }}
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please enter calendar name' }]}
      >
        <Input placeholder="Calendar Name" disabled={isEditing} />
      </Form.Item>

      <Form.Item
        label="Calendar Type"
        name="type"
        rules={[{ required: true, message: 'Please select calendar type' }]}
      >
        <Select 
          placeholder="Select calendar type"
          onChange={handleTypeChange}
        >
          {CalendarTypes.map(type => (
            <Option key={type.value} value={type.value}>
              {type.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
      >
        <TextArea rows={3} placeholder="Calendar description" />
      </Form.Item>

      <Form.Item
        label="Time Zone"
        name="timeZone"
        rules={[{ required: true, message: 'Please select timezone' }]}
      >
        <Select
          showSearch
          placeholder="Select timezone"
          filterOption={(input, option) =>
            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
          }
        >
          <Option value="UTC">(UTC-06:00) Central Time (US & Canada)</Option>
          <Option value="America/New_York">(UTC-05:00) Eastern Time (US & Canada)</Option>
          <Option value="America/Chicago">(UTC-06:00) Central Time (US & Canada)</Option>
          <Option value="America/Denver">(UTC-07:00) Mountain Time (US & Canada)</Option>
          <Option value="America/Los_Angeles">(UTC-08:00) Pacific Time (US & Canada)</Option>
          <Option value="Europe/London">(UTC+00:00) Greenwich Mean Time</Option>
          <Option value="UTC">UTC</Option>
        </Select>
      </Form.Item>

      {renderTypeSpecificFields()}

      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? 'Save' : 'Save'}
          </Button>
          <Button onClick={onCancel}>
            Discard Changes
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CalendarForm;