import { notFound } from "next/navigation";

import { UmkmDetailClient } from "@/components/forms/umkm-detail-client";
import { can } from "@/lib/permissions";
import { requireSession } from "@/server/auth/session";
import { getModuleCatalog, getUmkmDetail } from "@/server/repositories/umkm";

export default async function UmkmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const [detail, catalog] = await Promise.all([
    getUmkmDetail(id),
    getModuleCatalog(),
  ]);
  if (!detail) notFound();
  const safeDetail = {
    ...detail,
    business: {
      ...detail.business,
      contact: can(session.role, "reveal_pii")
        ? detail.business.contact
        : null,
    },
    audits: [],
  };
  return (
    <UmkmDetailClient
      detail={safeDetail as never}
      role={session.role}
      catalog={catalog.map((item) => ({
        id: item.id as string,
        slug: item.slug as string,
        name: item.name as string,
        description: item.description as string | null,
      }))}
    />
  );
}
