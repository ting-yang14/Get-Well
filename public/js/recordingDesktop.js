const accessCameraBtn = document.getElementById("accessCameraBtn");
const recordVideoBtn = document.getElementById("recordVideoBtn");
const stopVideoBtn = document.getElementById("stopVideoBtn");
const downloadVideoBtn = document.getElementById("downloadVideoBtn");
const playVideoBtn = document.getElementById("playVideoBtn");
const preview = document.getElementById("preview");
const recorded = document.getElementById("recorded");
const msgDesktop = document.getElementById("msgDesktop");
const startVideoTime = document.getElementById("startVideoTime");
const stopVideoTime = document.getElementById("stopVideoTime");
let mediaRecorder;
let recordedBlobs;
let isCameraAccess = false;
let isRecordVideo = false;
accessCameraBtn.addEventListener("click", accessCamera);
recordVideoBtn.addEventListener("click", recordVideo);
stopVideoBtn.addEventListener("click", stopVideo);
downloadVideoBtn.addEventListener("click", downloadVideo);
playVideoBtn.addEventListener("click", playVideo);

socket.on("mobile-start", (Msg) => {
  console.log("desktop-receive", Msg);
  msgDesktop.textContent = Msg;
  if (isCameraAccess === false) {
    socket.emit("video-stop", "Error: Desktop camera cannot access");
    return;
  }
  if (isRecordVideo === true) {
    return;
  }
  recordVideoBtn.click();
});

socket.on("mobile-stop", (Msg) => {
  console.log("desktop-receive", Msg);
  msgDesktop.textContent = Msg;
  if (isRecordVideo === true) {
    stopVideoBtn.click();
  } else {
    return;
  }
});

async function accessCamera() {
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
    isCameraAccess = true;
    recordVideoBtn.disabled = false;
    accessCameraBtn.remove();
    console.log("getUserMedia() got stream:", stream);
    window.stream = stream;
    preview.srcObject = stream;
    downloadVideoBtn.href = stream;
  } catch (err) {
    console.log("navigator.getUserMedia error:", err);
    errMsgDesktop.textContent = `navigator.getUserMedia error:${err.toString()}`;
  }
}

function recordVideo() {
  console.log(isRecordVideo);
  recordVideoBtn.textContent = "紀錄中";
  recordVideoBtn.disabled = true;
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
    isRecordVideo = true;
    socket.emit("video-start", "Desktop camera start recording");
    startVideoTime.textContent = `開始時間：${getCurrentTime()}`;
    stopVideoBtn.textContent = "停止紀錄";
    console.log("MediaRecorder started", mediaRecorder);
  } catch (err) {
    console.error("Exception while creating MediaRecorder:", err);
    errMsgDesktop.textContent = `Exception while creating MediaRecorder: ${JSON.stringify(
      err
    )}`;
    return;
  }
}

function handleDataAvailable(event) {
  console.log("handleDataAvailable", event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function stopVideo() {
  mediaRecorder.stop();
  isRecordVideo = false;
  socket.emit("video-stop", "Desktop camera stop recording");
  recordVideoBtn.textContent = "開始紀錄";
  stopVideoBtn.textContent = "已停止紀錄";
  stopVideoTime.textContent = `結束時間：${getCurrentTime()}`;
  recordVideoBtn.disabled = false;
  stopVideoBtn.disabled = true;
  playVideoBtn.disabled = false;
  downloadVideoBtn.disabled = false;
}

function downloadVideo() {
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
}

function playVideo() {
  const blob = new Blob(recordedBlobs, { type: "video/mp4" });
  recorded.src = null;
  recorded.srcObject = null;
  recorded.src = window.URL.createObjectURL(blob);
  recorded.controls = true;
  recorded.play();
}

function getFilename() {
  const now = new Date();
  const time = now.toTimeString().slice(0, 8).replaceAll(":", "-");
  return `${now.toISOString().slice(0, 10)}_${time}`;
}

function getCurrentTime() {
  const now = new Date();
  const day = now.toISOString().slice(0, 10).replaceAll("-", "/");
  const time = now.toTimeString().slice(0, 8);
  return `${day} ${time}`;
}
