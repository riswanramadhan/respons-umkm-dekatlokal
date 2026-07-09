import "server-only";

import {
  demoListUmkm,
  demoModulesDashboard,
  demoUmkmDetail,
} from "@/demo/store";
import type { UmkmFilters } from "@/features/umkm/filters";
import type { UmkmPageResult } from "@/features/umkm/types";

export async function listUmkm(filters: UmkmFilters): Promise<UmkmPageResult> {
  return demoListUmkm(filters);
}

export async function getUmkmDetail(umkmId: string) {
  return demoUmkmDetail(umkmId);
}

export async function getModuleCatalog() {
  return demoModulesDashboard();
}
