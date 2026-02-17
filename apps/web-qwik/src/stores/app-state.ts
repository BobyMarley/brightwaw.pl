import type { AuthSessionState } from "../features/auth/types";

export type AppState = {
  auth: AuthSessionState;
  locale: "pl" | "en" | "ru" | "by";
  edgeRegion: string;
};

export const initialAppState: AppState = {
  auth: {
    user: null,
    isAuthenticated: false,
  },
  locale: "pl",
  edgeRegion: "fra1",
};

