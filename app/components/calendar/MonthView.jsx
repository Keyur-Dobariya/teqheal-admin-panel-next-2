import { EventCard } from "./EventCard";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isToday,
    parseISO,
    isWithinInterval,
    isSameDay,
    setYear,
} from "date-fns";

export const MonthView = ({ currentDate, eventsData, onEventClick, onDateClick }) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const getEventsForDate = (date) => {
        if (eventsData.length === 0) return [];

        return eventsData.filter((event) => {
            const eventStart = parseISO(event.eventDate);
            const eventEnd = event?.endDate ? parseISO(event.endDate) : eventStart;

            if (event.eventType === "birthday") {
                const birthdayThisYear = setYear(eventStart, date.getFullYear());
                return isSameDay(date, birthdayThisYear);
            }

            return isWithinInterval(date, { start: eventStart, end: eventEnd });
        });
    };

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {weekdays.map((day) => (
                    <div
                        key={day}
                        className="p-4 text-sm text-gray-600 font-medium text-muted-foreground bg-secondary/50 uppercase"
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 h-full">
                {days.map((day, index) => {
                    const dayEvents = getEventsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isCurrentDay = isToday(day);
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                    const isLastInRow = day.getDay() === 6;

                    const isLastInMonth = index >= days.length - 7;

                    return (
                        <div
                            key={day.toISOString()}
                            // className={`p-4 min-h-[100px] sm:min-h-[120px] md:min-h-[140px] lg:min-h-[160px] xl:min-h-[180px] cursor-pointer hover:bg-gray-50 transition-colors
                            className={`p-4 min-h-[150px] cursor-pointer hover:bg-gray-50 transition-colors 
                                ${!isCurrentMonth ? 'bg-gray-50' : ''}
                                ${isWeekend ? '' : ''}
                                ${isLastInRow ? '' : 'border-r border-gray-200'}
                                ${isLastInMonth ? '' : 'border-b border-gray-200'}
                            `}
                            onClick={() => onDateClick(day)}
                        >
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span
                                        className={`text-sm font-medium ${isCurrentDay
                                            ? 'bg-blue-800 text-white rounded-full w-6 h-6 flex items-center justify-center'
                                            : !isCurrentMonth
                                                ? 'text-gray-400'
                                                : 'text-gray-800'
                                        }`}
                                    >
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    {dayEvents.slice(0, 3).map((event) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            onClick={() => onEventClick(event)}
                                            compact
                                        />
                                    ))}

                                    {dayEvents.length > 3 && (
                                        <div className="text-xs text-muted-foreground">
                                            +{dayEvents.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};