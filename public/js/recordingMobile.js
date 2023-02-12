import { getCurrentTime } from "./base.js";

const accX = document.getElementById("accX");
const accY = document.getElementById("accY");
const accZ = document.getElementById("accZ");
const oriAlpha = document.getElementById("oriAlpha");
const oriBeta = document.getElementById("oriBeta");
const oriGamma = document.getElementById("oriGamma");

let recordingInterval;
let recordData = [];
let record = {
  startTime: null,
  data: [],
  endTime: null,
};

// --- send record button ---
// sendDataBtn.addEventListener("click", sendSensorData.bind(null, record));

// function sendSensorData(record) {
//   socket.emit("send-data", "動作資料傳送", user._id);
// }
// --- not yet ---

export const mobileController = {
  accessSensor: async function (device, socket, user) {
    let access;
    let msg;
    if (device === "iPhone") {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response !== "granted") {
          access = false;
          msg = "請關閉瀏覽器後，許可存取";
          // socket
          socket.emit("device-access", user._id, { access, msg });
          return;
        }
      } catch (err) {
        console.log(err);
        access = false;
        msg = "手機感測器連結失敗";
        // socket
        socket.emit("device-access", user._id, { access, msg });
        return;
      }
    }
    window.addEventListener("deviceorientation", deviceOrientationHandler);
    window.addEventListener("devicemotion", deviceMotionHandler);
    access = true;
    msg = "手機感測器已連結";
    // socket
    socket.emit("device-access", user._id, { access, msg });
    accessSensorBtn.remove();
    startSensorBtn.disabled = false;
  },
  startSensor: function (device, socket, user) {
    const startSensorTime = document.getElementById("startSensorTime");
    recordData = [];
    record.startTime = getCurrentTime();
    startSensorTime.textContent = `開始時間：${getCurrentTime()}`;
    if (!recordingInterval) {
      recordingInterval = setInterval(saveCurrentData, 33.3);
    }
    // socket
    // socket.emit("record-start", device, user._id);
    socket.emit("record", "start", device, user._id);
    startSensorBtn.disabled = true;
    startSensorBtn.textContent = "紀錄中";
    stopSensorBtn.disabled = false;
    stopSensorBtn.textContent = "停止紀錄";
    showDataBtn.disabled = true;
    sendDataBtn.disabled = true;
  },
  stopSensor: function (device, socket, user) {
    const stopSensorTime = document.getElementById("stopSensorTime");
    clearInterval(recordingInterval);
    // socket
    // socket.emit("record-stop", device, user._id);
    socket.emit("record", "stop", device, user._id);
    record.endTime = getCurrentTime();
    recordingInterval = null;
    record.data = recordData;
    stopSensorTime.textContent = `結束時間：${getCurrentTime()}`;
    startSensorBtn.disabled = false;
    startSensorBtn.textContent = "開始紀錄";
    stopSensorBtn.disabled = true;
    stopSensorBtn.textContent = "已停止紀錄";
    showDataBtn.disabled = false;
    sendDataBtn.disabled = false;
  },
  showSensorData: function () {
    // const recordTable = document.getElementById("recordTable");
    const recordContainer = document.getElementById("recordContainer");
    const recordTbody = document.getElementById("recordTbody");
    // recordTable.style.display = "table";
    recordContainer.style.display = "block";
    recordTbody.innerHTML = null;
    appendRecord(recordTbody, record);
  },
};

function deviceMotionHandler(e) {
  const { x, y, z } = e.acceleration;
  const roundX = Math.round(x * 10000) / 10000;
  const roundY = Math.round(y * 10000) / 10000;
  const roundZ = Math.round(z * 10000) / 10000;
  accX.textContent = roundX;
  accY.textContent = roundY;
  accZ.textContent = roundZ;
}

function deviceOrientationHandler(e) {
  const roundAlpha = Math.round(e.alpha * 10000) / 10000;
  const roundBeta = Math.round(e.beta * 10000) / 10000;
  const roundGamma = Math.round(e.gamma * 10000) / 10000;
  oriAlpha.textContent = roundAlpha;
  oriBeta.textContent = roundBeta;
  oriGamma.textContent = roundGamma;
}

function saveCurrentData() {
  const currentData = {};
  currentData.acc_X = accX.textContent;
  currentData.acc_Y = accY.textContent;
  currentData.acc_Z = accZ.textContent;
  currentData.ori_alpha = oriAlpha.textContent;
  currentData.ori_beta = oriBeta.textContent;
  currentData.ori_gamma = oriGamma.textContent;
  currentData.time = Date.now();
  recordData.push(currentData);
}

function appendRecord(table, record) {
  record.data.forEach((rowData, index) => {
    insertRow(table, rowData, index);
  });
}

function insertRow(table, rowData, index) {
  const row = table.insertRow(-1);
  const cellIdx = row.insertCell(0);
  const cellAccX = row.insertCell(1);
  const cellAccY = row.insertCell(2);
  const cellAccZ = row.insertCell(3);
  const cellOriAlpha = row.insertCell(4);
  const cellOriBeta = row.insertCell(5);
  const cellOriGamma = row.insertCell(6);
  const cellTime = row.insertCell(7);
  cellIdx.innerHTML = index;
  cellAccX.innerHTML = rowData.acc_X;
  cellAccY.innerHTML = rowData.acc_Y;
  cellAccZ.innerHTML = rowData.acc_Z;
  cellOriAlpha.innerHTML = rowData.ori_alpha;
  cellOriBeta.innerHTML = rowData.ori_beta;
  cellOriGamma.innerHTML = rowData.ori_gamma;
  cellTime.innerHTML = rowData.time;
}
