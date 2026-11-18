const welcomeCard = document.querySelector("#welcome-card");
const beginButton = document.querySelector("#begin-button");
const checkup = document.querySelector("#checkup");
const completionCard = document.querySelector("#completion-card");
const taskSections = [...document.querySelectorAll(".task-section")];
const backButton = document.querySelector("#back-button");
const okayButton = document.querySelector("#okay-button");
const nextSectionButton = document.querySelector("#next-section-button");
const qrForm = document.querySelector("#qr-form");
const qrUrlInput = document.querySelector("#qr-url");
const qrContainer = document.querySelector("#qr-container");
const qrResult = document.querySelector("#qr-result");
const qrStatus = document.querySelector("#qr-status");
let qrObjectUrl = "";
let currentSectionIndex = 0;
let showingTasks = false;

function renderCurrentSection() {
  taskSections.forEach((section, index) => {
    const isCurrentSection = index === currentSectionIndex;
    section.hidden = !isCurrentSection;
    section.querySelector(".section-content").hidden = !isCurrentSection || !showingTasks;
  });

  backButton.hidden = !showingTasks && currentSectionIndex === 0;
  okayButton.hidden = showingTasks;
  nextSectionButton.hidden = !showingTasks;
}

function focusCurrentSectionHeading() {
  taskSections[currentSectionIndex].querySelector("h2").focus();
}

beginButton.addEventListener("click", () => {
  welcomeCard.hidden = true;
  checkup.hidden = false;
  currentSectionIndex = 0;
  showingTasks = false;
  renderCurrentSection();
  focusCurrentSectionHeading();
});

okayButton.addEventListener("click", () => {
  showingTasks = true;
  renderCurrentSection();
  taskSections[currentSectionIndex].querySelector(".task-checkbox").focus();
});

backButton.addEventListener("click", () => {
  if (showingTasks) {
    showingTasks = false;
    renderCurrentSection();
    focusCurrentSectionHeading();
    return;
  }

  if (currentSectionIndex === 0) {
    checkup.hidden = true;
    welcomeCard.hidden = false;
    beginButton.focus();
    return;
  }

  currentSectionIndex -= 1;
  showingTasks = true;
  renderCurrentSection();
  taskSections[currentSectionIndex].querySelector(".task-checkbox").focus();
});

nextSectionButton.addEventListener("click", () => {
  if (currentSectionIndex === taskSections.length - 1) {
    completionCard.showModal();
    return;
  }

  currentSectionIndex += 1;
  showingTasks = false;
  renderCurrentSection();
  focusCurrentSectionHeading();
});

qrForm.addEventListener("submit", (event) => {
  event.preventDefault();
  qrStatus.textContent = "";
  qrStatus.dataset.state = "";
  qrResult.hidden = true;
  qrContainer.replaceChildren();

  if (qrObjectUrl) {
    URL.revokeObjectURL(qrObjectUrl);
    qrObjectUrl = "";
  }

  if (typeof window.qrcode !== "function") {
    qrStatus.textContent = "The QR code generator could not be loaded. Please try again later.";
    qrStatus.dataset.state = "error";
    return;
  }

  try {
    const targetUrl = new URL(qrUrlInput.value.trim());
    if (targetUrl.protocol !== "https:" && targetUrl.protocol !== "http:") {
      qrStatus.textContent = "Enter a link that starts with http:// or https://.";
      qrStatus.dataset.state = "error";
      return;
    }

    const qrCode = window.qrcode(0, "M");
    qrCode.addData(targetUrl.href);
    qrCode.make();

    const svgBlob = new Blob([qrCode.createSvgTag(5, 4)], { type: "image/svg+xml" });
    qrObjectUrl = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.alt = `QR code for ${targetUrl.hostname}`;
    image.src = qrObjectUrl;
    qrContainer.append(image);
    qrResult.hidden = false;
    qrStatus.textContent = `QR code generated for ${targetUrl.hostname}.`;
  } catch (error) {
    console.error("Could not generate the QR code:", error);
    qrStatus.textContent = "Could not generate a QR code for that link. Check the URL and try again.";
    qrStatus.dataset.state = "error";
  }
});