'use client';

import React, { useState, useEffect, useRef } from "react";
import {
    Modal, Form, Select, DatePicker, Input, TimePicker, Radio, Avatar, Button, Row, Col
} from "antd";
import { UserSelect } from "../components/CommonComponents";
import appKeys from "../utils/appKeys";
import appString from "../utils/appString";
import { getLocalData, isAdmin } from "../dataStorage/DataPref";
import { endpoints } from "../api/apiEndpoints";
import apiCall, { HttpMethod } from "../api/apiServiceProvider";
import {
    leaveTypeLabel,
    dayTypeLabel,
    leaveCategoryLabel,
    leaveHalfDayTypeLabel,
    leaveLabelKeys,
    leaveStatusLabel
} from "../utils/enum";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const { TextArea } = Input;
const { Option } = Select;

export default function LeaveAddUpdateModel({
                                                isModelOpen,
                                                setIsModelOpen,
                                                activeUsersData,
                                                selectedRecord,
                                                isLeaveStatusChange,
                                                setIsLeaveStatusChange,
                                                onSuccessCallback
                                            }) {
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();
    const containerRef = useRef(null);
    const [isAfter3Days, setIsAfter3Days] = useState(true);
    const isEditing = !!selectedRecord;
    const modelTitle = isEditing ? appString.updateLeave : appString.addLeave;

    const parseDate = (value, format = 'hh:mm A') =>
        value && dayjs(value, format).isValid() ? dayjs(value, format) : null;

    const defaultFormValues = {
        [appKeys.user]: selectedRecord?.[appKeys.user]?._id || null,
        [appKeys.leaveType]: selectedRecord?.[appKeys.leaveType] || null,
        [appKeys.dayType]: selectedRecord?.[appKeys.dayType] || leaveLabelKeys.singleDay,
        [appKeys.leaveHalfDayType]: selectedRecord?.[appKeys.leaveHalfDayType] || leaveLabelKeys.firstHalf,
        [appKeys.startDate]: selectedRecord?.[appKeys.startDate] ? dayjs(selectedRecord[appKeys.startDate]) : dayjs(),
        [appKeys.endDate]: selectedRecord?.[appKeys.endDate] ? dayjs(selectedRecord[appKeys.endDate]) : null,
        [appKeys.startTime]: parseDate(selectedRecord?.[appKeys.startTime]),
        [appKeys.endTime]: parseDate(selectedRecord?.[appKeys.endTime]),
        [appKeys.leaveCategory]: selectedRecord?.[appKeys.leaveCategory] || leaveLabelKeys.unpaid,
        [appKeys.reason]: selectedRecord?.[appKeys.reason] || null,
    };

    useEffect(() => {
        if (isLeaveStatusChange) {
            form.setFieldsValue({
                [appKeys.status]: selectedRecord[appKeys.status],
                [appKeys.rejectedReason]: selectedRecord[appKeys.rejectedReason]
            });
        } else {
            form.setFieldsValue(defaultFormValues);
        }
    }, [isModelOpen, isEditing, selectedRecord, form]);

    const handleCancel = () => {
        setIsModelOpen(false);
        setIsLeaveStatusChange(false);
        form.resetFields();
        if (containerRef.current) containerRef.current.scrollTop = 0;
    };

    const handleAddOrUpdate = async () => {
        try {
            if (!isLeaveStatusChange) {
                await form.validateFields([
                    appKeys.reason,
                    appKeys.leaveType,
                    ...(isAdmin() ? [appKeys.user] : []),
                    ...(form.getFieldValue(appKeys.leaveType) === leaveLabelKeys.manualHours ? [appKeys.startTime, appKeys.endTime] : []),
                    ...(form.getFieldValue(appKeys.dayType) === leaveLabelKeys.multipleDay ? [appKeys.endDate] : [])
                ]);
            } else {
                await form.validateFields([
                    ...(form.getFieldValue(appKeys.status) === leaveLabelKeys.rejected
                        ? [appKeys.rejectedReason]
                        : [])
                ]);
            }

            const allValues = form.getFieldsValue();
            const payload = {
                ...allValues,
                [appKeys.user]: isAdmin() ? allValues[appKeys.user] : getLocalData(appKeys._id)
            };

            const statusPayload = {
                [appKeys.status]: allValues[appKeys.status],
                [appKeys.rejectedReason]:
                    allValues[appKeys.status] === leaveLabelKeys.rejected
                        ? allValues[appKeys.rejectedReason]
                        : null
            };

            setIsLoading(true);

            await apiCall({
                method: HttpMethod.POST,
                url: isLeaveStatusChange
                    ? `${endpoints.leaveStatusChange}${selectedRecord["_id"]}`
                    : isEditing
                        ? `${endpoints.addLeave}/${selectedRecord["_id"]}`
                        : endpoints.addLeave,
                data: isLeaveStatusChange ? statusPayload : payload,
                setIsLoading,
                successCallback: (data) => {
                    handleCancel();
                    onSuccessCallback(data);
                }
            });
        } catch (err) {
            console.error("Form Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormChange = (_, allValues) => {
        form.setFieldsValue(allValues);
    };

    const leaveType = Form.useWatch(appKeys.leaveType, form);
    const dayType = Form.useWatch(appKeys.dayType, form);

    const renderFormFields = () => (
        <Form style={{overflowX: "hidden"}} form={form} layout="vertical" onValuesChange={handleFormChange}>
            {isLeaveStatusChange ? (
                <>
                    <Form.Item name={appKeys.status} label={appString.leaveStatus}>
                        <Select
                            placeholder={`Select ${appString.leaveStatus.toLowerCase()}`}
                            options={leaveStatusLabel}
                            style={{ height: "40px" }}
                        />
                    </Form.Item>
                    <Form.Item
                        name={appKeys.rejectedReason}
                        label={appString.rejectedReason}
                        rules={[{ required: true, message: "Rejected reason is required" }]}
                    >
                        <TextArea rows={2} placeholder="Enter rejection reason" />
                    </Form.Item>
                </>
            ) : (
                <>
                    {isAdmin() && (
                        <Form.Item
                            name={appKeys.user}
                            label={appString.user}
                            rules={[{ required: true, message: appString.selectUser }]}
                        >
                            <UserSelect users={activeUsersData} />
                        </Form.Item>
                    )}
                    <Form.Item
                        name={appKeys.leaveType}
                        label={appString.leaveType}
                        rules={[{ required: true, message: `Select ${appString.leaveType.toLowerCase()}` }]}
                    >
                        <Select
                            placeholder={`Select ${appString.leaveType.toLowerCase()}`}
                            allowClear
                            options={leaveTypeLabel}
                            onChange={(value) => {
                                form.setFieldsValue({
                                    [appKeys.leaveType]: value,
                                    [appKeys.dayType]: value === leaveLabelKeys.fullDay ? leaveLabelKeys.singleDay : null,
                                    [appKeys.leaveHalfDayType]: value === leaveLabelKeys.halfDay ? leaveLabelKeys.firstHalf : null,
                                    [appKeys.endDate]: null,
                                    [appKeys.startTime]: null,
                                    [appKeys.endTime]: null
                                });
                            }}
                        />
                    </Form.Item>

                    {leaveType === leaveLabelKeys.fullDay && (
                        <Form.Item name={appKeys.dayType} label={appString.selectOne}>
                            <Radio.Group
                                options={dayTypeLabel}
                                onChange={(e) =>
                                    form.setFieldsValue({
                                        [appKeys.dayType]: e.target.value,
                                        [appKeys.endDate]: null
                                    })
                                }
                            />
                        </Form.Item>
                    )}

                    {leaveType === leaveLabelKeys.halfDay && (
                        <Form.Item name={appKeys.leaveHalfDayType} label={appString.selectOne}>
                            <Radio.Group options={leaveHalfDayTypeLabel} />
                        </Form.Item>
                    )}

                    <Form.Item
                        name={appKeys.reason}
                        label={appString.reason}
                        rules={[{ required: true, message: "Reason is required" }]}
                    >
                        <Input placeholder="Enter reason" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={dayType === leaveLabelKeys.multipleDay ? 12 : 24}>
                            <Form.Item name={appKeys.startDate} label={appString.startDate} rules={[{ required: true }]}>
                                <DatePicker style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        {dayType === leaveLabelKeys.multipleDay && (
                            <Col span={12}>
                                {dayType === leaveLabelKeys.multipleDay && (
                                    <Form.Item
                                        name={appKeys.endDate}
                                        label={appString.endDate}
                                        rules={[{ required: true }]}
                                    >
                                        <DatePicker
                                            style={{ width: "100%" }}
                                            disabledDate={(current) =>
                                                current && current.isSameOrBefore(form.getFieldValue(appKeys.startDate), "day")
                                            }
                                        />
                                    </Form.Item>
                                )}
                            </Col>
                        )}
                    </Row>
                    {leaveType === leaveLabelKeys.manualHours && (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name={appKeys.startTime}
                                    label={appString.startTime}
                                    rules={[{ required: true }]}
                                >
                                    <TimePicker use12Hours style={{ width: "100%" }} minuteStep={30} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={appKeys.endTime}
                                    label={appString.endTime}
                                    rules={[{ required: true }]}
                                >
                                    <TimePicker
                                        use12Hours
                                        style={{ width: "100%" }}
                                        minuteStep={30}
                                        disabledTime={() => {
                                            const start = form.getFieldValue(appKeys.startTime);
                                            if (!start) return {};
                                            const startHour = dayjs(start).hour();
                                            const startMinute = dayjs(start).minute();
                                            return {
                                                disabledHours: () =>
                                                    Array.from({ length: 24 }, (_, i) => i).filter((h) => h < startHour),
                                                disabledMinutes: (hour) =>
                                                    hour === startHour
                                                        ? Array.from({ length: 60 }, (_, i) => i).filter((m) => m < startMinute)
                                                        : []
                                            };
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}

                    <Form.Item name={appKeys.leaveCategory} label={appString.selectOne}>
                        <Radio.Group
                            options={leaveCategoryLabel({ disabledValues: [] })}
                        />
                    </Form.Item>
                </>
            )}
        </Form>
    );

    return (
        isModelOpen && (
            <Modal
                title={modelTitle}
                open={isModelOpen}
                maskClosable={false}
                centered
                okText={modelTitle}
                onOk={handleAddOrUpdate}
                onCancel={handleCancel}
                confirmLoading={isLoading}
                width={450}
            >
                <div
                    ref={containerRef}
                    className="container-with-scrollbar"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                >
                    {renderFormFields()}
                </div>
            </Modal>
        )
    );
}



















// 'use client'
//
// import React, {useState, useEffect, useRef} from "react";
// import {
//     Avatar, Button, DatePicker, Dropdown, Form, Radio, Input, message, Modal, Select, Tag, TimePicker, Tooltip, Upload
// } from "antd";
// import appKeys from "../utils/appKeys";
// import appString from "../utils/appString";
// import {getLocalData, isAdmin} from "../dataStorage/DataPref";
// import {endpoints} from "../api/apiEndpoints";
// import apiCall, {HttpMethod} from "../api/apiServiceProvider";
// import {
//     leaveTypeLabel,
//     UserRole, dayTypeLabel, leaveCategoryLabel, leaveHalfDayTypeLabel, leaveLabelKeys, leaveStatusLabel,
// } from "../utils/enum";
// import dayjs from "dayjs";
// import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
// import {UserSelect} from "../components/CommonComponents";
//
// dayjs.extend(isSameOrBefore);
//
// const {Option} = Select;
// const {TextArea} = Input;
//
// export default function LeaveAddUpdateModel({
//                                                 isModelOpen,
//                                                 setIsModelOpen,
//                                                 activeUsersData,
//                                                 leaveData,
//                                                 isEditing,
//                                                 isLeaveStatusChange,
//                                                 setIsEditing,
//                                                 setIsLeaveStatusChange,
//                                                 onSuccessCallback,
//                                             }) {
//     const [isLoading, setIsLoading] = useState(false);
//     const [form] = Form.useForm();
//     const containerRef = useRef(null);
//     // const isEditing = !!selectedRecord;
//     const modelTitle = isEditing ? appString.updateLeave : appString.addLeave;
//
//     const parseDate = (dateString) => {
//         if (!dateString) return null;
//
//         const isoParsed = dayjs(dateString);
//         if (isoParsed.isValid()) return isoParsed;
//
//         const customParsed = dayjs(dateString, "hh:mm A");
//         if (customParsed.isValid()) return customParsed;
//
//         return null; // If both fail
//     };
//
//     const defaultLeaveValues = {
//         [appKeys.user]: leaveData[appKeys.user] ? leaveData[appKeys.user].userId : null,
//         [appKeys.leaveType]: leaveData[appKeys.leaveType] || null,
//         [appKeys.dayType]: leaveData[appKeys.dayType] || leaveLabelKeys.singleDay,
//         [appKeys.leaveHalfDayType]: leaveData[appKeys.leaveHalfDayType] || leaveLabelKeys.firstHalf,
//         [appKeys.startDate]: leaveData[appKeys.startDate] ? dayjs(leaveData[appKeys.startDate]) : dayjs(),
//         [appKeys.endDate]: leaveData[appKeys.endDate] ? dayjs(leaveData[appKeys.endDate]) : null,
//         [appKeys.startTime]: parseDate(leaveData[appKeys.startTime]),
//         [appKeys.endTime]: parseDate(leaveData[appKeys.endTime]),
//         [appKeys.leaveCategory]: leaveData[appKeys.leaveCategory] || leaveLabelKeys.unpaid,
//         [appKeys.reason]: leaveData[appKeys.reason] || null,
//     };
//
//     const [leaveValues, setLeaveValues] = useState(defaultLeaveValues);
//     const [isAfter3Days, setIsAfter3Days] = useState(true);
//
//     useEffect(() => {
//         if(isLeaveStatusChange) {
//             form.setFieldsValue({
//                 [appKeys.status]: leaveData[appKeys.status],
//                 [appKeys.rejectedReason]: leaveData[appKeys.rejectedReason],
//             })
//         }
//         if (isEditing) {
//             const isAfter3 = !!(leaveData[appKeys.startDate] && dayjs(leaveData[appKeys.startDate]).diff(dayjs(), 'day') < 3);
//             setIsAfter3Days(isAfter3);
//             form.setFieldsValue(leaveValues);
//             setLeaveValues(leaveValues);
//         }
//     }, []);
//
//     const resetLeaveValues = () => {
//         setLeaveValues(defaultLeaveValues);
//         form.resetFields();
//         if (containerRef.current) {
//             containerRef.current.scrollTop = 0;
//         }
//     };
//
//     const handleEditCancel = () => {
//         setIsModelOpen(false);
//         setIsEditing(false);
//         setIsLeaveStatusChange(false);
//         resetLeaveValues();
//     };
//
//     const handleFieldChange = (changedValues, allValues) => {
//         form.setFieldsValue(allValues);
//         setLeaveValues((prev) => ({
//             ...prev,
//             [appKeys.reason]: allValues[appKeys.reason],
//         }));
//     };
//
//     const handleAddUpdateLeaveApi = async () => {
//         try {
//             if(!isLeaveStatusChange) {
//                 await form.validateFields([
//                     appKeys.reason,
//                     appKeys.leaveType,
//                     ...(isAdmin() ? [appKeys.user] : []),
//                     ...(leaveValues[appKeys.leaveType] === leaveLabelKeys.manualHours ? [appKeys.startTime, appKeys.endTime] : []),
//                     ...(leaveValues[appKeys.dayType] === leaveLabelKeys.multipleDay ? [appKeys.endDate] : []),
//                 ]);
//             } else {
//                 await form.validateFields([
//                     ...(form.getFieldValue(appKeys.status) === leaveLabelKeys.rejected ? [appKeys.rejectedReason] : []),
//                 ]);
//             }
//
//             const payload = {
//                 ...leaveValues,
//                 [appKeys.user]:  isAdmin() ? leaveValues[appKeys.user] : getLocalData(appKeys._id),
//                 // [appKeys.startDate]: leaveValues[appKeys.startDate]?.format("YYYY-MM-DD"),
//                 // [appKeys.endDate]: leaveValues[appKeys.endDate]?.format("YYYY-MM-DD"),
//             };
//
//             const statusChangePayload = {
//                 [appKeys.status]: form.getFieldValue(appKeys.status),
//                 [appKeys.rejectedReason]: form.getFieldValue(appKeys.status) === leaveLabelKeys.rejected ? form.getFieldValue(appKeys.rejectedReason) : null,
//             };
//
//             setIsLoading(true);
//
//             await apiCall({
//                 method: HttpMethod.POST,
//                 url: isLeaveStatusChange ? `${endpoints.leaveStatusChange}${leaveData["_id"]}` : isEditing ? `${endpoints.addLeave}/${leaveData["_id"]}` : endpoints.addLeave,
//                 data: isLeaveStatusChange ? statusChangePayload : payload,
//                 setIsLoading: setIsLoading,
//                 successCallback: (data) => {
//                     handleEditCancel();
//                     onSuccessCallback(data);
//                 },
//             });
//         } catch (error) {
//             console.error("Form validation or API failed:", error);
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     const formUi = () => {
//         return (
//             <Form
//                 form={form}
//                 layout="vertical"
//                 onValuesChange={handleFieldChange}
//             >
//                 {isLeaveStatusChange ? <div>
//                     <Form.Item name={appKeys.status} label={appString.leaveStatus}>
//                         <Select
//                             placeholder={`Select ${appString.leaveStatus.toLowerCase()}`}
//                             style={{height: '40px'}}
//                             options={leaveStatusLabel}
//                         />
//                     </Form.Item>
//                     <Form.Item name={appKeys.rejectedReason} label={appString.rejectedReason}
//                                rules={[{required: true, message: `${appString.rejectedReason} is required`}]}>
//                         <TextArea rows={2} placeholder={`Enter ${appString.rejectedReason.toLowerCase()}`}/>
//                     </Form.Item>
//                 </div> : <div>
//                     {isAdmin() ?
//                         <Form.Item name={appKeys.user} label={appString.user}
//                                    rules={[{required: true, message: appString.selectUser}]} span={24}>
//                             <UserSelect users={activeUsersData} />
//                         </Form.Item> : null}
//                     <Form.Item name={appKeys.leaveType} label={appString.leaveType}
//                                rules={[{required: true, message: `Select ${appString.leaveType.toLowerCase()}`}]} span={24}>
//                         <Select
//                             placeholder={`Select ${appString.leaveType.toLowerCase()}`}
//                             allowClear
//                             value={leaveValues[appKeys.leaveType]}
//                             onChange={(value) => {
//                                 setLeaveValues((prev) => ({
//                                     ...prev,
//                                     [appKeys.dayType]: value === leaveLabelKeys.fullDay ? leaveLabelKeys.singleDay : null,
//                                     [appKeys.leaveHalfDayType]: value === leaveLabelKeys.halfDay ? leaveLabelKeys.firstHalf : null,
//                                     [appKeys.endDate]: null,
//                                     [appKeys.startTime]: null,
//                                     [appKeys.endTime]: null,
//                                     [appKeys.leaveType]: value,
//                                 }));
//                             }}
//                             options={leaveTypeLabel}
//                         />
//                     </Form.Item>
//                     {leaveValues[appKeys.leaveType] === leaveLabelKeys.fullDay ?
//                         <Form.Item name={appKeys.dayType} label={appString.selectOne} span={24}>
//                             <Radio.Group
//                                 name={appKeys.dayType}
//                                 defaultValue={leaveLabelKeys.singleDay}
//                                 options={dayTypeLabel}
//                                 value={leaveValues[appKeys.dayType]}
//                                 onChange={({target: {value}}) => {
//                                     setLeaveValues((prev) => ({
//                                         ...prev,
//                                         [appKeys.endDate]: null,
//                                         [appKeys.dayType]: value,
//                                     }));
//                                 }}
//                             />
//                         </Form.Item> : null}
//                     {leaveValues[appKeys.leaveType] === leaveLabelKeys.halfDay ?
//                         <Form.Item name={appKeys.leaveHalfDayType} label={appString.selectOne} span={24}>
//                             <Radio.Group
//                                 name={appKeys.leaveHalfDayType}
//                                 defaultValue={leaveLabelKeys.firstHalf}
//                                 options={leaveHalfDayTypeLabel}
//                                 value={leaveValues[appKeys.leaveHalfDayType]}
//                                 onChange={({target: {value}}) => {
//                                     setLeaveValues((prev) => ({
//                                         ...prev,
//                                         [appKeys.leaveHalfDayType]: value,
//                                     }));
//                                 }}
//                             />
//                         </Form.Item> : null}
//                     <Form.Item name={appKeys.reason} label={appString.reason}
//                                rules={[{required: true, message: `${appString.reason} is required`}]}>
//                         <Input placeholder={`Enter ${appString.reason.toLowerCase()}`}/>
//                     </Form.Item>
//                     <Form.Item name={appKeys.startDate} label={appString.startDate} rules={[{required: true}]}
//                                span={leaveValues[appKeys.dayType] === leaveLabelKeys.multipleDay ? 12 : 24}>
//                         <DatePicker defaultValue={leaveValues[appKeys.startDate]}
//                                     value={leaveValues[appKeys.startDate] ? dayjs(leaveValues[appKeys.startDate], 'YYYY-MM-DD') : null}
//                                     style={{width: "100%"}}
//                                     allowClear={false}
//                                     onChange={(date, dateString) => {
//                                         const isAfter3 = !!(dateString && dayjs(dateString).diff(dayjs(), 'day') < 3);
//                                         setIsAfter3Days(isAfter3);
//
//                                         setLeaveValues((prev) => ({
//                                             ...prev,
//                                             [appKeys.startDate]: dateString,
//                                         }));
//                                     }}/>
//                     </Form.Item>
//                     {leaveValues[appKeys.dayType] === leaveLabelKeys.multipleDay ?
//                         <Form.Item name={appKeys.endDate} label={appString.endDate}
//                                    rules={[{required: true, message: 'Please select end date!'}]} span={12}>
//                             <DatePicker
//                                 value={leaveValues[appKeys.endDate] ? dayjs(leaveValues[appKeys.endDate], 'YYYY-MM-DD') : null}
//                                 style={{width: "100%"}}
//                                 disabledDate={(current) =>
//                                     current && current.isSameOrBefore(dayjs(leaveValues[appKeys.startDate]), 'day')
//                                 }
//                                 onChange={(date, dateString) => {
//                                     setLeaveValues((prev) => ({
//                                         ...prev,
//                                         [appKeys.endDate]: dateString,
//                                     }));
//                                 }}/>
//                         </Form.Item> : null}
//                     {leaveValues[appKeys.leaveType] === leaveLabelKeys.manualHours ?
//                         <Form.Item name={appKeys.startTime} label={appString.startTime}
//                                    rules={[{required: true, message: 'Please select start time!'}]} span={12}>
//                             <TimePicker use12Hours minuteStep={30} showNow={false} showSecond={false}
//                                         value={leaveValues[appKeys.startTime] ? dayjs(leaveValues[appKeys.startTime], 'hh:mm A') : null}
//                                         style={{width: "100%"}}
//                                         onChange={(time, timeString) => {
//                                             setLeaveValues((prev) => ({
//                                                 ...prev,
//                                                 [appKeys.startTime]: timeString,
//                                             }));
//                                         }}/>
//                         </Form.Item> : null}
//                     {leaveValues[appKeys.leaveType] === leaveLabelKeys.manualHours ?
//                         <Form.Item name={appKeys.endTime} label={appString.endTime}
//                                    rules={[{required: true, message: 'Please select end time!'}]} span={12}>
//                             <TimePicker use12Hours minuteStep={30} showNow={false} showSecond={false}
//                                         value={leaveValues[appKeys.endTime] ? dayjs(leaveValues[appKeys.endTime], 'hh:mm A') : null}
//                                         style={{width: "100%"}}
//                                         disabledTime={() => {
//                                             // const isSameDay = dayjs(leaveValues[appKeys.startDate]).isSame(leaveValues[appKeys.endDate], 'day');
//                                             // if (!isSameDay) return {};
//
//                                             const [startHour, startMinute] = dayjs(leaveValues[appKeys.startTime], "hh:mm A").format("HH:mm").split(":").map(Number);
//
//                                             return {
//                                                 disabledHours: () =>
//                                                     Array.from({length: 24}, (_, i) => i).filter(h => h < startHour),
//                                                 disabledMinutes: (selectedHour) => {
//                                                     if (selectedHour === startHour) {
//                                                         return Array.from({length: 60}, (_, i) => i).filter(m => m < startMinute);
//                                                     }
//                                                     return [];
//                                                 }
//                                             };
//                                         }}
//                                         onChange={(time, timeString) => {
//                                             setLeaveValues((prev) => ({
//                                                 ...prev,
//                                                 [appKeys.endTime]: timeString,
//                                             }));
//                                         }}/>
//                         </Form.Item> : null}
//                     <Form.Item name={appKeys.leaveCategory} label={appString.selectOne} span={24}>
//                         <Radio.Group
//                             name={appKeys.leaveCategory}
//                             options={leaveCategoryLabel({
//                                 // disabledValues: isAfter3Days ? [leaveLabelKeys.paid] : [],
//                                 disabledValues: [],
//                             })}
//                             defaultValue={leaveValues[appKeys.leaveCategory]}
//                             onChange={({target: {value}}) => {
//                                 setLeaveValues((prev) => ({
//                                     ...prev,
//                                     [appKeys.leaveCategory]: value,
//                                 }));
//                             }}
//                         />
//                     </Form.Item>
//                 </div>}
//             </Form>
//         );
//     };
//
//     return (<>
//         {isModelOpen && (<Modal
//             title={modelTitle}
//             maskClosable={false}
//             centered
//             open={isModelOpen}
//             width={450}
//             onOk={() => {
//                 handleAddUpdateLeaveApi();
//             }}
//             onCancel={handleEditCancel}
//             onClose={handleEditCancel}
//             okText={modelTitle}
//         >
//             {<div
//                 className="container-with-scrollbar"
//                 ref={containerRef}
//                 style={{
//                     width: "100%", maxHeight: "75vh", overflow: "auto", alignItems: "center",
//                 }}
//             >
//                 {formUi()}
//             </div>}
//         </Modal>)}
//     </>);
// }