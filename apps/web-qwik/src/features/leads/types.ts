export type LeadSource = "home" | "pranie" | "cennik" | "landing";

export type LeadPayload = {
  name: string;
  phone: string;
  address: string;
  message?: string;
  source: LeadSource;
  locale: "pl" | "en" | "ru" | "by";
  metadata?: Record<string, string>;
};

export type LeadResult = {
  ok: boolean;
  error?: string;
  idempotencyKey?: string;
};

