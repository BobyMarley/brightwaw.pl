import { getServerEnv } from "../../server/env";

export type SupabaseServerConfig = {
  url: string;
  serviceRoleKey: string;
};

export const getSupabaseServerConfig = (): SupabaseServerConfig => {
  const env = getServerEnv();
  return {
    url: process.env.PUBLIC_SUPABASE_URL || "",
    serviceRoleKey: env.supabaseServiceRoleKey,
  };
};

