export type SeoLocale = "pl" | "en" | "ru" | "by";

export type SeoInput = {
  title: string;
  description: string;
  locale: SeoLocale;
  pathname: string;
  image?: string;
  noindex?: boolean;
};

