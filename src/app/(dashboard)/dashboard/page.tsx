import { OverviewDashboard } from "@/components/dashboard/overview-dashboard";
import { requireSession } from "@/server/auth/session";
import { getHeaderNotifications } from "@/server/repositories/header";
import { getOverview, type OverviewPeriod } from "@/server/repositories/overview";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const requested = (await searchParams).period;
  const period: OverviewPeriod = ["30d", "90d", "1y", "all"].includes(requested ?? "")
    ? (requested as OverviewPeriod)
    : "all";
  await requireSession();
  const [data, notifications] = await Promise.all([
    getOverview(period),
    getHeaderNotifications(),
  ]);

  return (
    <OverviewDashboard
      data={data}
      period={period}
      notifications={notifications}
    />
  );
}
