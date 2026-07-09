import "server-only";

import { demoModulesDashboard } from "@/demo/store";

export async function getModulesDashboard() {
  return demoModulesDashboard();
}
