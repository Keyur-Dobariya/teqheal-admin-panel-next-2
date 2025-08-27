import { Card, Tag, Space, Typography } from 'antd';
import { EyeInvisibleOutlined } from '@ant-design/icons';
import { format, parseISO } from 'date-fns';

const { Text } = Typography;

const calendarTheme = {
    eventColors: {
        holiday: '#ff7875',
        leave: '#ffc069',
        personal: '#95de64',
        meeting: '#69c0ff',
        birthday: '#b37feb'
    },
    textSecondary: '#666666',
};

export const EventCard = ({ event, onClick, compact = false }) => {
    const getEventColor = (type) => {
        return calendarTheme.eventColors[type] || calendarTheme.eventColors.personal;
    };

    const isMultiDay = event.endDate && event.endDate !== event.eventDate;

    if (compact) {
        return !event.isSilentLeave && (
            <div
                className="flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis"
                style={{
                    backgroundColor: `${getEventColor(event.eventType)}20`,
                    border: `1px solid ${getEventColor(event.eventType)}40`,
                    color: '#000',
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(event);
                }}
            >
                {event.isSilentLeave && (
                    <EyeInvisibleOutlined className="text-[10px]" />
                )}
                <span className="truncate">{event.eventTitle}</span>
            </div>
        );
    }

    return (
        <Card
            size="small"
            hoverable
            onClick={onClick}
            className="rounded-md shadow-sm"
            style={{
                borderColor: getEventColor(event.eventType),
                backgroundColor: `${getEventColor(event.eventType)}10`,
            }}
            bodyStyle={{ padding: '12px' }}
        >
            <Space direction="vertical" size="small" className="w-full">
                {/* Title + Silent icon */}
                <div className="flex justify-between items-start">
                    <Text strong className="text-[14px]">{event.eventTitle}</Text>
                    {event.isSilentLeave && (
                        <EyeInvisibleOutlined style={{ color: calendarTheme.textSecondary }} />
                    )}
                </div>

                {/* Event detail */}
                {event.eventDetail && (
                    <Text type="secondary" className="text-xs leading-tight">
                        {event.eventDetail}
                    </Text>
                )}

                {/* Tags */}
                <Space wrap>
                    <Tag
                        style={{
                            fontSize: '11px',
                            backgroundColor: `${getEventColor(event.eventType)}22`,
                            borderColor: getEventColor(event.eventType),
                            color: getEventColor(event.eventType),
                        }}
                    >
                        {event.eventType}
                    </Tag>

                    {event.eventLeaveType && (
                        <Tag className="text-[11px]">{event.eventLeaveType}</Tag>
                    )}

                    {event.isLeaveOnDay && (
                        <Tag color="red" className="text-[11px]">
                            Leave Day
                        </Tag>
                    )}
                </Space>

                {/* Date */}
                <Text type="secondary" className="text-[11px]">
                    {isMultiDay ? (
                        `${format(parseISO(event.eventDate), 'MMM d')} - ${format(parseISO(event.endDate), 'MMM d, yyyy')}`
                    ) : (
                        format(parseISO(event.eventDate), 'MMM d, yyyy')
                    )}
                </Text>
            </Space>
        </Card>
    );
};
