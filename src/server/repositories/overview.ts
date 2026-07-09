import "server-only";

import { demoOverview } from "@/demo/store";
import type { OverviewData } from "@/features/overview/types";

export type OverviewPeriod = "30d" | "90d" | "1y" | "all";

export async function getOverview(
  period: OverviewPeriod,
): Promise<OverviewData> {
  return demoOverview(period);
}
