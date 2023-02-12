import { navView } from "./navView.js";
import { fetchUser } from "./base.js";
let user;
init();
async function init() {
  if (localStorage.token) {
    const headers = { Authorization: localStorage.token };
    try {
      user = await fetchUser(headers);
      navView.user();
      console.log(user._id);
    } catch (error) {
      console.log(error);
      window.location.href = "/";
    }
  } else {
    window.location.href = "/";
  }
}
