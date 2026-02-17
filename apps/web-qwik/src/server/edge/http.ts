export const readIdempotencyKey = (headers: Headers): string => {
  return (
    headers.get("x-idempotency-key") ||
    headers.get("x-request-id") ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
};

export const jsonError = (message: string, status = 500) => ({
  status,
  body: {
    success: false,
    message,
  },
});

