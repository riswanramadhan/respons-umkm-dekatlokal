export const pricingStatuses = ["clear", "variable", "none"] as const;
export const stockSystems = ["ready_stock", "pre_order", "both"] as const;
export const visualConsistencies = ["consistent", "partial", "none"] as const;
export const googleRatingBands = ["above_4", "below_4", "unknown"] as const;
export const postingFrequencies = ["regular", "sometimes", "never"] as const;
export const paymentMethods = ["cash", "digital", "both"] as const;
export const orderChannels = [
  "whatsapp",
  "social_media_dm",
  "in_store",
] as const;
export const ecommercePlatforms = [
  "shopee",
  "tokopedia",
  "bukalapak",
  "lazada",
  "blibli",
  "tiktok_shop",
  "other",
] as const;

export type PricingStatus = (typeof pricingStatuses)[number];
export type StockSystem = (typeof stockSystems)[number];
export type VisualConsistency = (typeof visualConsistencies)[number];
export type GoogleRatingBand = (typeof googleRatingBands)[number];
export type PostingFrequency = (typeof postingFrequencies)[number];
export type PaymentMethod = (typeof paymentMethods)[number];
export type OrderChannel = (typeof orderChannels)[number];
export type EcommercePlatform = (typeof ecommercePlatforms)[number];
export type ReadinessCategory = "Rendah" | "Menengah" | "Siap";

export interface CheckupAnswers {
  has_nib: boolean;
  product_active: boolean;
  pricing_status: PricingStatus;
  stock_system: StockSystem;
  has_fixed_brand_name: boolean;
  has_logo: boolean;
  visual_consistency: VisualConsistency;
  instagram_username: string | null;
  tiktok_username: string | null;
  google_maps_url: string | null;
  google_maps_registered: boolean;
  has_google_reviews: boolean;
  google_rating_band: GoogleRatingBand;
  has_facebook_page: boolean;
  uses_whatsapp_business: boolean;
  ecommerce_platforms: EcommercePlatform[];
  ecommerce_other: string | null;
  social_active_recently: boolean;
  posting_frequency: PostingFrequency;
  payment_methods: PaymentMethod;
  ships_orders: boolean;
  order_channel: OrderChannel;
  commitment_manage_website: boolean | null;
  commitment_update_information: boolean | null;
  commitment_learn_and_grow: boolean | null;
}

export interface ScoreResult {
  points: number;
  maxPoints: 19;
  score: number;
  category: ReadinessCategory;
}
