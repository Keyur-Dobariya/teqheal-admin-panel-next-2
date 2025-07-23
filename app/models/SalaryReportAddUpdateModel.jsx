'use client'

import React, {useEffect, useRef, useState} from "react";
import {Modal, Form, Input, Select, DatePicker, Checkbox, Row, Table} from "antd";
import dayjs from "dayjs";
import {
    getLabelByKey,
    leaveLabelKeys,
    leaveTypeLabel,
} from "../utils/enum";
import appKeys from "../utils/appKeys";
import apiCall, {HttpMethod} from "../api/apiServiceProvider";
import {endpoints} from "../api/apiEndpoints";
import {convertCamelCase} from "../utils/utils";
import {CheckCircle, XCircle} from "../utils/icons";

const {TextArea} = Input;

export const SalaryReportAddUpdateModel = ({
                                        isModelOpen,
                                        setIsModelOpen,
                                        selectedRecord,
                                        onSuccessCallback,
                                    }) => {
    const [form] = Form.useForm();
    const [leaveData, setLeaveData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [punchData, setPunchData] = useState([]);
    const [removedLeaveData, setRemovedLeaveData] = useState([]);
    const [removedPunchData, setRemovedPunchData] = useState([]);
    const [addLeaveData, setAddLeaveData] = useState([]);
    const [addPunchData, setAddPunchData] = useState([]);
    const [isBonus, setIsBonus] = useState(false);
    const [isDeduct, setIsDeduct] = useState(false);
    const containerRef = useRef(null);
    const isEditing = !!selectedRecord;

    useEffect(() => {
        form.setFieldsValue({
            user: selectedRecord.user?.fullName || "",
            description: selectedRecord.description || "",
            bonus: selectedRecord.bonus || "",
            deduct: selectedRecord.deduct || "",
            dateRange: selectedRecord.date ? [dayjs(selectedRecord.date[0]), dayjs(selectedRecord.date[1])] : null,
        });

        setIsBonus(!!selectedRecord.bonus);
        setIsDeduct(!!selectedRecord.deduct);

        setLeaveData(selectedRecord.leaveData ? selectedRecord.leaveData || [] : null);
        setPunchData(selectedRecord.punchData ? selectedRecord.punchData || [] : null);
    }, [isEditing, selectedRecord, form]);

    const handleOk = () => {
        form
            .validateFields()
            .then(async (values) => {
                const payload = {
                    _id: selectedRecord._id,
                    user: selectedRecord.user._id,
                    description: values.description,
                    query: selectedRecord.query,
                    bonus: isBonus ? values.bonus : null,
                    deduct: isDeduct ? values.deduct : null,
                    removedLeave: removedLeaveData,
                    removedPunch: removedPunchData,
                    addLeave: addLeaveData,
                    addPunch: addPunchData,
                };
                await apiCall({
                    method: HttpMethod.POST,
                    url: endpoints.updateSalaryReport,
                    data: payload,
                    setIsLoading: setIsLoading,
                    successCallback: (data) => {
                        setIsModelOpen(false);
                        onSuccessCallback(data);
                    },
                });
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    const handleCancel = () => {
        setIsModelOpen(false);
        form.resetFields();
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };

    function getLeaveDateTime(leave) {
        const { leaveType, dayType, startDate, endDate, startTime, endTime } = leave;

        if (leaveType === leaveLabelKeys.fullDay && dayType === leaveLabelKeys.singleDay) return startDate;
        if (leaveType === leaveLabelKeys.fullDay && dayType === leaveLabelKeys.multipleDay) return `${startDate} to ${endDate}`;
        if (leaveType === leaveLabelKeys.halfDay) return startDate;
        if (leaveType === leaveLabelKeys.manualHours) return `${startDate} ${startTime} to ${endTime}`;
        return "-";
    }

    function getLeaveType(leave) {
        const { leaveType, dayType, leaveHalfDayType } = leave;
        if (leaveType === leaveLabelKeys.fullDay && dayType === leaveLabelKeys.multipleDay)
            return `${getLabelByKey(leaveType, leaveTypeLabel)} (${convertCamelCase(dayType)})`;
        if (leaveType === leaveLabelKeys.halfDay)
            return `${getLabelByKey(leaveType, leaveTypeLabel)} (${convertCamelCase(leaveHalfDayType)})`;
        return getLabelByKey(leaveType, leaveTypeLabel);
    }

    return (
        <Modal
            title="Salary Report"
            open={isModelOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            onClose={handleCancel}
            footer={selectedRecord.isPublished ? null : undefined}
            confirmLoading={isLoading}
            width={700}
        >
            <div
                ref={containerRef}
                style={{maxHeight: "75vh", overflowY: "auto", scrollbarWidth: "none"}}
            >
                <Form form={form} layout="vertical" disabled={selectedRecord.isPublished}>
                    <Form.Item
                        label="User"
                        name="user"
                        rules={[{required: true, message: "Please select a user!"}]}
                    >
                        <Input placeholder="User Name" value={form.getFieldValue(appKeys.user)} disabled
                               style={{height: "40px"}}/>
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <TextArea placeholder={selectedRecord.isPublished ? "" : "Description of Salary Report"} rows={2} />
                    </Form.Item>
                    <Row style={{margin: "0 0 15px 5px", gap: "15px"}}>
                        <Checkbox checked={isBonus} onChange={(e) => setIsBonus(e.target.checked)}>
                            Bonus
                        </Checkbox>
                        <Checkbox checked={isDeduct} onChange={(e) => setIsDeduct(e.target.checked)}>
                            Deduct
                        </Checkbox>
                    </Row>
                    {isBonus && (
                        <Form.Item
                            name="bonus"
                            label="Bonus"
                        >
                            <Input value={selectedRecord.bonus} placeholder="Enter bonus Amount" type="number"
                                   style={{height: "40px"}}/>
                        </Form.Item>
                    )}
                    {isDeduct && (
                        <Form.Item
                            name="deduct"
                            label="Deduct"
                        >
                            <Input value={selectedRecord.deduct} placeholder="Enter deduct Amount" type="number"
                                   style={{height: "40px"}}/>
                        </Form.Item>
                    )}
                    {selectedRecord.isPublished ?
                        <div style={{display: "flex", alignItems: "center", marginBottom: "10px", gap: "10px"}}>
                            <CheckCircle className="successIconStyle"/>
                            <div style={{marginRight: "20px"}}>Leave deducted from salary</div>
                            <XCircle className="deleteIconStyle"/>
                            <div>Leave not deducted from salary</div>
                        </div> : null}
                    {/*<strong style={{fontSize: "16px"}}>Leave List:</strong>*/}
                    {/*<Form.Item>*/}
                    {/*    {leaveData && leaveData.length > 0 ? (*/}
                    {/*        leaveData.map((leave, index) => (*/}
                    {/*            <LeaveItem key={leave._id} leave={leave} index={leave._id}*/}
                    {/*                       isPublished={selectedRecord.isPublished} onChange={(value) => {*/}
                    {/*                setRemovedLeaveData(prevData => [...prevData, value]);*/}
                    {/*            }}/>*/}
                    {/*        ))*/}
                    {/*    ) : (*/}
                    {/*        <span>No leaves available</span>*/}
                    {/*    )}*/}
                    {/*</Form.Item>*/}
                    <Form.Item label={<strong>Leave List</strong>}>
                        <Table
                            rowKey="_id"
                            pagination={false}
                            dataSource={leaveData}
                            bordered
                            size="middle"
                            columns={[
                                {
                                    title: "Date & Time",
                                    render: (leave) => getLeaveDateTime(leave),
                                },
                                {
                                    title: "Type",
                                    render: (leave) => getLeaveType(leave),
                                },
                                {
                                    title: "Hour",
                                    render: (leave) => leave.hours,
                                },
                                {
                                    title: "Unexpected",
                                    render: (leave) => (leave.isUnexpected ? "Yes" : "No"),
                                },
                                {
                                    title: "Sandwich",
                                    render: (leave) => (leave.sandwichLeave ? "Yes" : "No"),
                                },
                                {
                                    title: "Reason",
                                    dataIndex: "reason",
                                }
                            ]}
                            rowSelection={{
                                type: "checkbox",
                                getCheckboxProps: () => ({
                                    disabled: selectedRecord.isPublished,
                                }),
                                selectedRowKeys: leaveData.filter(l => l.isDeductible).map(l => l._id),
                                onChange: (selectedKeys) => {
                                    const updatedLeave = leaveData.map(item => ({
                                        ...item,
                                        isDeductible: selectedKeys.includes(item._id),
                                    }));

                                    const removed = updatedLeave
                                        .filter(item => !item.isDeductible)
                                        .map(item => ({
                                            _id: item._id,
                                            isDeductible: false,
                                        }));

                                    const added = updatedLeave
                                        .filter(item => item.isDeductible)
                                        .map(item => ({
                                            _id: item._id,
                                            isDeductible: true,
                                        }));

                                    setLeaveData(updatedLeave);
                                    setRemovedLeaveData(removed);
                                    setAddLeaveData(added);
                                }
                            }}
                        />
                    </Form.Item>
                    <Form.Item label={<strong>Punch List</strong>}>
                        <Table
                            rowKey="date"
                            pagination={false}
                            dataSource={punchData}
                            bordered
                            size="middle"
                            columns={[
                                { title: "Date", dataIndex: "date" },
                                { title: "Working Hour", dataIndex: "workingHours", render: h => h || "-" },
                                { title: "Missing Hour", dataIndex: "missingHours", render: h => h || "-" },
                            ]}
                            rowSelection={{
                                type: "checkbox",
                                getCheckboxProps: () => ({
                                    disabled: selectedRecord.isPublished,
                                }),
                                selectedRowKeys: punchData.filter(p => p.isDeductible).map(p => p.date),
                                onChange: (selectedKeys) => {
                                    const updatedPunch = punchData.map(item => ({
                                        ...item,
                                        isDeductible: selectedKeys.includes(item.date),
                                    }));

                                    const removed = updatedPunch
                                        .filter(p => !p.isDeductible)
                                        .map(p => ({
                                            _id: selectedRecord.punchData._id,
                                            date: p.date,
                                            isDeductible: false,
                                        }));

                                    const added = updatedPunch
                                        .filter(p => p.isDeductible)
                                        .map(p => ({
                                            _id: selectedRecord.punchData._id,
                                            date: p.date,
                                            isDeductible: true,
                                        }));

                                    setPunchData(updatedPunch);
                                    setRemovedPunchData(removed);
                                    setAddPunchData(added);
                                }
                            }}
                        />
                    </Form.Item>
                    {/*<strong style={{fontSize: "16px"}}>Punch List:</strong>*/}
                    {/*<Form.Item>*/}
                    {/*    {punchData && punchData.length > 0 ? (*/}
                    {/*        punchData.map((punch, index) => {*/}
                    {/*            return (*/}
                    {/*                <PunchItem key={punch.date} id={selectedRecord.punchData._id} punch={punch}*/}
                    {/*                           index={punch.date} isPublished={selectedRecord.isPublished}*/}
                    {/*                           onChange={(value) => {*/}
                    {/*                               setRemovedPunchData(prevData => [...prevData, value]);*/}
                    {/*                           }}/>*/}
                    {/*            );*/}
                    {/*        })*/}
                    {/*    ) : (*/}
                    {/*        <span>No punch available</span>*/}
                    {/*    )}*/}
                    {/*</Form.Item>*/}
                </Form>
            </div>
        </Modal>
    );
};

function PunchItem({punch, id, index, isPublished, onChange}) {
    const [checked, setChecked] = useState(punch.isDeductible);

    const CommonBoxItem = ({checked, punch}) => {
        return (
            <div
                className={`taskFieldContainerModel ${checked ? '' : 'disabled'}`}
                style={{opacity: isPublished ? 0.5 : checked ? 1 : 0.5}}
            >
                <div className="taskFieldRowModel">
                    <div className="taskFieldLabelModel">Date</div>
                    <div className="taskFieldValueModel">{punch.date}</div>
                </div>
                <div className="taskFieldRowModel">
                    <div className="taskFieldLabelModel">Working Hour</div>
                    <div className="taskFieldValueModel">{punch.workingHours ? punch.workingHours : '-'}</div>
                </div>
                <div className="taskFieldRowModel" style={{borderBottom: "none"}}>
                    <div className="taskFieldLabelModel">Missing Hour</div>
                    <div className="taskFieldValueModel">{punch.missingHours ? punch.missingHours : '-'}</div>
                </div>
            </div>
        );
    };

    return (
        <div key={index} style={{marginTop: "15px", display: "flex", alignItems: "start", gap: "10px"}}>
            {isPublished ? <div style={{width: "100%", display: "flex", alignItems: "start", gap: "10px"}}>
                {checked ? <CheckCircle className="successIconStyle"/> : <XCircle className="deleteIconStyle"/>}
                <CommonBoxItem checked={checked} punch={punch}/>
            </div> : <Checkbox
                key={index}
                checked={checked}
                onChange={(e) => {
                    setChecked(e.target.checked);
                    onChange({_id: id, date: e.target.name, isDeductible: e.target.checked});
                }}
                style={{width: "100%"}}
                name={index}
            >
                <CommonBoxItem checked={checked} punch={punch}/>
            </Checkbox>}
        </div>
    );
}

function LeaveItem({leave, index, isPublished, onChange}) {
    const [checked, setChecked] = useState(leave.isDeductible);

    function getLeaveDateTime(leave) {
        const {leaveType, dayType, startDate, endDate, startTime, endTime} = leave;
        if (leaveType === leaveLabelKeys.fullDay && dayType === leaveLabelKeys.singleDay) {
            return startDate;
        }
        if (leaveType === leaveLabelKeys.fullDay && dayType === leaveLabelKeys.multipleDay) {
            return `${startDate} to ${endDate}`;
        }
        if (leaveType === leaveLabelKeys.halfDay) {
            return startDate;
        }
        if (leaveType === leaveLabelKeys.manualHours) {
            return `${startDate} ${startTime} to ${endTime}`;
        }
        return "-";
    }

    function getLeaveType(leave) {
        const {leaveType, dayType, leaveHalfDayType} = leave;
        if (leaveType === leaveLabelKeys.fullDay && dayType === leaveLabelKeys.multipleDay) {
            return `${getLabelByKey(leaveType, leaveTypeLabel)} (${convertCamelCase(dayType)})`;
        }
        if (leaveType === leaveLabelKeys.halfDay) {
            return `${getLabelByKey(leaveType, leaveTypeLabel)} (${convertCamelCase(leaveHalfDayType)})`;
        }
        return getLabelByKey(leaveType, leaveTypeLabel);
    }

    const CommonBoxItem = ({checked, leave}) => {
        return (
            <div
                className={`taskFieldContainerModel ${checked ? '' : 'disabled'}`}
                style={{opacity: isPublished ? 0.5 : checked ? 1 : 0.5}}
            >
                <div className="taskFieldRowModel">
                    <div className="taskFieldLabelModel">Date & Time</div>
                    <div className="taskFieldValueModel">{getLeaveDateTime(leave)}</div>
                </div>
                <div className="taskFieldRowModel">
                    <div className="taskFieldLabelModel">Leave Type</div>
                    <div className="taskFieldValueModel">{getLeaveType(leave)}</div>
                </div>
                <div className="taskFieldRowModel">
                    <div className="taskFieldLabelModel">Unexpected</div>
                    <div className="taskFieldValueModel">{leave.isUnexpected === false ? 'No' : 'Yes'}</div>
                </div>
                <div className="taskFieldRowModel">
                    <div className="taskFieldLabelModel">Sandwich Leave</div>
                    <div className="taskFieldValueModel">{leave.sandwichLeave === false ? 'No' : 'Yes'}</div>
                </div>
                <div className="taskFieldRowModel" style={{borderBottom: "none"}}>
                    <div className="taskFieldLabelModel">Reason</div>
                    <div className="taskFieldValueModel">{leave.reason}</div>
                </div>
            </div>
        );
    };

    return (
        <div key={index} style={{marginTop: "15px", display: "flex", alignItems: "start", gap: "10px"}}>
            {isPublished ? <div style={{width: "100%", display: "flex", alignItems: "start", gap: "10px"}}>
                {checked ? <CheckCircle className="successIconStyle"/> : <XCircle className="deleteIconStyle"/>}
                <CommonBoxItem checked={checked} leave={leave}/>
            </div> : <Checkbox
                key={index}
                checked={checked}
                onChange={(e) => {
                    setChecked(e.target.checked);
                    onChange({_id: e.target.name, isDeductible: e.target.checked});
                }}
                style={{width: "100%"}}
                name={index}
            >
                <CommonBoxItem checked={checked} leave={leave}/>
            </Checkbox>}
        </div>
    );
}