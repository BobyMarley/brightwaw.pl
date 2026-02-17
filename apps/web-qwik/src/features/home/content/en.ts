import type { HomePageData } from "../types";

export const homeEnData: HomePageData = {
  locale: "en",
  seo: {
    title: "Apartment Cleaning Warsaw from 160 PLN | BrightHouse Cleaning",
    description: "Professional apartment, house and office cleaning in Warsaw.",
  },
  navigation: [
    { label: "Home Cleaning", href: "/en/" },
    { label: "Pricing", href: "/en/cennik.html" },
    { label: "Upholstery", href: "/en/pranie.html" },
    { label: "Reviews", href: "https://g.page/r/CQmCteFzMdvWEB0" },
  ],
  hero: {
    title: "Apartment cleaning in Warsaw from 160 PLN",
    subtitle: "Rated 4.9/5, trusted by 2500+ clients and fast arrival.",
    primaryCta: { label: "Check price", href: "#contact" },
    secondaryCta: { label: "Call now", href: "tel:+48888742534" },
    stats: [
      { value: "2500+", label: "Happy clients" },
      { value: "4.9/5", label: "Average rating" },
      { value: "280+", label: "Google reviews" },
    ],
  },
  calculator: {
    title: "Cleaning calculator",
    subtitle: "Select service scope and estimate total cost.",
    minOrder: 160,
    unitLabel: "PLN / item",
    minOrderLabel: "Minimum order",
    totalLabel: "Total",
    items: [
      { id: "room", label: "Room", unitPrice: 80 },
      { id: "bathroom", label: "Bathroom", unitPrice: 70 },
      { id: "kitchen", label: "Kitchen", unitPrice: 90 },
      { id: "windows", label: "Window cleaning", unitPrice: 60 },
    ],
    submitLabel: "Move to form",
  },
  contact: {
    title: "Send request",
    subtitle: "We will call you back and confirm details.",
    nameLabel: "Name",
    phoneLabel: "Phone",
    addressLabel: "Address",
    messageLabel: "Comment",
    submitLabel: "Send request",
    successMessage: "Request sent successfully.",
    errorMessage: "Request sending failed.",
  },
  cleaning: {
    title: "What is included",
    subtitle: "Scope of work by room.",
    modes: [
      {
        id: "standard",
        label: "Standard cleaning",
        rooms: [
          { id: "room", label: "Room", bullets: ["Vacuum cleaning", "Dust removal", "Floor mopping"] },
          { id: "hall", label: "Hallway", bullets: ["Mirror cleaning", "Vacuum cleaning", "Floor mopping"] },
          { id: "kitchen", label: "Kitchen", bullets: ["Counter cleaning", "Sink cleaning", "Trash removal"] },
          { id: "bathroom", label: "Bathroom", bullets: ["Sanitary cleaning", "Disinfection", "Tile cleaning"] },
        ],
      },
      {
        id: "deep",
        label: "Deep cleaning",
        rooms: [
          { id: "room", label: "Room", bullets: ["Detail cleaning", "Baseboards", "Door cleaning"] },
          { id: "hall", label: "Hallway", bullets: ["Cabinet cleaning", "Lamp cleaning", "Corners"] },
          { id: "kitchen", label: "Kitchen", bullets: ["Fronts cleaning", "Appliance cleaning", "Degreasing"] },
          { id: "bathroom", label: "Bathroom", bullets: ["Scale removal", "Grout cleaning", "Fixture polishing"] },
        ],
      },
    ],
  },
  services: {
    title: "Our services",
    subtitle: "Apartment, house and office cleaning with transparent pricing.",
    cards: [
      { title: "Standard cleaning", description: "Regular upkeep cleaning.", href: "/en/cennik.html" },
      { title: "Deep cleaning", description: "Detailed full-home cleaning.", href: "/en/cennik.html" },
      { title: "Post-renovation", description: "Construction dust and residue removal.", href: "/en/cennik.html" },
      { title: "Upholstery cleaning", description: "Sofas, mattresses and carpets.", href: "/en/pranie.html" },
    ],
  },
  faq: {
    title: "FAQ",
    subtitle: "Key answers before booking.",
    items: [
      { question: "How long does cleaning take?", answer: "Usually 2-3 hours for a typical 2-room apartment." },
      { question: "Do I need to be home?", answer: "No, key handover is possible." },
      { question: "Do you work on weekends?", answer: "Yes, we work 7 days a week." },
      { question: "Are products safe?", answer: "Yes, we use professional and safe products." },
    ],
  },
  cta: {
    title: "Ready for a clean home?",
    subtitle: "Order online or call us directly.",
    primaryCta: { label: "Order cleaning", href: "#contact" },
    secondaryCta: { label: "+48 888 742 534", href: "tel:+48888742534" },
  },
};
