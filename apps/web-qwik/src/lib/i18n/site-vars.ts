export type SupportedLocale = "pl" | "en" | "ru" | "by";

export type SiteI18nVars = {
  locale: SupportedLocale;
  ui: {
    send: string;
    sending: string;
    fillRequired: string;
    invalidPhone: string;
    submitErrorPrefix: string;
    sendRetry: string;
    submitError: string;
    submitSuccess: string;
    callUs: string;
    pricing: string;
    reviews: string;
  };
  contact: {
    phoneDisplay: string;
    phoneHref: string;
    email: string;
    emailHref: string;
    hours: string;
  };
};

const COMMON_CONTACT = {
  phoneDisplay: "+48 888 742 534",
  phoneHref: "tel:+48888742534",
  email: "sales@brightwaw.pl",
  emailHref: "mailto:sales@brightwaw.pl",
};

const I18N_BY_LOCALE: Record<SupportedLocale, SiteI18nVars> = {
  pl: {
    locale: "pl",
    ui: {
      send: "Wyślij zgłoszenie",
      sending: "Wysyłanie...",
      fillRequired: "Proszę wypełnić wszystkie pola.",
      invalidPhone: "Proszę podać poprawny numer telefonu.",
      submitErrorPrefix: "Wystąpił błąd wysyłania.",
      sendRetry: "Spróbuj ponownie.",
      submitError: "Wystąpił błąd wysyłania. Spróbuj ponownie.",
      submitSuccess: "Dziękujemy! Skontaktujemy się wkrótce.",
      callUs: "Zadzwoń",
      pricing: "Cennik",
      reviews: "Opinie",
    },
    contact: {
      ...COMMON_CONTACT,
      hours: "Pn-Nd: 08:00-20:00",
    },
  },
  en: {
    locale: "en",
    ui: {
      send: "Send request",
      sending: "Sending...",
      fillRequired: "Please fill in all required fields.",
      invalidPhone: "Please enter a valid phone number.",
      submitErrorPrefix: "Sending failed.",
      sendRetry: "Please try again.",
      submitError: "Sending failed. Please try again.",
      submitSuccess: "Thank you! We will contact you shortly.",
      callUs: "Call us",
      pricing: "Pricing",
      reviews: "Reviews",
    },
    contact: {
      ...COMMON_CONTACT,
      hours: "Mon-Sun: 08:00-20:00",
    },
  },
  ru: {
    locale: "ru",
    ui: {
      send: "Отправить заявку",
      sending: "Отправка...",
      fillRequired: "Пожалуйста, заполните все поля.",
      invalidPhone: "Пожалуйста, введите корректный номер телефона.",
      submitErrorPrefix: "Ошибка отправки.",
      sendRetry: "Попробуйте снова.",
      submitError: "Ошибка отправки. Попробуйте снова.",
      submitSuccess: "Спасибо! Мы скоро свяжемся с вами.",
      callUs: "Позвонить",
      pricing: "Цены",
      reviews: "Отзывы",
    },
    contact: {
      ...COMMON_CONTACT,
      hours: "Пн-Вс: 08:00-20:00",
    },
  },
  by: {
    locale: "by",
    ui: {
      send: "Адправіць заяўку",
      sending: "Адпраўка...",
      fillRequired: "Калі ласка, запоўніце ўсе палі.",
      invalidPhone: "Калі ласка, увядзіце карэктны нумар тэлефона.",
      submitErrorPrefix: "Памылка адпраўкі.",
      sendRetry: "Паспрабуйце яшчэ раз.",
      submitError: "Памылка адпраўкі. Паспрабуйце яшчэ раз.",
      submitSuccess: "Дзякуй! Мы хутка з вамі звяжамся.",
      callUs: "Патэлефанаваць",
      pricing: "Кошты",
      reviews: "Водгукі",
    },
    contact: {
      ...COMMON_CONTACT,
      hours: "Пн-Нд: 08:00-20:00",
    },
  },
};

export const resolveLocaleFromPath = (pathname: string): SupportedLocale => {
  if (pathname.startsWith("/en")) return "en";
  if (pathname.startsWith("/ru")) return "ru";
  if (pathname.startsWith("/by")) return "by";
  return "pl";
};

export const getSiteI18nVars = (pathname: string): SiteI18nVars => {
  const locale = resolveLocaleFromPath(pathname);
  return I18N_BY_LOCALE[locale];
};
