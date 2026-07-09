export interface AnalyticsPoint {
  name?: string;
  date?: string;
  slug?: string;
  value: number;
}

export interface OverviewData {
  kpi: {
    total_umkm: number;
    rendah: number;
    menengah: number;
    siap: number;
    average_score: number;
    without_nib: number;
    without_google_maps: number;
    without_whatsapp_business: number;
    inactive_social: number;
  };
  categories: AnalyticsPoint[];
  gaps: AnalyticsPoint[];
  channels: AnalyticsPoint[];
  modules: AnalyticsPoint[];
  trend: AnalyticsPoint[];
  latest: Array<Record<string, unknown>>;
  priorities: Array<Record<string, unknown>>;
}
