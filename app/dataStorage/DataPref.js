import appKey from "../utils/appKey";
import {UserRole} from "../utils/enum";

export const storeLoginData = (data, isLoginData) => {
  const userData = isLoginData ? data["data"] : data;
  if(isLoginData) {
    if(data[appKey.jwtToken]) {
      localStorage.setItem(appKey.isLogin, "true");
      localStorage.setItem(appKey.jwtToken, data[appKey.jwtToken]);
    }
  }
  localStorage.setItem(appKey.employeeCode, userData[appKey.employeeCode]);
  localStorage.setItem(appKey.fullName, userData[appKey.fullName]);
  localStorage.setItem(appKey.emailAddress, userData[appKey.emailAddress]);
  localStorage.setItem(appKey.mobileNumber, userData[appKey.mobileNumber]);
  localStorage.setItem(appKey.profilePhoto, userData[appKey.profilePhoto]);
  localStorage.setItem(appKey._id, userData[appKey._id]);
  localStorage.setItem(appKey.role, userData[appKey.role]);
};

export const getLocalData = (key) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
}

export const isAdmin = () => {
  return getLocalData(appKey.role) === UserRole.Admin;
};
