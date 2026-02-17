import type { RequestHandler } from "@builder.io/qwik-city";
import { getServerEnv } from "../../../server/env";
import { parseLeadBody } from "../../../server/edge/leads";
import { readIdempotencyKey } from "../../../server/edge/http";

const setCors = (headers: Headers) => {
  const env = getServerEnv();
  headers.set("Content-Type", "application/json");
  headers.set("Access-Control-Allow-Origin", env.allowedOrigin || "*");
  headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
};

export const onOptions: RequestHandler = async ({ headers, send }) => {
  setCors(headers);
  send(204, "");
};

export const onGet: RequestHandler = async ({ headers, json }) => {
  setCors(headers);
  json(405, { success: false, message: "Only POST method is allowed." });
};

export const onPost: RequestHandler = async ({ headers, json, parseBody, request }) => {
  setCors(headers);
  const idempotencyKey = readIdempotencyKey(request.headers);
  headers.set("x-idempotency-key", idempotencyKey);

  const env = getServerEnv();
  const botToken = env.telegramBotToken;
  const chatIds = (env.telegramChatId || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!botToken || chatIds.length === 0) {
    json(500, { success: false, message: "Missing Telegram env configuration." });
    return;
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = await parseBody().catch(() => null);
  }
  const parsedBody = parseLeadBody(body);
  if (!parsedBody) {
    json(400, { success: false, message: "Invalid or missing data." });
    return;
  }

  try {
    const results = await Promise.all(
      chatIds.map(async (chatId) => {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: parsedBody.message,
            parse_mode: "HTML",
          }),
        });

        const responseBody = await response.json().catch(() => ({}));
        return { ok: response.ok, status: response.status, chatId, body: responseBody };
      }),
    );

    const failed = results.filter((item) => !item.ok);
    if (failed.length > 0) {
      json(500, {
        success: false,
        message: "Failed to send message to Telegram.",
        details: failed,
      });
      return;
    }

    json(200, { success: true, message: "Message sent successfully.", idempotencyKey });
  } catch (error) {
    json(500, {
      success: false,
      message: "Failed to send message to Telegram.",
      details: String(error),
      idempotencyKey,
    });
  }
};
