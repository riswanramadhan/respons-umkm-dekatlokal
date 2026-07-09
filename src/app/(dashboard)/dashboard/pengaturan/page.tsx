import { SettingsClient } from "@/components/forms/settings-client";
import { requireSession } from "@/server/auth/session";
import { listDashboardUsers } from "@/server/repositories/settings";
import { getOverview } from "@/server/repositories/overview";

export default async function SettingsPage() {
  const session = await requireSession();
  const [users, overview] = await Promise.all([
    session.role === "superadmin" ? listDashboardUsers() : Promise.resolve([]),
    getOverview("all"),
  ]);
  return <SettingsClient session={session} users={users as never} totalUmkm={overview.kpi.total_umkm} />;
}
