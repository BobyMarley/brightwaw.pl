import type { DashboardData } from "./types";

export const getDashboardMockData = (): DashboardData => {
  return {
    kpis: [
      { key: "new_leads", label: "Nowe leady", value: "24", trend: "up" },
      { key: "conversion_rate", label: "Konwersja", value: "18.4%", trend: "up" },
      { key: "avg_order_value", label: "Srednia wartosc", value: "412 zl", trend: "flat" },
      { key: "response_time", label: "Czas odpowiedzi", value: "6 min", trend: "down" },
    ],
    leads: [],
  };
};

