import { navView } from "./navView.js";
import { fetchUser } from "./base.js";
// input
const avatar = document.getElementById("avatar");
const username = document.getElementById("username");
const email = document.getElementById("email");
const defaultGender = document.getElementById("defaultGender");
const genderSelector = document.getElementById("genderSelector");
const height = document.getElementById("height");
const weight = document.getElementById("weight");

// button
const avatarInput = document.getElementById("avatarInput");
const editUserBtn = document.getElementById("editUserBtn");
const updateUserBtn = document.getElementById("updateUserBtn");
avatarInput.addEventListener("change", previewAvatar);
editUserBtn.addEventListener("click", showInputColumn);
updateUserBtn.addEventListener("click", updateUser);

let user;
// load page
init();

async function init() {
  if (localStorage.token) {
    const headers = { Authorization: localStorage.token };
    try {
      const userData = await fetchUser(headers);
      user = userData.user;
      if (userData.avatarUrl === null) {
        generateDefaultAvatar(user);
      } else {
        avatar.src = userData.avatarUrl;
      }
      navView.user();
      console.log(user);
      console.log(user._id);
      setDefaultUserInfo(user);
    } catch (error) {
      console.log(error);
      window.location.href = "/";
    }
  } else {
    window.location.href = "/";
  }
}

// avatar preview
function previewAvatar() {
  const uploadedFile = avatarInput.files[0];
  const reader = new FileReader();
  reader.addEventListener(
    "load",
    function () {
      avatar.src = reader.result;
    },
    false
  );
  if (uploadedFile) {
    reader.readAsDataURL(uploadedFile);
  }
}

function setDefaultUserInfo(user) {
  username.value = user.username;
  email.value = user.email;
  if (user.gender) {
    defaultGender.textContent = user.gender;
    defaultGender.classList.remove("text-secondary");
    defaultGender.classList.add("text-light");
    const selectedRadio = document.querySelector(`input[value=${user.gender}]`);
    selectedRadio.checked = true;
  }
  if (user.height) {
    height.value = user.height;
  }
  if (user.weight) {
    weight.value = user.weight;
  }
}

function showInputColumn() {
  // 顯示儲存按鈕
  updateUserBtn.classList.toggle("d-none");
  // 重複點擊，顯示已更新內容
  setUserChange();
}

function editToggle(element) {
  if (element.readOnly) {
    element.readOnly = false;
  } else {
    element.readOnly = true;
  }
  element.classList.toggle("form-control-plaintext");
  element.classList.toggle("text-light");
  element.classList.toggle("form-control");
}

function setUserChange() {
  // 顯示選取的性別，隱藏選項
  const genderSelected = document.querySelector(
    'input[name="genderRadios"]:checked'
  ).value;
  defaultGender.textContent = genderSelected;
  if (defaultGender.classList.contains("text-secondary")) {
    defaultGender.classList.add("text-light");
  }
  defaultGender.classList.toggle("d-none");
  genderSelector.classList.toggle("d-none");
  // 恢復readonly 身高體重
  editToggle(username);
  editToggle(height);
  editToggle(weight);
}

async function updateUser() {
  // 顯示紀錄
  setUserChange();
  // 上傳新 user data
  try {
    const requestBody = {};
    const genderSelected = document.querySelector(
      'input[name="genderRadios"]:checked'
    ).value;
    // 若有更新大頭貼，先上傳得到檔名
    if (avatarInput.files[0]) {
      const uploadedFile = avatarInput.files[0];
      // 獲得 putObjectSignedUrl
      const response = await axios.get("/api/record/s3Url");
      console.log(response.data);
      // put file to S3
      const s3response = await axios.put(response.data.url, uploadedFile);
      console.log(s3response);
      // add fileName to requestBody
      requestBody.avatarFileName = response.data.fileName;
    }
    // 取得 user data
    if (username.value) {
      requestBody.username = username.value;
    }
    if (genderSelected) {
      requestBody.gender = genderSelected;
    }
    if (height.value) {
      requestBody.height = height.value;
    }
    if (weight.value) {
      requestBody.weight = weight.value;
    }
    // patch user data
    const patchResponse = await axios.patch(
      `/api/user/${user._id}`,
      requestBody,
      {
        headers: { Authorization: localStorage.token },
      }
    );
    console.log(patchResponse);
    if (patchResponse.data.success) {
      updateUserBtn.classList.add("text-success");
      updateUserBtn.textContent = ` 儲存成功 `;
    } else {
      updateUserBtn.classList.add("text-danger");
      updateUserBtn.textContent = ` 儲存失敗 `;
    }
  } catch (error) {
    console.log(error);
    updateUserBtn.classList.add("text-danger");
    updateUserBtn.textContent = ` 儲存失敗 `;
  }
}

// default avatar function
function generateDefaultAvatar(user) {
  // set background
  avatar.style.backgroundColor = generateAvatarBackgroundColor(user.username);
  // set username
  const avatarP = document.createElement("p");
  const pContent = document.createTextNode(user.username);
  const classToAdd = [
    "position-absolute",
    "top-50",
    "start-50",
    "translate-middle",
    "fs-1",
    "fw-bolder",
  ];
  const uploadLabel = document.getElementById("uploadLabel");
  avatarP.appendChild(pContent);
  avatarP.classList.add(...classToAdd);
  uploadLabel.insertAdjacentElement("beforebegin", avatarP);
}

function generateAvatarBackgroundColor(username) {
  const charCodeRed = Math.pow(username.charCodeAt(0), 7) % 200;
  const charCodeGreen =
    Math.pow(username.charCodeAt(1), 7) % 200 || charCodeRed;
  const charCodeBlue =
    Math.pow(username.charCodeAt(2), 7) % 200 ||
    (charCodeGreen + charCodeRed) % 200;
  const backgroundColor = `rgb(${charCodeRed}, ${charCodeGreen}, ${charCodeBlue})`;
  return backgroundColor;
}
