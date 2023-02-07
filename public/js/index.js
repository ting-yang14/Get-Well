const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");

const registerMsg = document.getElementById("registerMsg");
const loginMsg = document.getElementById("loginMsg");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const toggleLogin = document.getElementById("toggleLogin");
const toggleRegister = document.getElementById("toggleRegister");
const registerUsername = document.getElementById("registerUsername");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

loginBtn.addEventListener("click", login);
registerBtn.addEventListener("click", register);
toggleLogin.addEventListener("click", resetResponseMsg.bind(null, loginMsg));
toggleRegister.addEventListener(
  "click",
  resetResponseMsg.bind(null, registerMsg)
);
async function login() {
  const requestBody = {
    email: loginEmail.value,
    password: loginPassword.value,
  };
  try {
    const response = await axios.post("/api/user/login", requestBody);
    console.log(response.data);
    if (response.data.success) {
      displayResponseMsg(loginMsg, "成功登入", "text-success");
      loginForm.reset();
    }
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
    if (response.data.success) {
      displayResponseMsg(registerMsg, "成功註冊", "text-success");
      registerForm.reset();
      toggleLogin.classList.remove("btn-secondary");
      toggleLogin.classList.add("btn-success");
      loginEmail.value = requestBody.email;
      resetResponseMsg(loginMsg);
    }
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
