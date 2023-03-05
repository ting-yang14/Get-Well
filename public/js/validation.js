// index page
const registerUsernameValidation = document.getElementById(
  "registerUsernameValidation"
);
const registerEmailValidation = document.getElementById(
  "registerEmailValidation"
);
const registerPasswordValidation = document.getElementById(
  "registerPasswordValidation"
);
const loginEmailValidation = document.getElementById("loginEmailValidation");
const loginPasswordValidation = document.getElementById(
  "loginPasswordValidation"
);
const usernameRegex = /^[\u4E00-\u9FFFa-zA-Z0-9]{1,8}$/;
const emailRegex = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/;
const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export function resetRegisterValidation() {
  registerUsernameValidation.classList = [];
  registerEmailValidation.classList = [];
  registerPasswordValidation.classList = [];
  registerUsernameValidation.textContent = "";
  registerEmailValidation.textContent = "";
  registerPasswordValidation.textContent = "";
  inputClassName.forEach((className) => {
    if (registerUsername.classList.contains(className)) {
      registerUsername.classList.remove(className);
    }
    if (registerEmail.classList.contains(className)) {
      registerEmail.classList.remove(className);
    }
    if (registerPassword.classList.contains(className)) {
      registerPassword.classList.remove(className);
    }
  });
}

export function resetLoginValidation() {
  loginEmailValidation.classList = [];
  loginPasswordValidation.classList = [];
  loginEmailValidation.textContent = "";
  loginPasswordValidation.textContent = "";
  inputClassName.forEach((className) => {
    if (loginEmail.classList.contains(className)) {
      loginEmail.classList.remove(className);
    }
    if (loginPassword.classList.contains(className)) {
      loginPassword.classList.remove(className);
    }
  });
}

export function registerInputValidation() {
  resetRegisterValidation();
  const registerUsernameValue = registerUsername.value;
  const registerEmailValue = registerEmail.value;
  const registerPasswordValue = registerPassword.value;
  const isRegisterUsernameValid = usernameRegex.test(registerUsernameValue);
  const isRegisterEmailValid = emailRegex.test(registerEmailValue);
  const isRegisterPasswordValid = passwordRegex.test(registerPasswordValue);

  if (isRegisterUsernameValid) {
    registerUsername.classList.add(inputClassName[0]);
    registerUsernameValidation.classList.add(tooltipClassName[0]);
    registerUsernameValidation.textContent = "格式正確";
  } else {
    registerUsername.classList.add(inputClassName[1]);
    registerUsernameValidation.classList.add(tooltipClassName[1]);
    registerUsernameValidation.textContent =
      "請輸入一至八字元的數字、中英文字母組合";
  }

  if (isRegisterEmailValid) {
    registerEmail.classList.add(inputClassName[0]);
    registerEmailValidation.classList.add(tooltipClassName[0]);
    registerEmailValidation.textContent = "格式正確";
  } else {
    registerEmail.classList.add(inputClassName[1]);
    registerEmailValidation.classList.add(tooltipClassName[1]);
    registerEmailValidation.textContent = "請輸入正確信箱格式";
  }

  if (isRegisterPasswordValid) {
    registerPassword.classList.add(inputClassName[0]);
    registerPasswordValidation.classList.add(tooltipClassName[0]);
    registerPasswordValidation.textContent = "格式正確";
  } else {
    registerPassword.classList.add(inputClassName[1]);
    registerPasswordValidation.classList.add(tooltipClassName[1]);
    registerPasswordValidation.textContent =
      "請輸入含有數字、英文字母和標點符號（如！和＆）的密碼組合，且至少由六個字元組成";
  }

  if (
    isRegisterUsernameValid &&
    isRegisterEmailValid &&
    isRegisterPasswordValid
  ) {
    return true;
  } else {
    return false;
  }
}

export function loginInputValidation() {
  resetLoginValidation();
  const loginEmailValue = loginEmail.value;
  const loginPasswordValue = loginPassword.value;
  const isLoginEmailValid = emailRegex.test(loginEmailValue);
  const isLoginPasswordValid = passwordRegex.test(loginPasswordValue);

  if (isLoginEmailValid) {
    loginEmail.classList.add(inputClassName[0]);
    loginEmailValidation.classList.add(tooltipClassName[0]);
    loginEmailValidation.textContent = "格式正確";
  } else {
    loginEmail.classList.add(inputClassName[1]);
    loginEmailValidation.classList.add(tooltipClassName[1]);
    loginEmailValidation.textContent = "請輸入正確信箱格式";
  }

  if (isLoginPasswordValid) {
    loginPassword.classList.add(inputClassName[0]);
    loginPasswordValidation.classList.add(tooltipClassName[0]);
    loginPasswordValidation.textContent = "格式正確";
  } else {
    loginPassword.classList.add(inputClassName[1]);
    loginPasswordValidation.classList.add(tooltipClassName[1]);
    loginPasswordValidation.textContent =
      "請輸入含有數字、英文字母和標點符號（如！和＆）的密碼組合，且至少由六個字元組成";
  }

  if (isLoginEmailValid && isLoginPasswordValid) {
    return true;
  } else {
    return false;
  }
}

// user page
const updateUsernameValidation = document.getElementById(
  "updateUsernameValidation"
);
const updateHeightValidation = document.getElementById(
  "updateHeightValidation"
);
const updateWeightValidation = document.getElementById(
  "updateWeightValidation"
);

export function resetUpdateValidation() {
  updateUsernameValidation.classList = [];
  updateHeightValidation.classList = [];
  updateWeightValidation.classList = [];
  updateUsernameValidation.textContent = "";
  updateHeightValidation.textContent = "";
  updateWeightValidation.textContent = "";
  inputClassName.forEach((className) => {
    if (username.classList.contains(className)) {
      username.classList.remove(className);
    }
    if (height.classList.contains(className)) {
      height.classList.remove(className);
    }
    if (weight.classList.contains(className)) {
      weight.classList.remove(className);
    }
  });
}
export function updateInputValidation() {
  resetUpdateValidation();
  const usernameValue = username.value;
  const heightValue = parseFloat(height.value);
  const weightValue = parseFloat(weight.value);
  const isUsernameValid = usernameRegex.test(usernameValue);
  let isHeightValid;
  let isWeightValid;

  if (isUsernameValid) {
    username.classList.add(inputClassName[0]);
    updateUsernameValidation.classList.add(tooltipClassName[0]);
    updateUsernameValidation.textContent = "格式正確";
  } else {
    username.classList.add(inputClassName[1]);
    updateUsernameValidation.classList.add(tooltipClassName[1]);
    updateUsernameValidation.textContent =
      "請輸入一至八字元的數字、中英文字母組合";
  }

  if (heightValue > 80 && heightValue < 200) {
    height.classList.add(inputClassName[0]);
    updateHeightValidation.classList.add(tooltipClassName[0]);
    updateHeightValidation.textContent = "格式正確";
    isHeightValid = true;
  } else {
    height.classList.add(inputClassName[1]);
    updateHeightValidation.classList.add(tooltipClassName[1]);
    updateHeightValidation.textContent = "請輸入介於80~200公分";
    isHeightValid = false;
  }
  if (weightValue > 30 && weightValue < 200) {
    weight.classList.add(inputClassName[0]);
    updateWeightValidation.classList.add(tooltipClassName[0]);
    updateWeightValidation.textContent = "格式正確";
    isWeightValid = true;
  } else {
    weight.classList.add(inputClassName[1]);
    updateWeightValidation.classList.add(tooltipClassName[1]);
    updateWeightValidation.textContent = "請輸入介於30~200公斤";
    isWeightValid = false;
  }

  if (isUsernameValid && isHeightValid && isWeightValid) {
    return true;
  } else {
    return false;
  }
}

// record, recording page
const exerciseNameValidation = document.getElementById(
  "exerciseNameValidation"
);
const exerciseCountsValidation = document.getElementById(
  "exerciseCountsValidation"
);
const inputClassName = ["is-valid", "is-invalid"];
const tooltipClassName = ["valid-tooltip", "invalid-tooltip"];

export function resetExerciseValidation() {
  exerciseNameValidation.classList = [];
  exerciseCountsValidation.classList = [];
  exerciseNameValidation.textContent = "";
  exerciseCountsValidation.textContent = "";
  inputClassName.forEach((className) => {
    if (exerciseName.classList.contains(className)) {
      exerciseName.classList.remove(className);
    }
    if (exerciseCounts.classList.contains(className)) {
      exerciseCounts.classList.remove(className);
    }
  });
}

export function exerciseInputValidation() {
  let isExerciseNameValid;
  let isExerciseCountsValid;
  resetExerciseValidation();
  const exerciseNameValue = exerciseName.value;
  const exerciseCountsValue = Number(exerciseCounts.value);

  if (exerciseNameValue.trim().length !== 0) {
    exerciseName.classList.add(inputClassName[0]);
    exerciseNameValidation.classList.add(tooltipClassName[0]);
    exerciseNameValidation.textContent = "格式正確";
    isExerciseNameValid = true;
  } else {
    exerciseName.classList.add(inputClassName[1]);
    exerciseNameValidation.classList.add(tooltipClassName[1]);
    exerciseNameValidation.textContent = "請填入動作名稱";
    isExerciseNameValid = false;
  }

  if (Number.isInteger(exerciseCountsValue) && exerciseCountsValue > 0) {
    exerciseCounts.classList.add(inputClassName[0]);
    exerciseCountsValidation.classList.add(tooltipClassName[0]);
    exerciseCountsValidation.textContent = "格式正確";
    isExerciseCountsValid = true;
  } else {
    exerciseCounts.classList.add(inputClassName[1]);
    exerciseCountsValidation.classList.add(tooltipClassName[1]);
    exerciseCountsValidation.textContent = "請填入正整數";
    isExerciseCountsValid = false;
  }

  if (isExerciseNameValid && isExerciseCountsValid) {
    return true;
  } else {
    return false;
  }
}
