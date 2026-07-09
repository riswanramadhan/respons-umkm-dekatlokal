import "server-only";

import { demoExportRows, demoListUmkm } from "@/demo/store";
import type { UmkmFilters } from "@/features/umkm/filters";
import { maskEmail, maskWhatsapp } from "@/lib/masking";
import type { AppRole } from "@/lib/permissions";

export async function getExportRows({
  filters,
  ids,
  umkmId,
  role,
}: {
  filters: UmkmFilters;
  ids?: string[];
  umkmId?: string;
  role: AppRole;
}) {
  let selectedIds = ids;
  if (!selectedIds?.length && !umkmId) {
    selectedIds = [];
    let page = 1;
    while (selectedIds.length < 10_000) {
      const result = demoListUmkm({ ...filters, page, pageSize: 100 });
      selectedIds.push(...result.rows.map((row) => row.checkupId));
      if (page >= result.pageCount) break;
      page += 1;
    }
  }

  const rows = demoExportRows(selectedIds, umkmId);
  if (role !== "viewer") return rows;
  return rows.map((row) => ({
    ...row,
    whatsapp: maskWhatsapp(String(row.whatsapp)),
    email: maskEmail(String(row.email)),
  }));
}
