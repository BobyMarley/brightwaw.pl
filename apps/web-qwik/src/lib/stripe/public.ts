export type StripePublicConfig = {
  publishableKey: string;
};

export const getStripePublicConfig = (): StripePublicConfig => {
  return {
    publishableKey: process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  };
};
