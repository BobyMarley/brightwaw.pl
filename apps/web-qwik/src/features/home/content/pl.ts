import type { HomePageData } from "../types";

export const homePlData: HomePageData = {
  locale: "pl",
  seo: {
    title: "Sprzątanie mieszkań Warszawa od 160 zł | BrightHouse Cleaning",
    description:
      "Profesjonalne sprzątanie mieszkań, domów i biur w Warszawie. Ocena 4.9/5 i szybki dojazd.",
  },
  navigation: [
    { label: "Sprzątanie mieszkań", href: "/sprzatanie-mieszkan-warszawa.html" },
    { label: "Cennik", href: "/cennik.html" },
    { label: "Pranie chemiczne", href: "/pranie.html" },
    { label: "Opinie", href: "https://g.page/r/CQmCteFzMdvWEB0" },
  ],
  hero: {
    title: "Sprzątanie mieszkań w Warszawie od 160 zł",
    subtitle: "Ocena 4.9/5, 2500+ klientów, profesjonalny sprzęt Kärcher i szybki dojazd.",
    primaryCta: { label: "Sprawdź cenę", href: "#kontakt" },
    secondaryCta: { label: "Zadzwoń", href: "tel:+48888742534" },
    stats: [
      { value: "2500+", label: "Zadowolonych klientów" },
      { value: "4.9/5", label: "Średnia ocena" },
      { value: "280+", label: "Opinii w Google" },
    ],
  },
  calculator: {
    title: "Kalkulator sprzątania",
    subtitle: "Wybierz zakres usługi i zobacz orientacyjną cenę.",
    minOrder: 160,
    unitLabel: "zł / szt.",
    minOrderLabel: "Minimalne zamówienie",
    totalLabel: "Suma",
    items: [
      { id: "room", label: "Pokój", unitPrice: 80 },
      { id: "bathroom", label: "Łazienka", unitPrice: 70 },
      { id: "kitchen", label: "Kuchnia", unitPrice: 90 },
      { id: "windows", label: "Mycie okien", unitPrice: 60 },
    ],
    submitLabel: "Przenieś do formularza",
  },
  contact: {
    title: "Wyślij zgłoszenie",
    subtitle: "Oddzwonimy i potwierdzimy szczegóły zamówienia.",
    nameLabel: "Imię",
    phoneLabel: "Telefon",
    addressLabel: "Adres",
    messageLabel: "Komentarz",
    submitLabel: "Wyślij zgłoszenie",
    successMessage: "Zgłoszenie wysłane pomyślnie.",
    errorMessage: "Nie udało się wysłać zgłoszenia.",
  },
  cleaning: {
    title: "Co zawiera sprzątanie",
    subtitle: "Zakres prac dla każdego pomieszczenia.",
    modes: [
      {
        id: "standard",
        label: "Sprzątanie standardowe",
        rooms: [
          { id: "room", label: "Pokój", bullets: ["Odkurzanie podłóg", "Wycieranie kurzu", "Mycie podłogi"] },
          { id: "hall", label: "Korytarz", bullets: ["Czyszczenie luster", "Odkurzanie", "Mycie podłogi"] },
          { id: "kitchen", label: "Kuchnia", bullets: ["Mycie blatu", "Czyszczenie zlewu", "Wyniesienie śmieci"] },
          { id: "bathroom", label: "Łazienka", bullets: ["Mycie sanitariatów", "Dezynfekcja", "Czyszczenie płytek"] },
        ],
      },
      {
        id: "deep",
        label: "Sprzątanie generalne",
        rooms: [
          { id: "room", label: "Pokój", bullets: ["Doczyszczanie detali", "Mycie listew", "Czyszczenie drzwi"] },
          { id: "hall", label: "Korytarz", bullets: ["Mycie szaf", "Czyszczenie lamp", "Doczyszczanie narożników"] },
          { id: "kitchen", label: "Kuchnia", bullets: ["Mycie frontów", "Czyszczenie AGD", "Odtłuszczanie powierzchni"] },
          { id: "bathroom", label: "Łazienka", bullets: ["Usuwanie kamienia", "Czyszczenie fug", "Polerowanie armatury"] },
        ],
      },
    ],
  },
  services: {
    title: "Nasze usługi",
    subtitle: "Sprzątanie mieszkań, domów i biur z transparentnym cennikiem.",
    cards: [
      {
        title: "Sprzątanie standardowe",
        description: "Regularne sprzątanie mieszkań i domów.",
        href: "/cennik.html",
      },
      {
        title: "Sprzątanie generalne",
        description: "Głębokie czyszczenie wszystkich pomieszczeń.",
        href: "/cennik.html",
      },
      {
        title: "Sprzątanie po remoncie",
        description: "Usuwanie kurzu i zabrudzeń poremontowych.",
        href: "/cennik.html",
      },
      {
        title: "Pranie chemiczne",
        description: "Pranie sof, materacy i dywanów na miejscu.",
        href: "/pranie.html",
      },
    ],
  },
  faq: {
    title: "FAQ - najczęstsze pytania",
    subtitle: "Najważniejsze odpowiedzi przed zamówieniem.",
    items: [
      {
        question: "Ile trwa sprzątanie mieszkania?",
        answer: "Standardowe sprzątanie 2-pokojowego mieszkania trwa zwykle 2-3 godziny.",
      },
      {
        question: "Czy muszę być obecny podczas sprzątania?",
        answer: "Nie, możesz przekazać klucze i wrócić po zakończonej usłudze.",
      },
      {
        question: "Jakie środki są używane?",
        answer: "Używamy profesjonalnych i bezpiecznych środków, także dla domów z dziećmi i zwierzętami.",
      },
      {
        question: "Czy pracujecie w weekendy?",
        answer: "Tak, działamy 7 dni w tygodniu w godzinach 8:00-20:00.",
      },
    ],
  },
  cta: {
    title: "Gotowy na czysty dom?",
    subtitle: "Zamów usługę online lub zadzwoń. Potwierdzimy termin i koszt.",
    primaryCta: { label: "Zamów sprzątanie", href: "#kontakt" },
    secondaryCta: { label: "+48 888 742 534", href: "tel:+48888742534" },
  },
};
