const welcomeCard = document.querySelector("#welcome-card");
const beginButton = document.querySelector("#begin-button");
const checkup = document.querySelector("#checkup");
const checkupTitle = document.querySelector("#checkup-title");
const completionCard = document.querySelector("#completion-card");
const taskCheckboxes = [...document.querySelectorAll(".task-checkbox")];
const qrForm = document.querySelector("#qr-form");
const qrUrlInput = document.querySelector("#qr-url");
const qrContainer = document.querySelector("#qr-container");
const qrResult = document.querySelector("#qr-result");
const qrStatus = document.querySelector("#qr-status");
let qrObjectUrl = "";

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