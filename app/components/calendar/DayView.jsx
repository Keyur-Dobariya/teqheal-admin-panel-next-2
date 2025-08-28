import { EventCard } from './EventCard';
import { Typography, Empty } from 'antd';
import { format, parseISO } from 'date-fns';

const { Title, Text } = Typography;

export const DayView = ({ currentDate, eventsData, onEventClick }) => {
    const dayEvents = eventsData.filter(event => {
        const eventStart = parseISO(event.eventDate);
        const eventEnd = event.endDate ? parseISO(event.endDate) : eventStart;
        return currentDate >= eventStart && currentDate <= eventEnd;
    });

    const timeSlots = Array.from({ length: 24 }, (_, i) => i);

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
                    <div className="flex flex-col gap-2">
                        {timeSlots.map((hour) => (
                            <div
                                key={hour}
                                className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => {

                                }}
                            >
                                <div className="w-16 text-sm text-gray-500">
                                    {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                                </div>
                                <div className="flex-1 h-[1px] bg-gray-200"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
