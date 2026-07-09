import { ExportClient } from "@/components/forms/export-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { parseUmkmFilters } from "@/features/umkm/filters";
import { requireSession } from "@/server/auth/session";
import { listUmkm } from "@/server/repositories/umkm";

export default async function ExportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  const raw = await searchParams;
  const filters = parseUmkmFilters(raw);
  const [result, allResult] = await Promise.all([
    listUmkm({ ...filters, page: 1, pageSize: 10 }),
    listUmkm(parseUmkmFilters({})),
  ]);
  const selectedIds = typeof raw.ids === "string" ? raw.ids.split(",").filter(Boolean) : [];
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) query.set(key, first);
  }
  return <div className="space-y-5"><PageHeader eyebrow="Export & Laporan" title="Siapkan data untuk laporan" description="Ekspor data UMKM dengan filter dan perlindungan kontak sesuai hak akses." /><ExportClient initialQuery={query.toString()} filteredTotal={result.total} allTotal={allResult.total} selectedCount={selectedIds.length} role={session.role} /></div>;
}
