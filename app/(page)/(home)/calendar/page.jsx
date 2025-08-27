'use client'

import {useEffect, useState} from "react";
import { CalendarHeader } from "../../../components/calendar/CalendarHeader";
import { MonthView } from "../../../components/calendar/MonthView";
import { DayView } from "../../../components/calendar/DayView";
import { YearView } from "../../../components/calendar/YearView";
import EventDialog from "../../../components/calendar/EventDialog";
import { addDays, addMonths, addYears, subDays, subMonths, subYears } from "date-fns";
import {Card} from "antd";
import {AppDataFields, useAppData} from "../../../masterData/AppDataContext";

export default function Page() {
    const {eventsData, updateAppDataField} = useAppData();
    const [currentView, setCurrentView] = useState({
        type: 'month',
        date: new Date()
    });

    const [events, setEvents] = useState(eventsData || []);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState();

    useEffect(() => {
        setEvents(eventsData);
    }, [eventsData]);

    const handlePrevious = () => {
        setCurrentView(prev => {
            switch (prev.type) {
                case 'day':
                    return { ...prev, date: subDays(prev.date, 1) };
                case 'month':
                    return { ...prev, date: subMonths(prev.date, 1) };
                case 'year':
                    return { ...prev, date: subYears(prev.date, 1) };
                default:
                    return prev;
            }
        });
    };

    const handleNext = () => {
        setCurrentView(prev => {
            switch (prev.type) {
                case 'day':
                    return { ...prev, date: addDays(prev.date, 1) };
                case 'month':
                    return { ...prev, date: addMonths(prev.date, 1) };
                case 'year':
                    return { ...prev, date: addYears(prev.date, 1) };
                default:
                    return prev;
            }
        });
    };

    const handleViewChange = (viewType) => {
        setCurrentView(prev => ({ ...prev, type: viewType }));
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setSelectedDate(undefined);
        setIsEventDialogOpen(true);
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setSelectedEvent(undefined);
        setIsEventDialogOpen(true);
    };

    const handleAddEvent = () => {
        setSelectedEvent(undefined);
        setSelectedDate(currentView.date);
        setIsEventDialogOpen(true);
    };

    const handleMonthClick = (date) => {
        setCurrentView({ type: 'month', date });
    };

    const handleEventSave = (data) => {
        if(data?.data) {
            updateAppDataField(AppDataFields.eventsData, data?.data);
        }
        setSelectedEvent(null);
        setSelectedDate(null)
    };

    return (
        <Card>
            <div className="flex flex-col">
                <CalendarHeader
                    currentDate={currentView.date}
                    viewType={currentView.type}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onViewChange={handleViewChange}
                    onAddEvent={handleAddEvent}
                />

                <div>
                    {currentView.type === 'month' && (
                        <MonthView
                            currentDate={currentView.date}
                            eventsData={eventsData}
                            onEventClick={handleEventClick}
                            onDateClick={handleDateClick}
                        />
                    )}

                    {currentView.type === 'day' && (
                        <DayView
                            currentDate={currentView.date}
                            eventsData={events}
                            onEventClick={handleEventClick}
                        />
                    )}

                    {currentView.type === 'year' && (
                        <YearView
                            currentDate={currentView.date}
                            eventsData={events}
                            onMonthClick={handleMonthClick}
                        />
                    )}
                </div>

                <EventDialog
                    open={isEventDialogOpen}
                    onOpenChange={setIsEventDialogOpen}
                    event={selectedEvent}
                    initialDate={selectedDate}
                    onSave={handleEventSave}
                />
            </div>
        </Card>
    );
};