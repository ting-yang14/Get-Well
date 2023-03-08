export const navView = {
  login: function (avatarUrl) {
    const logLink = document.getElementById("logLink");
    logLink.innerHTML = `&nbsp;&nbsp;會員登出`;
    logLink.classList.remove("fa-circle-user");
    logLink.classList.add("fa-right-from-bracket");
    logLink.dataset.bsTarget = null;
    logLink.dataset.bsToggle = null;
    logLink.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "/";
    });
    const unLoginBtn = document.getElementById("unLoginBtn");
    const navImg = document.getElementById("navImg");
    unLoginBtn.classList.add("d-none");
    navImg.classList.remove("d-none");
    if (avatarUrl) {
      navImg.src = avatarUrl;
    }
    const userLink = document.getElementById("userLink");
    const recordingLink = document.getElementById("recordingLink");
    userLink.classList.remove("d-none");
    recordingLink.classList.remove("d-none");
    const navbarBrand = document.querySelector(".navbar-brand");
    navbarBrand.href = "/user";
  },
};
