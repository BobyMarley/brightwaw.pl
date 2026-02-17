export type SiteState = {
  locale: "pl" | "en" | "by" | "ru";
  isMobileMenuOpen: boolean;
};

export const initialSiteState: SiteState = {
  locale: "pl",
  isMobileMenuOpen: false,
};
