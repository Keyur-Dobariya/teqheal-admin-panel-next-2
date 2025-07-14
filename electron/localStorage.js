const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { config } = require("./electronEndpoints");

const encryptionKey = "AbcD1234EfGh5678IjKl9012MnOp3456";
const storageDir = path.join(os.homedir(), "TeqhealTracker", `localStorage${config.isDev ? "/Dev" : ""}`);

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const userDataPath = path.join(storageDir, "userData.enc");
const attendanceDataPath = path.join(storageDir, "attendanceData.enc");
const settingDataPath = path.join(storageDir, "settingData.enc");

const encryptAndSave = (filePath, data) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(encryptionKey.padEnd(32)), iv);
    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");

    fs.writeFileSync(filePath, iv.toString("hex") + encrypted, "utf8");
    console.log(`Data saved successfully to ${filePath}`);
  } catch (error) {
    console.error("Error saving encrypted data:", error);
  }
};

const loadAndDecrypt = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const iv = Buffer.from(fileContent.slice(0, 32), "hex");
      const encryptedData = fileContent.slice(32);

      const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(encryptionKey.padEnd(32)), iv);
      let decrypted = decipher.update(encryptedData, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return JSON.parse(decrypted);
    }
  } catch (error) {
    console.error("Error decrypting data:", error);
  }
  return null;
};

const deleteData = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Data deleted from ${filePath}`);
    }
  } catch (error) {
    console.error("Error deleting data:", error);
  }
};

const saveUserData = (data) => encryptAndSave(userDataPath, data);
const loadUserData = () => loadAndDecrypt(userDataPath);
const deleteUserData = () => deleteData(userDataPath);

const saveAttendanceData = (data) => encryptAndSave(attendanceDataPath, data);
const loadAttendanceData = () => loadAndDecrypt(attendanceDataPath);
const deleteAttendanceData = () => deleteData(attendanceDataPath);

const saveSettingData = (data) => encryptAndSave(settingDataPath, data);
const loadSettingData = () => loadAndDecrypt(settingDataPath);
const deleteSettingData = () => deleteData(settingDataPath);

module.exports = {
  saveUserData,
  loadUserData,
  deleteUserData,
  saveAttendanceData,
  loadAttendanceData,
  deleteAttendanceData,
  saveSettingData,
  loadSettingData,
  deleteSettingData,
};
