import api from './api';

// Types matching the backend models
export interface CalendarListItem {
  name: string;
  description: string;
  type: string;
}

export interface CalendarViewModel {
  name: string;
  type: string;
  description: string;
  timeZone: string;
  cronExpression?: string;
  invertTimeRange?: boolean;
  startingTime?: string;
  endingTime?: string;
  days?: string[];
  dates?: string[];
  daysExcluded?: boolean[];
}

export interface CreateCalendarRequest {
  name: string;
  type: string;
  description: string;
  timeZone: string;
  cronExpression?: string;
  //invertTimeRange?: boolean;
  //startingTime?: string;
  //endingTime?: string;
  //days?: string[];
  //dates?: string[];
  //daysExcluded?: boolean[];
}

// Calendar types for the dropdown
export const CalendarTypes = [
  { value: 'cron', label: 'Cron' },
  { value: 'annual', label: 'Annual' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
  { value: 'holiday', label: 'Holiday' },
];

// Calendars API service
export const calendarsApi = {
  // Get all calendars
  getCalendars: async (): Promise<CalendarListItem[]> => {
    const response = await api.get<CalendarListItem[]>('/calendars');
    return response.data;
  },

  // Get specific calendar by name
  getCalendar: async (name: string): Promise<CalendarViewModel> => {
    const response = await api.get<CalendarViewModel>(`/calendars/${encodeURIComponent(name)}`);
    return response.data;
  },

  // Create new calendar
  createCalendar: async (calendar: CreateCalendarRequest): Promise<void> => {
    await api.post('/calendars', calendar);
  },

  // Update existing calendar
  updateCalendar: async (name: string, calendar: CalendarViewModel): Promise<void> => {
    await api.put(`/calendars/${encodeURIComponent(name)}`, calendar);
  },

  // Delete calendar
  deleteCalendar: async (name: string): Promise<void> => {
    await api.delete(`/calendars/${encodeURIComponent(name)}`);
  },
};
