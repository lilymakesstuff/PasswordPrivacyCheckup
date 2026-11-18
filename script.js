const welcomeCard = document.querySelector("#welcome-card");
const beginButton = document.querySelector("#begin-button");
const checkup = document.querySelector("#checkup");
const checkupTitle = document.querySelector("#checkup-title");
const completionCard = document.querySelector("#completion-card");
const taskCheckboxes = [...document.querySelectorAll(".task-checkbox")];

beginButton.addEventListener("click", () => {
  welcomeCard.hidden = true;
  checkup.hidden = false;
  checkupTitle.focus();
});

taskCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (taskCheckboxes.every((task) => task.checked)) {
      completionCard.showModal();
    }
  });
});