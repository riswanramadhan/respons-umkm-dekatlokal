import "server-only";

import { demoStore } from "@/demo/store";

export async function listDashboardUsers() {
  return demoStore().profiles;
}
