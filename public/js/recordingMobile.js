const accessSensorBtn = document.getElementById("accessSensorBtn");
const recordSensorBtn = document.getElementById("recordSensorBtn");
const stopSensorBtn = document.getElementById("stopSensorBtn");
const showDataBtn = document.getElementById("showDataBtn");
const accX = document.getElementById("accX");
const accY = document.getElementById("accY");
const accZ = document.getElementById("accZ");
const oriAlpha = document.getElementById("oriAlpha");
const oriBeta = document.getElementById("oriBeta");
const oriGamma = document.getElementById("oriGamma");
const msgMobile = document.getElementById("msgMobile");
const realtimeDataTable = document.getElementById("realtimeDataTable");
const recordTable = document.getElementById("recordTable");
const startSensorTime = document.getElementById("startSensorTime");
const stopSensorTime = document.getElementById("stopSensorTime");
let isMobileAccess = false;
let isRecordSensor = false;
let recordingInterval;
let recordData = [];
let record = {
  startTime: null,
  data: [],
  endTime: null,
};

accessSensorBtn.addEventListener("click", accessSensor);
recordSensorBtn.addEventListener("click", recordSensor);
stopSensorBtn.addEventListener("click", stopRecording);
showDataBtn.addEventListener("click", showSensorData.bind(null, record));

socket.on("desktop-start", (Msg) => {
  console.log("mobile-receive", Msg);
  msgMobile.textContent = Msg;
  if (isMobileAccess === false) {
    socket.emit("sensor-stop", "Error: Mobile sensor cannot access");
    return;
  }
  if (isRecordSensor === true) {
    return;
  }
  recordSensorBtn.click();
});

socket.on("desktop-stop", (Msg) => {
  console.log("mobile-receive", Msg);
  msgMobile.textContent = Msg;
  if (isRecordSensor === true) {
    stopSensorBtn.click();
  } else {
    return;
  }
});

async function accessSensor() {
  if (device === "iPhone") {
    try {
      const response = await DeviceMotionEvent.requestPermission();
      if (response !== "granted") {
        msgMobile.textContent = `DeviceMotionEvent request permission error`;
        return;
      }
    } catch (err) {
      console.log(err);
      msgMobile.textContent = `DeviceMotionEvent request permission error:${err.toString()}`;
    }
  }
  window.addEventListener("deviceorientation", deviceOrientationHandler);
  window.addEventListener("devicemotion", deviceMotionHandler);
  isMobileAccess = true;
  accessSensorBtn.remove();
  recordSensorBtn.disabled = false;
}

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

function recordSensor() {
  recordData = [];
  record.startTime = getCurrentTime();
  startSensorTime.textContent = `開始時間：${getCurrentTime()}`;
  if (!recordingInterval) {
    recordingInterval = setInterval(saveCurrentData, 33.3);
  }
  isRecordSensor = true;
  socket.emit("sensor-start", "Mobile sensor start recording");
  recordSensorBtn.disabled = true;
  recordSensorBtn.textContent = "紀錄中";
  stopSensorBtn.disabled = false;
  stopSensorBtn.textContent = "停止紀錄";
  showDataBtn.disabled = true;
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

function stopRecording() {
  clearInterval(recordingInterval);
  isRecordSensor = false;
  socket.emit("sensor-stop", "Mobile sensor stop recording");
  record.endTime = getCurrentTime();
  recordingInterval = null;
  record.data = recordData;
  stopSensorTime.textContent = `結束時間：${getCurrentTime()}`;
  recordSensorBtn.disabled = false;
  recordSensorBtn.textContent = "開始紀錄";
  stopSensorBtn.disabled = true;
  stopSensorBtn.textContent = "已停止紀錄";
  showDataBtn.disabled = false;
}

function showSensorData(record) {
  recordTable.style.display = "block";
  clearRecord(recordTable);
  appendRecord(recordTable, record);
}

function clearRecord(table) {
  const rowCounts = table.rows.length;
  for (let i = 0; i < rowCounts - 2; i++) {
    table.deleteRow(-1);
  }
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
