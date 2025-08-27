import {Card, Typography} from 'antd';
import {
    startOfYear,
    endOfYear,
    eachMonthOfInterval,
    format,
    parseISO,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isToday,
    getDay
} from 'date-fns';

const { Title, Text } = Typography;

export const YearView = ({ currentDate, eventsData, onMonthClick }) => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    const getEventsForMonth = (month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        return eventsData.filter(event => {
            const eventStart = parseISO(event.eventDate);
            const eventEnd = event.endDate ? parseISO(event.endDate) : eventStart;
            return (eventStart <= monthEnd && eventEnd >= monthStart);
        });
    };

    const getEventDaysInMonth = (month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

        return days.filter(day => {
            return eventsData.some(event => {
                const eventStart = parseISO(event.eventDate);
                const eventEnd = event.endDate ? parseISO(event.endDate) : eventStart;
                return day >= eventStart && day <= eventEnd;
            });
        });
    };

    return (
        <div className="flex-1 overflow-auto p-6 bg-white">
            {/* Header */}
            <div className="mb-6">
                <Title level={2} className="!mb-2 text-black">
                    {format(currentDate, 'yyyy')}
                </Title>
                <Text type="secondary">
                    {eventsData.length} total events this year
                </Text>
            </div>

            {/* One month per row */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                {/*<div style={{*/}
                {/*    display: 'grid',*/}
                {/*    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',*/}
                {/*    gap: '24px'*/}
                {/*}}>*/}
                {months.map((month) => {
                    const monthEvents = getEventsForMonth(month);
                    const eventDays = getEventDaysInMonth(month);

                    // Days of this month
                    const days = eachDayOfInterval({
                        start: startOfMonth(month),
                        end: endOfMonth(month)
                    });

                    // How many blanks before the 1st? (Sunday=0)
                    const startDay = getDay(startOfMonth(month));
                    const paddedDays = [
                        ...Array(startDay).fill(null), // empty slots
                        ...days
                    ];

                    return (
                        <Card hoverable>
                            <div
                                key={month.toISOString()}
                                className="p-4"
                                onClick={() => onMonthClick(month)}
                            >
                                {/* Month header */}
                                <div className="mb-3">
                                    <Title level={5} className="!m-0 !mb-1 text-black">
                                        {format(month, 'MMMM')}
                                    </Title>
                                    <Text type="secondary" className="text-sm">
                                        {monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''}
                                    </Text>
                                </div>

                                {/* Mini calendar */}
                                <div className="mb-3">
                                    {/* Weekdays */}
                                    <div className="grid grid-cols-7 gap-1 mb-1">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                            <div
                                                key={idx}
                                                className="text-center text-xs font-medium text-gray-500 p-0.5"
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Days with padding */}
                                    <div className="grid grid-cols-7 gap-0.5">
                                        {paddedDays.map((day, idx) => {
                                            if (!day) {
                                                return <div key={`empty-${idx}`} />; // empty cell
                                            }
                                            const hasEvent = eventDays.some(eventDay =>
                                                eventDay.getTime() === day.getTime()
                                            );
                                            const isCurrentDay = isToday(day);

                                            return (
                                                <div
                                                    key={day.toISOString()}
                                                    className={`
                                                    text-center text-[11px] p-0.5 rounded
                                                    ${isCurrentDay ? 'bg-blue-600 text-white' : hasEvent ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}
                                                `}
                                                >
                                                    {format(day, 'd')}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {monthEvents.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(
                                                monthEvents.reduce((acc, event) => {
                                                    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
                                                    return acc;
                                                }, {})
                                            ).map(([type, count]) => (
                                                <span
                                                    key={type}
                                                    className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-black"
                                                >
                                                {`${type}":" ${count}`}
                                            </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
