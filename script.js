const welcomeCard = document.querySelector("#welcome-card");
const beginButton = document.querySelector("#begin-button");
const checkup = document.querySelector("#checkup");
const checkupTitle = document.querySelector("#checkup-title");
const completionCard = document.querySelector("#completion-card");
const taskCheckboxes = [...document.querySelectorAll(".task-checkbox")];
const inviteForm = document.querySelector("#invite-form");
const inviteEmail = document.querySelector("#invite-email");
const inviteWebsite = document.querySelector("#invite-website");
const inviteButton = document.querySelector("#invite-button");
const inviteStatus = document.querySelector("#invite-status");
const INVITE_API_URL = "https://YOUR-VERCEL-DEPLOYMENT.vercel.app/api/send-invite";

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

inviteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  inviteStatus.textContent = "";
  inviteStatus.dataset.state = "";

  if (INVITE_API_URL.includes("YOUR-VERCEL-DEPLOYMENT")) {
    inviteStatus.textContent = "Email invites are not connected yet. Add your Vercel function URL in script.js.";
    inviteStatus.dataset.state = "error";
    return;
  }

  inviteButton.disabled = true;
  inviteButton.textContent = "Sending…";
  inviteStatus.textContent = "Sending invitation…";

  try {
    const response = await fetch(INVITE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail.value.trim(),
        website: inviteWebsite.value,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "The invitation could not be sent. Please try again.");
    }

    inviteForm.reset();
    inviteStatus.textContent = "Invitation sent.";
  } catch (error) {
    console.error("Could not send invitation:", error);
    inviteStatus.textContent = error.message || "The invitation could not be sent. Please try again.";
    inviteStatus.dataset.state = "error";
  } finally {
    inviteButton.disabled = false;
    inviteButton.textContent = "Send invite";
  }
});