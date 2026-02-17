export type AuthRole = "guest" | "client" | "manager" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  role: AuthRole;
  locale: "pl" | "en" | "ru" | "by";
};

export type AuthSessionState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
};

