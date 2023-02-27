import { getCurrentTime } from "./base.js";

const mobileAccX = document.getElementById("mobileAccX");
const mobileAccY = document.getElementById("mobileAccY");
const mobileAccZ = document.getElementById("mobileAccZ");
const mobileOriAlpha = document.getElementById("mobileOriAlpha");
const mobileOriBeta = document.getElementById("mobileOriBeta");
const mobileOriGamma = document.getElementById("mobileOriGamma");

let recordingInterval;
let recordData = [];
let record = {
  startTime: null,
  data: [],
  endTime: null,
};
let localSocket;
let localUser;
export const mobileController = {
  accessSensor: async function (device, socket, user) {
    let access;
    let msg;
    localSocket = socket;
    localUser = user;
    if (device === "iPhone") {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response !== "granted") {
          // socket
          access = false;
          msg = "請關閉瀏覽器後再開啟分頁允許資料存取";
          socket.emit("device-access", user._id, { access, msg });
          return;
        }
      } catch (err) {
        console.log(err);
        // socket
        access = false;
        msg = "請關閉瀏覽器後再開啟分頁允許資料存取";
        socket.emit("device-access", user._id, { access, msg });
        return;
      }
    }
    window.addEventListener("deviceorientation", deviceOrientationHandler);
    window.addEventListener("devicemotion", deviceMotionHandler);
    // socket
    access = true;
    msg = "手機感測器資料存取成功";
    socket.emit("device-access", user._id, { access, msg });
    accessSensorBtn.remove();
    startSensorBtn.disabled = false;
  },
  startSensor: function (device, socket, user) {
    recordData = [];
    record.startTime = getCurrentTime();
    if (!recordingInterval) {
      recordingInterval = setInterval(saveCurrentData, 33.3);
    }
    // socket
    socket.emit("record", "start", device, user._id);
    startSensorBtn.disabled = true;
    startSensorBtn.innerHTML = `&nbsp;&nbsp;紀錄中`;
    stopSensorBtn.disabled = false;
    stopSensorBtn.innerHTML = `&nbsp;&nbsp;停止紀錄`;
    showDataBtn.disabled = true;
    sendDataBtn.disabled = true;
  },
  stopSensor: function (device, socket, user) {
    clearInterval(recordingInterval);
    // socket
    socket.emit("record", "stop", device, user._id);
    record.endTime = getCurrentTime();
    recordingInterval = null;
    record.data = recordData;
    socket.emit("send-record", record, user._id);
    startSensorBtn.disabled = false;
    startSensorBtn.innerHTML = `&nbsp;&nbsp;開始紀錄`;
    stopSensorBtn.disabled = true;
    stopSensorBtn.innerHTML = `&nbsp;&nbsp;已停止紀錄`;
    showDataBtn.disabled = false;
    sendDataBtn.disabled = false;
  },
};

function deviceMotionHandler(e) {
  const roundedAcc = ["x", "y", "z"].map((axis) => {
    const value = e.acceleration[axis];
    return Math.round(value * 10000) / 10000;
  });
  localSocket.emit("send-acc", roundedAcc, localUser._id);
  [mobileAccX.textContent, mobileAccY.textContent, mobileAccZ.textContent] =
    roundedAcc;
}

function deviceOrientationHandler(e) {
  const roundedOri = ["alpha", "beta", "gamma"].map((orientation) => {
    const value = e[orientation];
    return Math.round(value * 10000) / 10000;
  });
  localSocket.emit("send-ori", roundedOri, localUser._id);
  [
    mobileOriAlpha.textContent,
    mobileOriBeta.textContent,
    mobileOriGamma.textContent,
  ] = roundedOri;
}

function saveCurrentData() {
  const currentData = {
    acc_X: mobileAccX.textContent,
    acc_Y: mobileAccY.textContent,
    acc_Z: mobileAccZ.textContent,
    ori_alpha: mobileOriAlpha.textContent,
    ori_beta: mobileOriBeta.textContent,
    ori_gamma: mobileOriGamma.textContent,
    time: Date.now(),
  };
  recordData.push(currentData);
}
