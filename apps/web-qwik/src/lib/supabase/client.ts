/**
 * Supabase client placeholders for Qwik migration.
 * Use public anon key only on client side.
 */
export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

export const getSupabasePublicConfig = (): SupabasePublicConfig => {
  return {
    url: process.env.PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.PUBLIC_SUPABASE_ANON_KEY || "",
  };
};
