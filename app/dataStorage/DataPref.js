import appKeys from "../utils/appKeys";
import {UserRole} from "../utils/enum";

export const storeLoginData = (data, isLoginData) => {
  const userData = isLoginData ? data["data"] : data;
  if(isLoginData) {
    if(data[appKeys.jwtToken]) {
      localStorage.setItem(appKeys.isLogin, "true");
      localStorage.setItem(appKeys.jwtToken, data[appKeys.jwtToken]);
    }
  }
  localStorage.setItem(appKeys.companyId, userData[appKeys.companyId]);
  localStorage.setItem(appKeys.employeeCode, userData[appKeys.employeeCode]);
  localStorage.setItem(appKeys.fullName, userData[appKeys.fullName]);
  localStorage.setItem(appKeys.emailAddress, userData[appKeys.emailAddress]);
  localStorage.setItem(appKeys.mobileNumber, userData[appKeys.mobileNumber]);
  localStorage.setItem(appKeys.profilePhoto, userData[appKeys.profilePhoto]);
  localStorage.setItem(appKeys._id, userData[appKeys._id]);
  localStorage.setItem(appKeys.role, userData[appKeys.role]);
};

export const getLocalData = (key) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
}

export const isAdmin = () => {
  return getLocalData(appKeys.role) === UserRole.Admin;
};
