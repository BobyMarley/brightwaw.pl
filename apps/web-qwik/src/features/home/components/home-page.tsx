import { component$ } from "@builder.io/qwik";
import type { HomePageData } from "../types";
import { SiteHeader } from "./site-header";
import { HeroSection } from "./hero-section";
import { CalculatorSection } from "./calculator-section";
import { ContactSection } from "./contact-section";
import { CleaningSection } from "./cleaning-section";
import { ServicesSection } from "./services-section";
import { FaqSection } from "./faq-section";
import { CtaSection } from "./cta-section";

type HomePageProps = {
  data: HomePageData;
  sendLeadAction: any;
};

export const HomePage = component$<HomePageProps>(({ data, sendLeadAction }) => {
  return (
    <>
      <SiteHeader />
      <HeroSection hero={data.hero} />
      <CalculatorSection section={data.calculator} />
      <ContactSection section={data.contact} action={sendLeadAction} />
      <CleaningSection section={data.cleaning} />
      <ServicesSection section={data.services} />
      <FaqSection section={data.faq} />
      <CtaSection section={data.cta} />
    </>
  );
});
