import { getCurrentTime } from "./base.js";

const preview = document.getElementById("preview");
const recorded = document.getElementById("recorded");

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
      access = true;
      // socket
      msg = "視訊鏡頭已開啟";
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
      msg = "存取視訊鏡頭失敗";
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
      // socket.emit("record-start", device, user._id);
      socket.emit("record", "start", device, user._id);
      startVideoTime.textContent = `開始時間：${getCurrentTime()}`;
      stopVideoBtn.textContent = "停止紀錄";
      console.log("MediaRecorder started", mediaRecorder);
    } catch (err) {
      console.error("Exception while creating MediaRecorder:", err);
      msgDesktop.textContent = `Exception while creating MediaRecorder: ${JSON.stringify(
        err
      )}`;
    }
  },
  stopVideo: function (device, socket, user) {
    const stopVideoTime = document.getElementById("stopVideoTime");
    mediaRecorder.stop();
    // socket
    // socket.emit("record-stop", device, user._id);
    socket.emit("record", "stop", device, user._id);
    startVideoBtn.textContent = "開始紀錄";
    stopVideoBtn.textContent = "已停止紀錄";
    stopVideoTime.textContent = `結束時間：${getCurrentTime()}`;
    startVideoBtn.disabled = false;
    stopVideoBtn.disabled = true;
    playVideoBtn.disabled = false;
    downloadVideoBtn.disabled = false;
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
