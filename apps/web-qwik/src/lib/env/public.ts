export type PublicRuntimeEnv = {
  siteUrl: string;
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  stripePublishableKey: string;
};

export const getPublicRuntimeEnv = (): PublicRuntimeEnv => {
  const siteUrl = process.env.PUBLIC_SITE_URL || "";
  const apiBaseUrl = process.env.PUBLIC_API_BASE_URL || siteUrl;
  return {
    siteUrl,
    apiBaseUrl,
    supabaseUrl: process.env.PUBLIC_SUPABASE_URL || "",
    supabaseAnonKey: process.env.PUBLIC_SUPABASE_ANON_KEY || "",
    stripePublishableKey: process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  };
};
