import { homeByData } from "./content/by";
import { homeEnData } from "./content/en";
import { homePlData } from "./content/pl";
import { homeRuData } from "./content/ru";
import type { HomePageData, SupportedLocale } from "./types";

const FALLBACK_LOCALE: SupportedLocale = "pl";

export const resolveLocaleFromPathname = (pathname: string): SupportedLocale => {
  if (pathname.startsWith("/en")) return "en";
  if (pathname.startsWith("/by")) return "by";
  if (pathname.startsWith("/ru")) return "ru";
  return "pl";
};

export const getHomePageData = (locale: SupportedLocale): HomePageData => {
  switch (locale) {
    case "en":
      return homeEnData;
    case "by":
      return homeByData;
    case "ru":
      return homeRuData;
    case "pl":
      return homePlData;
    default:
      return homePlData;
  }
};

export const getHomePageDataForPath = (pathname: string): HomePageData => {
  const locale = resolveLocaleFromPathname(pathname) || FALLBACK_LOCALE;
  return getHomePageData(locale);
};
