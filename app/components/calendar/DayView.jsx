import { useEffect, useMemo, useState } from 'react';
import { EventCard } from './EventCard';
import { Typography, Empty } from 'antd';
import { format, parseISO, isSameDay, getHours, getMinutes } from 'date-fns';

const { Title, Text } = Typography;

export const DayView = ({ currentDate, eventsData, onEventClick }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const dayEvents = eventsData.filter(event => {
        const eventStart = parseISO(event.eventDate);
        const eventEnd = event.endDate ? parseISO(event.endDate) : eventStart;
        return currentDate >= eventStart && currentDate <= eventEnd;
    });

    const timeSlots = Array.from({ length: 24 }, (_, i) => i);

    const isToday = isSameDay(currentDate, currentTime);

    return (
        <div className="flex-1 overflow-auto bg-white">
            <div className="p-6">
                <div className="mb-6">
                    <Title level={4} className="!m-0 !mb-2 text-black">
                        {format(currentDate, 'EEEE, MMMM d, yyyy')}
                    </Title>
                    <Text type="secondary">
                        {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled
                    </Text>
                </div>

                {dayEvents.length === 0 ? (
                    <Empty description="No events scheduled" className="py-12" />
                ) : (
                    <div className="grid gap-4 max-w-[600px]">
                        {dayEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                onClick={() => onEventClick(event)}
                            />
                        ))}
                    </div>
                )}

                <div className="mt-8 border-t border-gray-200 pt-6">
                    <Title level={5} className="!mb-4 text-black">
                        Time Slots
                    </Title>
                    <div className="flex flex-col gap-0 relative">
                        {timeSlots.map((hour) => {
                            const slotTime = new Date(currentDate);
                            slotTime.setHours(hour, 0, 0, 0);

                            const isCurrentHour = isToday && hour === getHours(currentTime);
                            const minutes = getMinutes(currentTime);
                            const lineTop = (minutes / 60) * 100;

                            return (
                                <div
                                    key={hour}
                                    className="relative flex items-center gap-2 p-2 h-16 border-b border-gray-200 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-11 text-sm text-gray-500 pt-1">
                                        {format(slotTime, 'HH:mm')}
                                    </div>
                                    <div className="flex-1 relative h-full">
                                        {isCurrentHour && (
                                            <div
                                                className="absolute left-0 right-0 h-[1px] bg-red-500 z-10"
                                                style={{ top: `${lineTop}%` }}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};