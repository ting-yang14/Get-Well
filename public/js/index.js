import { navView } from "./navView.js";
import { fetchUser } from "./base.js";
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
toggleLoginBtn.addEventListener("click", resetResponseMsg.bind(null, loginMsg));
toggleRegisterBtn.addEventListener(
  "click",
  resetResponseMsg.bind(null, registerMsg)
);

async function init() {
  if (localStorage.token) {
    const headers = { Authorization: localStorage.token };
    try {
      user = await fetchUser(headers);
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
}

async function register() {
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
    resetResponseMsg(loginMsg);
  } catch (error) {
    console.error(error);
    console.log(error.response.data.message);
    displayResponseMsg(registerMsg, error.response.data.message, "text-danger");
  }
}

function displayResponseMsg(item, msg, className) {
  resetResponseMsg(item);
  item.innerText = msg;
  item.classList.add(className);
}

function resetResponseMsg(item) {
  item.innerText = null;
  item.classList.remove("text-danger", "text-success");
}
