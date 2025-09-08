import { WEBHOOK_URL } from "@src/config/environmentVariables";

export async function sendWebhook(payload: unknown) {
  if (!WEBHOOK_URL) {
    console.warn("WEBHOOK_URL environment variable is missing");
    return;
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Webhook failed:", err);
  }
}
