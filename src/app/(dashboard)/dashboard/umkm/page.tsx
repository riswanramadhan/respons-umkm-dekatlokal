import { EmptyState } from "@/components/states/empty-state";
import { UmkmDataTable } from "@/components/tables/umkm-data-table";
import { UmkmFilterBar } from "@/components/tables/umkm-filter-bar";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { parseUmkmFilters } from "@/features/umkm/filters";
import { requireSession } from "@/server/auth/session";
import { getModuleCatalog, listUmkm } from "@/server/repositories/umkm";

export default async function UmkmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const filters = parseUmkmFilters(await searchParams);
  const [result, modules] = await Promise.all([
    listUmkm(filters),
    getModuleCatalog(),
  ]);
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Data UMKM" title="Seluruh UMKM" description="Kelola hasil Digital Checkup dan kebutuhan pendampingan." />
      <Card className="overflow-hidden">
        <UmkmFilterBar key={filters.q} filters={filters} modules={modules.map((item) => ({ slug: item.slug as string, name: item.name as string }))} />
        {result.rows.length ? <UmkmDataTable result={result} filters={filters} role={session.role} /> : <div className="p-5"><EmptyState title="Tidak ada hasil" description="Tidak ada UMKM yang cocok dengan filter aktif. Bersihkan filter atau ubah kata pencarian." /></div>}
      </Card>
    </div>
  );
}
