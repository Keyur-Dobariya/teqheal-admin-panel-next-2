'use client'

import {Avatar, Button, DatePicker, Divider, Popover, Select} from "antd";
import {Calendar, Check, ChevronsUp, Filter, ShoppingCart, Tag as TagIcon, User} from "../../../utils/icons";
import {
    getIconByKey,
    getLabelByKey,
    taskCategoryLabel,
    taskColumnStatusLabel,
    taskPriorityLabel, taskStatusLabel
} from "../../../utils/enum";
import dayjs from "dayjs";
import React from "react";

const {Option} = Select;
const {RangePicker} = DatePicker;

export const FilterPopover = ({
                                  employeeRecord,
                                  activeClientData,
                                  isShowFilterPopup,
                                  setIsShowFilterPopup,
                                  activeFilterCount,
                                  setActiveFilterCount,
                                  filteredProjects,
                                  filters,
                                  handleFilterChange,
                                  handleClearClick,
                                  filterTasks
                              }) => {

    return (
        <Popover
            trigger="click"
            open={isShowFilterPopup}
            placement="bottom"
            onOpenChange={(newVisible) => {
                setIsShowFilterPopup(newVisible);
            }}
            content={
                <div>
                    <div style={{fontWeight: "500", marginBottom: "10px"}}>Filters</div>

                    <LabelContentRow label="Client:" icon={<Calendar size={18}/>}>
                        <Select
                            showSearch
                            value={filters.client}
                            placeholder="Select Client"
                            onChange={(value) => {
                                handleFilterChange('client', value);
                            }}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            allowClear
                            style={{width: "100%", height: "37px"}}
                        >
                            {activeClientData.map(client => (
                                <Option key={client._id} value={client._id}>{client.clientName}</Option>
                            ))}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Project:" icon={<Calendar size={18}/>}>
                        <Select
                            showSearch
                            disabled={!filters.client}
                            value={filters.project}
                            placeholder="Select Project"
                            onChange={(value) => {
                                handleFilterChange('project', value);
                            }}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            allowClear
                            style={{width: "100%", height: "37px"}}
                        >
                            {filteredProjects.map(project => (
                                <Option key={project._id} value={project._id}>
                                    {project.projectName}
                                </Option>
                            ))}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Date:" icon={<Calendar size={18}/>}>
                        <RangePicker value={filters.dateRange}
                                     onChange={(dates) => {
                                         handleFilterChange('dateRange', dates);
                                     }} size="small"
                                     style={{width: "100%", height: "37px"}}/>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Status:" icon={<Check size={18}/>}>
                        <Select
                            size="small"
                            placeholder="Select status"
                            style={{width: "100%", height: 37}}
                            value={filters.status}
                            onChange={(value) => {
                                handleFilterChange('status', value);
                            }}
                            allowClear
                        >
                            {taskColumnStatusLabel.map((item) => (
                                <Option key={item.value} value={item.value}>
                                    {item.label}
                                </Option>
                            ))}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Priority:" icon={<ChevronsUp/>}>
                        <Select
                            size="small"
                            placeholder="Select Priority"
                            style={{width: "100%", height: 37, borderRadius: 10}}
                            value={filters.priority}
                            onChange={(value) => {
                                handleFilterChange('priority', value);
                            }}
                            allowClear
                        >
                            {taskPriorityLabel.map((item) => (
                                <Option key={item.key} value={item.key}>
                                    <div
                                        className="flex items-center gap-2">{getIconByKey(item.key, taskPriorityLabel)}{getLabelByKey(item.key, taskPriorityLabel)}</div>
                                </Option>
                            ))}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="To:" icon={<User size={18}/>}>
                        <Select
                            size="small"
                            placeholder="Select Employee"
                            value={filters.employee}
                            onChange={(value) => {
                                handleFilterChange('employee', value);
                            }}
                            style={{width: "100%", height: "37px"}}
                            optionLabelProp="label"
                            allowClear
                        >
                            {employeeRecord.map((emp, index) => {
                                return (
                                    <Option
                                        key={emp._id}
                                        value={emp._id}
                                        label={
                                            <span>
                      <Avatar
                          size="small"
                          src={emp.profilePhoto || null}
                          style={{marginRight: 8}}
                      >
                        {emp.fullName?.charAt(0)}
                      </Avatar>
                                                {emp.fullName}
                    </span>
                                        }
                                    >
                  <span style={{display: "flex", alignItems: "center"}}>
                    <Avatar
                        size="small"
                        src={emp.profilePhoto || null}
                        style={{marginRight: 8}}
                    >
                      {emp.fullName?.charAt(0)}
                    </Avatar>
                      {emp.fullName}
                  </span>
                                    </Option>
                                );
                            })}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Category:" icon={<ShoppingCart size={18}/>}>
                        <Select
                            size="small"
                            placeholder="Select Category"
                            style={{width: "100%", height: 37, borderRadius: 10}}
                            value={filters.category}
                            onChange={(value) => {
                                handleFilterChange('category', value);
                            }}
                            allowClear
                        >
                            {taskCategoryLabel.map((item) => (
                                <Option key={item.key} value={item.key}>
                                    <div
                                        className="flex items-center gap-2">{getIconByKey(item.key, taskCategoryLabel)}{getLabelByKey(item.key, taskCategoryLabel)}</div>
                                </Option>
                            ))}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Label:" icon={<TagIcon size={18}/>}>
                        <Select
                            size="small"
                            placeholder="Select Label"
                            style={{width: "100%", height: 37, borderRadius: 10}}
                            value={filters.label}
                            onChange={(value) => {
                                handleFilterChange('label', value);
                            }}
                            allowClear
                        >
                            {taskStatusLabel.map((item) => (
                                <Option key={item.key} value={item.key}>
                                    <div
                                        className="flex items-center gap-2">{getIconByKey(item.key, taskStatusLabel)}{getLabelByKey(item.key, taskStatusLabel)}</div>
                                </Option>
                            ))}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Created At:" icon={<Calendar size={18}/>}>
                        <DatePicker value={filters.createdAt}
                                    disabledDate={(current) => {
                                        return current && current > dayjs().endOf('day');
                                    }}
                                    onChange={(dates) => {
                                        handleFilterChange('createdAt', dates);
                                    }} size="small"
                                    style={{width: "100%", height: "37px"}}/>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <div style={{display: "flex", gap: 8}}>
                        <Button
                            block
                            style={{fontWeight: 500, flex: 1, height: 37}}
                            onClick={() => {
                                setIsShowFilterPopup(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            block
                            style={{fontWeight: 500, flex: 1, height: 37}}
                            disabled={Object.values(filters).filter(val => val !== null && val !== undefined).length <= 0}
                            onClick={() => {
                                setActiveFilterCount(0);
                                handleClearClick();
                            }}
                            type="primary"
                        >
                            Reset
                        </Button>
                        {/*<Button*/}
                        {/*    block*/}
                        {/*    style={{fontWeight: 500, flex: 1, height: 37}}*/}
                        {/*    // disabled={Object.values(filters).filter(val => val !== null && val !== undefined).length <= 0}*/}
                        {/*    onClick={() => {*/}
                        {/*        if (Object.values(filters).filter(val => val !== null && val !== undefined).length <= 0) {*/}
                        {/*            setIsShowFilterPopup(false);*/}
                        {/*        } else {*/}
                        {/*            setActiveFilterCount(0);*/}
                        {/*            handleClearClick();*/}
                        {/*        }*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    {Object.values(filters).filter(val => val !== null && val !== undefined).length <= 0 ? "Cancel" : "Reset"}*/}
                        {/*</Button>*/}
                        {/*<Button*/}
                        {/*    block*/}
                        {/*    style={{fontWeight: 500, flex: 1, height: 37}}*/}
                        {/*    onClick={() => {*/}
                        {/*        setIsShowFilterPopup(false);*/}
                        {/*        const count = Object.values(filters).filter(val => val !== null && val !== undefined).length;*/}
                        {/*        setActiveFilterCount(count);*/}
                        {/*        filterTasks();*/}
                        {/*    }}*/}
                        {/*    type="primary"*/}
                        {/*>*/}
                        {/*    Filter*/}
                        {/*</Button>*/}
                    </div>

                </div>
            }
        >
            <Button
                variant="outlined"
                icon={<Filter/>}
                onClick={() => setIsShowFilterPopup(!isShowFilterPopup)}
                style={{width: "100%"}}
            >
                Filters{activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
            </Button>
        </Popover>
    );
};

const LabelContentRow = ({label, icon, children}) => {
    return (
        <div style={{marginBottom: 10, display: "flex", alignItems: "center"}}>
            <div style={{width: "35%", display: "flex", alignItems: "center"}}>
                {icon && <span style={{marginRight: 4}}>{icon}</span>}
                {label}
            </div>
            <div style={{width: "65%"}}>
                {children}
            </div>
        </div>
    );
};