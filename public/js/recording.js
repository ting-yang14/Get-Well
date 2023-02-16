import { navView } from "./navView.js";
import { fetchUser } from "./base.js";
import { desktopController } from "./recordingDesktop.js";
import { mobileController } from "./recordingMobile.js";

// --- initial ---
let device;
let user;
const socket = io("/recording");
init();
// message
const msgDesktop = document.getElementById("msgDesktop");
const msgMobile = document.getElementById("msgMobile");

// recording function
// let recordingInterval;
// let recordData = [];
// let record = {
//   startTime: null,
//   data: [],
//   endTime: null,
// };
let localRecord;
// desktop
// let mediaRecorder;
// let recordedBlobs;

// desktop buttons
const accessCameraBtn = document.getElementById("accessCameraBtn");
const startVideoBtn = document.getElementById("startVideoBtn");
const downloadVideoBtn = document.getElementById("downloadVideoBtn");
const stopVideoBtn = document.getElementById("stopVideoBtn");
const playVideoBtn = document.getElementById("playVideoBtn");
// mobile buttons
const accessSensorBtn = document.getElementById("accessSensorBtn");
const startSensorBtn = document.getElementById("startSensorBtn");
const stopSensorBtn = document.getElementById("stopSensorBtn");

async function init() {
  if (localStorage.token) {
    const headers = { Authorization: localStorage.token };
    try {
      device = checkDevice();
      displayView(device);
      user = await fetchUser(headers);
      // setup nav button
      navView.recording();

      // join socket room with userId
      socket.emit("user-join", device, user._id);

      // desktop button event
      accessCameraBtn.addEventListener(
        "click",
        desktopController.accessCamera.bind(null, socket, user)
      );
      startVideoBtn.addEventListener(
        "click",
        desktopController.startVideo.bind(null, device, socket, user)
      );
      stopVideoBtn.addEventListener(
        "click",
        desktopController.stopVideo.bind(null, device, socket, user)
      );
      downloadVideoBtn.addEventListener(
        "click",
        desktopController.downloadVideo
      );
      playVideoBtn.addEventListener("click", desktopController.playVideo);
      // mobile button event
      accessSensorBtn.addEventListener(
        "click",
        mobileController.accessSensor.bind(null, device, socket, user)
      );
      startSensorBtn.addEventListener(
        "click",
        mobileController.startSensor.bind(null, device, socket, user)
      );
      stopSensorBtn.addEventListener(
        "click",
        mobileController.stopSensor.bind(null, device, socket, user)
      );
    } catch (error) {
      console.log(error);
      window.location.href = "/";
    }
  } else {
    window.location.href = "/";
  }
}

// socket on event
socket.on("connect", () => {
  console.log(socket.id);
});

socket.on("join-result", (msg) => {
  console.log("join-result: ", msg);
  // 依據 device 顯示 result.msg
  if (device === "Desktop") {
    msgDesktop.textContent = msg;
  } else {
    msgMobile.textContent = msg;
  }
});

socket.on("access-result", (msg) => {
  console.log("access-result", msg);
  // 依據 device 顯示 result.msg
  if (device === "Desktop") {
    msgDesktop.textContent = msg;
  } else {
    msgMobile.textContent = msg;
  }
});

socket.on("start-result", (startDevice, result) => {
  console.log(`由${startDevice} 開始紀錄 ${result.both}: ${result.msg}`);
  if (startDevice === "Desktop") {
    if (result.both) {
      // 雙方收到 開始紀錄
      if (device === "Desktop") {
        // start: Desktop, receive: Desktop
        // 同裝置，僅顯示訊息
        msgDesktop.textContent = result.msg;
      } else {
        // start: Desktop, receive: Mobile
        // 若 Mobile 還沒開始，則按下開始 (同時會再發 emit 一個 "record-start")
        if (startSensorBtn.disabled === false) {
          startSensorBtn.click();
        }
        // 若 Mobile 已開始，僅更新訊息
        msgMobile.textContent = result.msg;
      }
    } else {
      // 單方收到 拒絕開始
      // start: Desktop, stop: Desktop
      // 按下停止 (同時會再發 emit 一個 "record-stop")
      stopVideoBtn.click();
      msgDesktop.textContent = result.msg;
    }
  } else {
    if (result.both) {
      if (device === "Desktop") {
        // start: Mobile, receive: Desktop
        // 若 Desktop 還沒開始，則按下開始 (同時會再發 emit 一個 "record-start")
        if (startVideoBtn.disabled === false) {
          startVideoBtn.click();
        }
        // 若 Desktop 已開始，僅更新訊息
        msgDesktop.textContent = result.msg;
      } else {
        // start: Mobile, receive: Mobile
        // 同裝置，僅顯示訊息
        msgMobile.textContent = result.msg;
      }
    } else {
      // 單方收到 拒絕開始
      // start: Mobile, stop: Mobile
      stopSensorBtn.click();
      msgMobile.textContent = result.msg;
    }
  }
});

socket.on("stop-result", (stopDevice, result) => {
  console.log(`由${stopDevice} 停止紀錄 ${result.both}: ${result.msg}`);
  if (stopDevice === "Desktop") {
    if (result.both) {
      // 雙方收到 停止紀錄
      if (device === "Desktop") {
        // stop: Desktop, receive: Desktop
        // 同裝置，僅顯示訊息
        msgDesktop.textContent = result.msg;
      } else {
        // stop: Desktop, receive: Mobile
        // 如果還沒開始就按 (同時會再發 emit 一個 "record-stop")
        if (stopSensorBtn.disabled === false) {
          stopSensorBtn.click();
        }
        // 已開始，僅更新訊息
        msgMobile.textContent = result.msg;
      }
    } else {
      // 單方收到 停止
      // stop: Desktop, stop: Desktop
      // 更新停止訊息
      msgMobile.textContent = result.msg;
    }
  } else {
    if (result.both) {
      if (device === "Desktop") {
        // stop: Mobile, receive: Desktop
        // 如果還沒開始就按 (同時會再發 emit 一個 "record-stop")
        if (stopVideoBtn.disabled === false) {
          stopVideoBtn.click();
        }
        // 已開始，僅更新訊息
        msgDesktop.textContent = result.msg;
      } else {
        // stop: Mobile, receive: Mobile
        // 同裝置，僅顯示訊息
        msgMobile.textContent = result.msg;
      }
    } else {
      // 單方收到 停止
      // stop: Mobile, stop: Mobile
      // 更新停止訊息
      msgDesktop.textContent = result.msg;
    }
  }
});

socket.on("receive-record", (record) => {
  mobileController.showSensorData(record);
  localRecord = record;
});

const postRecordBtn = document.getElementById("postRecordBtn");
postRecordBtn.addEventListener("click", postRecord);
function postRecord() {
  desktopController.sendRecordMulter(localRecord, user._id);
  // desktopController.sendRecordFrontend(localRecord);
}
function displayView(device) {
  if (device === "Desktop") {
    const desktopSec = document.getElementById("desktopSec");
    desktopSec.classList.add("active-section");
  } else {
    const mobileSec = document.getElementById("mobileSec");
    mobileSec.classList.add("active-section");
  }
}

function checkDevice() {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Android") > -1) {
    return "Android";
  }
  if (userAgent.indexOf("iPhone") > -1) {
    return "iPhone";
  }
  return "Desktop";
}
