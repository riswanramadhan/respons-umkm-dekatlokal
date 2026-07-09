import { z } from "zod";

const booleanFilter = z.enum(["all", "yes", "no"]).default("all");

export const umkmFilterSchema = z.object({
  q: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(100).default(25),
  category: z.enum(["all", "Rendah", "Menengah", "Siap"]).default("all"),
  minScore: z.coerce.number().int().min(0).max(100).default(0),
  maxScore: z.coerce.number().int().min(0).max(100).default(100),
  nib: booleanFilter,
  googleMaps: booleanFilter,
  whatsappBusiness: booleanFilter,
  socialActive: booleanFilter,
  ecommerce: z.string().trim().max(40).default("all"),
  module: z.string().trim().max(80).default("all"),
  verification: z
    .enum(["all", "unverified", "verified"])
    .default("all"),
  sort: z
    .enum([
      "business_name",
      "owner_name",
      "effective_score",
      "readiness_category",
      "submitted_at",
    ])
    .default("submitted_at"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

export type UmkmFilters = z.infer<typeof umkmFilterSchema>;

export function parseUmkmFilters(
  params: Record<string, string | string[] | undefined>,
) {
  const flat = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
  const parsed = umkmFilterSchema.safeParse(flat);
  return parsed.success ? parsed.data : umkmFilterSchema.parse({});
}
