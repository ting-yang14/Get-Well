import { getCurrentTime, raiseAlert } from "./base.js";
import {
  exerciseInputValidation,
  resetExerciseValidation,
} from "./validation.js";

const preview = document.getElementById("preview");
const recorded = document.getElementById("recorded");
const exerciseName = document.getElementById("exerciseName");
const exerciseCounts = document.getElementById("exerciseCounts");
let mediaRecorder;
let recordedBlobs;

export const desktopController = {
  accessCamera: async function (socket, user) {
    let access;
    let msg;
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
      // socket
      access = true;
      msg = "視訊鏡頭畫面存取成功";
      socket.emit("device-access", user._id, { access, msg });
      startVideoBtn.disabled = false;
      accessCameraBtn.remove();
      console.log("getUserMedia() got stream:", stream);
      window.stream = stream;
      preview.srcObject = stream;
      downloadVideoBtn.href = stream;
    } catch (err) {
      console.log("navigator.getUserMedia error:", err);
      // socket
      access = false;
      msg = "請開啟視訊鏡頭存取權限並重新整理頁面";
      socket.emit("device-access", user._id, { access, msg });
    }
  },
  startVideo: function (device, socket, user) {
    const startVideoTime = document.getElementById("startVideoTime");
    startVideoBtn.textContent = "紀錄中";
    startVideoBtn.disabled = true;
    recordedBlobs = [];
    try {
      mediaRecorder = new MediaRecorder(window.stream);
      console.log("Created MediaRecorder", mediaRecorder);
      stopVideoBtn.disabled = false;
      mediaRecorder.onstop = (event) => {
        console.log("Recorder stopped: ", event);
        console.log("Recorded Blobs: ", recordedBlobs);
      };
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start();
      // socket
      socket.emit("record", "start", device, user._id);
      startVideoTime.textContent = `開始時間：${getCurrentTime()}`;
      stopVideoBtn.textContent = "停止紀錄";
      console.log("MediaRecorder started", mediaRecorder);
    } catch (err) {
      console.error("Exception while creating MediaRecorder:", err);
      msgDesktop.innerHTML = raiseAlert(false, "請重新開啟頁面並啟動視訊鏡頭");
    }
  },
  stopVideo: function (device, socket, user) {
    const stopVideoTime = document.getElementById("stopVideoTime");
    mediaRecorder.stop();
    // socket
    socket.emit("record", "stop", device, user._id);
    startVideoBtn.textContent = "開始紀錄";
    stopVideoBtn.textContent = "已停止紀錄";
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
  sendRecordFrontend: async function (localRecord) {
    resetExerciseValidation();
    const blob = new Blob(recordedBlobs, { type: "video/webm" });
    if (blob.size === 0) {
      msgDesktop.innerHTML = raiseAlert(false, "尚未紀錄影像");
    }
    if (exerciseInputValidation()) {
      const requestBody = {
        exerciseName: exerciseName.value,
        exerciseCounts: Number(exerciseCounts.value),
        exerciseRecord: localRecord,
      };
      try {
        const response = await axios.get("/api/record/s3Url");
        const s3response = await axios.put(response.data.url, blob);
        requestBody.videoFileName = response.data.fileName;
        const postResponse = await axios.post("/api/record", requestBody, {
          headers: { Authorization: localStorage.token },
        });
        console.log(postResponse);
        if (postResponse.data.success) {
          exerciseCounts.value = null;
          exerciseName.value = null;
          resetExerciseValidation();
          msgDesktop.innerHTML = raiseAlert(true, "紀錄上傳成功");
        } else {
          msgDesktop.innerHTML = raiseAlert(false, "紀錄上傳失敗");
        }
      } catch (error) {
        console.log(error);
        msgDesktop.innerHTML = raiseAlert(false, "紀錄上傳失敗");
      }
    }
  },
  // sendRecordMulter: async function (localRecord, userId) {
  //   const exerciseName = document.getElementById("exerciseName");
  //   const exerciseCounts = document.getElementById("exerciseCounts");
  //   const blob = new Blob(recordedBlobs, { type: "video/webm" });
  //   const file = new File([blob], "filename.webm", {
  //     type: blob.type,
  //     lastModified: new Date().getTime(),
  //   });
  //   const formData = new FormData();
  //   formData.append("exerciseCounts", exerciseCounts.value);
  //   formData.append("exerciseName", exerciseName.value);
  //   formData.append("uploadVideo", file);
  //   formData.append("record", JSON.stringify(localRecord));
  //   formData.append("userId", userId);
  //   try {
  //     const headers = {
  //       Authorization: localStorage.token,
  //       "content-type": "multipart/form-data",
  //     };
  //     const response = await axios.post("/api/record", formData, {
  //       headers: headers,
  //     });
  //     console.log(response);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // },
};

function handleDataAvailable(event) {
  console.log("handleDataAvailable", event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function getFilename() {
  const now = new Date();
  const time = now.toTimeString().slice(0, 8).replaceAll(":", "-");
  return `${now.toISOString().slice(0, 10)}_${time}`;
}
