'use client';

import { useState } from 'react';
import { Avatar } from 'antd';
import { profilePhotoManager, getTwoCharacterFromName } from '../utils/utils';
import { getDarkColor } from '../utils/appColor';
import { getLocalData } from "../dataStorage/DataPref";
import appKeys from "../utils/appKeys";

const SafeAvatar = ({ userData, showName = false, size, ...props }) => {
    const [imageError, setImageError] = useState(false);

    const profileData = {
        profilePhoto: userData?.profilePhoto,
        gender: userData?.gender,
        userName: userData?.userName,
    };

    if (imageError && showName && profileData?.userName) {
        const initials = getTwoCharacterFromName(profileData.userName);
        return (
            <Avatar
                size={size}
                style={{
                    backgroundColor: getDarkColor(profileData.userName),
                    color: 'white',
                    fontWeight: '500',
                    fontSize: 'auto'
                }}
                {...props}
            >
                {initials}
            </Avatar>
        );
    }

    const hasImage = profileData?.profilePhoto && !imageError;
    const fallbackSrc = profilePhotoManager({ url: null, gender: profileData?.gender });
    const finalSrc = hasImage ? profileData.profilePhoto : fallbackSrc;

    return (
        <Avatar
            src={finalSrc}
            size={size}
            onError={() => setImageError(true)}
            {...props}
        />
    );
};

export default SafeAvatar;