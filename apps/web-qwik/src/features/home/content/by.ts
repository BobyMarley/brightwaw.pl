import type { HomePageData } from "../types";

export const homeByData: HomePageData = {
  locale: "by",
  seo: {
    title: "Прыбіранне кватэр Варшава ад 160 zł | BrightHouse Cleaning",
    description: "Прафесійнае прыбіранне кватэр, дамоў і офісаў у Варшаве.",
  },
  navigation: [
    { label: "Прыбіранне", href: "/by/" },
    { label: "Кошты", href: "/by/cennik.html" },
    { label: "Хімчыстка", href: "/by/pranie.html" },
    { label: "Водгукі", href: "https://g.page/r/CQmCteFzMdvWEB0" },
  ],
  hero: {
    title: "Прыбіранне кватэр у Варшаве ад 160 zł",
    subtitle: "Рэйтынг 4.9/5, 2500+ кліентаў і хуткі выезд.",
    primaryCta: { label: "Разлічыць кошт", href: "#contact" },
    secondaryCta: { label: "Патэлефанаваць", href: "tel:+48888742534" },
    stats: [
      { value: "2500+", label: "Кліентаў" },
      { value: "4.9/5", label: "Сярэдняя ацэнка" },
      { value: "280+", label: "Водгукаў Google" },
    ],
  },
  calculator: {
    title: "Калькулятар прыбірання",
    subtitle: "Выберыце патрэбныя паслугі і ацаніце кошт.",
    minOrder: 160,
    unitLabel: "zł / шт.",
    minOrderLabel: "Мінімальны заказ",
    totalLabel: "Усяго",
    items: [
      { id: "room", label: "Пакой", unitPrice: 80 },
      { id: "bathroom", label: "Ванная", unitPrice: 70 },
      { id: "kitchen", label: "Кухня", unitPrice: 90 },
      { id: "windows", label: "Мыццё вокнаў", unitPrice: 60 },
    ],
    submitLabel: "Перайсці да формы",
  },
  contact: {
    title: "Адправіць заяўку",
    subtitle: "Патэлефануем і пацвердзім дэталі.",
    nameLabel: "Імя",
    phoneLabel: "Тэлефон",
    addressLabel: "Адрас",
    messageLabel: "Каментар",
    submitLabel: "Адправіць",
    successMessage: "Заяўка паспяхова адпраўлена.",
    errorMessage: "Не атрымалася адправіць заяўку.",
  },
  cleaning: {
    title: "Што ўваходзіць у прыбіранне",
    subtitle: "Пералік работ па кожным памяшканні.",
    modes: [
      {
        id: "standard",
        label: "Стандартнае прыбіранне",
        rooms: [
          { id: "room", label: "Пакой", bullets: ["Пыласос", "Выдаленне пылу", "Мыццё падлогі"] },
          { id: "hall", label: "Калідор", bullets: ["Люстэркі", "Пыласос", "Мыццё падлогі"] },
          { id: "kitchen", label: "Кухня", bullets: ["Стальніца", "Ракавіна", "Вынас смецця"] },
          { id: "bathroom", label: "Ванная", bullets: ["Сантэхніка", "Дэзінфекцыя", "Плітка"] },
        ],
      },
      {
        id: "deep",
        label: "Генеральнае прыбіранне",
        rooms: [
          { id: "room", label: "Пакой", bullets: ["Дэталі", "Ліштвы", "Дзверы"] },
          { id: "hall", label: "Калідор", bullets: ["Шафы", "Свяцільні", "Куты"] },
          { id: "kitchen", label: "Кухня", bullets: ["Фасады", "Тэхніка", "Абястлушчванне"] },
          { id: "bathroom", label: "Ванная", bullets: ["Налёт", "Швы", "Паліроўка"] },
        ],
      },
    ],
  },
  services: {
    title: "Нашы паслугі",
    subtitle: "Прыбіранне кватэр, дамоў і офісаў з празрыстымі коштамі.",
    cards: [
      { title: "Стандартнае", description: "Рэгулярнае прыбіранне.", href: "/by/cennik.html" },
      { title: "Генеральнае", description: "Глыбокае прыбіранне.", href: "/by/cennik.html" },
      { title: "Пасля рамонту", description: "Прыбіранне будаўнічага пылу і бруду.", href: "/by/cennik.html" },
      { title: "Хімчыстка", description: "Канапы, матрацы і дываны.", href: "/by/pranie.html" },
    ],
  },
  faq: {
    title: "FAQ",
    subtitle: "Адказы на папулярныя пытанні.",
    items: [
      { question: "Колькі доўжыцца прыбіранне?", answer: "Звычайна 2-3 гадзіны для стандартнай 2-пакаёвай кватэры." },
      { question: "Ці трэба быць дома?", answer: "Не, можна перадаць ключы." },
      { question: "Ці працуеце ў выходныя?", answer: "Так, працуем 7 дзён на тыдзень." },
      { question: "Сродкі бяспечныя?", answer: "Так, выкарыстоўваем прафесійныя бяспечныя сродкі." },
    ],
  },
  cta: {
    title: "Гатовыя да чыстай кватэры?",
    subtitle: "Замоўце анлайн або патэлефануйце.",
    primaryCta: { label: "Замовіць прыбіранне", href: "#contact" },
    secondaryCta: { label: "+48 888 742 534", href: "tel:+48888742534" },
  },
};
