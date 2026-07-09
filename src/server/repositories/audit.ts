import "server-only";

import { demoAuditPage, demoDeletedCheckups } from "@/demo/store";

export async function listAuditLogs({
  page = 1,
  action = "all",
  q = "",
}: {
  page?: number;
  action?: string;
  q?: string;
}) {
  return demoAuditPage(page, action, q);
}

export async function listDeletedCheckups() {
  return demoDeletedCheckups();
}
