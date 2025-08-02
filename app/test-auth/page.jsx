'use client';

import { getLocalData } from '../dataStorage/DataPref';
import appKeys from '../utils/appKeys';

export default function TestAuth() {
    const token = getLocalData(appKeys.jwtToken);
    const isLogin = getLocalData(appKeys.isLogin);

    return (
        <div className="p-8">
            <h1>Authentication Test Page</h1>
            <p>Token: {token ? 'Present' : 'Not found'}</p>
            <p>IsLogin: {isLogin}</p>
            <p>If you can see this page without being logged in, authentication is not working.</p>
        </div>
    );
}