const exerciseNameValidation = document.getElementById(
  "exerciseNameValidation"
);
const exerciseCountsValidation = document.getElementById(
  "exerciseCountsValidation"
);
const inputClassName = ["is-valid", "is-invalid"];
const tooltipClassName = ["valid-tooltip", "invalid-tooltip"];

export function resetExerciseValidation() {
  // reset
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
  //validate
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
