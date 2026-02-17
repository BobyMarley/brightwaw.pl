import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export type ServerEnv = {
  supabaseServiceRoleKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  telegramBotToken: string;
  telegramChatId: string;
  allowedOrigin: string;
  edgeRegion: string;
  edgeModeEnabled: boolean;
};

const ROOT_ENV_LOCAL_PATH = fileURLToPath(new URL("../../../../.env.local", import.meta.url));
const ROOT_ENV_PATH = fileURLToPath(new URL("../../../../.env", import.meta.url));

const parseEnvFile = (filepath: string): Record<string, string> => {
  if (!existsSync(filepath)) return {};
  const raw = readFileSync(filepath, "utf-8");
  const result: Record<string, string> = {};

  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex < 1) return;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  });

  return result;
};

const fileEnvCache = {
  ...parseEnvFile(ROOT_ENV_PATH),
  ...parseEnvFile(ROOT_ENV_LOCAL_PATH),
};

const readEnv = (key: string, fallback = "") =>
  process.env[key] || fileEnvCache[key] || fallback;

export const getServerEnv = (): ServerEnv => {
  return {
    supabaseServiceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY"),
    stripeSecretKey: readEnv("STRIPE_SECRET_KEY"),
    stripeWebhookSecret: readEnv("STRIPE_WEBHOOK_SECRET"),
    telegramBotToken: readEnv("TELEGRAM_BOT_TOKEN"),
    telegramChatId: readEnv("TELEGRAM_CHAT_ID"),
    allowedOrigin: readEnv("ALLOWED_ORIGIN", "*"),
    edgeRegion: readEnv("EDGE_REGION", "fra1"),
    edgeModeEnabled: readEnv("EDGE_MODE_ENABLED", "true").toLowerCase() === "true",
  };
};
