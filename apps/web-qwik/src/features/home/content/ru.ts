import type { HomePageData } from "../types";

export const homeRuData: HomePageData = {
  locale: "ru",
  seo: {
    title: "Уборка квартир Варшава от 160 zł | BrightHouse Cleaning",
    description: "Профессиональная уборка квартир, домов и офисов в Варшаве.",
  },
  navigation: [
    { label: "Уборка", href: "/ru/" },
    { label: "Цены", href: "/ru/cennik.html" },
    { label: "Химчистка", href: "/ru/pranie.html" },
    { label: "Отзывы", href: "https://g.page/r/CQmCteFzMdvWEB0" },
  ],
  hero: {
    title: "Уборка квартир в Варшаве от 160 zł",
    subtitle: "Рейтинг 4.9/5, более 2500 клиентов и быстрый выезд.",
    primaryCta: { label: "Рассчитать стоимость", href: "#contact" },
    secondaryCta: { label: "Позвонить", href: "tel:+48888742534" },
    stats: [
      { value: "2500+", label: "Довольных клиентов" },
      { value: "4.9/5", label: "Средняя оценка" },
      { value: "280+", label: "Отзывов Google" },
    ],
  },
  calculator: {
    title: "Калькулятор уборки",
    subtitle: "Выберите услуги и оцените общую стоимость.",
    minOrder: 160,
    unitLabel: "zł / шт.",
    minOrderLabel: "Минимальный заказ",
    totalLabel: "Итого",
    items: [
      { id: "room", label: "Комната", unitPrice: 80 },
      { id: "bathroom", label: "Санузел", unitPrice: 70 },
      { id: "kitchen", label: "Кухня", unitPrice: 90 },
      { id: "windows", label: "Мойка окон", unitPrice: 60 },
    ],
    submitLabel: "Перейти к форме",
  },
  contact: {
    title: "Отправить заявку",
    subtitle: "Перезвоним и подтвердим детали.",
    nameLabel: "Имя",
    phoneLabel: "Телефон",
    addressLabel: "Адрес",
    messageLabel: "Комментарий",
    submitLabel: "Отправить заявку",
    successMessage: "Заявка успешно отправлена.",
    errorMessage: "Не удалось отправить заявку.",
  },
  cleaning: {
    title: "Что входит в уборку",
    subtitle: "Список работ по каждому помещению.",
    modes: [
      {
        id: "standard",
        label: "Стандартная уборка",
        rooms: [
          { id: "room", label: "Комната", bullets: ["Пылесос", "Удаление пыли", "Мытье пола"] },
          { id: "hall", label: "Коридор", bullets: ["Зеркала", "Пылесос", "Мытье пола"] },
          { id: "kitchen", label: "Кухня", bullets: ["Столешница", "Раковина", "Вынос мусора"] },
          { id: "bathroom", label: "Санузел", bullets: ["Сантехника", "Дезинфекция", "Плитка"] },
        ],
      },
      {
        id: "deep",
        label: "Генеральная уборка",
        rooms: [
          { id: "room", label: "Комната", bullets: ["Детальная чистка", "Плинтусы", "Двери"] },
          { id: "hall", label: "Коридор", bullets: ["Шкафы", "Светильники", "Углы"] },
          { id: "kitchen", label: "Кухня", bullets: ["Фасады", "Техника", "Обезжиривание"] },
          { id: "bathroom", label: "Санузел", bullets: ["Известковый налет", "Швы", "Полировка"] },
        ],
      },
    ],
  },
  services: {
    title: "Наши услуги",
    subtitle: "Уборка квартир, домов и офисов с прозрачными ценами.",
    cards: [
      { title: "Стандартная уборка", description: "Регулярная поддерживающая уборка.", href: "/ru/cennik.html" },
      { title: "Генеральная уборка", description: "Глубокая детальная уборка.", href: "/ru/cennik.html" },
      { title: "После ремонта", description: "Уборка строительной пыли и загрязнений.", href: "/ru/cennik.html" },
      { title: "Химчистка", description: "Диваны, матрасы и ковры.", href: "/ru/pranie.html" },
    ],
  },
  faq: {
    title: "FAQ",
    subtitle: "Ответы на частые вопросы.",
    items: [
      { question: "Сколько длится уборка?", answer: "Обычно 2-3 часа для стандартной 2-комнатной квартиры." },
      { question: "Нужно ли быть дома?", answer: "Нет, можно передать ключи." },
      { question: "Работаете в выходные?", answer: "Да, работаем 7 дней в неделю." },
      { question: "Средства безопасны?", answer: "Да, используем профессиональные безопасные средства." },
    ],
  },
  cta: {
    title: "Готовы к чистому дому?",
    subtitle: "Оставьте заявку онлайн или позвоните.",
    primaryCta: { label: "Заказать уборку", href: "#contact" },
    secondaryCta: { label: "+48 888 742 534", href: "tel:+48888742534" },
  },
};
