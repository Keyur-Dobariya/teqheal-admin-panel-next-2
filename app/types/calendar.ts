export interface HolidayEvent {
    id: string;
    eventTitle: string;
    eventDetail: string;
    eventType: 'holiday' | 'leave' | 'personal' | 'meeting' | 'birthday';
    eventLeaveType?: 'full' | 'half' | 'sick' | 'casual' | 'maternity' | 'paternity';
    eventDate: string;
    endDate?: string; // For multi-day events
    isLeaveOnDay: boolean;
    isSilentLeave: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CalendarView {
    type: 'day' | 'month' | 'year';
    date: Date;
}

export interface EventFormData {
    eventTitle: string;
    eventDetail: string;
    eventType: string;
    eventLeaveType?: string;
    eventDate: string;
    endDate?: string;
    isLeaveOnDay: boolean;
    isSilentLeave: boolean;
}