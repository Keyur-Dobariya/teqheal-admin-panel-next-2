"use client";

import React, {useState, useRef, useEffect} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {Modal} from "antd";

export default function Page() {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modelTitle, setModelTitle] = useState(null);
    const [eventTitle, setEventTitle] = useState("");
    const [eventStartDate, setEventStartDate] = useState("");
    const [eventEndDate, setEventEndDate] = useState("");
    const [eventLevel, setEventLevel] = useState("");
    const [events, setEvents] = useState([]);
    const [isOpen, openModal] = useState(false);
    const calendarRef = useRef(null);

    const calendarsEvents = {
        Danger: "danger",
        Success: "success",
        Primary: "primary",
        Warning: "warning",
    };

    useEffect(() => {
        // Initialize with some events
        setEvents([
            {
                id: "1",
                title: "Event Conf.",
                start: new Date().toISOString().split("T")[0],
                extendedProps: {calendar: "Danger"},
            },
            {
                id: "2",
                title: "Meeting",
                start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
                extendedProps: {calendar: "Success"},
            },
            {
                id: "3",
                title: "Workshop",
                start: new Date(Date.now() + 172800000).toISOString().split("T")[0],
                end: new Date(Date.now() + 259200000).toISOString().split("T")[0],
                extendedProps: {calendar: "Primary"},
            },
        ]);
    }, []);

    const handleDateSelect = (selectInfo) => {
        resetModalFields();
        setEventStartDate(selectInfo.startStr);
        setEventEndDate(selectInfo.endStr || selectInfo.startStr);
        openModal(true);
    };

    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        setSelectedEvent(event);
        setModelTitle(event ? "Update Event" : "Add Event");
        setEventTitle(event.title);
        setEventStartDate(event.start?.toISOString().split("T")[0] || "");
        setEventEndDate(event.end?.toISOString().split("T")[0] || "");
        setEventLevel(event.extendedProps.calendar);
        openModal(true);
    };

    const handleAddOrUpdateEvent = () => {
        if (selectedEvent) {
            // Update existing event
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.id === selectedEvent.id
                        ? {
                            ...event,
                            title: eventTitle,
                            start: eventStartDate,
                            end: eventEndDate,
                            extendedProps: {calendar: eventLevel},
                        }
                        : event
                )
            );
        } else {
            // Add new event
            const newEvent = {
                id: Date.now().toString(),
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                allDay: true,
                extendedProps: {calendar: eventLevel},
            };
            setEvents((prevEvents) => [...prevEvents, newEvent]);
        }
        openModal(false);
        resetModalFields();
    };

    const resetModalFields = () => {
        setEventTitle("");
        setEventStartDate("");
        setEventEndDate("");
        setEventLevel("");
        setSelectedEvent(null);
        setModelTitle("Add Event");
    };

    const renderEventContent = (eventInfo) => {
        const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
        return (
            <div
                className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
            >
                <div className="fc-daygrid-event-dot"></div>
                <div className="fc-event-time">{eventInfo.timeText}</div>
                <div className="fc-event-title">{eventInfo.event.title}</div>
            </div>
        );
    };

    return (
        <>
            <div className="custom-calendar">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "prev,next addEventButton",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    events={events}
                    selectable={true}
                    dayHeaderClassNames={["fc-day"]}
                    dayCellClassNames={["fc-day-cell"]}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    eventContent={renderEventContent}
                    customButtons={{
                        addEventButton: {
                            text: "Add Event +",
                            click: () => {
                                openModal(true);
                            },
                        },
                    }}
                />
            </div>
            <Modal
                title={(<div className="text-lg">{modelTitle}</div>)}
                maskClosable={false}
                centered
                closeIcon={false}
                open={isOpen}
                onOk={handleAddOrUpdateEvent}
                onCancel={() => openModal(false)}
                onClose={() => openModal(false)}
                okText={modelTitle}
                className="max-w-[700px] p-6 lg:p-10"
            >
                <div className="flex flex-col overflow-y-auto custom-scrollbar">
                    <div>
                        <p className="text-sm text-gray-500">
                            Plan your next big moment: schedule or edit an event to stay on
                            track
                        </p>
                    </div>
                    <div className="mt-8">
                        <div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Event Title
                                </label>
                                <input
                                    id="event-title"
                                    type="text"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                                />
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="block mb-4 text-sm font-medium text-gray-700">
                                Event Color
                            </label>
                            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                                {Object.entries(calendarsEvents).map(([key, value]) => (
                                    <div key={key} className="n-chk">
                                        <div
                                            className={`form-check form-check-${value} form-check-inline`}
                                        >
                                            <label
                                                className="flex items-center text-sm text-gray-700 form-check-label"
                                                htmlFor={`modal${key}`}
                                            >
                        <span className="relative">
                          <input
                              className="sr-only form-check-input"
                              type="radio"
                              name="event-level"
                              value={key}
                              id={`modal${key}`}
                              checked={eventLevel === key}
                              onChange={() => setEventLevel(key)}
                          />
                          <span
                              className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box">
                            <span
                                className={`h-2 w-2 rounded-full bg-white ${
                                    eventLevel === key ? "block" : "hidden"
                                }`}
                            ></span>
                          </span>
                        </span>
                                                {key}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Enter Start Date
                            </label>
                            <div className="relative">
                                <input
                                    id="event-start-date"
                                    type="date"
                                    value={eventStartDate}
                                    onChange={(e) => setEventStartDate(e.target.value)}
                                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Enter End Date
                            </label>
                            <div className="relative">
                                <input
                                    id="event-end-date"
                                    type="date"
                                    value={eventEndDate}
                                    onChange={(e) => setEventEndDate(e.target.value)}
                                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};