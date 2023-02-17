import { navView } from "./navView.js";
import { fetchUser } from "./base.js";

const recordVideo = document.getElementById("recordVideo");
const startVideoTime = document.getElementById("startVideoTime");
const stopVideoTime = document.getElementById("stopVideoTime");
const exerciseName = document.getElementById("exerciseName");
const exerciseCounts = document.getElementById("exerciseCounts");
let user;
let record;

init();

async function init() {
  if (localStorage.token) {
    const headers = { Authorization: localStorage.token };
    try {
      user = await fetchUser(headers);
      navView.record();
      console.log(user._id);
      record = await getRecord();

      // default setup
      const exerciseRecord = await record.record.exerciseRecord;
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

async function getRecord() {
  const pathname = window.location.pathname;
  try {
    const response = await axios.get(`/api${pathname}`, {
      headers: { Authorization: localStorage.token },
    });
    return response.data;
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
