'use client'

import { ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import {Button, Segmented} from "antd";
import {useState} from "react";
import {
    LeftOutlined,
    RightOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import {isAdmin} from "../../dataStorage/DataPref";

export const CalendarHeader = ({
                                   currentDate,
                                   viewType,
                                   onPrevious,
                                   onNext,
                                   onViewChange,
                                   onAddEvent
                               }) => {

    const [options, setOptions] = useState(['day', 'month', 'year']);

    const getTitle = () => {
        switch (viewType) {
            case 'day':
                return format(currentDate, 'EEEE, MMMM d, yyyy');
            case 'month':
                return format(currentDate, 'MMMM yyyy');
            case 'year':
                return format(currentDate, 'yyyy');
            default:
                return '';
        }
    };

    return (
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <Segmented block value={viewType} options={[
                {
                    label: 'Day',
                    value: 'day',
                },
                {
                    label: 'Month',
                    value: 'month',
                },
                {
                    label: 'Year',
                    value: 'year',
                },
            ]} size="large" onChange={(value) => onViewChange(value)} style={{ width: 250 }} />
            <div className="min-w-[200px] text-center">
                <h2 className="text-lg font-semibold text-foreground">
                    {getTitle()}
                </h2>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="outlined"
                    onClick={onPrevious}
                    icon={<LeftOutlined />} />
                <Button
                    variant="outlined"
                    onClick={onNext}
                    icon={<RightOutlined />} />
                {isAdmin() && <Button type="primary" icon={<PlusOutlined/>} onClick={onAddEvent}>
                    Add Event
                </Button>}
            </div>
        </div>
    );
};