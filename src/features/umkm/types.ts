export interface ModuleBadge {
  id: string;
  slug: string;
  name: string;
  priority: number;
  status: string;
  origin: string;
  reason: string | null;
  isCurrent: boolean;
}

export interface UmkmListItem {
  id: string;
  slug: string;
  checkupId: string;
  businessName: string;
  ownerName: string;
  whatsappMasked: string;
  contactQuality: string;
  score: number;
  calculatedScore: number;
  hasOverride: boolean;
  category: "Rendah" | "Menengah" | "Siap";
  hasNib: boolean;
  googleMaps: boolean;
  whatsappBusiness: boolean;
  socialActive: boolean;
  postingFrequency: string;
  ecommercePlatforms: string[];
  modules: ModuleBadge[];
  verificationStatus: string;
  submittedAt: string;
  dataStatus: string;
  version: number;
  moduleSentToUmkm: boolean;
  moduleSentAt: string | null;
}

export interface UmkmPageResult {
  rows: UmkmListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}
