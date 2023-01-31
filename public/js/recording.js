const startBtn = document.getElementById("startBtn");
const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const downloadBtn = document.getElementById("downloadBtn");
const playBtn = document.getElementById("playBtn");
const preview = document.getElementById("preview");
const recorded = document.getElementById("recorded");
const errMsg = document.getElementById("errMsg");
const startTime = document.getElementById("startTime");
const stopTime = document.getElementById("stopTime");
let mediaRecorder;
let recordedBlobs;

startBtn.addEventListener("click", start);
async function start() {
  try {
    const constraints = {
      audio: true,
      video: {
        facingMode: "user",
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
      },
    };
    startBtn.disabled = true;
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    recordBtn.disabled = false;
    console.log("getUserMedia() got stream:", stream);
    window.stream = stream;
    preview.srcObject = stream;
    downloadBtn.href = stream;
  } catch (e) {
    console.log("navigator.getUserMedia error:", e);
    errMsg.textContent = `navigator.getUserMedia error:${e.toString()}`;
  }
}
recordBtn.addEventListener("click", record);
function record() {
  recordBtn.textContent = "紀錄中";
  recordBtn.disabled = true;
  recordedBlobs = [];
  try {
    mediaRecorder = new MediaRecorder(window.stream);
    console.log("Created MediaRecorder", mediaRecorder);
    stopBtn.disabled = false;
    mediaRecorder.onstop = (event) => {
      console.log("Recorder stopped: ", event);
      console.log("Recorded Blobs: ", recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    startTime.textContent = `開始時間：${getCurrentTime()}`;
    stopBtn.textContent = "停止紀錄";
    console.log("MediaRecorder started", mediaRecorder);
  } catch (e) {
    console.error("Exception while creating MediaRecorder:", e);
    errMsg.textContent = `Exception while creating MediaRecorder: ${JSON.stringify(
      e
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

stopBtn.addEventListener("click", stop);
function stop() {
  mediaRecorder.stop();
  recordBtn.textContent = "開始紀錄";
  stopBtn.textContent = "已停止紀錄";
  stopTime.textContent = `結束時間：${getCurrentTime()}`;
  recordBtn.disabled = false;
  stopBtn.disabled = true;
  playBtn.disabled = false;
  downloadBtn.disabled = false;
}
downloadBtn.addEventListener("click", download);
function download() {
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
playBtn.addEventListener("click", play);
function play() {
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
