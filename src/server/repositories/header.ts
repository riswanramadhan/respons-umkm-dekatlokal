import "server-only";

import { demoHeaderNotifications } from "@/demo/store";

export async function getHeaderNotifications() {
  return demoHeaderNotifications();
}
