export const dashboardWidgetIds = [
  "trend",
  "distribution",
  "gaps",
  "readiness",
  "priorities",
  "modules",
  "latest",
  "channels",
  "without-nib",
  "without-maps",
  "without-wa",
  "inactive-social",
  "verification",
] as const;

export type DashboardWidgetId = (typeof dashboardWidgetIds)[number];

export interface DashboardWidgetPreference {
  version: 1;
  order: DashboardWidgetId[];
  hidden: DashboardWidgetId[];
}

export const defaultDashboardWidgets: DashboardWidgetId[] = [
  "trend",
  "distribution",
  "gaps",
  "readiness",
  "priorities",
  "modules",
  "latest",
];

export function defaultWidgetPreference(): DashboardWidgetPreference {
  return {
    version: 1,
    order: [...dashboardWidgetIds],
    hidden: dashboardWidgetIds.filter(
      (id) => !defaultDashboardWidgets.includes(id),
    ),
  };
}

export function parseWidgetPreference(
  value: string | null,
): DashboardWidgetPreference {
  if (!value) return defaultWidgetPreference();
  try {
    const parsed = JSON.parse(value) as Partial<DashboardWidgetPreference>;
    const validOrder = Array.isArray(parsed.order)
      ? parsed.order.filter((id): id is DashboardWidgetId =>
          dashboardWidgetIds.includes(id as DashboardWidgetId),
        )
      : [];
    const order = [
      ...new Set([...validOrder, ...dashboardWidgetIds]),
    ] as DashboardWidgetId[];
    const hidden = Array.isArray(parsed.hidden)
      ? parsed.hidden.filter((id): id is DashboardWidgetId =>
          dashboardWidgetIds.includes(id as DashboardWidgetId),
        )
      : defaultWidgetPreference().hidden;
    return { version: 1, order, hidden: [...new Set(hidden)] };
  } catch {
    return defaultWidgetPreference();
  }
}
