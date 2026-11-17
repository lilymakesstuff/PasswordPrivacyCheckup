const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function respond(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.status(status).json(body);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

module.exports = async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const origin = req.headers.origin;

  let allowedOriginUrl;
  try {
    allowedOriginUrl = new URL(allowedOrigin).origin;
  } catch (error) {
    console.error("ALLOWED_ORIGIN is missing or invalid:", error);
    return respond(res, 500, { error: "Email invitations are not configured yet." });
  }

  if (origin !== allowedOriginUrl) {
    return respond(res, 403, { error: "This request is not allowed." });
  }

  res.setHeader("Access-Control-Allow-Origin", allowedOriginUrl);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.setHeader("Cache-Control", "no-store");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return respond(res, 405, { error: "Method not allowed." });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Password and Privacy Checkup";
  const siteUrl = process.env.SITE_URL;

  if (!apiKey || !senderEmail || !siteUrl) {
    console.error("Invitation email configuration is incomplete.");
    return respond(res, 500, { error: "Email invitations are not configured yet." });
  }

  let parsedSiteUrl;
  try {
    parsedSiteUrl = new URL(siteUrl);
  } catch (error) {
    console.error("SITE_URL is not a valid URL:", error);
    return respond(res, 500, { error: "Email invitations are not configured yet." });
  }

  if (parsedSiteUrl.protocol !== "https:") {
    console.error("SITE_URL must use HTTPS.");
    return respond(res, 500, { error: "Email invitations are not configured yet." });
  }

  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return respond(res, 400, { error: "Enter a valid email address." });
  }

  if (typeof body.website === "string" && body.website.trim()) {
    return respond(res, 400, { error: "The invitation could not be sent." });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return respond(res, 400, { error: "Enter a valid email address." });
  }

  const safeSiteUrl = escapeHtml(parsedSiteUrl.href);
  const emailPayload = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email }],
    subject: "You're invited to the Password and Privacy Checkup",
    textContent: `You have been invited to try the Password and Privacy Checkup. Open it here: ${parsedSiteUrl.href}\n\nIf you weren't expecting this invitation, you can ignore this email.`,
    htmlContent: `<p>You have been invited to try the Password and Privacy Checkup.</p><p><a href="${safeSiteUrl}">Open the checkup</a></p><p>If you weren't expecting this invitation, you can ignore this email.</p>`,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const brevoResponse = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(emailPayload),
      signal: controller.signal,
    });

    if (!brevoResponse.ok) {
      console.error("Brevo rejected the invitation email with status:", brevoResponse.status);
      return respond(res, 502, { error: "The invitation could not be sent. Please try again later." });
    }

    return respond(res, 200, { message: "Invitation sent." });
  } catch (error) {
    console.error("Brevo request failed:", error);
    return respond(res, 502, { error: "The invitation could not be sent. Please try again later." });
  } finally {
    clearTimeout(timeoutId);
  }
};
