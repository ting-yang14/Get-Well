import { navView } from "./navView.js";
import { fetchUser, raiseAlert } from "./base.js";
import {
  resetRegisterValidation,
  resetLoginValidation,
  registerInputValidation,
  loginInputValidation,
} from "./validation.js";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const registerMsg = document.getElementById("registerMsg");
const loginMsg = document.getElementById("loginMsg");
// input
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const registerUsername = document.getElementById("registerUsername");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
loginEmail.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    login();
  }
});
loginPassword.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    login();
  }
});
registerUsername.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    register();
  }
});
registerEmail.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    register();
  }
});
registerPassword.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    register();
  }
});
// button
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const toggleLoginBtn = document.getElementById("toggleLoginBtn");
const toggleRegisterBtn = document.getElementById("toggleRegisterBtn");
loginBtn.addEventListener("click", login);
registerBtn.addEventListener("click", register);
toggleLoginBtn.addEventListener("click", () => {
  resetInputValue();
  resetResponseMsg(loginMsg);
  resetLoginValidation();
});
toggleRegisterBtn.addEventListener("click", () => {
  resetInputValue();
  resetResponseMsg(registerMsg);
  resetRegisterValidation();
});

async function login() {
  if (loginInputValidation()) {
    const requestBody = {
      email: loginEmail.value,
      password: loginPassword.value,
    };
    try {
      const response = await axios.post("/api/user/login", requestBody);
      if (response.data.success) {
        loginMsg.innerHTML = raiseAlert(true, "登入成功");
        loginForm.reset();
        localStorage.setItem("token", response.data.data.token);
        window.location.href = "/user";
      }
    } catch (error) {
      console.error(error);
      console.log(error.response.data.message);
      loginMsg.innerHTML = raiseAlert(false, error.response.data.message);
    }
  } else {
    return;
  }
}

async function register() {
  if (registerInputValidation()) {
    const requestBody = {
      username: registerUsername.value,
      email: registerEmail.value,
      password: registerPassword.value,
    };
    try {
      const response = await axios.post("/api/user/register", requestBody);
      if (response.data.success) {
        registerMsg.innerHTML = raiseAlert(true, "註冊成功");
        registerForm.reset();
        toggleLoginBtn.classList.remove("btn-secondary");
        toggleLoginBtn.classList.add("btn-success");
        loginEmail.value = requestBody.email;
        resetRegisterValidation();
        resetResponseMsg(loginMsg);
      }
    } catch (error) {
      console.error(error);
      console.log(error.response.data.message);
      registerMsg.innerHTML = raiseAlert(false, error.response.data.message);
    }
  }
}

function resetResponseMsg(item) {
  item.innerHTML = null;
}

function resetInputValue() {
  registerUsername.value = null;
  registerEmail.value = null;
  registerPassword.value = null;
  loginEmail.value = null;
  loginPassword.value = null;
}

async function init() {
  if (localStorage.token) {
    try {
      const userData = await fetchUser();
      navView.login(userData.avatarUrl);
    } catch (error) {
      console.log(error);
    }
  }
}

init();
