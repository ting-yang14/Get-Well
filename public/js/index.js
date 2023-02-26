import { navView } from "./navView.js";
import { fetchUser } from "./base.js";
import {
  resetRegisterValidation,
  resetLoginValidation,
  registerInputValidation,
  loginInputValidation,
} from "./validation.js";
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const toggleLoginBtn = document.getElementById("toggleLoginBtn");
const toggleRegisterBtn = document.getElementById("toggleRegisterBtn");

const registerMsg = document.getElementById("registerMsg");
const loginMsg = document.getElementById("loginMsg");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const registerUsername = document.getElementById("registerUsername");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

let user;

init();

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

async function init() {
  if (localStorage.token) {
    const headers = { Authorization: localStorage.token };
    try {
      const userData = await fetchUser(headers);
      user = userData.user;
      navView.index();
      console.log(user._id);
    } catch (error) {
      console.log(error);
    }
  } else {
    return;
  }
}

async function login() {
  if (loginInputValidation()) {
    const requestBody = {
      email: loginEmail.value,
      password: loginPassword.value,
    };
    try {
      const response = await axios.post("/api/user/login", requestBody);
      console.log(response.data);
      displayResponseMsg(loginMsg, "成功登入", "text-success");
      loginForm.reset();
      localStorage.setItem("token", response.data.data.token);
      window.location.href = "/user";
    } catch (error) {
      console.error(error);
      console.log(error.response.data.message);
      displayResponseMsg(loginMsg, error.response.data.message, "text-danger");
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
      console.log(response.data);
      displayResponseMsg(registerMsg, "成功註冊", "text-success");
      registerForm.reset();
      toggleLoginBtn.classList.remove("btn-secondary");
      toggleLoginBtn.classList.add("btn-success");
      loginEmail.value = requestBody.email;
      resetRegisterValidation();
      resetResponseMsg(loginMsg);
    } catch (error) {
      console.error(error);
      console.log(error.response.data.message);
      displayResponseMsg(
        registerMsg,
        error.response.data.message,
        "text-danger"
      );
    }
  } else {
    return;
  }
}

function displayResponseMsg(item, msg, className) {
  resetResponseMsg(item);
  item.textContent = msg;
  item.classList.add(className);
}

function resetResponseMsg(item) {
  item.textContent = null;
  item.classList.remove("text-danger", "text-success");
}
function resetInputValue() {
  registerUsername.value = null;
  registerEmail.value = null;
  registerPassword.value = null;
  loginEmail.value = null;
  loginPassword.value = null;
}
