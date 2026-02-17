export type DashboardKpi = {
  key: "new_leads" | "conversion_rate" | "avg_order_value" | "response_time";
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
};

export type DashboardLeadItem = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  source: string;
  locale: "pl" | "en" | "ru" | "by";
  status: "new" | "contacted" | "won" | "lost";
};

export type DashboardData = {
  kpis: DashboardKpi[];
  leads: DashboardLeadItem[];
};

