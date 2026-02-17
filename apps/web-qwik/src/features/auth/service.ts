import type { RequestEventBase } from "@builder.io/qwik-city";
import type { AuthRole, AuthSessionState, AuthUser } from "./types";

const FALLBACK_LOCALE = "pl" as const;

const parseRole = (value: unknown): AuthRole => {
  const role = String(value || "").toLowerCase();
  if (role === "client" || role === "manager" || role === "admin") return role;
  return "guest";
};

export const getAuthSession = async (
  event: RequestEventBase,
): Promise<AuthSessionState> => {
  const cookieEmail = event.cookie.get("bw_user_email")?.value || "";
  const cookieId = event.cookie.get("bw_user_id")?.value || "";
  const cookieRole = event.cookie.get("bw_user_role")?.value || "";
  const cookieLocale = event.cookie.get("bw_user_locale")?.value || FALLBACK_LOCALE;

  if (!cookieEmail || !cookieId) {
    return { user: null, isAuthenticated: false };
  }

  const user: AuthUser = {
    id: cookieId,
    email: cookieEmail,
    role: parseRole(cookieRole),
    locale:
      cookieLocale === "en" || cookieLocale === "ru" || cookieLocale === "by"
        ? cookieLocale
        : FALLBACK_LOCALE,
  };

  return { user, isAuthenticated: true };
};

export const requireRole = (session: AuthSessionState, allowed: AuthRole[]) => {
  if (!session.user) return false;
  return allowed.includes(session.user.role);
};

