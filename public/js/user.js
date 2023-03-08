import { navView } from "./navView.js";
import { fetchUser } from "./base.js";
import { resetUpdateValidation, updateInputValidation } from "./validation.js";
// --- avatar ---
const avatar = document.getElementById("avatar");
const avatarUsername = document.getElementById("avatarUsername");
// input
const username = document.getElementById("username");
const email = document.getElementById("email");
const defaultGender = document.getElementById("defaultGender");
const genderSelector = document.getElementById("genderSelector");
const height = document.getElementById("height");
const weight = document.getElementById("weight");
username.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    updateUser();
  }
});
height.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    updateUser();
  }
});
weight.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    updateUser();
  }
});
// button
const avatarInput = document.getElementById("avatarInput");
const editUserBtn = document.getElementById("editUserBtn");
const updateUserBtn = document.getElementById("updateUserBtn");
avatarInput.addEventListener("change", previewAvatar);
editUserBtn.addEventListener("click", showInputColumn);
updateUserBtn.addEventListener("click", updateUser);

function previewAvatar() {
  const uploadedFile = avatarInput.files[0];
  const reader = new FileReader();
  const navImg = document.getElementById("navImg");
  reader.addEventListener(
    "load",
    function () {
      avatar.src = reader.result;
      navImg.src = reader.result;
    },
    false
  );
  if (uploadedFile) {
    reader.readAsDataURL(uploadedFile);
  }
}

function setDefaultUserInfo(userData) {
  const user = userData.user;
  if (userData.avatarUrl) {
    avatar.src = userData.avatarUrl;
  } else {
    avatarUsername.textContent = user.username;
    avatarUsername.classList.remove("d-none");
  }
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
  ["text-success", "text-danger"].forEach((className) => {
    if (updateUserBtn.classList.contains(className)) {
      updateUserBtn.classList.remove(className);
    }
  });
  updateUserBtn.innerHTML = "";
  updateUserBtn.classList.toggle("d-none");
  defaultGender.classList.toggle("d-none");
  genderSelector.classList.toggle("d-none");
  editToggle(username);
  editToggle(height);
  editToggle(weight);
  setUserChange();
  resetUpdateValidation();
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
  const genderSelected = document.querySelector(
    'input[name="genderRadios"]:checked'
  ).value;
  defaultGender.textContent = genderSelected;
  if (defaultGender.classList.contains("text-secondary")) {
    defaultGender.classList.add("text-light");
  }
  avatarUsername.textContent = username.value;
}

async function updateUser() {
  setUserChange();
  if (updateInputValidation()) {
    const genderSelected = document.querySelector(
      'input[name="genderRadios"]:checked'
    ).value;
    const requestBody = {
      username: username.value,
      gender: genderSelected,
      height: parseFloat(height.value),
      weight: parseFloat(weight.value),
    };
    try {
      if (avatarInput.files[0]) {
        const uploadedFile = avatarInput.files[0];
        const response = await axios.get("/api/s3");
        if (response.data.success) {
          await axios.put(response.data.data.url, uploadedFile);
          requestBody.avatarFileName = response.data.data.fileName;
        }
      }
      const patchResponse = await axios.patch(
        `/api/user/${user._id}`,
        requestBody,
        {
          headers: { Authorization: localStorage.token },
        }
      );
      if (patchResponse.data.success) {
        updateUserBtn.classList.add("text-success");
        updateUserBtn.innerHTML = `&nbsp;&nbsp;儲存成功`;
      } else {
        updateUserBtn.classList.add("text-danger");
        updateUserBtn.innerHTML = `&nbsp;&nbsp;儲存失敗`;
      }
    } catch (error) {
      console.log(error);
      updateUserBtn.classList.add("text-danger");
      updateUserBtn.innerHTML = `&nbsp;&nbsp;儲存失敗`;
    }
  } else {
    return;
  }
}
// --- avatar END---

// --- calendar ---
let date = new Date();
let currentYear = date.getFullYear();
let currentMonth = date.getMonth();
let nextPage;
let keyword;
const calendarTbody = document.getElementById("calendarTbody");
const year = document.getElementById("year");
const month = document.getElementById("month");
const monthList = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];
const searchInput = document.querySelector("input[type='search']");
searchInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    getSearchResult();
  }
});
// button
const prevMonthBtn = document.getElementById("prev");
const nextMonthBtn = document.getElementById("next");
const searchBtn = document.getElementById("searchBtn");
const loadMoreBtn = document.getElementById("loadMoreBtn");
prevMonthBtn.addEventListener("click", updateCalendar);
nextMonthBtn.addEventListener("click", updateCalendar);
searchBtn.addEventListener("click", getSearchResult);
loadMoreBtn.addEventListener("click", loadMoreRecord);
// recordBoard
const recordBoard = document.getElementById("recordBoard");
const recordResult = document.getElementById("recordResult");
const resultIcon = document.getElementById("resultIcon");
const resultText = document.getElementById("resultText");
const resultLink = document.getElementById("resultLink");
const recordBoardViewControl = {
  showDateRecord: function (recordList) {
    this.clearBoard();
    this.generateRecord(recordList);
  },
  showNoRecordToday: function () {
    resultIcon.classList.add("fa-person-circle-plus");
    resultText.textContent = "今日尚無紀錄";
    resultLink.classList.remove("d-none");
    recordResult.classList.remove("d-none");
  },
  showNoSearchResult: function () {
    this.clearBoard();
    if (resultIcon.classList.contains("fa-person-circle-plus")) {
      resultIcon.classList.remove("fa-person-circle-plus");
    }
    resultIcon.classList.add("fa-circle-exclamation");
    resultText.textContent = "查無相關紀錄";
    resultLink.classList.add("d-none");
    recordResult.classList.remove("d-none");
  },
  showSearchResult: function (recordList, nextPage) {
    this.clearBoard();
    this.generateRecord(recordList);
    if (nextPage !== null) {
      loadMoreBtn.classList.remove("d-none");
    } else {
      loadMoreBtn.classList.add("d-none");
    }
  },
  loadMore: function (recordList, nextPage) {
    this.generateRecord(recordList);
    if (nextPage !== null) {
      loadMoreBtn.classList.remove("d-none");
    } else {
      loadMoreBtn.classList.add("d-none");
    }
  },
  clearBoard: function () {
    recordResult.classList.add("d-none");
    loadMoreBtn.classList.add("d-none");
    this.removeExistedRecordCard();
  },
  generateRecord: function (recordList) {
    recordList.forEach((record) => {
      const card = this.generateCard(record);
      recordBoard.insertBefore(card, loadMoreBtn);
    });
  },
  removeExistedRecordCard: function () {
    const existedCards = document.querySelectorAll(".card");
    existedCards.forEach((card) => card.remove());
  },
  generateCard: function (record) {
    const card = document.createElement("div");
    card.classList.add("card", "text-dark", "my-2", "card-width");
    const cardHead = document.createElement("div");
    cardHead.classList.add("card-header", "text-end");
    cardHead.textContent = `${record.exerciseRecord.startTime.slice(0, 10)}`;
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    const cardTitleContainer = document.createElement("div");
    cardTitleContainer.classList.add(
      "d-flex",
      "flex-wrap",
      "justify-content-between",
      "align-items-center"
    );
    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = record.exerciseName;
    const cardSubtitle = document.createElement("h6");
    cardSubtitle.classList.add("text-muted");
    cardSubtitle.innerHTML = `完成<span>&nbsp;${record.exerciseCounts}&nbsp;</span>次`;
    cardTitleContainer.appendChild(cardTitle);
    cardTitleContainer.appendChild(cardSubtitle);
    const cardTimeContainer = document.createElement("div");
    cardTimeContainer.classList.add("row", "mb-2");
    const startTime = document.createElement("span");
    startTime.classList.add("card-text", "col-6", "col-md-12");
    startTime.innerHTML = `開始：${record.exerciseRecord.startTime.slice(
      11,
      19
    )}`;
    const endTime = document.createElement("span");
    endTime.classList.add("card-text", "col-6", "col-md-12");
    endTime.innerHTML = `結束：${record.exerciseRecord.endTime.slice(11, 19)}`;
    cardTimeContainer.appendChild(startTime);
    cardTimeContainer.appendChild(endTime);
    const cardLinkContainer = document.createElement("div");
    cardLinkContainer.classList.add("text-end");
    const cardLink = document.createElement("a");
    cardLink.classList.add("btn", "btn-primary", "fa-solid", "fa-file-pen");
    cardLink.href = `/record/${record._id}`;
    cardLink.innerHTML = `&nbsp;&nbsp;檢視紀錄`;
    cardLinkContainer.appendChild(cardLink);
    cardBody.appendChild(cardTitleContainer);
    cardBody.appendChild(cardTimeContainer);
    cardBody.appendChild(cardLinkContainer);
    card.appendChild(cardHead);
    card.appendChild(cardBody);
    return card;
  },
};

async function generateCalendar() {
  await generateCalendarView();
  addGetDateRecordFunction();
}

async function generateCalendarView() {
  year.textContent = currentYear;
  month.textContent = monthList[currentMonth];
  const hasRecordDate = await getHasRecordDate();
  const firstDayOfCurrentMonth = new Date(
    currentYear,
    currentMonth,
    1
  ).getDay();
  const lastDateOfCurrentMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();
  const lastDayOfCurrentMonth = new Date(
    currentYear,
    currentMonth,
    lastDateOfCurrentMonth
  ).getDay();
  const lastDateOfLastMonth = new Date(currentYear, currentMonth, 0).getDate();
  let calendarTbodyInnerHTML = "";
  let currentDay = 0;
  // last month date
  for (let i = firstDayOfCurrentMonth; i > 0; i--) {
    if (currentDay === 0) {
      calendarTbodyInnerHTML += `<tr>`;
    }
    calendarTbodyInnerHTML += `<td class="text-muted table-secondary">${
      lastDateOfLastMonth - i + 1
    }</td>`;
    currentDay += 1;
  }
  // current month date
  for (let i = 1; i <= lastDateOfCurrentMonth; i++) {
    if (currentDay === 0) {
      calendarTbodyInnerHTML += `<tr>`;
    }
    let isToday =
      i === date.getDate() &&
      currentMonth === new Date().getMonth() &&
      currentYear === new Date().getFullYear()
        ? "text-primary fw-bolder"
        : "";
    if (hasRecordDate.includes(i)) {
      const date = i < 10 ? `0${i}` : i;
      calendarTbodyInnerHTML += `<td class="${isToday} hasRecord" data-date=${date}><span class="recordDot"></span><div class="my-3">${i}</div></td>`;
    } else {
      calendarTbodyInnerHTML += `<td class="${isToday}"><div class="my-3">${i}</div></td>`;
    }
    currentDay += 1;
    if (currentDay === 7) {
      calendarTbodyInnerHTML += `</tr>`;
      currentDay = 0;
    }
  }
  // next month date
  for (let i = lastDayOfCurrentMonth; i < 6; i++) {
    calendarTbodyInnerHTML += `<td class="text-muted table-secondary">${
      i - lastDayOfCurrentMonth + 1
    }</td>`;
    currentDay += 1;
    if (currentDay === 7) {
      calendarTbodyInnerHTML += `</tr>`;
      currentDay = 0;
    }
  }
  calendarTbody.innerHTML = calendarTbodyInnerHTML;
}

function addGetDateRecordFunction() {
  const recordDate = document.querySelectorAll(".hasRecord");
  recordDate.forEach((date) => date.addEventListener("click", getDateRecord));
}

function checkTodayRecord() {
  const today = document.querySelector("td.text-primary");
  if (today.classList.contains("hasRecord")) {
    today.click();
  } else {
    recordBoardViewControl.showNoRecordToday();
  }
}

function updateCalendar() {
  currentMonth = this.id === "prev" ? currentMonth - 1 : currentMonth + 1;
  if (currentMonth < 0 || currentMonth > 11) {
    date = new Date(currentYear, currentMonth, new Date().getDate());
    currentYear = date.getFullYear();
    currentMonth = date.getMonth();
  } else {
    date = new Date();
  }
  generateCalendar();
}

async function getHasRecordDate() {
  try {
    const response = await axios.get(
      `/api/record?time=${currentYear}-${monthList[currentMonth]}`,
      {
        headers: { Authorization: localStorage.token },
      }
    );
    if (response.data.success) {
      const records = response.data.data.records;
      const hasRecordDate = [];
      records.forEach((record) =>
        hasRecordDate.push(
          parseInt(record.exerciseRecord.startTime.slice(8, 10))
        )
      );
      const uniqueHasRecordDate = [...new Set(hasRecordDate)];
      return uniqueHasRecordDate;
    }
  } catch (error) {
    console.log(error);
  }
}

async function getDateRecord() {
  try {
    const response = await axios.get(
      `/api/record?time=${currentYear}-${monthList[currentMonth]}-${this.dataset.date}`,
      {
        headers: { Authorization: localStorage.token },
      }
    );
    if (response.data.success) {
      const records = response.data.data.records;
      recordBoardViewControl.showDateRecord(records);
    }
  } catch (error) {
    console.log(error);
    recordBoardViewControl.showNoSearchResult();
  }
}

async function getSearchResult() {
  try {
    keyword = searchInput.value;
    const response = await axios.get(`/api/record?keyword=${keyword}&page=0`, {
      headers: { Authorization: localStorage.token },
    });
    if (response.data.success) {
      const records = response.data.data.records;
      if (records.length === 0) {
        recordBoardViewControl.showNoSearchResult();
      } else {
        nextPage = response.data.data.nextPage;
        recordBoardViewControl.showSearchResult(records, nextPage);
      }
    }
  } catch (error) {
    console.log(error);
    recordBoardViewControl.showNoSearchResult();
  }
}

async function loadMoreRecord() {
  try {
    const response = await axios.get(
      `/api/record?keyword=${keyword}&page=${nextPage}`,
      {
        headers: { Authorization: localStorage.token },
      }
    );
    if (response.data.success) {
      const records = response.data.data.records;
      nextPage = response.data.data.nextPage;
      recordBoardViewControl.loadMore(records, nextPage);
    }
  } catch (error) {
    console.log(error);
    recordBoardViewControl.showNoSearchResult();
  }
}
// --- calendar END ---

// page initial
let user;
async function init() {
  if (localStorage.token) {
    try {
      const userData = await fetchUser();
      user = userData.user;
      navView.login(userData.avatarUrl);
      setDefaultUserInfo(userData);
      await generateCalendar();
      checkTodayRecord();
    } catch (error) {
      console.log(error);
      window.location.href = "/";
    }
  } else {
    window.location.href = "/";
  }
}

init();
