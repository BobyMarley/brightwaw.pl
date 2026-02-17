export type LocalBusinessJsonLdInput = {
  siteUrl: string;
  localePath: string;
  name: string;
  description: string;
  phone: string;
  email: string;
};

export const buildLocalBusinessJsonLd = (input: LocalBusinessJsonLdInput) => {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "CleaningService"],
    name: input.name,
    url: `${input.siteUrl}${input.localePath}`,
    image: `${input.siteUrl}/public/logo.svg`,
    telephone: input.phone,
    email: input.email,
    areaServed: "Warszawa",
    openingHours: "Mo-Su 08:00-20:00",
    address: {
      "@type": "PostalAddress",
      streetAddress: "ul. WRONIA, nr 45, lok. U2",
      addressLocality: "Warszawa",
      postalCode: "00-870",
      addressCountry: "PL",
    },
    description: input.description,
  };
};

