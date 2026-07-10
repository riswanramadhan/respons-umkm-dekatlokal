import { existsSync } from "node:fs";
import { join } from "node:path";

import { ModuleCatalogClient } from "@/components/forms/module-catalog-client";
import { requireSession } from "@/server/auth/session";
import { getModulesDashboard } from "@/server/repositories/modules";

const coverBySlug: Record<string, string> = {
  "digitalisasi-umkm": "/modul 1-digitalisasi umkm.png",
  "branding-umkm": "/modul 2-branding umkm.png",
  "legalitas-usaha": "/modul 3-legalitas umkm.png",
  "produk-kemasan": "/modul 4-produk dan kemasan umkm.png",
  "operasional-keuangan-dasar": "/modul 5-operasional dan keuangan dasar umkm.png",
  "konsistensi-promosi": "/modul 6-konsistensi promosi umkm.png",
  "profil-usaha-administrasi": "/modul 7-profil usaha dan administarsi umkm.png",
  "komitmen-growth": "/modul 8-komitmen dan growth mindset umkm.png",
};
const pdfBySlug: Record<string, string> = {
  "digitalisasi-umkm": "Modul_1_Digitalisasi_UMKM_DekatLokal_FINAL.pdf",
  "branding-umkm": "Modul_2_Branding_UMKM_DekatLokal_FINAL.pdf",
  "legalitas-usaha": "Modul_3_Legalitas_Usaha_UMKM_DekatLokal_FINAL.pdf",
  "produk-kemasan": "Modul_4_Produk_dan_Kemasan_UMKM_DekatLokal_FINAL.pdf",
  "operasional-keuangan-dasar": "Modul_5_Operasional_dan_Keuangan_Dasar_UMKM_DekatLokal_FINAL.pdf",
  "konsistensi-promosi": "Modul_6_Konsistensi_Promosi_UMKM_DekatLokal_FINAL.pdf",
  "profil-usaha-administrasi": "Modul_7_Profil_Usaha_dan_Administrasi_UMKM_DekatLokal_FINAL.pdf",
  "komitmen-growth": "Modul_8_Komitmen_dan_Growth_Mindset_UMKM_DekatLokal_FINAL.pdf",
};

export default async function ModulesPage() {
  const session = await requireSession();
  const modules = await getModulesDashboard();
  const withMaterials = modules.map((module) => {
    const slug = String(module.slug);
    const pdfName = pdfBySlug[slug];
    const file = join(process.cwd(), "public", "modul-pendampingan", pdfName ?? "");
    return {
      ...module,
      materialHref: module.materialHref && pdfName && existsSync(file) ? `/modul-pendampingan/${pdfName}` : null,
      coverImageHref: coverBySlug[slug] ?? null,
    };
  });
  return <ModuleCatalogClient modules={withMaterials as never} role={session.role} />;
}
