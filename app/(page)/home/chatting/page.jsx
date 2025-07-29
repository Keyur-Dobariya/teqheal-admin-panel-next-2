'use client';

import React, {useEffect, useState, useRef} from "react";
import {
    List,
    Avatar,
    Badge,
    Button,
    Collapse,
    Tooltip, Form, Typography, Input, Card,
} from "antd";
import {
    PhoneFilled,
    VideoCameraFilled,
    CheckCircleFilled,
    CloseCircleOutlined,
    ClockCircleFilled,
} from "@ant-design/icons";

import {endpoints} from "../../../api/apiEndpoints";
import {AppDataFields, useAppData} from "../../../masterData/AppDataContext";
import appColor from "../../../utils/appColor";
import dayjs from "dayjs";
import {chatApiAction, UserActiveStatus} from "../../../utils/enum";
import {
    getDataById,
    getTwoCharacterFromName,
} from "../../../utils/utils";
import {Search} from '../../../utils/icons';

import GroupCreateModel from "./GroupCreateModel";
import {createChatRoom} from "./ChatApisConfig";
import {MessageSection} from "./MessageSection";
import appString from "../../../utils/appString";
import {getDarkColor} from "../../../utils/appColor";
import {getLocalData} from "../../../dataStorage/DataPref";
import appKeys from "../../../utils/appKeys";
import imagePaths from "../../../utils/imagesPath";
import {LoadingComponent} from "../../../components/LoadingComponent";

const statusIconStyle = (color) => ({
    fontSize: 11,
    color: color ?? appColor.statusAvailable,
    position: "absolute",
    top: 29,
    right: 5,
    backgroundColor: "white",
    borderRadius: "50%",
    border: "1px solid white",
});

const statusIcon = (isGroup, status) => {
    if (isGroup) {
        return null;
    }
    if (status === UserActiveStatus.available) {
        return <CheckCircleFilled style={statusIconStyle(appColor.statusAvailable)}/>;
    }
    if (status === UserActiveStatus.notAvailable) {
        return <CloseCircleOutlined style={statusIconStyle(appColor.secondary)}/>;
    }
    return <ClockCircleFilled style={statusIconStyle(appColor.statusAway)}/>;
};

export default function Page() {
    const {usersData, chatRoomsData, updateAppDataField} = useAppData();
    const [isStartMsgLoading, setStartMsgLoading] = useState(false);

    const [fullRoomsData, setFullRoomsData] = useState([]);
    const [roomsData, setRoomsData] = useState([]);
    const [pinnedData, setPinnedData] = useState([]);
    const [contactData, setContactData] = useState([]);

    const [selectedRoom, setSelectedRoom] = useState({
        fullName: null,
        emailAddress: null,
        profilePhoto: null,
        _id: null,
        roomId: null,
    });

    const [selectedRoomFullData, setSelectedRoomFullData] = useState(null);

    const usersInChatRooms = new Set();

    useEffect(() => {
        setFullRoomsData(chatRoomsData);
    }, [chatRoomsData]);

    useEffect(() => {
        setRoomsData(fullRoomsData);
        setPinnedData(getFilteredPinnedData(fullRoomsData));
        setContactData(filteredContactsData);

        roomsData.forEach(room => {
            const otherMember = room.members.find(member => member._id !== getLocalData(appKeys._id));
            if (otherMember) {
                usersInChatRooms.add(otherMember._id);
            }
        });
    }, [fullRoomsData]);

    const filteredContactsData = usersData.filter(
        user => user._id !== getLocalData(appKeys._id) && !usersInChatRooms.has(user._id)
    );

    const getFilteredPinnedData = (rooms) =>
        rooms.filter(room => room?.userMeta?.isPinned);

    const handleSearchChange = (e) => {
        const searchText = e.target.value.toLowerCase();

        const checkRecord = (record) => {
            if (record.isGroup) {
                return record.groupName?.toLowerCase().includes(searchText);
            } else {
                const otherMember = record.members.find(
                    (member) => member._id !== getLocalData(appKeys._id)
                );
                return otherMember?.fullName?.toLowerCase().includes(searchText);
            }
        };

        if (searchText) {
            const filteredRoomData = fullRoomsData.filter(checkRecord);
            const filteredPinned = getFilteredPinnedData(filteredRoomData);
            const filteredContacts = filteredContactsData.filter(contact =>
                contact.fullName.toLowerCase().includes(searchText)
            );

            setRoomsData(filteredRoomData);
            setPinnedData(filteredPinned);
            setContactData(filteredContacts);
        } else {
            // Reset to full data
            setRoomsData(fullRoomsData);
            setPinnedData(getFilteredPinnedData(fullRoomsData));
            setContactData(filteredContactsData);
        }
    };

    useEffect(() => {
        const evtSource = new EventSource(`${endpoints.employeesChange}userId=${getLocalData(appKeys._id)}&role=${getLocalData(appKeys.role)}`);

        evtSource.onmessage = (event) => {
            if (event.data) {
                updateAppDataField(AppDataFields.usersData, JSON.parse(event.data) || usersData);
            }
        };

        evtSource.addEventListener('end', () => {
            evtSource.close();
        });

        return () => evtSource.close();
    }, [usersData, updateAppDataField]);

    useEffect(() => {
        const eventSource = new EventSource(endpoints.chatUpdates);

        eventSource.onmessage = (event) => {
            const roomId = selectedRoom?.roomId;
            const updatedData = JSON.parse(event.data);
            console.log('Received chat updates:', updatedData);

            if (updatedData?.messagesData) {
                const updatedArray = roomsData.map((item) => {
                    const updatedItem = updatedData?.messagesData.find((data) => data._id === item._id);
                    return updatedItem ? updatedItem : item;
                });
                updateAppDataField(AppDataFields.chatRoomsData, updatedArray || chatRoomsData);
            }

            // if (roomId && updatedData?.messages?.[roomId]) {
            //     setMessages(updatedData.messages[roomId].messages);
            // }
        };

        eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [selectedRoom?.roomId]);

    const setRoomCreatedData = (data) => {
        setFullRoomsData([...roomsData, data.data]);
        setSelectedRoom({
            fullName: data.data.members.find(m => m._id !== getLocalData(appKeys._id))?.fullName || "Unnamed User",
            emailAddress: data.data.members.find(m => m._id !== getLocalData(appKeys._id))?.emailAddress || "Unnamed User",
            profilePhoto: data.data.members.find(m => m._id !== getLocalData(appKeys._id))?.profilePhoto,
            _id: data.data.members.find(m => m._id !== getLocalData(appKeys._id))?._id,
            roomId: data.data?._id,
        });
        setSelectedRoomFullData(data?.data);
    }

    if (!usersData) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <LoadingComponent/>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-hidden">
                <Card
                    className="h-full"
                    bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                    <div className="flex-1 flex bg-white rounded-[10px] h-full overflow-auto">
                        <div className="w-[300px] border-r border-[#ddd] flex flex-col">
                            <div
                                className="flex justify-between items-center my-[20px] mx-[25px] text-[21px] font-semibold text-black">
                                <div>Messages</div>
                                <div
                                    className="text-[20px] text-[#1a1a1a] cursor-pointer hover:text-[var(--primary-color)] transition-colors duration-300">
                                    <GroupCreateModel onSuccess={setRoomCreatedData}/>
                                </div>
                            </div>
                            <div className="mb-[15px] mx-[20px]">
                                <Input
                                    placeholder={appString.searchHint}
                                    prefix={<Search/>}
                                    onChange={handleSearchChange}
                                    className="w-full flex-1 max-w-90"
                                />
                            </div>
                            <Collapse
                                defaultActiveKey={["pin", "messages", "contacts"]}
                                expandIconPosition="right"
                                className="chatCollapse"
                                bordered={false}
                            >
                                <Collapse.Panel style={{
                                    border: "none",
                                    display: pinnedData && pinnedData.length > 0 ? 'block' : 'none'
                                }} header="📌 Pin Chat" key="pin">
                                    <List
                                        className="overflow-y-auto scrollbar-thin"
                                        itemLayout="horizontal"
                                        dataSource={pinnedData}
                                        renderItem={(room) => {
                                            return <RoomItem usersData={usersData} data={room} selectedRoom={selectedRoom}
                                                             setSelectedRoom={setSelectedRoom} onRoomClick={(data) => {
                                                setSelectedRoomFullData(data);
                                            }}/>
                                        }}
                                    />
                                </Collapse.Panel>
                                <Collapse.Panel
                                    style={{border: "none", display: roomsData && roomsData.length > 0 ? 'block' : 'none'}}
                                    header="💬 Message" key="messages">
                                    <List
                                        className="overflow-y-auto scrollbar-thin"
                                        itemLayout="horizontal"
                                        dataSource={roomsData}
                                        renderItem={(room) => {
                                            return <RoomItem usersData={usersData} data={room} selectedRoom={selectedRoom}
                                                             setSelectedRoom={setSelectedRoom} onRoomClick={(data) => {
                                                setSelectedRoomFullData(data);
                                            }}/>
                                        }}
                                    />
                                </Collapse.Panel>
                                <Collapse.Panel style={{
                                    border: "none",
                                    display: contactData && contactData.length > 0 ? 'block' : 'none'
                                }} header="📱 Contact" key="contacts">
                                    <List
                                        className="overflow-y-auto scrollbar-thin"
                                        itemLayout="horizontal"
                                        dataSource={contactData}
                                        renderItem={(user) => {
                                            return <RoomItem usersData={usersData} data={user} isRoom={false}
                                                             selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom}
                                                             onRoomClick={(data) => {
                                                                 setSelectedRoomFullData(data);
                                                             }}/>
                                        }}
                                    />
                                </Collapse.Panel>
                            </Collapse>
                        </div>
                        {selectedRoom.fullName ? (
                            <div className="flex flex-col flex-1">
                                {/* Chat Header */}
                                <div className="h-[70px] flex justify-between items-center font-semibold text-[17px] text-[#1a1a1a] px-[15px] py-[5px] border-b border-[#ddd]">
                                    {/* Left: Avatar + Info */}
                                    <div className="flex items-center px-[5px] cursor-pointer bg-white text-[14px] font-[550] text-[#1a1a1a]">
                                        <Badge
                                            count={statusIcon(
                                                true,
                                                getDataById(usersData, selectedRoom._id)?.status || UserActiveStatus.notAvailable
                                            )}
                                        >
                                            <Tooltip title={selectedRoom.fullName}>
                                                <Avatar
                                                    size={35}
                                                    src={selectedRoom.profilePhoto || null}
                                                    style={{
                                                        backgroundColor: !selectedRoom.profilePhoto
                                                            ? getDarkColor(selectedRoom.fullName)
                                                            : undefined,
                                                        color: appColor.white,
                                                        cursor: "pointer",
                                                        fontSize: "13px",
                                                        fontWeight: "550",
                                                        border: "none",
                                                    }}
                                                >
                                                    {!selectedRoom.profilePhoto &&
                                                        getTwoCharacterFromName(selectedRoom.fullName)}
                                                </Avatar>
                                            </Tooltip>
                                        </Badge>
                                        <div className="ml-[12px] flex-1">
                                            <div>{selectedRoom.fullName}</div>
                                            <div className="text-[11px] text-[#888] font-[450]">
                                                {getDataById(usersData, selectedRoom._id)?.status ||
                                                    UserActiveStatus.notAvailable}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Icons */}
                                    <div className="flex items-center text-[18px] gap-[5px] text-[var(--primary-color)]">
                                        <div className="w-[33px] h-[33px] rounded-[10px] bg-white flex justify-center items-center transition-colors duration-300 cursor-pointer hover:bg-[#f3f3f3]">
                                            <Tooltip title="Voice Call">
                                                <PhoneFilled rotate={90} onClick={() => {
                                                    // navigate(routes.calling, { state: { remoteUserId: selectedRoom._id } });
                                                }} />
                                            </Tooltip>
                                        </div>
                                        <div className="w-[33px] h-[33px] rounded-[10px] bg-white flex justify-center items-center transition-colors duration-300 cursor-pointer hover:bg-[#f3f3f3]">
                                            <Tooltip title="Video Call">
                                                <VideoCameraFilled onClick={() => {
                                                    // navigate(routes.calling, { state: { remoteUserId: selectedRoom._id } });
                                                }} />
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>

                                {/* Message Section or Start Button */}
                                {selectedRoom.roomId ? (
                                    <MessageSection
                                        roomId={selectedRoom.roomId}
                                        employeeList={usersData}
                                        selectedRoomFullData={selectedRoomFullData}
                                    />
                                ) : (
                                    <div className="flex flex-col flex-1 justify-center items-center gap-[40px]">
                                        <img src={imagePaths.emojiHey} className="w-[180px]" />
                                        <Button
                                            type="primary"
                                            loading={isStartMsgLoading}
                                            onClick={async () => {
                                                const body = {
                                                    otherUserId: selectedRoom._id,
                                                    action: chatApiAction.createRoom,
                                                };
                                                await createChatRoom({
                                                    body,
                                                    setIsLoading: setStartMsgLoading,
                                                    onSuccess: setRoomCreatedData,
                                                });
                                            }}
                                            style={{ height: "40px", borderRadius: "50px" }}
                                        >
                                            Start Conversation
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col flex-1 justify-center items-center">
                                <img src={imagePaths.chatIcon} alt="chat" className="w-[300px]" />
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const RoomItem = ({usersData, data, isRoom = true, selectedRoom, setSelectedRoom, onRoomClick}) => {

    let memberId = !isRoom ? data._id : null;
    let displayName = !isRoom ? data.fullName : null;
    let emailAddress = !isRoom ? data.emailAddress : null;
    let displayPhoto = !isRoom ? data.profilePhoto : null;
    let status = !isRoom ? data.status : UserActiveStatus.notAvailable;

    if (isRoom) {
        if (data.isGroup) {
            displayName = data.groupName || "Unnamed Group";
            displayPhoto = data.groupPhoto;
        } else {
            const otherMember = data.members.find(
                (member) => member._id !== getLocalData(appKeys._id)
            );
            memberId = otherMember?._id || null;
            displayName = otherMember?.fullName || "Unnamed User";
            emailAddress = otherMember?.emailAddress || "Unnamed User";
            displayPhoto = otherMember?.profilePhoto;
            status = getDataById(usersData, otherMember?._id)?.status || UserActiveStatus.notAvailable;
        }
    }

    const lastMessage = data.lastMessage?.message
        ? `${data.lastMessage.message.substring(0, 30)}${data.lastMessage.message.length > 30 ? "..." : ""}`
        : "No messages yet";

    const lastSender = data.lastMessage?.sender?._id === getLocalData(appKeys._id) ? "You: " : '';

    const lastMessageTime = data.lastMessage?.messageTime
        ? dayjs(data.lastMessage.messageTime).format("h:mm A")
        : null;

    const getMessageWithIcon = (messageType) => {
        switch (messageType) {
            case 'image':
                return `📸 Image`;
            case 'video':
                return `🎥 Video`;
            case 'audio':
                return `🎶 Audio`;
            case 'file':
                return `📝 File️`;
            case 'text':
                return messageType;
            default:
                return messageType;
        }
    };

    return <div
        key={data._id}
        className={`flex items-center p-[15px] cursor-pointer text-[14px] font-[550] text-[#1a1a1a] bg-white hover:bg-[#f6f6f6] transition-colors duration-300 ${
            selectedRoom.roomId === data._id ? "bg-[var(--primary-color-trans)]" : ""
        }`}
        onClick={() => {
            if (isRoom) {
                onRoomClick(data);
            }
            setSelectedRoom({
                fullName: displayName,
                emailAddress: emailAddress,
                profilePhoto: displayPhoto,
                _id: memberId,
                roomId: isRoom ? data._id : null,
            });
        }}
    >
        <Badge count={statusIcon(isRoom && data.isGroup, status)}>
            <Tooltip title={displayName}>
                <Avatar
                    size={35}
                    src={displayPhoto || null}
                    style={{
                        backgroundColor: !displayPhoto ? getDarkColor(displayName) : undefined,
                        color: appColor.white,
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "550",
                        border: "none",
                    }}
                >
                    {!displayPhoto && getTwoCharacterFromName(displayName)}
                </Avatar>
            </Tooltip>
        </Badge>
        <div style={{marginLeft: "12px", flex: 1}}>
            <div style={{
                fontSize: "13px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#1e1e1e",
                fontWeight: 500,
                marginBottom: "3px"
            }}>
                {displayName}
                {isRoom && selectedRoom.roomId !== data._id && data?.messagesData?.unreadMessages && data?.messagesData?.unreadMessages > 0 ? (
                    <Badge size="small" count={data?.messagesData?.unreadMessages}/>
                ) : null}
            </div>
            <div style={{
                fontSize: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#888",
                fontWeight: 450
            }}>
                {isRoom ?
                    <Typography.Paragraph
                        ellipsis={{rows: 1}}
                        style={{flex: 1, fontSize: "12px", marginBottom: "0px", color: "#636363"}}
                    >
                        {`${lastSender}${getMessageWithIcon(lastMessage)}`.slice(0, 26)}
                    </Typography.Paragraph>
                    // <span style={{ flex: 1 }}>{`${lastSender}${getMessageWithIcon(lastMessage)}`}</span>
                    : <span>{status}</span>}
                {lastMessageTime && (
                    <span style={{float: "right", marginLeft: "8px"}}>
            {lastMessageTime}
        </span>
                )}
            </div>
        </div>
    </div>;
};