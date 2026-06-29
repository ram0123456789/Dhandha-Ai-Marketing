import { logger } from "./logger";

const PIXAZO_API_KEY = process.env.PIXAZO_API_KEY;
const BASE_URL = "https://gateway.pixazo.ai";

export async function generateImageJob(prompt: string): Promise<{ requestId: string; status: string }> {
  if (!PIXAZO_API_KEY) {
    throw new Error("PIXAZO_API_KEY is not set");
  }

  const url = `${BASE_URL}/gpt-image-2-text-to-image/v1/gpt-image-2-text-to-image/generate`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Ocp-Apim-Subscription-Key": PIXAZO_API_KEY,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const text = await response.text();
    logger.error({ status: response.status, body: text }, "Pixazo image generation failed");
    throw new Error(`Pixazo API error: ${response.status}`);
  }

  const data = await response.json() as { request_id?: string; status?: string; requestId?: string };
  const requestId = data.request_id ?? data.requestId ?? "";
  const status = data.status ?? "QUEUED";

  return { requestId, status };
}

export async function pollImageStatus(requestId: string): Promise<{ requestId: string; status: string; imageUrl: string | null; error: string | null }> {
  if (!PIXAZO_API_KEY) {
    throw new Error("PIXAZO_API_KEY is not set");
  }

  const url = `${BASE_URL}/v2/requests/status/${requestId}`;
  const response = await fetch(url, {
    headers: {
      "Ocp-Apim-Subscription-Key": PIXAZO_API_KEY,
    },
  });

  if (!response.ok) {
    logger.error({ status: response.status, requestId }, "Pixazo status poll failed");
    return { requestId, status: "ERROR", imageUrl: null, error: `Status poll failed: ${response.status}` };
  }

  const data = await response.json() as {
    request_id?: string;
    status?: string;
    output?: { media_url?: string[] };
    error?: string | null;
  };

  const status = data.status ?? "QUEUED";
  const imageUrl = data.output?.media_url?.[0] ?? null;
  const error = typeof data.error === "string" ? data.error : null;

  return { requestId, status, imageUrl, error };
}
