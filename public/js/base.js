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
  const now = new Date();
  const day = now.toISOString().slice(0, 10).replaceAll("-", "/");
  const time = now.toTimeString().slice(0, 8);
  return `${day} ${time}`;
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
