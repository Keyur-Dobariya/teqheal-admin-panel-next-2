import { useState, useEffect } from 'react';
import { HolidayEvent, EventFormData } from '../types/calendar';
import {useAppData} from "../masterData/AppDataContext";

export const useEvents = () => {
    const {eventsData, updateAppDataField} = useAppData();

    const [events, setEvents] = useState<HolidayEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // const { toast } = useToast();


    const createEvent = (eventData: EventFormData) => {
        const newEvent: HolidayEvent = {
            id: Date.now().toString(),
            ...eventData,
            eventType: eventData.eventType as HolidayEvent['eventType'],
            eventLeaveType: eventData.eventLeaveType as HolidayEvent['eventLeaveType'] | undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);
        localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));

        // toast({
        //     title: "Event Created",
        //     description: `"${eventData.eventTitle}" has been added to your calendar.`,
        // });
    };

    const updateEvent = (id: string, eventData: EventFormData) => {
        const updatedEvents = events.map(event =>
            event.id === id
                ? {
                    ...event,
                    ...eventData,
                    eventType: eventData.eventType as HolidayEvent['eventType'],
                    eventLeaveType: eventData.eventLeaveType as HolidayEvent['eventLeaveType'] | undefined,
                    updatedAt: new Date().toISOString()
                }
                : event
        );

        setEvents(updatedEvents);
        localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));

        // toast({
        //     title: "Event Updated",
        //     description: `"${eventData.eventTitle}" has been updated.`,
        // });
    };

    const deleteEvent = (id: string) => {
        const eventToDelete = events.find(event => event.id === id);
        const updatedEvents = events.filter(event => event.id !== id);

        setEvents(updatedEvents);
        localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));

        // toast({
        //     title: "Event Deleted",
        //     description: `"${eventToDelete?.eventTitle}" has been removed from your calendar.`,
        // });
    };

    return {
        events,
        isLoading,
        createEvent,
        updateEvent,
        deleteEvent
    };
};