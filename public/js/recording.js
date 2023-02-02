const mobileSec = document.getElementById("mobileSec");
const desktopSec = document.getElementById("desktopSec");
const device = checkDevice();

const socket = io("/recording");
socket.on("connect", () => {
  console.log(socket.id);
});

if (device === "Desktop") {
  desktopSec.classList.add("active-section");
} else {
  mobileSec.classList.add("active-section");
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
