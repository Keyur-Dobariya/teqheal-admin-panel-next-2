import appColor from "./appColor";
import imagePaths from "./imagesPath";

export const uploadType = {
    chatting: "chatting",
};

export const chatApiAction = {
    getRooms: "getRooms",
    getMessages: "getMessages",
    sendMessage: "sendMessage",
    createGroup: "createGroup",
    createRoom: "createRoom",
    markMessagesAsRead: "markMessagesAsRead",
    getRoomWithMessages: "getRoomWithMessages",
};

export const SelectMode = {
    Single: "single",
    Multiple: "multiple",
}

export const InputType = {
    Text: "text",
    Password: "password",
    Email: "email",
    TextArea: "area",
    Number: "number",
    Search: "search",
    Tel: "tel",
    URL: "url",
    Date: "date",
    Time: "time",
    DateTime: "datetime-local",
    Month: "month",
    Week: "week",
    Color: "color",
    File: "file",
    Hidden: "hidden",
    Range: "range",
    Radio: "radio",
    Checkbox: "checkbox",
    Switch: "switch",
    Select: "select",
    DatePicker: "datePicker",
};

export const UserRole = {
    Admin: "Admin",
    Employee: "Employee",
};

export const UserActiveStatus = {
    available: "available",
    away: "away",
    notAvailable: "notAvailable",
};

export const Gender = {
    Male: "Male",
    Female: "Female",
    Other: "Other",
};

export const BloodGroup = {
    APositive: "A positive (A+)",
    ANegative: "A negative (A-)",
    BPositive: "B positive (B+)",
    BNegative: "B negative (B-)",
    OPositive: "O positive (O+)",
    ONegative: "O negative (O-)",
    ABPositive: "AB positive (AB+)",
    ABNegative: "AB negative (AB-)",
};

export const selectOptions = (object) => Object.entries(object).map(([value, label]) => ({
    label,
    value,
}));

export const ApprovalStatus = {
    Approved: "Approved",
    Pending: "Pending",
    Rejected: "Rejected",
};

export const DateTimeFormat = {
    DDMMYYYY: "DD-MM-YYYY",
    MMDDYYYY: "MM-DD-YYYY",
    YYYYMMDD: "YYYY-MM-DD",
    DDMMYYYYHHMMSS: "DD-MM-YYYY HH:mm:ss",
    MMDDYYYYHHMMSS: "MM-DD-YYYY HH:mm:ss",
    YYYYMMDDHHMMSS: "YYYY-MM-DD HH:mm:ss",
    DDMMYYYYHHMM: "DD-MM-YYYY HH:mm",
    MMDDYYYYHHMM: "MM-DD-YYYY HH:mm",
    YYYYMMDDHHMM: "YYYY-MM-DD HH:mm",
    DDMMYYYYHHMMA: "DD-MM-YYYY HH:mm A",
    MMDDYYYYHHMMA: "MM-DD-YYYY HH:mm A",
    YYYYMMDDHHMMA: "YYYY-MM-DD HH:mm A",
    DDMMMYYYY: "DD MMM, YYYY",
    DDMMMMYYYY: "DD MMMM, YYYY"
};

export const Technology = [
    {label: "Android Java", value: "Android Java"},
    {label: "Android Kotlin", value: "Android Kotlin"},
    {label: "Flutter", value: "Flutter"},
    {label: "React Native", value: "React Native"},
    {label: "Php", value: "Php"},
    {label: "Php Laravel", value: "Php Laravel"},
    {label: "Php Codeigniter", value: "Php Codeigniter"},
    {label: "Wordpress", value: "Wordpress"},
    {label: "Python", value: "Python"},
    {label: "Java", value: "Java"},
    {label: "C#", value: "C#"},
    {label: "C++", value: "C++"},
    {label: "C", value: "C"},
    {label: "React", value: "React"},
    {label: "Angular", value: "Angular"},
    {label: "Vue", value: "Vue"},
    {label: "Node", value: "Node"},
    {label: "MongoDB", value: "MongoDB"},
    {label: "MySQL", value: "MySQL"},
    {label: "AWS", value: "AWS"},
];

export const eventTypeLabels = {
    birthday: "🎂 Birthday",
    holiday: "🏖️ Holiday",
    workingSaturday: "🛠️ Working Saturday",
    offSaturday: "🛌 Off Saturday",
    festival: "🎉 Festival",
    nationalHoliday: "🇮🇳 National Holiday",
    exam: "📝 Exam",
    meeting: "📅 Meeting",
    anniversary: "💍 Anniversary",
    importantDay: "⭐ Important Day",
    newYear: "🎊 New Year",
    makarSankranti: "🪁 Makar Sankranti",
    republicDay: "🏵️ Republic Day",
    vasantPanchami: "🌼 Vasant Panchami",
    mahaShivratri: "🕉️ Maha Shivratri",
    holi: "🌈 Holi",
    chetichand: "🌊 Cheti Chand",
    eidUlFitr: "🕌 Eid-ul-Fitr",
    ramNavami: "🕉️ Ram Navami",
    mahavirJayanti: "🧘 Mahavir Jayanti",
    ambedkarJayanti: "📜 Dr. Ambedkar Jayanti",
    goodFriday: "✝️ Good Friday",
    parshuramJayanti: "🏹 Parshuram Jayanti",
    eidUlAdha: "🐐 Eid-ul-Adha (Bakrid)",
    muharram: "🕯️ Muharram (Ashoora)",
    rakshaBandhan: "🎁 Raksha Bandhan",
    independenceDay: "🎆 Independence Day",
    parsiNewYear: "🔥 Parsi New Year (Pateti)",
    janmashtami: "🦚 Janmashtami",
    eidEMilad: "🌙 Eid-e-Milad-un-Nabi",
    gandhiJayanti: "🕊️ Gandhi Jayanti",
    dussehra: "🏹 Dussehra (Vijaya Dashami)",
    diwali: "🪔 Diwali",
    vikramSamvatNewYear: "📆 Vikram Samvat New Year",
    bhaiBij: "🤝 Bhai Bij",
    sardarPatelJayanti: "🧱 Sardar Vallabhbhai Patel Jayanti",
    guruNanakJayanti: "🪔 Guru Nanak Jayanti",
    devDeepawali: "✨ Dev Deepawali",
    qutubFestival: "🏛️ Qutub Festival",
    hornbillFestival: "🦜 Hornbill Festival",
    galdanNamchot: "📿 Galdan Namchot",
    hanukkah: "🕎 Hanukkah",
    christmas: "🎄 Christmas",
    tulsiPujanDiwas: "🌿 Tulsi Pujan Diwas",
    losarFestival: "🎐 Losar Festival",
    newYearsEve: "🎇 New Year's Eve",
    teacherDay: "👩‍🏫 Teacher’s Day",
};

export const eventTypeMenuList = [
    {label: eventTypeLabels.birthday, key: "birthday"},
    {label: eventTypeLabels.holiday, key: "holiday"},
    {label: eventTypeLabels.workingSaturday, key: "workingSaturday"},
    {label: eventTypeLabels.offSaturday, key: "offSaturday"},
    {label: eventTypeLabels.festival, key: "festival"},
    {label: eventTypeLabels.nationalHoliday, key: "nationalHoliday"},
    {label: eventTypeLabels.exam, key: "exam"},
    {label: eventTypeLabels.meeting, key: "meeting"},
    {label: eventTypeLabels.anniversary, key: "anniversary"},
    {label: eventTypeLabels.importantDay, key: "importantDay"},
    {label: eventTypeLabels.newYear, key: "newYear"},
    {label: eventTypeLabels.makarSankranti, key: "makarSankranti"},
    {label: eventTypeLabels.republicDay, key: "republicDay"},
    {label: eventTypeLabels.vasantPanchami, key: "vasantPanchami"},
    {label: eventTypeLabels.mahaShivratri, key: "mahaShivratri"},
    {label: eventTypeLabels.holi, key: "holi"},
    {label: eventTypeLabels.chetichand, key: "chetichand"},
    {label: eventTypeLabels.eidUlFitr, key: "eidUlFitr"},
    {label: eventTypeLabels.ramNavami, key: "ramNavami"},
    {label: eventTypeLabels.mahavirJayanti, key: "mahavirJayanti"},
    {label: eventTypeLabels.ambedkarJayanti, key: "ambedkarJayanti"},
    {label: eventTypeLabels.goodFriday, key: "goodFriday"},
    {label: eventTypeLabels.parshuramJayanti, key: "parshuramJayanti"},
    {label: eventTypeLabels.eidUlAdha, key: "eidUlAdha"},
    {label: eventTypeLabels.muharram, key: "muharram"},
    {label: eventTypeLabels.rakshaBandhan, key: "rakshaBandhan"},
    {label: eventTypeLabels.independenceDay, key: "independenceDay"},
    {label: eventTypeLabels.parsiNewYear, key: "parsiNewYear"},
    {label: eventTypeLabels.janmashtami, key: "janmashtami"},
    {label: eventTypeLabels.eidEMilad, key: "eidEMilad"},
    {label: eventTypeLabels.gandhiJayanti, key: "gandhiJayanti"},
    {label: eventTypeLabels.dussehra, key: "dussehra"},
    {label: eventTypeLabels.diwali, key: "diwali"},
    {label: eventTypeLabels.vikramSamvatNewYear, key: "vikramSamvatNewYear"},
    {label: eventTypeLabels.bhaiBij, key: "bhaiBij"},
    {label: eventTypeLabels.sardarPatelJayanti, key: "sardarPatelJayanti"},
    {label: eventTypeLabels.guruNanakJayanti, key: "guruNanakJayanti"},
    {label: eventTypeLabels.devDeepawali, key: "devDeepawali"},
    {label: eventTypeLabels.qutubFestival, key: "qutubFestival"},
    {label: eventTypeLabels.hornbillFestival, key: "hornbillFestival"},
    {label: eventTypeLabels.galdanNamchot, key: "galdanNamchot"},
    {label: eventTypeLabels.hanukkah, key: "hanukkah"},
    {label: eventTypeLabels.christmas, key: "christmas"},
    {label: eventTypeLabels.tulsiPujanDiwas, key: "tulsiPujanDiwas"},
    {label: eventTypeLabels.losarFestival, key: "losarFestival"},
    {label: eventTypeLabels.newYearsEve, key: "newYearsEve"},
    {label: eventTypeLabels.teacherDay, key: "teacherDay"},
];

export const eventLeaveTypeMenuList = [
    {label: "Working Day", key: "working"},
    {label: "Full Day", key: "fullDay"},
    {label: "Half Day", key: "halfDay"},
];

export const taskColumnLabel = {
    ToDo: "📌 To Do",
    InProgress: "🚀 In Progress",
    Completed: "✅ Completed",
    Testing: "🔬 Testing",
    OnHold: "⏸️ On Hold",
    Reopened: "🔄 Reopened",
    Blocked: "❌ Blocked",
};

export const getLabelByKey = (key, list) => {
    const match = list.find((item) => item.key === key || item.value === key);
    return match ? match.label : key;
};

// export const getIconByKey = (key, list) => {
//   const match = list.find((item) => item.key === key);
//   return match ? match.icon : null;
// };

export const getIconByKey = (key, labelSet) => {
    if (!Array.isArray(labelSet)) {
        console.error("Label set is undefined or not an array", labelSet);
        return null;
    }
    const item = labelSet.find((item) => item.key === key || item.value === key);
    return item ? item.icon : null;
};

export const getKeyByLabel = (label, list) => {
    const match = list.find((item) => item.label === label);
    return match ? match.key : label;
};

export const getValueByLabel = (label, list) => {
    const match = list.find((item) => item.label === label);
    return match ? match.value : label;
};

export const taskColumnStatusLabel = [
    {label: taskColumnLabel.ToDo, value: "toDo"},
    {label: taskColumnLabel.InProgress, value: "inProgress"},
    {label: taskColumnLabel.Testing, value: "testing"},
    {label: taskColumnLabel.OnHold, value: "onHold"},
    {label: taskColumnLabel.Completed, value: "completed"},
    {label: taskColumnLabel.Reopened, value: "reopened"},
];

export const taskPriorityLabel = [
    {
        label: "No Priority",
        value: "noPriority",
        color: appColor.secondary,
        icon: <img src={imagePaths.priority_clear} style={{width: 18, height: 18}}/>,
    },
    {
        label: "Urgent",
        value: "urgent",
        color: appColor.danger,
        icon: <img src={imagePaths.priority_urjent} style={{width: 18, height: 18}}/>,
    },
    {
        label: "High Priority",
        value: "highPriority",
        color: appColor.warning,
        icon: <img src={imagePaths.priority_high} style={{width: 18, height: 18}}/>,
    },
    {
        label: "Medium Priority",
        value: "mediumPriority",
        color: appColor.success,
        icon: <img src={imagePaths.priority_normal} style={{width: 18, height: 18}}/>,
    },
    {
        label: "Low Priority",
        value: "lowPriority",
        color: appColor.info,
        icon: <img src={imagePaths.priority_low} style={{width: 18, height: 18}}/>,
    },
    {
        label: "On Hold",
        value: "onHold",
        color: appColor.secondary,
        icon: <img src={imagePaths.priority_on_hold} style={{width: 18, height: 18}}/>,
    },
];

export const taskStatusLabel = [
    {label: "📌 To Do", key: "toDo"},
    {label: "🏁 Started", key: "started"},
    {label: "💤 On Hold", key: "onHold"},
    {label: "⏳ Pending Review", key: "pendingReview"},
    {label: "🔍 Under Review", key: "underReview"},
    {label: "✨ Needs Attention", key: "needsAttention"},
];

export const reportTypeKey = {
    leaveWise: "leaveWise",
    punchWise: "punchWise",
    trackingWise: "trackingWise",
};

export const reportTypeLabels = [
    {label: "Leave Wise", value: reportTypeKey.leaveWise},
    {label: "Punch Wise", value: reportTypeKey.punchWise},
    {label: "Tracking Wise", value: reportTypeKey.trackingWise},
];

export const festivalList = [
    {
        eventDate: "2025-01-01",
        eventTitle: "New Year's Eve",
        eventDetail: "Celebration marking the start of the year.",
        eventLeaveType: null,
        eventType: "newYear",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-01-14",
        eventTitle: "Makar Sankranti",
        eventDetail: "Harvest festival celebrated with kite flying.",
        eventLeaveType: null,
        eventType: "makarSankranti",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-01-26",
        eventTitle: "Republic Day",
        eventDetail: "Commemorates the adoption of the Indian Constitution.",
        eventLeaveType: null,
        eventType: "republicDay",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-02-02",
        eventTitle: "Vasant Panchami",
        eventDetail: "Festival dedicated to Goddess Saraswati, marking the arrival of spring.",
        eventLeaveType: null,
        eventType: "vasantPanchami",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-02-26",
        eventTitle: "Maha Shivratri",
        eventDetail: "A Hindu festival honoring Lord Shiva.",
        eventLeaveType: null,
        eventType: "mahaShivratri",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-03-14",
        eventTitle: "Holi",
        eventDetail: "Festival of colors celebrating the arrival of spring.",
        eventLeaveType: null,
        eventType: "holi",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-03-30",
        eventTitle: "Chetichand",
        eventDetail: "Sindhi New Year celebrated by the Sindhi community.",
        eventLeaveType: null,
        eventType: "chetichand",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-03-31",
        eventTitle: "Eid-ul-Fitr",
        eventDetail: "Islamic festival marking the end of Ramadan.",
        eventLeaveType: null,
        eventType: "eidUlFitr",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-04-06",
        eventTitle: "Ram Navami",
        eventDetail: "Celebrates the birth of Lord Rama.",
        eventLeaveType: null,
        eventType: "ramNavami",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-04-10",
        eventTitle: "Mahavir Jayanti",
        eventDetail: "Birth anniversary of Lord Mahavir, founder of Jainism.",
        eventLeaveType: null,
        eventType: "mahavirJayanti",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-04-14",
        eventTitle: "Dr. Ambedkar Jayanti",
        eventDetail: "Birth anniversary of Dr. B.R. Ambedkar.",
        eventLeaveType: null,
        eventType: "ambedkarJayanti",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-04-18",
        eventTitle: "Good Friday",
        eventDetail: "Christian holiday commemorating the crucifixion of Jesus Christ.",
        eventLeaveType: null,
        eventType: "goodFriday",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-04-29",
        eventTitle: "Parshuram Jayanti",
        eventDetail: "Celebrates the birth of Lord Parshuram.",
        eventLeaveType: null,
        eventType: "parshuramJayanti",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-06-07",
        eventTitle: "Eid-ul-Adha (Bakrid)",
        eventDetail: "Islamic festival of sacrifice.",
        eventLeaveType: null,
        eventType: "eidUlAdha",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-07-06",
        eventTitle: "Muharram (Ashoora)",
        eventDetail: "Islamic day of mourning.",
        eventLeaveType: null,
        eventType: "muharram",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-08-09",
        eventTitle: "Raksha Bandhan",
        eventDetail: "Celebrates the bond between brothers and sisters.",
        eventLeaveType: null,
        eventType: "rakshaBandhan",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-08-15",
        eventTitle: "Independence Day",
        eventDetail: "Marks India's independence from British rule.",
        eventLeaveType: null,
        eventType: "independenceDay",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-08-16",
        eventTitle: "Parsi New Year (Pateti)",
        eventDetail: "New Year celebration for the Parsi community.",
        eventLeaveType: null,
        eventType: "parsiNewYear",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-08-27",
        eventTitle: "Janmashtami",
        eventDetail: "Celebrates the birth of Lord Krishna.",
        eventLeaveType: null,
        eventType: "janmashtami",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-09-05",
        eventTitle: "Eid-e-Milad-un-Nabi",
        eventDetail: "Commemorates the birth of Prophet Muhammad.",
        eventLeaveType: null,
        eventType: "eidEMilad",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-10-02",
        eventTitle: "Gandhi Jayanti",
        eventDetail: "Birth anniversary of Mahatma Gandhi.",
        eventLeaveType: null,
        eventType: "gandhiJayanti",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-10-02",
        eventTitle: "Dussehra (Vijaya Dashami)",
        eventDetail: "Celebrates the victory of good over evil.",
        eventLeaveType: null,
        eventType: "dussehra",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-10-20",
        eventTitle: "Diwali",
        eventDetail: "Festival of lights symbolizing the victory of light over darkness.",
        eventLeaveType: null,
        eventType: "diwali",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-10-22",
        eventTitle: "Vikram Samvat New Year",
        eventDetail: "Gujarati New Year celebration.",
        eventLeaveType: null,
        eventType: "vikramSamvatNewYear",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-10-23",
        eventTitle: "Bhai Bij",
        eventDetail: "Celebrates the bond between brothers and sisters.",
        eventLeaveType: null,
        eventType: "bhaiBij",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-10-31",
        eventTitle: "Sardar Vallabhbhai Patel Jayanti",
        eventDetail: "Birth anniversary of Sardar Vallabhbhai Patel.",
        eventLeaveType: null,
        eventType: "sardarPatelJayanti",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-11-05",
        eventTitle: "Guru Nanak Jayanti",
        eventDetail: "Birth anniversary of Guru Nanak Dev Ji, founder of Sikhism.",
        eventLeaveType: null,
        eventType: "guruNanakJayanti",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-11-05",
        eventTitle: "Dev Deepawali",
        eventDetail: "Festival of lights celebrated in Varanasi on Kartik Purnima.",
        eventLeaveType: null,
        eventType: "devDeepawali",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-11-15",
        eventTitle: "Qutub Festival",
        eventDetail: "Cultural festival held at Qutub Minar, Delhi, showcasing music and dance.",
        eventLeaveType: null,
        eventType: "qutubFestival",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-12-01",
        eventTitle: "Hornbill Festival",
        eventDetail: "Festival in Nagaland celebrating tribal culture and heritage.",
        eventLeaveType: null,
        eventType: "hornbillFestival",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-12-14",
        eventTitle: "Galdan Namchot",
        eventDetail: "Buddhist festival celebrated in Ladakh, marking the birthday of Tsongkhapa.",
        eventLeaveType: null,
        eventType: "galdanNamchot",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-12-14",
        eventTitle: "Hanukkah",
        eventDetail: "Jewish festival of lights, celebrated over eight days.",
        eventLeaveType: null,
        eventType: "hanukkah",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-12-25",
        eventTitle: "Christmas",
        eventDetail: "Christian festival celebrating the birth of Jesus Christ.",
        eventLeaveType: null,
        eventType: "christmas",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-12-25",
        eventTitle: "Tulsi Pujan Diwas",
        eventDetail: "Hindu festival dedicated to the worship of the Tulsi plant.",
        eventLeaveType: null,
        eventType: "tulsiPujanDiwas",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-12-28",
        eventTitle: "Losar Festival",
        eventDetail: "Tibetan New Year celebrated in Ladakh with traditional rituals.",
        eventLeaveType: null,
        eventType: "losarFestival",
        isLeaveOnDay: false,
        isSilentLeave: false
    },
    {
        eventDate: "2025-12-31",
        eventTitle: "New Year's Eve",
        eventDetail: "Celebration marking the end of the year.",
        eventLeaveType: null,
        eventType: "newYearsEve",
        isLeaveOnDay: false,
        isSilentLeave: false
    }
];

export const sundayList = [
    {
        eventDate: '2025-01-05',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-01-12',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-01-19',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-01-26',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-02-02',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-02-09',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-02-16',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-02-23',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-03-02',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-03-09',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-03-16',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-03-23',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-03-30',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-04-06',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-04-13',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-04-20',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-04-27',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-05-04',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-05-11',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-05-18',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-05-25',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-06-01',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-06-08',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-06-15',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-06-22',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-06-29',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-07-06',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-07-13',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-07-20',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-07-27',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-08-03',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-08-10',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-08-17',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-08-24',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-08-31',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-09-07',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-09-14',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-09-21',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-09-28',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-10-05',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-10-12',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-10-19',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-10-26',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-11-02',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-11-09',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-11-16',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-11-23',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-11-30',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-12-07',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-12-14',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-12-21',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    },
    {
        eventDate: '2025-12-28',
        eventTitle: 'Sunday',
        eventDetail: 'Weekly off',
        eventLeaveType: 'fullDay',
        eventType: 'holiday',
        isLeaveOnDay: true,
        isSilentLeave: true
    }];

export const leaveLabelKeys = {
    fullDay: "fullDay",
    halfDay: "halfDay",
    manualHours: "manualHours",
    firstHalf: "firstHalf",
    secondHalf: "secondHalf",
    singleDay: "singleDay",
    multipleDay: "multipleDay",
    paid: "paid",
    unpaid: "unpaid",
    approved: "approved",
    pending: "pending",
    rejected: "rejected"
};

export const leaveCategoryNewLabel = [
    {label: "Paid(Sick) Leave", value: leaveLabelKeys.paid},
    {label: "Unpaid Leave", value: leaveLabelKeys.unpaid},
];

export const leaveTypeLabel = [
    {label: "Full Day", value: leaveLabelKeys.fullDay},
    {label: "Half Day", value: leaveLabelKeys.halfDay},
    {label: "Manual Hours", value: leaveLabelKeys.manualHours},
];

export const dayTypeLabel = [
    {label: "Single Day", value: leaveLabelKeys.singleDay},
    {label: "Multiple Day", value: leaveLabelKeys.multipleDay},
];

export const leaveHalfDayTypeLabel = [
    {label: "First Half", value: leaveLabelKeys.firstHalf},
    {label: "Second Half", value: leaveLabelKeys.secondHalf},
];

export const leaveStatusLabel = [
    {label: "Approved", value: leaveLabelKeys.approved},
    {label: "Pending", value: leaveLabelKeys.pending},
    {label: "Rejected", value: leaveLabelKeys.rejected},
];

export const leaveCategoryLabel = ({disabledValues = []}) => [
    { label: "Paid(Sick) Leave", value: leaveLabelKeys.paid, disabled: disabledValues.includes(leaveLabelKeys.paid) },
    { label: "Unpaid Leave", value: leaveLabelKeys.unpaid, disabled: disabledValues.includes(leaveLabelKeys.unpaid) },
];

export const taskCategoryLabel = [
    {label: "💻 Development", value: "development"},
    {label: "🎨 Design", value: "design"},
    {label: "📑 Documentation", value: "documentation"},
    {label: "🛒 Client Request", value: "clientRequest"},
    {label: "🔬 Testing", value: "testing"},
    {label: "🔄 Bug Fix", value: "bugFix"},
    {label: "💡 New Feature", value: "newFeature"},
];

export const projectTypeLabel = [
    {
        label: "💻 Frontend Development",
        value: "frontendDevelopment",
        details: "UI/UX Design, HTML, CSS, JavaScript, React, Angular, Vue.js, etc."
    },
    {
        label: "🔙 Backend Development",
        value: "backendDevelopment",
        details: "Server-side logic, APIs, Databases (SQL/NoSQL), Node.js, Python, Ruby, Java, etc."
    },
    {
        label: "🌐 Full-stack Development",
        value: "fullstackDevelopment",
        details: "Combining both Frontend and Backend (e.g., MERN Stack, LAMP Stack)."
    },
    {
        label: "📱 Mobile Application Development",
        value: "mobileAppDevelopment",
        details: "Native Apps (iOS, Android), Cross-Platform Apps (React Native, Flutter), Progressive Web Apps (PWAs)."
    },
    {label: "🏢 Enterprise Software Development", value: "enterpriseSoftwareDevelopment", details: "ERP, CRM, SCM, etc."},
    {
        label: "☁️ Cloud Computing",
        value: "cloudComputing",
        details: "Cloud Infrastructure, Cloud-Native Apps, Serverless Computing, AWS, Azure, GCP."
    },
    {
        label: "📊 Data-Driven Projects",
        value: "dataDrivenProjects",
        details: "Big Data, Data Analytics, Machine Learning (ML), AI, Data Warehousing."
    },
    {
        label: "🎮 Game Development",
        value: "gameDevelopment",
        details: "2D/3D Games, Mobile Games, VR/AR Games, Unity, Unreal Engine."
    },
    {label: "🖥️ Embedded Systems", value: "embeddedSystems", details: "IoT, Firmware Development, Sensors, Wearables."},
    {
        label: "⛓️ Blockchain Development",
        value: "blockchainDevelopment",
        details: "Cryptocurrency (Bitcoin, Ethereum), Smart Contracts, DApps (Decentralized Apps)."
    },
    {
        label: "🌐 SaaS (Software as a Service)",
        value: "saas",
        details: "Cloud-based Solutions (Google Workspace, Slack, Dropbox), Subscription-Based Services."
    },
    {
        label: "🔒 Security & Privacy",
        value: "securityPrivacy",
        details: "Cybersecurity, Encryption, Penetration Testing, Firewalls, VPNs."
    },
    {
        label: "🤖 AI & Robotics",
        value: "aiRobotics",
        details: "Artificial Intelligence, Robotics Software, NLP (Natural Language Processing), Machine Learning."
    },
    {
        label: "🚀 DevOps",
        value: "devOps",
        details: "Automation Tools, CI/CD (Continuous Integration/Continuous Deployment), Containerization (Docker, Kubernetes)."
    },
    {
        label: "🔧 Software Maintenance",
        value: "softwareMaintenance",
        details: "Legacy System Upgrades, Bug Fixes, Patches, System Optimization."
    },
    {
        label: "🕶️ AR/VR Projects",
        value: "arVrProjects",
        details: "Augmented Reality (AR), Virtual Reality (VR), Mixed Reality."
    },
    {
        label: "🔗 API Development",
        value: "apiDevelopment",
        details: "RESTful APIs, GraphQL, WebSocket APIs, Microservices."
    },
    {
        label: "🧪 Test Automation",
        value: "testAutomation",
        details: "Automated Testing, Performance Testing, Unit Testing, UI Testing (e.g., Selenium, Cypress)."
    },
    {
        label: "🖥️ Desktop Application Development",
        value: "desktopAppDevelopment",
        details: "Cross-Platform Desktop Apps (Electron), Native Desktop Apps (Windows, macOS)."
    },
    {
        label: "🗣️ AI Chatbots",
        value: "aiChatbots",
        details: "Customer Support Bots, Personal Assistants, Chatbot Development Frameworks (Dialogflow, Rasa)."
    }
];
