import { navView } from "./navView.js";
import { fetchUser, raiseAlert } from "./base.js";
import { desktopController } from "./recordingDesktop.js";
import { mobileController } from "./recordingMobile.js";

let device;
let localRecord;
// message
const msgDesktop = document.getElementById("msgDesktop");
const msgMobile = document.getElementById("msgMobile");
// desktop buttons
const accessCameraBtn = document.getElementById("accessCameraBtn");
const startVideoBtn = document.getElementById("startVideoBtn");
const downloadVideoBtn = document.getElementById("downloadVideoBtn");
const stopVideoBtn = document.getElementById("stopVideoBtn");
const playVideoBtn = document.getElementById("playVideoBtn");
const postRecordBtn = document.getElementById("postRecordBtn");
// mobile buttons
const accessSensorBtn = document.getElementById("accessSensorBtn");
const startSensorBtn = document.getElementById("startSensorBtn");
const stopSensorBtn = document.getElementById("stopSensorBtn");
// spinner
const spinner = document.getElementById("spinner");
// exercise input
const exerciseName = document.getElementById("exerciseName");
const exerciseCounts = document.getElementById("exerciseCounts");
exerciseCounts.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    postRecord();
  }
});
exerciseName.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    postRecord();
  }
});
// socket
const socket = io("/recording");
// both device received
socket.on("join-result", (result) => {
  if (device === "Desktop") {
    msgDesktop.innerHTML = raiseAlert(result.join, result.msg);
  } else {
    msgMobile.innerHTML = raiseAlert(result.join, result.msg);
  }
});

socket.on("access-result", (result) => {
  if (device === "Desktop") {
    msgDesktop.innerHTML = raiseAlert(result.access, result.msg);
  } else {
    msgMobile.innerHTML = raiseAlert(result.access, result.msg);
  }
});

socket.on("start-result", (triggerDevice, result) => {
  if (triggerDevice === "Desktop") {
    if (result.both) {
      if (device === "Desktop") {
        msgDesktop.innerHTML = raiseAlert(result.both, result.msg);
      } else {
        //
        if (startSensorBtn.disabled === false) {
          startSensorBtn.click();
        }
        msgMobile.innerHTML = raiseAlert(result.both, result.msg);
      }
    } else {
      stopVideoBtn.click();
      msgDesktop.innerHTML = raiseAlert(result.both, result.msg);
    }
  } else {
    if (result.both) {
      if (device === "Desktop") {
        if (startVideoBtn.disabled === false) {
          startVideoBtn.click();
        }
        msgDesktop.innerHTML = raiseAlert(result.both, result.msg);
      } else {
        msgMobile.innerHTML = raiseAlert(result.both, result.msg);
      }
    } else {
      stopSensorBtn.click();
      msgMobile.innerHTML = raiseAlert(result.both, result.msg);
    }
  }
});

socket.on("stop-result", (triggerDevice, result) => {
  if (triggerDevice === "Desktop") {
    if (result.both) {
      if (device === "Desktop") {
        msgDesktop.innerHTML = raiseAlert(result.both, result.msg);
      } else {
        if (stopSensorBtn.disabled === false) {
          stopSensorBtn.click();
        }
        msgMobile.innerHTML = raiseAlert(result.both, result.msg);
      }
    } else {
      msgMobile.innerHTML = raiseAlert(result.both, result.msg);
    }
  } else {
    if (result.both) {
      if (device === "Desktop") {
        if (stopVideoBtn.disabled === false) {
          stopVideoBtn.click();
        }
        msgDesktop.innerHTML = raiseAlert(result.both, result.msg);
      } else {
        msgMobile.innerHTML = raiseAlert(result.both, result.msg);
      }
    } else {
      msgDesktop.innerHTML = raiseAlert(result.both, result.msg);
    }
  }
});

socket.on("receive-result", (result) => {
  spinner.classList.add("d-none");
  if (device === "Desktop") {
    msgDesktop.innerHTML = raiseAlert(result.post, result.msg);
  } else {
    msgMobile.innerHTML = raiseAlert(result.post, result.msg);
  }
});
// desktop received
socket.on("receive-record", (record) => {
  desktopController.showSensorData(record);
  localRecord = record;
});

socket.on("receive-acc", (acc) => {
  desktopController.showAccData(acc);
});

socket.on("receive-ori", (ori) => {
  desktopController.showOriData(ori);
});

// mobile received
socket.on("receive-start", () => {
  spinner.classList.remove("d-none");
});

function postRecord() {
  desktopController.postRecordFrontend(localRecord);
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

async function init() {
  if (localStorage.token) {
    try {
      device = checkDevice();
      displayView(device);
      const userData = await fetchUser();
      const user = userData.user;
      navView.login(userData.avatarUrl);
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
      postRecordBtn.addEventListener("click", postRecord);
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

init();
