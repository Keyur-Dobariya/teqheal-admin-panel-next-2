'use client';

import { useState } from 'react';
import { Avatar } from 'antd';
import { profilePhotoManager, getTwoCharacterFromName } from '../utils/utils';
import { getDarkColor } from '../utils/appColor';
import { getLocalData } from "../dataStorage/DataPref";
import appKeys from "../utils/appKeys";

const SafeAvatar = ({ userData, showName = false, isMyData = false, size, ...props }) => {
    const [imageError, setImageError] = useState(false);

    const profileData = userData || (isMyData ? {
        profilePhoto: getLocalData(appKeys.profilePhoto),
        gender: getLocalData(appKeys.gender),
        fullName: getLocalData(appKeys.fullName),
    } : null);

    if (imageError && showName && profileData?.fullName) {
        const initials = getTwoCharacterFromName(profileData.fullName);
        return (
            <Avatar
                size={size}
                style={{
                    backgroundColor: getDarkColor(profileData.fullName),
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