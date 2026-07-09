import type { CheckupAnswers } from "./types";

export interface RecommendedModule {
  slug: string;
  name: string;
  priority: number;
  reason: string;
}

interface Rule extends Omit<RecommendedModule, "priority"> {
  materialHref: string;
  when: (answers: CheckupAnswers) => boolean;
}

const modulePath = (slug: string) => `/modul-pendampingan/${slug}.pdf`;

const rules: Rule[] = [
  {
    slug: "digitalisasi-umkm",
    name: "Digitalisasi UMKM",
    reason:
      "Kanal transaksi, komunikasi, atau penjualan digital belum lengkap.",
    materialHref: modulePath("digitalisasi-umkm"),
    when: (a) =>
      !a.uses_whatsapp_business ||
      a.ecommerce_platforms.length === 0 ||
      a.payment_methods === "cash" ||
      a.order_channel === "in_store",
  },
  {
    slug: "branding-umkm",
    name: "Branding UMKM",
    reason: "Nama brand atau logo belum siap sebagai identitas usaha.",
    materialHref: modulePath("branding-umkm"),
    when: (a) => !a.has_fixed_brand_name || !a.has_logo,
  },
  {
    slug: "legalitas-usaha",
    name: "Legalitas Usaha",
    reason: "UMKM belum memiliki legalitas dasar atau NIB.",
    materialHref: modulePath("legalitas-usaha"),
    when: (a) => !a.has_nib,
  },
  {
    slug: "produk-kemasan",
    name: "Produk dan Kemasan",
    reason: "Produk, stok, atau visual kemasan belum konsisten.",
    materialHref: modulePath("produk-kemasan"),
    when: (a) => !a.product_active || a.visual_consistency !== "consistent",
  },
  {
    slug: "operasional-keuangan-dasar",
    name: "Operasional dan Keuangan Dasar",
    reason:
      "Harga, metode pembayaran, atau proses pengiriman masih perlu dirapikan.",
    materialHref: modulePath("operasional-keuangan-dasar"),
    when: (a) =>
      a.pricing_status !== "clear" ||
      a.payment_methods === "cash" ||
      !a.ships_orders,
  },
  {
    slug: "konsistensi-promosi",
    name: "Konsistensi Promosi",
    reason: "Aktivitas konten atau ritme promosi digital belum konsisten.",
    materialHref: modulePath("konsistensi-promosi"),
    when: (a) =>
      !a.instagram_username ||
      !a.social_active_recently ||
      a.posting_frequency !== "regular",
  },
  {
    slug: "profil-usaha-administrasi",
    name: "Profil Usaha dan Administrasi",
    reason:
      "Profil usaha, Google Maps, ulasan, atau administrasi website perlu disiapkan.",
    materialHref: modulePath("profil-usaha-administrasi"),
    when: (a) =>
      !a.google_maps_registered ||
      !a.has_google_reviews ||
      (a.product_active && a.has_fixed_brand_name),
  },
  {
    slug: "komitmen-growth",
    name: "Komitmen dan Growth",
    reason:
      "Komitmen mengelola website, memperbarui informasi, atau belajar bertumbuh perlu diperkuat.",
    materialHref: modulePath("komitmen-growth"),
    when: (a) =>
      a.commitment_manage_website === false ||
      a.commitment_update_information === false ||
      a.commitment_learn_and_grow === false,
  },
];

export const interventionModuleCatalog = rules.map((rule) => ({
  slug: rule.slug,
  name: rule.name,
  reason: rule.reason,
  materialHref: rule.materialHref,
}));

export function recommendModules(answers: CheckupAnswers): RecommendedModule[] {
  return rules
    .filter((rule) => rule.when(answers))
    .map((rule, index) => ({
      slug: rule.slug,
      name: rule.name,
      reason: rule.reason,
      priority: index + 1,
    }));
}

export function summarizeModules(modules: RecommendedModule[], limit = 6) {
  return modules.slice(0, limit);
}
