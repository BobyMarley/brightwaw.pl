import { getPublicRuntimeEnv } from "../../lib/env/public";
import type { LeadPayload, LeadResult } from "./types";

const buildTelegramMessage = (lead: LeadPayload) => {
  const lines = [
    "<b>Nowe zgloszenie</b>",
    `Zrodlo: ${lead.source}`,
    `Jezyk: ${lead.locale}`,
    `Imie: ${lead.name}`,
    `Telefon: ${lead.phone}`,
    `Adres: ${lead.address}`,
  ];
  if (lead.message) lines.push(`Komentarz: ${lead.message}`);
  if (lead.metadata) {
    Object.entries(lead.metadata).forEach(([k, v]) => lines.push(`${k}: ${v}`));
  }
  return lines.join("\n");
};

export const submitLead = async (lead: LeadPayload): Promise<LeadResult> => {
  const env = getPublicRuntimeEnv();
  const base = (env.apiBaseUrl || "").replace(/\/$/, "");
  const endpoint = base ? `${base}/api/telegram_proxy` : "/api/telegram_proxy";
  const idempotencyKey = `${lead.source}:${lead.phone}:${Date.now()}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      body: JSON.stringify({
        message: buildTelegramMessage(lead),
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { ok: false, error: body?.message || `HTTP ${response.status}`, idempotencyKey };
    }

    return { ok: true, idempotencyKey };
  } catch (error) {
    return { ok: false, error: String(error), idempotencyKey };
  }
};

