export type ParsedLeadBody = {
  message: string;
};

export const parseLeadBody = (body: unknown): ParsedLeadBody | null => {
  if (!body || typeof body !== "object") return null;
  const maybeMessage = (body as { message?: unknown }).message;
  if (typeof maybeMessage !== "string" || !maybeMessage.trim()) return null;
  return { message: maybeMessage.trim() };
};

