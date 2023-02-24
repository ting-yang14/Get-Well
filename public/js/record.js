import { navView } from "./navView.js";
import { fetchUser } from "./base.js";

const recordVideo = document.getElementById("recordVideo");
const startVideoTime = document.getElementById("startVideoTime");
const stopVideoTime = document.getElementById("stopVideoTime");
const exerciseName = document.getElementById("exerciseName");
const exerciseCounts = document.getElementById("exerciseCounts");
const currentPathname = window.location.pathname;
const editRecordBtn = document.getElementById("editRecordBtn");
const saveRecordBtn = document.getElementById("saveRecordBtn");
const deleteRecordBtn = document.getElementById("deleteRecordBtn");
let user;
let record;
let countDownNum = 3;

editRecordBtn.addEventListener("click", editToggle);
saveRecordBtn.addEventListener("click", saveRecord);
deleteRecordBtn.addEventListener("click", deleteRecord);

function editToggle() {
  if (saveRecordBtn.classList.contains("btn-warning")) {
    saveRecordBtn.classList.remove("text-danger");
    saveRecordBtn.classList.replace("btn-warning", "btn-primary");
  }
  if (saveRecordBtn.classList.contains("btn-success")) {
    saveRecordBtn.classList.replace("btn-success", "btn-primary");
  }
  saveRecordBtn.textContent = "儲存修改";
  saveRecordBtn.classList.toggle("d-none");
  if (exerciseName.readOnly && exerciseCounts.readOnly) {
    exerciseName.readOnly = false;
    exerciseCounts.readOnly = false;
  } else {
    exerciseName.readOnly = true;
    exerciseCounts.readOnly = true;
  }
}

async function saveRecord() {
  const requestBody = {
    exerciseName: exerciseName.value,
    exerciseCounts: exerciseCounts.value,
  };
  try {
    const patchResponse = await axios.patch(
      `/api${currentPathname}`,
      requestBody,
      {
        headers: { Authorization: localStorage.token },
      }
    );
    console.log(patchResponse);
    if (patchResponse.data.success) {
      saveRecordBtn.classList.replace("btn-primary", "btn-success");
      saveRecordBtn.textContent = "儲存成功";
    } else {
      saveRecordBtn.classList.replace("btn-primary", "btn-warning");
      saveRecordBtn.classList.add("text-danger");
      saveRecordBtn.textContent = "儲存失敗";
    }
  } catch (error) {
    console.log(error);
    saveRecordBtn.classList.replace("btn-primary", "btn-warning");
    saveRecordBtn.classList.add("text-danger");
    saveRecordBtn.textContent = "儲存失敗";
  }
}

function alert(message, type) {
  const deleteResponseAlert = document.getElementById("deleteResponseAlert");
  const alertContent = document.createElement("div");
  alertContent.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
  deleteResponseAlert.appendChild(alertContent);
}

function countDown() {
  document.getElementById("countDownTime").textContent = `${countDownNum}...`;
  countDownNum -= 1;
  if (countDownNum == 0) {
    location.href = "/user";
  }
  setTimeout(countDown, 1000);
}

async function deleteRecord() {
  try {
    const deleteResponse = await axios.delete(`/api${currentPathname}`, {
      headers: { Authorization: localStorage.token },
    });
    console.log(deleteResponse);
    if (deleteResponse.data.success) {
      alert("紀錄刪除成功，本頁面將於3秒後前往我的紀錄", "success");
      countDown();
    } else {
      alert("紀錄刪除失敗", "danger");
    }
  } catch (error) {
    console.log(error);
    alert("紀錄刪除失敗", "danger");
  }
}

async function getRecord() {
  try {
    const response = await axios.get(`/api${currentPathname}`, {
      headers: { Authorization: localStorage.token },
    });
    console.log(response.data);
    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error(error);
  }
}

function generateAccChart(exerciseRecord) {
  const accChart = document.getElementById("accChart");
  const accData = {
    labels: generateLabels(exerciseRecord.data.length),
    datasets: [
      {
        label: "X axis",
        data: exerciseRecord.data.map((row) => row.acc_X),
        pointStyle: false,
        cubicInterpolationMode: "monotone",
        tension: 0.4,
      },
      {
        label: "Y axis",
        data: exerciseRecord.data.map((row) => row.acc_Y),
        pointStyle: false,
        cubicInterpolationMode: "monotone",
        tension: 0.4,
      },
      {
        label: "Z axis",
        data: exerciseRecord.data.map((row) => row.acc_Z),
        pointStyle: false,
        cubicInterpolationMode: "monotone",
        tension: 0.4,
      },
    ],
  };
  const accConfig = {
    type: "line",
    data: accData,
    options: {
      responsive: true,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          usePointStyle: true,
          callbacks: {
            labelPointStyle: function (context) {
              return {
                pointStyle: "circle",
                rotation: 0,
              };
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "second",
            color: "#f8f9fa",
            font: {
              size: 14,
              lineHeight: 1.2,
            },
          },
          grid: {
            display: false,
          },
          ticks: {
            callback: function (value, index, values) {
              if (index % 30 === 0) {
                return accData.labels[index];
              }
            },
            color: "#dee2e6",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "m/s2",
            color: "#f8f9fa",
            font: {
              size: 14,
              lineHeight: 1.2,
            },
          },
          grid: {
            color: "#ced4da",
          },
          ticks: {
            color: "#dee2e6",
          },
        },
      },
    },
  };
  new Chart(accChart, accConfig);
}

function generateOriChart(exerciseRecord) {
  const oriChart = document.getElementById("oriChart");
  const oriData = {
    labels: generateLabels(exerciseRecord.data.length),
    datasets: [
      {
        label: "alpha",
        data: exerciseRecord.data.map((row) => row.ori_alpha),
        pointStyle: false,
        cubicInterpolationMode: "monotone",
        tension: 0.4,
        // borderColor: "red",
        // backgroundColor: "red",
      },
      {
        label: "beta",
        data: exerciseRecord.data.map((row) => row.ori_beta),
        pointStyle: false,
        cubicInterpolationMode: "monotone",
        tension: 0.4,
      },
      {
        label: "gamma",
        data: exerciseRecord.data.map((row) => row.ori_gamma),
        pointStyle: false,
        cubicInterpolationMode: "monotone",
        tension: 0.4,
      },
    ],
  };
  const oriConfig = {
    type: "line",
    data: oriData,
    options: {
      responsive: true,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          usePointStyle: true,
          callbacks: {
            labelPointStyle: function (context) {
              return {
                pointStyle: "circle",
                rotation: 0,
              };
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "second",
            color: "#f8f9fa",
            font: {
              size: 14,
              lineHeight: 1.2,
            },
          },
          grid: {
            display: false,
          },
          ticks: {
            callback: function (value, index, values) {
              if (index % 30 === 0) {
                return oriData.labels[index];
              }
            },
            color: "#dee2e6",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "deg",
            color: "#f8f9fa",
            font: {
              size: 14,
              lineHeight: 1.2,
            },
          },
          grid: {
            color: "#ced4da",
          },
          ticks: {
            color: "#dee2e6",
          },
        },
      },
    },
  };
  new Chart(oriChart, oriConfig);
}

function generateLabels(length) {
  let labels = [];
  for (let i = 0; i < length; i++) {
    if (i % 30 === 0) {
      if ((i / 30) % 60 < 10) {
        labels.push(`${Math.floor(i / 1800)}:0${(i / 30) % 60}`);
      } else {
        labels.push(`${Math.floor(i / 1800)}:${(i / 30) % 60}`);
      }
    } else {
      labels.push("");
    }
  }
  return labels;
}

async function init() {
  if (localStorage.token) {
    const headers = { Authorization: localStorage.token };
    try {
      const userData = await fetchUser(headers);
      user = userData.user;
      navView.record();
      console.log(user._id);
      record = await getRecord();

      // default setup
      const exerciseRecord = record.record.exerciseRecord;
      recordVideo.src = record.recordUrl;
      startVideoTime.textContent = `開始時間：${exerciseRecord.startTime}`;
      stopVideoTime.textContent = `結束時間：${exerciseRecord.endTime}`;
      exerciseName.value = record.record.exerciseName;
      exerciseCounts.value = record.record.exerciseCounts;

      // chart
      generateAccChart(exerciseRecord);
      generateOriChart(exerciseRecord);
    } catch (error) {
      console.log(error);
      window.location.href = "/";
    }
  } else {
    window.location.href = "/";
  }
}

init();
