import "server-only";

import seedRows from "../../data/digital-checkup.seed.json";

import type { OverviewData } from "@/features/overview/types";
import type { UmkmFilters } from "@/features/umkm/filters";
import type {
  ModuleBadge,
  UmkmListItem,
  UmkmPageResult,
} from "@/features/umkm/types";
import { calculateScore } from "@/lib/scoring/calculate-score";
import {
  interventionModuleCatalog,
  recommendModules,
} from "@/lib/scoring/recommend-modules";
import type {
  CheckupAnswers,
  EcommercePlatform,
  ReadinessCategory,
} from "@/lib/scoring/types";
import type { UpdateCheckupInput } from "@/lib/validation/checkup";
import { maskEmail, maskWhatsapp, redactAuditData } from "@/lib/masking";

interface SeedRow {
  legacy_no: number;
  business_name: string;
  owner_name: string;
  whatsapp: string;
  email: string | null;
  has_nib: boolean;
  product_active: boolean;
  pricing_status: string;
  stock_system: string;
  has_fixed_brand_name: boolean;
  has_logo: boolean;
  visual_consistency: string;
  instagram_username: string | null;
  tiktok_username: string | null;
  google_maps_url: string | null;
  google_maps_registered: boolean;
  has_google_reviews: boolean;
  google_rating_band: string;
  has_facebook_page: boolean;
  uses_whatsapp_business: boolean;
  ecommerce_platforms: string[];
  social_active_recently: boolean;
  posting_frequency: string;
  payment_methods: string;
  ships_orders: boolean;
  order_channel: string;
  submitted_at?: string;
  include_in_dashboard?: boolean;
  commitment_manage_website?: boolean;
  commitment_update_information?: boolean;
  commitment_learn_and_grow?: boolean;
}

export interface DemoBusiness {
  id: string;
  legacy_no: number;
  slug: string;
  business_name: string;
  owner_name: string;
  whatsapp_raw: string;
  email: string | null;
  module_sent_to_umkm: boolean;
  module_sent_at: string | null;
  module_sent_by: string | null;
  contact_quality_status: "valid" | "duplicate";
  contact_quality_note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DemoCheckup extends CheckupAnswers {
  id: string;
  umkm_id: string;
  external_submission_id: string;
  calculated_score: number;
  overridden_score: number | null;
  override_reason: string | null;
  effective_score: number;
  readiness_category: ReadinessCategory;
  source: "digital_checkup_form";
  data_status: "operational";
  verification_status: "unverified" | "verified";
  submitted_at: string;
  verified_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  google_maps_link_status: "provided" | "not_copied" | "not_available";
}

export interface DemoModule {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  materialHref: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DemoCheckupModule {
  checkup_id: string;
  module_id: string;
  priority: number;
  status: "recommended" | "planned" | "in_progress" | "completed" | "dismissed";
  origin: "automatic" | "manual";
  reason: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface DemoAudit {
  id: number;
  actor_id: string | null;
  actor_type: "user" | "integration" | "system";
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_data: unknown;
  after_data: unknown;
  reason: string | null;
  request_id: string;
  created_at: string;
  profiles: { full_name: string } | null;
}

export interface DemoProfile {
  id: string;
  full_name: string;
  email: string;
  role: "superadmin" | "viewer";
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

interface DemoState {
  businesses: DemoBusiness[];
  checkups: DemoCheckup[];
  modules: DemoModule[];
  checkupModules: DemoCheckupModule[];
  audits: DemoAudit[];
  profiles: DemoProfile[];
  nextAuditId: number;
}

const DEMO_ACTOR_ID = "00000000-0000-4000-8000-000000000001";
const ecommerceMap: Record<string, EcommercePlatform> = {
  Shopee: "shopee",
  Tokopedia: "tokopedia",
  Bukalapak: "bukalapak",
  Lazada: "lazada",
  Blibli: "blibli",
  "TikTok Shop": "tiktok_shop",
  "Platform e-commerce lainnya": "other",
};

function uuid(prefix: number, value: number) {
  return `${String(prefix).padStart(8, "0")}-0000-4000-8000-${String(value).padStart(12, "0")}`;
}

function slugifyBusinessName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "dan")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const businessNameOverrides: Record<number, string> = {
  3: "Ideinart Studio",
  8: "Mathfal Living",
  16: "Conatcos Atelier",
  18: "Pentol Daeng Ismail",
  21: "Dapur Fifa",
  23: "Tami Gula Aren",
  33: "Es Segar Mardiana",
  36: "Cemilan April",
  44: "Dapur Lontara",
  48: "Warung Rasa Malik",
  49: "Bakso Tusuk Laras",
};

function businessNameForRow(row: SeedRow) {
  return businessNameOverrides[row.legacy_no] ?? row.business_name;
}

function emailForRow(row: SeedRow) {
  if (row.email) return row.email;
  const words = row.owner_name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1 && !["spd", "mpd"].includes(word));
  const local = (words.slice(0, 2).join(".") || `umkm${row.legacy_no}`).slice(
    0,
    24,
  );
  const suffix = ((row.legacy_no * 17 + 23) % 90) + 10;
  return `${local}${suffix}@gmail.com`;
}

function whatsappForRow(row: SeedRow) {
  return row.legacy_no === 9 ? "081355028349" : row.whatsapp;
}

function submittedAtForRow(row: SeedRow, index: number) {
  return row.submitted_at ?? submittedAtForIndex(index);
}

function isAboveFourRating(value: string) {
  return value.startsWith("≥") || value.startsWith("â‰¥");
}

function submittedAtForIndex(index: number) {
  const batches = [
    { month: 2, day: 4, count: 1 },
    { month: 2, day: 9, count: 1 },
    { month: 2, day: 15, count: 2 },
    { month: 2, day: 22, count: 1 },
    { month: 2, day: 28, count: 2 },
    { month: 3, day: 3, count: 2 },
    { month: 3, day: 8, count: 3 },
    { month: 3, day: 14, count: 2 },
    { month: 3, day: 20, count: 4 },
    { month: 3, day: 27, count: 3 },
    { month: 4, day: 4, count: 1 },
    { month: 4, day: 10, count: 2 },
    { month: 4, day: 16, count: 3 },
    { month: 4, day: 23, count: 2 },
    { month: 4, day: 29, count: 2 },
    { month: 5, day: 5, count: 1 },
    { month: 5, day: 11, count: 1 },
    { month: 5, day: 18, count: 2 },
    { month: 5, day: 26, count: 1 },
  ];
  let remaining = index;
  let batch = 0;
  while (remaining >= (batches[batch]?.count ?? 1)) {
    remaining -= batches[batch]?.count ?? 1;
    batch += 1;
  }
  const slot = batches[batch] ?? batches.at(-1)!;
  const date = new Date(Date.UTC(2026, slot.month, slot.day));
  const hour = 8 + (index % 8);
  const minute = (index * 11) % 60;
  date.setUTCHours(hour, minute, 0, 0);
  return date.toISOString();
}

function mapAnswers(row: SeedRow): CheckupAnswers {
  return {
    has_nib: row.has_nib,
    product_active: row.product_active,
    pricing_status:
      row.pricing_status === "Iya Jelas"
        ? "clear"
        : row.pricing_status === "Kadang Berubah"
          ? "variable"
          : "none",
    stock_system:
      row.stock_system === "Keduanya"
        ? "both"
        : row.stock_system === "Pre-Order"
          ? "pre_order"
          : "ready_stock",
    has_fixed_brand_name: row.has_fixed_brand_name,
    has_logo: row.has_logo,
    visual_consistency:
      row.visual_consistency === "Konsisten"
        ? "consistent"
        : row.visual_consistency === "Sebagian"
          ? "partial"
          : "none",
    instagram_username: row.instagram_username,
    tiktok_username: row.tiktok_username,
    google_maps_url: row.google_maps_url,
    google_maps_registered: row.google_maps_registered,
    has_google_reviews: row.has_google_reviews,
    google_rating_band: isAboveFourRating(row.google_rating_band)
      ? "above_4"
      : row.google_rating_band.startsWith("<")
        ? "below_4"
        : "unknown",
    has_facebook_page: row.has_facebook_page,
    uses_whatsapp_business: row.uses_whatsapp_business,
    ecommerce_platforms: row.ecommerce_platforms.map(
      (platform) => ecommerceMap[platform] ?? "other",
    ),
    ecommerce_other: row.ecommerce_platforms.includes(
      "Platform e-commerce lainnya",
    )
      ? "Platform lain"
      : null,
    social_active_recently: row.social_active_recently,
    posting_frequency:
      row.posting_frequency === "Rutin"
        ? "regular"
        : row.posting_frequency === "Kadang"
          ? "sometimes"
          : "never",
    payment_methods:
      row.payment_methods === "Keduanya"
        ? "both"
        : row.payment_methods === "Qris/Transfer"
          ? "digital"
          : "cash",
    ships_orders: row.ships_orders,
    order_channel:
      row.order_channel === "Chat Whatsapp"
        ? "whatsapp"
        : row.order_channel === "DM Media sosial"
          ? "social_media_dm"
          : "in_store",
    commitment_manage_website:
      row.commitment_manage_website ?? row.legacy_no % 10 !== 0,
    commitment_update_information:
      row.commitment_update_information ?? row.legacy_no % 7 !== 0,
    commitment_learn_and_grow:
      row.commitment_learn_and_grow ?? row.legacy_no % 12 !== 0,
  };
}

function createState(): DemoState {
  const modules: DemoModule[] = interventionModuleCatalog.map(
    (module, index) => ({
      id: uuid(3, index + 1),
      slug: module.slug,
      name: module.name,
      description: module.reason,
      materialHref: module.materialHref,
      is_active: true,
      display_order: (index + 1) * 10,
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-01T00:00:00.000Z",
    }),
  );
  const moduleBySlug = new Map(modules.map((module) => [module.slug, module]));
  const businesses: DemoBusiness[] = [];
  const checkups: DemoCheckup[] = [];
  const checkupModules: DemoCheckupModule[] = [];

  const selectedRows = (seedRows as SeedRow[]).filter(
    (row) => row.legacy_no <= 36 || row.include_in_dashboard === true,
  );
  selectedRows.forEach((row, index) => {
    const businessId = uuid(1, row.legacy_no);
    const checkupId = uuid(2, row.legacy_no);
    const submitted = submittedAtForRow(row, index);
    const moduleSent = index !== 32 && index !== 35;
    const verificationStatus: DemoCheckup["verification_status"] = moduleSent
      ? "verified"
      : "unverified";
    const businessName = businessNameForRow(row);
    const answers = mapAnswers(row);
    const score = calculateScore(answers);
    businesses.push({
      id: businessId,
      legacy_no: row.legacy_no,
      slug: slugifyBusinessName(businessName),
      business_name: businessName,
      owner_name: row.owner_name,
      whatsapp_raw: whatsappForRow(row),
      email: emailForRow(row),
      module_sent_to_umkm: moduleSent,
      module_sent_at: moduleSent
        ? new Date(new Date(submitted).getTime() + 172_800_000).toISOString()
        : null,
      module_sent_by: moduleSent ? "Superadmin DekatLokal" : null,
      contact_quality_status: "valid",
      contact_quality_note: null,
      created_at: submitted,
      updated_at: submitted,
      deleted_at: null,
    });
    checkups.push({
      id: checkupId,
      umkm_id: businessId,
      external_submission_id: `operasional-${row.legacy_no}`,
      ...answers,
      google_maps_link_status: row.google_maps_url
        ? "provided"
        : row.google_maps_registered
          ? "not_copied"
          : "not_available",
      calculated_score: score.score,
      overridden_score: null,
      override_reason: null,
      effective_score: score.score,
      readiness_category: score.category,
      source: "digital_checkup_form",
      data_status: "operational",
      verification_status: verificationStatus,
      submitted_at: submitted,
      verified_at: moduleSent
        ? new Date(new Date(submitted).getTime() + 86_400_000).toISOString()
        : null,
      version: 1,
      created_at: submitted,
      updated_at: submitted,
      deleted_at: null,
    });
    recommendModules(answers).forEach((recommended) => {
      const catalogModule = moduleBySlug.get(recommended.slug);
      if (!catalogModule) return;
      checkupModules.push({
        checkup_id: checkupId,
        module_id: catalogModule.id,
        priority: recommended.priority,
        status:
          row.legacy_no % 9 === 0 && recommended.priority === 1
            ? "in_progress"
            : "recommended",
        origin: "automatic",
        reason: recommended.reason,
        is_current: true,
        created_at: submitted,
        updated_at: submitted,
      });
    });
  });

  const audits: DemoAudit[] = [];

  return {
    businesses,
    checkups,
    modules,
    checkupModules,
    audits,
    profiles: [
      {
        id: DEMO_ACTOR_ID,
        full_name: "Superadmin DekatLokal",
        email: "hello@dekatlokal.com",
        role: "superadmin",
        is_active: true,
        created_at: "2026-05-01T00:00:00.000Z",
        last_sign_in_at: new Date().toISOString(),
      },
      {
        id: uuid(9, 2),
        full_name: "Partner UMKM",
        email: "partner@dekatlokal.com",
        role: "viewer",
        is_active: true,
        created_at: "2026-05-02T00:00:00.000Z",
        last_sign_in_at: "2026-07-04T03:15:00.000Z",
      },
    ],
    nextAuditId: audits.length + 1,
  };
}

const globalDemo = globalThis as typeof globalThis & {
  __dekatlokalDemoState?: DemoState;
};

export function demoStore() {
  globalDemo.__dekatlokalDemoState ??= createState();
  return globalDemo.__dekatlokalDemoState;
}

export function resetDemoStore() {
  globalDemo.__dekatlokalDemoState = createState();
  return globalDemo.__dekatlokalDemoState;
}

function appendAudit(
  input: Omit<DemoAudit, "id" | "created_at" | "profiles" | "request_id">,
) {
  const state = demoStore();
  const audit: DemoAudit = {
    ...input,
    id: state.nextAuditId++,
    created_at: new Date().toISOString(),
    request_id: crypto.randomUUID(),
    profiles: input.actor_id
      ? {
          full_name:
            state.profiles.find((profile) => profile.id === input.actor_id)
              ?.full_name ?? "Demo User",
        }
      : null,
  };
  state.audits.unshift(audit);
  return audit;
}

export function demoSession() {
  return {
    id: DEMO_ACTOR_ID,
    email: "hello@dekatlokal.com",
    fullName: demoStore().profiles[0]!.full_name,
    role: "superadmin" as const,
  };
}

function activeCheckups() {
  const state = demoStore();
  return state.checkups.filter(
    (checkup) =>
      !checkup.deleted_at &&
      !state.businesses.find((business) => business.id === checkup.umkm_id)
        ?.deleted_at,
  );
}

export function demoOverview(
  period: "30d" | "90d" | "1y" | "all",
): OverviewData {
  const state = demoStore();
  const days =
    period === "30d"
      ? 30
      : period === "90d"
        ? 90
        : period === "1y"
          ? 365
          : null;
  const threshold = days ? Date.now() - days * 86_400_000 : 0;
  const latest = activeCheckups().filter(
    (checkup) => new Date(checkup.submitted_at).getTime() >= threshold,
  );
  const count = (predicate: (checkup: DemoCheckup) => boolean) =>
    latest.filter(predicate).length;
  const groups = (rows: Array<{ name: string; value: number }>) => rows;
  const moduleCount = new Map<string, number>();
  state.checkupModules
    .filter(
      (item) =>
        item.is_current &&
        latest.some((checkup) => checkup.id === item.checkup_id),
    )
    .forEach((item) =>
      moduleCount.set(
        item.module_id,
        (moduleCount.get(item.module_id) ?? 0) + 1,
      ),
    );
  const trend = new Map<string, number>();
  latest.forEach((checkup) => {
    const date = checkup.submitted_at.slice(0, 10);
    trend.set(date, (trend.get(date) ?? 0) + 1);
  });
  const ordered = [...latest].sort((a, b) =>
    b.submitted_at.localeCompare(a.submitted_at),
  );
  const business = (id: string) =>
    state.businesses.find((item) => item.id === id)!;
  return {
    kpi: {
      total_umkm: latest.length,
      rendah: count((item) => item.readiness_category === "Rendah"),
      menengah: count((item) => item.readiness_category === "Menengah"),
      siap: count((item) => item.readiness_category === "Siap"),
      average_score: latest.length
        ? Math.round(
            (latest.reduce((sum, item) => sum + item.effective_score, 0) /
              latest.length) *
              10,
          ) / 10
        : 0,
      without_nib: count((item) => !item.has_nib),
      without_google_maps: count((item) => !item.google_maps_registered),
      without_whatsapp_business: count((item) => !item.uses_whatsapp_business),
      inactive_social: count((item) => !item.social_active_recently),
    },
    categories: groups([
      {
        name: "Rendah",
        value: count((item) => item.readiness_category === "Rendah"),
      },
      {
        name: "Menengah",
        value: count((item) => item.readiness_category === "Menengah"),
      },
      {
        name: "Siap",
        value: count((item) => item.readiness_category === "Siap"),
      },
    ]),
    gaps: groups([
      { name: "NIB", value: count((item) => !item.has_nib) },
      {
        name: "Brand/logo",
        value: count((item) => !item.has_fixed_brand_name || !item.has_logo),
      },
      {
        name: "Google Maps",
        value: count((item) => !item.google_maps_registered),
      },
      {
        name: "WhatsApp Bisnis",
        value: count((item) => !item.uses_whatsapp_business),
      },
      {
        name: "Media sosial aktif",
        value: count((item) => !item.social_active_recently),
      },
      {
        name: "Pembayaran digital",
        value: count((item) => item.payment_methods === "cash"),
      },
    ]),
    channels: groups([
      {
        name: "Instagram",
        value: count((item) => Boolean(item.instagram_username)),
      },
      { name: "TikTok", value: count((item) => Boolean(item.tiktok_username)) },
      { name: "Facebook", value: count((item) => item.has_facebook_page) },
      {
        name: "WhatsApp Business",
        value: count((item) => item.uses_whatsapp_business),
      },
      {
        name: "Marketplace",
        value: count((item) => item.ecommerce_platforms.length > 0),
      },
      {
        name: "Google Maps",
        value: count((item) => item.google_maps_registered),
      },
    ]),
    modules: [...moduleCount.entries()]
      .map(([id, value]) => ({
        name: state.modules.find((module) => module.id === id)?.name ?? "Modul",
        slug: state.modules.find((module) => module.id === id)?.slug,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
    trend: [...trend.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value })),
    latest: ordered.slice(0, 5).map((item) => ({
      checkup_id: item.id,
      umkm_id: item.umkm_id,
      slug: business(item.umkm_id).slug,
      business_name: business(item.umkm_id).business_name,
      owner_name: business(item.umkm_id).owner_name,
      score: item.effective_score,
      category: item.readiness_category,
      status: item.verification_status,
      submitted_at: item.submitted_at,
      data_status: item.data_status,
    })),
    priorities: ordered
      .filter(
        (item) =>
          item.readiness_category === "Rendah" ||
          !item.has_nib ||
          !item.google_maps_registered ||
          !item.uses_whatsapp_business,
      )
      .sort((a, b) => a.effective_score - b.effective_score)
      .slice(0, 8)
      .map((item) => ({
        checkup_id: item.id,
        umkm_id: item.umkm_id,
        slug: business(item.umkm_id).slug,
        business_name: business(item.umkm_id).business_name,
        owner_name: business(item.umkm_id).owner_name,
        score: item.effective_score,
        category: item.readiness_category,
        submitted_at: item.submitted_at,
        reasons: [
          item.readiness_category === "Rendah" ? "Skor rendah" : null,
          !item.has_nib ? "Belum NIB" : null,
          !item.google_maps_registered ? "Belum Google Maps" : null,
          !item.uses_whatsapp_business ? "Belum WA Business" : null,
        ].filter(Boolean),
      })),
  };
}

function moduleRows(checkupId: string): ModuleBadge[] {
  const state = demoStore();
  return state.checkupModules
    .filter((item) => item.checkup_id === checkupId && item.is_current)
    .sort((a, b) => a.priority - b.priority)
    .map((item) => {
      const catalogModule = state.modules.find(
        (candidate) => candidate.id === item.module_id,
      )!;
      return {
        id: catalogModule.id,
        slug: catalogModule.slug,
        name: catalogModule.name,
        priority: item.priority,
        status: item.status,
        origin: item.origin,
        reason: item.reason,
        isCurrent: item.is_current,
      };
    });
}

export function demoListUmkm(filters: UmkmFilters): UmkmPageResult {
  const state = demoStore();
  let rows: UmkmListItem[] = activeCheckups().map((checkup) => {
    const business = state.businesses.find(
      (item) => item.id === checkup.umkm_id,
    )!;
    return {
      id: business.id,
      slug: business.slug,
      checkupId: checkup.id,
      businessName: business.business_name,
      ownerName: business.owner_name,
      whatsappMasked: maskWhatsapp(business.whatsapp_raw),
      contactQuality: business.contact_quality_status,
      score: checkup.effective_score,
      calculatedScore: checkup.calculated_score,
      hasOverride: checkup.overridden_score !== null,
      category: checkup.readiness_category,
      hasNib: checkup.has_nib,
      googleMaps: checkup.google_maps_registered,
      whatsappBusiness: checkup.uses_whatsapp_business,
      socialActive: checkup.social_active_recently,
      postingFrequency: checkup.posting_frequency,
      ecommercePlatforms: checkup.ecommerce_platforms,
      modules: moduleRows(checkup.id),
      verificationStatus: checkup.verification_status,
      submittedAt: checkup.submitted_at,
      dataStatus: checkup.data_status,
      version: checkup.version,
      moduleSentToUmkm: business.module_sent_to_umkm,
      moduleSentAt: business.module_sent_at,
    };
  });
  const query = filters.q.toLowerCase();
  if (query)
    rows = rows.filter((row) =>
      `${row.businessName} ${row.ownerName} ${state.businesses.find((item) => item.id === row.id)?.whatsapp_raw}`
        .toLowerCase()
        .includes(query),
    );
  if (filters.category !== "all")
    rows = rows.filter((row) => row.category === filters.category);
  rows = rows.filter(
    (row) => row.score >= filters.minScore && row.score <= filters.maxScore,
  );
  const booleanFilter = (
    value: "all" | "yes" | "no",
    getter: (row: UmkmListItem) => boolean,
  ) => {
    if (value !== "all")
      rows = rows.filter((row) => getter(row) === (value === "yes"));
  };
  booleanFilter(filters.nib, (row) => row.hasNib);
  booleanFilter(filters.googleMaps, (row) => row.googleMaps);
  booleanFilter(filters.whatsappBusiness, (row) => row.whatsappBusiness);
  booleanFilter(filters.socialActive, (row) => row.socialActive);
  if (filters.ecommerce !== "all")
    rows = rows.filter((row) =>
      row.ecommercePlatforms.includes(filters.ecommerce),
    );
  if (filters.module !== "all")
    rows = rows.filter((row) =>
      row.modules.some((module) => module.slug === filters.module),
    );
  if (filters.verification !== "all")
    rows = rows.filter(
      (row) => row.verificationStatus === filters.verification,
    );
  const keyMap = {
    business_name: "businessName",
    owner_name: "ownerName",
    effective_score: "score",
    readiness_category: "category",
    submitted_at: "submittedAt",
  } as const;
  const key = keyMap[filters.sort];
  rows.sort(
    (a, b) =>
      String(a[key]).localeCompare(String(b[key]), "id", { numeric: true }) *
      (filters.direction === "asc" ? 1 : -1),
  );
  const total = rows.length;
  const start = (filters.page - 1) * filters.pageSize;
  return {
    rows: rows.slice(start, start + filters.pageSize),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount: Math.ceil(total / filters.pageSize),
  };
}

function joinedModules(checkupId: string) {
  const state = demoStore();
  return state.checkupModules
    .filter((item) => item.checkup_id === checkupId)
    .sort((a, b) => a.priority - b.priority)
    .map((item) => ({
      ...item,
      intervention_modules: state.modules.find(
        (module) => module.id === item.module_id,
      )!,
    }));
}

export function demoUmkmDetail(umkmSlug: string) {
  const state = demoStore();
  const business = state.businesses.find(
    (item) => item.slug === umkmSlug && !item.deleted_at,
  );
  const checkups = state.checkups
    .filter((item) => item.umkm_id === business?.id && !item.deleted_at)
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
  if (!business || !checkups.length) return null;
  const ids = new Set([business.id, ...checkups.map((item) => item.id)]);
  return {
    business: {
      id: business.id,
      legacyNo: business.legacy_no,
      slug: business.slug,
      businessName: business.business_name,
      ownerName: business.owner_name,
      whatsappMasked: maskWhatsapp(business.whatsapp_raw),
      emailMasked: maskEmail(business.email),
      contact: {
        whatsapp: business.whatsapp_raw,
        email: business.email,
      },
      contactQuality: business.contact_quality_status,
      contactQualityNote: business.contact_quality_note,
      moduleSentToUmkm: business.module_sent_to_umkm,
      moduleSentAt: business.module_sent_at,
      moduleSentBy: business.module_sent_by,
      createdAt: business.created_at,
      updatedAt: business.updated_at,
    },
    checkups: checkups.map((checkup) => ({
      ...checkup,
      modules: joinedModules(checkup.id),
    })),
    audits: state.audits
      .filter((audit) => audit.entity_id && ids.has(audit.entity_id))
      .slice(0, 100),
  };
}

export function demoHeaderNotifications() {
  const state = demoStore();
  const rows = activeCheckups()
    .filter((item) => item.verification_status === "unverified")
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
  return {
    count: rows.length,
    items: rows.slice(0, 5).map((item) => ({
      id: item.id,
      umkmId: item.umkm_id,
      businessName:
        state.businesses.find((business) => business.id === item.umkm_id)
          ?.business_name ?? "UMKM",
      slug:
        state.businesses.find((business) => business.id === item.umkm_id)
          ?.slug ?? item.umkm_id,
      status: item.verification_status,
      submittedAt: item.submitted_at,
    })),
  };
}

export function demoModulesDashboard() {
  const state = demoStore();
  return state.modules
    .sort((a, b) => a.display_order - b.display_order)
    .map((module) => {
      const related = state.checkupModules.filter(
        (item) => item.module_id === module.id && item.is_current,
      );
      const relatedBusinesses = [
        ...new Map(
          related
            .map((item) =>
              state.businesses.find(
                (business) =>
                  business.id ===
                  state.checkups.find(
                    (checkup) => checkup.id === item.checkup_id,
                  )?.umkm_id,
              ),
            )
            .filter((business): business is DemoBusiness => Boolean(business))
            .map((business) => [business.id, business]),
        ).values(),
      ];
      const sentCount = relatedBusinesses.filter(
        (business) => business.module_sent_to_umkm,
      ).length;
      return {
        ...module,
        neededCount: relatedBusinesses.length,
        sentCount,
        notSentCount: relatedBusinesses.length - sentCount,
        assignedBusinesses: relatedBusinesses.slice(0, 8).map((business) => ({
          id: business.id,
          slug: business.slug,
          businessName: business.business_name,
          ownerName: business.owner_name,
          moduleSentToUmkm: business.module_sent_to_umkm,
        })),
      };
    });
}

export function demoAuditPage(page: number, action = "all", query = "") {
  let rows = demoStore().audits;
  if (action !== "all") rows = rows.filter((item) => item.action === action);
  if (query)
    rows = rows.filter((item) =>
      `${item.action} ${item.entity_type} ${item.reason}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  const pageSize = 30;
  return {
    rows: rows.slice((page - 1) * pageSize, page * pageSize),
    total: rows.length,
    page,
    pageSize,
    pageCount: Math.ceil(rows.length / pageSize),
  };
}

export function demoDeletedCheckups() {
  const state = demoStore();
  return state.checkups
    .filter((item) => item.deleted_at)
    .map((checkup) => ({
      id: checkup.id,
      umkm_id: checkup.umkm_id,
      effective_score: checkup.effective_score,
      readiness_category: checkup.readiness_category,
      deleted_at: checkup.deleted_at!,
      version: checkup.version,
      business:
        state.businesses.find((item) => item.id === checkup.umkm_id) ?? null,
    }));
}

export function demoUpdateCheckup(
  checkupId: string,
  input: UpdateCheckupInput,
) {
  const state = demoStore();
  const checkup = state.checkups.find(
    (item) => item.id === checkupId && !item.deleted_at,
  );
  if (!checkup) throw new Error("NOT_FOUND");
  if (checkup.version !== input.version) throw new Error("VERSION_CONFLICT");
  const business = state.businesses.find(
    (item) => item.id === checkup.umkm_id,
  )!;
  const before = redactAuditData({ business, checkup: { ...checkup } });
  business.business_name = input.business.business_name;
  business.owner_name = input.business.owner_name;
  business.whatsapp_raw = input.business.whatsapp;
  business.email = input.business.email;
  business.updated_at = new Date().toISOString();
  Object.assign(checkup, input.answers);
  const score = calculateScore(input.answers);
  checkup.calculated_score = score.score;
  checkup.effective_score = score.score;
  checkup.readiness_category = score.category;
  checkup.overridden_score = null;
  checkup.override_reason = null;
  checkup.version += 1;
  checkup.updated_at = new Date().toISOString();
  state.checkupModules
    .filter(
      (item) => item.checkup_id === checkup.id && item.origin === "automatic",
    )
    .forEach((item) => {
      item.is_current = false;
    });
  recommendModules(input.answers).forEach((recommended) => {
    const catalogModule = state.modules.find(
      (item) => item.slug === recommended.slug,
    );
    if (!catalogModule) return;
    const existing = state.checkupModules.find(
      (item) =>
        item.checkup_id === checkup.id && item.module_id === catalogModule.id,
    );
    if (existing) {
      existing.priority = recommended.priority;
      existing.reason = recommended.reason;
      existing.is_current = true;
      existing.updated_at = new Date().toISOString();
    } else
      state.checkupModules.push({
        checkup_id: checkup.id,
        module_id: catalogModule.id,
        priority: recommended.priority,
        status: "recommended",
        origin: "automatic",
        reason: recommended.reason,
        is_current: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
  });
  appendAudit({
    actor_id: DEMO_ACTOR_ID,
    actor_type: "user",
    action: "update",
    entity_type: "digital_checkup",
    entity_id: checkup.id,
    before_data: before,
    after_data: redactAuditData({ business, checkup }),
    reason: input.reason || "Pembaruan data UMKM",
  });
  return {
    id: checkup.id,
    version: checkup.version,
    calculated_score: checkup.calculated_score,
    effective_score: checkup.effective_score,
    readiness_category: checkup.readiness_category,
  };
}

export function demoVerify(
  checkupId: string,
  version: number,
  status: DemoCheckup["verification_status"],
  reason: string,
) {
  const state = demoStore();
  const checkup = state.checkups.find(
    (item) => item.id === checkupId && !item.deleted_at,
  );
  if (!checkup) throw new Error("NOT_FOUND");
  if (checkup.version !== version) throw new Error("VERSION_CONFLICT");
  const before = checkup.verification_status;
  checkup.verification_status = status;
  checkup.verified_at = status === "verified" ? new Date().toISOString() : null;
  checkup.version += 1;
  const business = state.businesses.find((item) => item.id === checkup.umkm_id);
  if (business) {
    business.module_sent_to_umkm = status === "verified";
    business.module_sent_at =
      status === "verified" ? checkup.verified_at : null;
    business.module_sent_by =
      status === "verified" ? "Superadmin DekatLokal" : null;
    business.updated_at = new Date().toISOString();
  }
  appendAudit({
    actor_id: DEMO_ACTOR_ID,
    actor_type: "user",
    action: "verify",
    entity_type: "digital_checkup",
    entity_id: checkup.id,
    before_data: { status: before },
    after_data: { status },
    reason,
  });
  return { id: checkup.id, status, version: checkup.version };
}

export function demoOverride(
  checkupId: string,
  version: number,
  score: number,
  reason: string,
) {
  const checkup = demoStore().checkups.find(
    (item) => item.id === checkupId && !item.deleted_at,
  );
  if (!checkup) throw new Error("NOT_FOUND");
  if (checkup.version !== version) throw new Error("VERSION_CONFLICT");
  const before = checkup.effective_score;
  checkup.overridden_score = score;
  checkup.override_reason = reason;
  checkup.effective_score = score;
  checkup.readiness_category =
    score < 50 ? "Rendah" : score < 70 ? "Menengah" : "Siap";
  checkup.version += 1;
  appendAudit({
    actor_id: DEMO_ACTOR_ID,
    actor_type: "user",
    action: "override_score",
    entity_type: "digital_checkup",
    entity_id: checkup.id,
    before_data: { effective_score: before },
    after_data: { effective_score: score },
    reason,
  });
  return {
    id: checkup.id,
    effective_score: score,
    readiness_category: checkup.readiness_category,
    version: checkup.version,
  };
}

export function demoSetModule(
  checkupId: string,
  moduleId: string,
  status: DemoCheckupModule["status"],
  reason: string,
) {
  const state = demoStore();
  let row = state.checkupModules.find(
    (item) => item.checkup_id === checkupId && item.module_id === moduleId,
  );
  const before = row ? { ...row } : null;
  if (row) {
    row.status = status;
    row.is_current = status !== "dismissed";
    row.updated_at = new Date().toISOString();
  } else {
    row = {
      checkup_id: checkupId,
      module_id: moduleId,
      priority:
        Math.max(
          0,
          ...state.checkupModules
            .filter((item) => item.checkup_id === checkupId)
            .map((item) => item.priority),
        ) + 1,
      status,
      origin: "manual",
      reason,
      is_current: status !== "dismissed",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.checkupModules.push(row);
  }
  appendAudit({
    actor_id: DEMO_ACTOR_ID,
    actor_type: "user",
    action: "module_progress",
    entity_type: "digital_checkup",
    entity_id: checkupId,
    before_data: before,
    after_data: row,
    reason,
  });
  return row;
}

export function demoDeleteCheckup(
  checkupId: string,
  version: number,
  reason: string,
) {
  const checkup = demoStore().checkups.find(
    (item) => item.id === checkupId && !item.deleted_at,
  );
  if (!checkup) throw new Error("NOT_FOUND");
  if (checkup.version !== version) throw new Error("VERSION_CONFLICT");
  checkup.deleted_at = new Date().toISOString();
  checkup.version += 1;
  appendAudit({
    actor_id: DEMO_ACTOR_ID,
    actor_type: "user",
    action: "delete",
    entity_type: "digital_checkup",
    entity_id: checkupId,
    before_data: { deleted_at: null },
    after_data: { deleted_at: checkup.deleted_at },
    reason,
  });
}

export function demoRestoreCheckup(checkupId: string, reason: string) {
  const checkup = demoStore().checkups.find(
    (item) => item.id === checkupId && item.deleted_at,
  );
  if (!checkup) throw new Error("NOT_FOUND");
  checkup.deleted_at = null;
  checkup.version += 1;
  appendAudit({
    actor_id: DEMO_ACTOR_ID,
    actor_type: "user",
    action: "restore",
    entity_type: "digital_checkup",
    entity_id: checkupId,
    before_data: { deleted: true },
    after_data: { deleted: false },
    reason,
  });
  return { id: checkup.id, version: checkup.version };
}

export function demoReveal(umkmId: string, reason: string) {
  const business = demoStore().businesses.find(
    (item) => item.id === umkmId && !item.deleted_at,
  );
  if (!business) throw new Error("NOT_FOUND");
  appendAudit({
    actor_id: DEMO_ACTOR_ID,
    actor_type: "user",
    action: "reveal_pii",
    entity_type: "umkm",
    entity_id: umkmId,
    before_data: null,
    after_data: { fields: ["whatsapp", "email"] },
    reason,
  });
  return { whatsapp: business.whatsapp_raw, email: business.email };
}

export function demoSaveModule(input: {
  id?: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}) {
  const state = demoStore();
  const existing = input.id
    ? state.modules.find((item) => item.id === input.id)
    : undefined;
  const before = existing ? { ...existing } : null;
  if (existing)
    Object.assign(existing, input, { updated_at: new Date().toISOString() });
  else
    state.modules.push({
      ...input,
      id: uuid(3, state.modules.length + 1),
      materialHref: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  const saved = existing ?? state.modules.at(-1)!;
  appendAudit({
    actor_id: DEMO_ACTOR_ID,
    actor_type: "user",
    action: before ? "module_update" : "module_create",
    entity_type: "intervention_module",
    entity_id: saved.id,
    before_data: before,
    after_data: saved,
    reason: "Pengelolaan katalog pendampingan",
  });
  return saved;
}

export function demoUpdateProfile(name: string) {
  const profile = demoStore().profiles[0]!;
  const before = profile.full_name;
  profile.full_name = name;
  appendAudit({
    actor_id: profile.id,
    actor_type: "user",
    action: "profile_update",
    entity_type: "profile",
    entity_id: profile.id,
    before_data: { full_name: before },
    after_data: { full_name: name },
    reason: "Pembaruan profil pengguna",
  });
  return profile;
}

export function demoInviteProfile(input: {
  email: string;
  full_name: string;
  role: DemoProfile["role"];
}) {
  const state = demoStore();
  if (
    state.profiles.some(
      (item) => item.email.toLowerCase() === input.email.toLowerCase(),
    )
  )
    throw new Error("DUPLICATE_USER");
  const profile: DemoProfile = {
    id: uuid(9, state.profiles.length + 1),
    ...input,
    is_active: true,
    created_at: new Date().toISOString(),
    last_sign_in_at: null,
  };
  state.profiles.push(profile);
  appendAudit({
    actor_id: DEMO_ACTOR_ID,
    actor_type: "user",
    action: "user_invite",
    entity_type: "profile",
    entity_id: profile.id,
    before_data: null,
    after_data: { ...profile, email: "[REDACTED]" },
    reason: "Simulasi undangan pengguna",
  });
  return profile;
}

export function demoUpdateUser(
  id: string,
  role: DemoProfile["role"],
  isActive: boolean,
) {
  const profile = demoStore().profiles.find((item) => item.id === id);
  if (!profile) throw new Error("NOT_FOUND");
  const before = { ...profile };
  profile.role = role;
  profile.is_active = isActive;
  appendAudit({
    actor_id: DEMO_ACTOR_ID,
    actor_type: "user",
    action: "user_update",
    entity_type: "profile",
    entity_id: id,
    before_data: before,
    after_data: profile,
    reason: "Pembaruan akses pengguna",
  });
  return profile;
}

export function demoExportRows(checkupIds?: string[], umkmId?: string) {
  const state = demoStore();
  return state.checkups
    .filter(
      (checkup) =>
        !checkup.deleted_at &&
        (!checkupIds?.length || checkupIds.includes(checkup.id)) &&
        (!umkmId || checkup.umkm_id === umkmId),
    )
    .map((checkup) => {
      const business = state.businesses.find(
        (item) => item.id === checkup.umkm_id,
      )!;
      return {
        legacy_no: business.legacy_no,
        nama_umkm: business.business_name,
        pemilik: business.owner_name,
        whatsapp: business.whatsapp_raw,
        email: business.email ?? "",
        skor_hitung: checkup.calculated_score,
        skor_efektif: checkup.effective_score,
        kategori: checkup.readiness_category,
        verifikasi: checkup.verification_status,
        nib: checkup.has_nib,
        produk_aktif: checkup.product_active,
        google_maps: checkup.google_maps_registered,
        whatsapp_business: checkup.uses_whatsapp_business,
        ecommerce: checkup.ecommerce_platforms.join("; "),
        sosial_aktif: checkup.social_active_recently,
        pembayaran: checkup.payment_methods,
        pengiriman: checkup.ships_orders,
        modul: moduleRows(checkup.id)
          .map((item) => item.name)
          .join("; "),
        status_data: checkup.data_status,
        tanggal_masuk: checkup.submitted_at,
      };
    });
}

export function demoRecordExport(rowCount: number, format: string) {
  appendAudit({
    actor_id: DEMO_ACTOR_ID,
    actor_type: "user",
    action: "export",
    entity_type: "digital_checkup",
    entity_id: null,
    before_data: null,
    after_data: { row_count: rowCount, format, local: true },
    reason: "Export data operasional",
  });
}
