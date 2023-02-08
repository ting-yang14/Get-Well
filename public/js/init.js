init();
const functionLink = document.getElementById("functionLink");
const userLink = document.getElementById("userLink");
const navView = {
  index: function () {
    this.setRecording();
    this.setLogout();
  },
  recording: function () {
    this.setUser();
    this.setLogout();
  },
  record: function () {
    this.setRecording();
    this.setLogout();
  },
  user: function () {
    this.setRecording();
    this.setLogout();
  },
  setLogout: function () {
    userLink.textContent = "會員登出";
    userLink.dataset.bsTarget = null;
    userLink.dataset.bsToggle = null;
    userLink.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "/";
    });
  },
  setRecording: function () {
    functionLink.dataset.bsTarget = null;
    functionLink.dataset.bsToggle = null;
    functionLink.href = "/recording";
  },
  setUser: function () {
    functionLink.textContent = "我的紀錄";
    functionLink.dataset.bsTarget = null;
    functionLink.dataset.bsToggle = null;
    functionLink.href = "/user";
  },
};
let user;
async function init() {
  const currentPath = window.location.pathname.split("/")[1];
  if (localStorage.token) {
    const headers = { Authorization: localStorage.token };
    await fetchUser(headers);
    if (currentPath === "") {
      navView.index();
    }
    if (currentPath === "recording") {
      navView.recording();
    }
    if (currentPath === "record") {
      navView.record();
    }
    if (currentPath === "user") {
      navView.user();
    }
  } else {
    if (currentPath === "") {
      return;
    } else {
      window.location.href = "/";
    }
  }
}
async function fetchUser(headers) {
  try {
    const response = await axios.get("/api/user/me", { headers: headers });
    console.log(response);
    user = response.data.data;
  } catch (error) {
    console.log(error);
    window.location.href = "/";
  }
}
