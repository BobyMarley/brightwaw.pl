export type SupportedLocale = "pl" | "en" | "by" | "ru";

export type SeoMeta = {
  title: string;
  description: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type HeroStat = {
  value: string;
  label: string;
};

export type HeroSection = {
  title: string;
  subtitle: string;
  primaryCta: NavLink;
  secondaryCta: NavLink;
  stats: HeroStat[];
};

export type ServiceCard = {
  title: string;
  description: string;
  href: string;
};

export type ServicesSection = {
  title: string;
  subtitle: string;
  cards: ServiceCard[];
};

export type CtaSection = {
  title: string;
  subtitle: string;
  primaryCta: NavLink;
  secondaryCta: NavLink;
};

export type CalculatorItem = {
  id: string;
  label: string;
  unitPrice: number;
};

export type CalculatorSection = {
  title: string;
  subtitle: string;
  minOrder: number;
  unitLabel: string;
  minOrderLabel: string;
  totalLabel: string;
  items: CalculatorItem[];
  submitLabel: string;
};

export type ContactSection = {
  title: string;
  subtitle: string;
  nameLabel: string;
  phoneLabel: string;
  addressLabel: string;
  messageLabel: string;
  submitLabel: string;
  successMessage: string;
  errorMessage: string;
};

export type CleaningRoom = {
  id: string;
  label: string;
  bullets: string[];
};

export type CleaningMode = {
  id: "standard" | "deep";
  label: string;
  rooms: CleaningRoom[];
};

export type CleaningSection = {
  title: string;
  subtitle: string;
  modes: CleaningMode[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSection = {
  title: string;
  subtitle: string;
  items: FaqItem[];
};

export type HomePageData = {
  locale: SupportedLocale;
  seo: SeoMeta;
  navigation: NavLink[];
  hero: HeroSection;
  calculator: CalculatorSection;
  contact: ContactSection;
  cleaning: CleaningSection;
  services: ServicesSection;
  faq: FaqSection;
  cta: CtaSection;
};
