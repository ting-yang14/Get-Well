import { getCurrentTime, raiseAlert } from "./base.js";
import {
  exerciseInputValidation,
  resetExerciseValidation,
} from "./validation.js";

const preview = document.getElementById("preview");
const recorded = document.getElementById("recorded");
const exerciseName = document.getElementById("exerciseName");
const exerciseCounts = document.getElementById("exerciseCounts");
// desktop table for real-time sensor data
const desktopAccX = document.getElementById("desktopAccX");
const desktopAccY = document.getElementById("desktopAccY");
const desktopAccZ = document.getElementById("desktopAccZ");
const desktopOriAlpha = document.getElementById("desktopOriAlpha");
const desktopOriBeta = document.getElementById("desktopOriBeta");
const desktopOriGamma = document.getElementById("desktopOriGamma");

let mediaRecorder;
let recordedBlobs;
let localSocket;
let localUser;

export const desktopController = {
  accessCamera: async function (socket, user) {
    let access;
    let msg;
    localSocket = socket;
    localUser = user;
    try {
      const constraints = {
        audio: true,
        video: {
          facingMode: "user",
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      access = true;
      msg = "視訊鏡頭畫面存取成功";
      socket.emit("device-access", user._id, { access, msg });
      startVideoBtn.disabled = false;
      accessCameraBtn.remove();
      window.stream = stream;
      preview.srcObject = stream;
      downloadVideoBtn.href = stream;
    } catch (err) {
      console.log("navigator.getUserMedia error:", err);
      access = false;
      msg = "請開啟視訊鏡頭存取權限並重新整理頁面";
      socket.emit("device-access", user._id, { access, msg });
    }
  },
  startVideo: function (device, socket, user) {
    const startVideoTime = document.getElementById("startVideoTime");
    startVideoBtn.innerHTML = `&nbsp;&nbsp;紀錄中`;
    startVideoBtn.disabled = true;
    recordedBlobs = [];
    try {
      mediaRecorder = new MediaRecorder(window.stream);
      stopVideoBtn.disabled = false;
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start();
      socket.emit("record", "start", device, user._id);
      startVideoTime.textContent = `開始時間：${getCurrentTime()}`;
      stopVideoBtn.innerHTML = `&nbsp;&nbsp;停止紀錄`;
    } catch (err) {
      console.error("Exception while creating MediaRecorder:", err);
      msgDesktop.innerHTML = raiseAlert(false, "請重新開啟頁面並啟動視訊鏡頭");
    }
  },
  stopVideo: function (device, socket, user) {
    const stopVideoTime = document.getElementById("stopVideoTime");
    mediaRecorder.stop();
    socket.emit("record", "stop", device, user._id);
    startVideoBtn.innerHTML = `&nbsp;&nbsp;開始紀錄`;
    stopVideoBtn.innerHTML = `&nbsp;&nbsp;已停止紀錄`;
    stopVideoTime.textContent = `結束時間：${getCurrentTime()}`;
    startVideoBtn.disabled = false;
    stopVideoBtn.disabled = true;
    playVideoBtn.disabled = false;
    downloadVideoBtn.disabled = false;
    exerciseName.disabled = false;
    exerciseCounts.disabled = false;
    postRecordBtn.disabled = false;
  },
  downloadVideo: function () {
    const blob = new Blob(recordedBlobs, { type: "video/webm" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = getFilename();
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  },
  playVideo: function () {
    const blob = new Blob(recordedBlobs, { type: "video/mp4" });
    recorded.src = null;
    recorded.srcObject = null;
    recorded.src = window.URL.createObjectURL(blob);
    recorded.controls = true;
    recorded.play();
  },
  postRecordFrontend: async function (localRecord) {
    resetExerciseValidation();
    const blob = new Blob(recordedBlobs, { type: "video/webm" });
    if (blob.size === 0) {
      msgDesktop.innerHTML = raiseAlert(false, "尚未紀錄影像");
    }
    if (localRecord.data.length === 0) {
      msgDesktop.innerHTML = raiseAlert(false, "尚未紀錄動作資料");
    }
    if (exerciseInputValidation()) {
      const requestBody = {
        exerciseName: exerciseName.value,
        exerciseCounts: Number(exerciseCounts.value),
        exerciseRecord: localRecord,
      };
      spinner.classList.remove("d-none");
      localSocket.emit("post-start", localUser._id);
      try {
        const response = await axios.get("/api/s3");
        await axios.put(response.data.data.url, blob, {
          headers: { "Content-Type": blob.type },
        });
        requestBody.videoFileName = response.data.data.fileName;
        const postResponse = await axios.post("/api/record", requestBody, {
          headers: { Authorization: localStorage.token },
        });
        if (postResponse.data.success) {
          exerciseCounts.value = null;
          exerciseName.value = null;
          resetExerciseValidation();
          const result = { post: true, msg: "紀錄上傳成功" };
          localSocket.emit("post-result", result, localUser._id);
        } else {
          const result = { post: false, msg: "紀錄上傳失敗" };
          localSocket.emit("post-result", result, localUser._id);
        }
      } catch (error) {
        console.log(error);
        const result = { post: false, msg: "紀錄上傳失敗" };
        localSocket.emit("post-result", result, localUser._id);
      }
    }
  },
  showSensorData: function (record) {
    const recordSec = document.getElementById("recordSec");
    const recordTbody = document.getElementById("recordTbody");
    recordSec.style.display = "block";
    recordTbody.innerHTML = null;
    appendRecord(recordTbody, record);
  },
  showAccData: function (acc) {
    [
      desktopAccX.textContent,
      desktopAccY.textContent,
      desktopAccZ.textContent,
    ] = acc;
  },
  showOriData: function (ori) {
    [
      desktopOriAlpha.textContent,
      desktopOriBeta.textContent,
      desktopOriGamma.textContent,
    ] = ori;
  },
};

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

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function getFilename() {
  const now = new Date();
  const time = now.toTimeString().slice(0, 8).replaceAll(":", "-");
  return `${now.toISOString().slice(0, 10)}_${time}`;
}
