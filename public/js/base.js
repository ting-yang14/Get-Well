export async function fetchUser(headers) {
  try {
    const response = await axios.get("/api/user/me", { headers: headers });
    const userData = response.data.data;
    return userData;
  } catch (error) {
    console.log(error);
  }
}

export function getCurrentTime() {
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
  const now = new Date();
  const year = now.getFullYear();
  const month = monthList[now.getMonth()];
  const date = now.getDate() < 10 ? `0${now.getDate()}` : now.getDate();
  const today = `${year}-${month}-${date}`;
  const time = now.toTimeString().slice(0, 8);
  return `${today} ${time}`;
}

export function raiseAlert(result, message) {
  let type;
  if (result === true) {
    type = "success";
  } else {
    type = "danger";
  }
  const innerHTMLContent = `<div class="alert alert-${type} alert-dismissible" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;

  return innerHTMLContent;
}
