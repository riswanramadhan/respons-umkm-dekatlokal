import { z } from "zod";

import {
  ecommercePlatforms,
  googleRatingBands,
  orderChannels,
  paymentMethods,
  postingFrequencies,
  pricingStatuses,
  stockSystems,
  visualConsistencies,
} from "@/lib/scoring/types";

const nullableHandle = z
  .string()
  .trim()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9._-]+$/)
  .nullable();

export const checkupAnswersSchema = z
  .object({
    has_nib: z.boolean(),
    product_active: z.boolean(),
    pricing_status: z.enum(pricingStatuses),
    stock_system: z.enum(stockSystems),
    has_fixed_brand_name: z.boolean(),
    has_logo: z.boolean(),
    visual_consistency: z.enum(visualConsistencies),
    instagram_username: nullableHandle.default(null),
    tiktok_username: nullableHandle.default(null),
    google_maps_url: z.string().trim().url().max(2048).nullable().default(null),
    google_maps_registered: z.boolean(),
    has_google_reviews: z.boolean(),
    google_rating_band: z.enum(googleRatingBands),
    has_facebook_page: z.boolean(),
    uses_whatsapp_business: z.boolean(),
    ecommerce_platforms: z.array(z.enum(ecommercePlatforms)).max(7),
    ecommerce_other: z.string().trim().max(100).nullable().default(null),
    social_active_recently: z.boolean(),
    posting_frequency: z.enum(postingFrequencies),
    payment_methods: z.enum(paymentMethods),
    ships_orders: z.boolean(),
    order_channel: z.enum(orderChannels),
    commitment_manage_website: z.boolean().nullable().default(null),
    commitment_update_information: z.boolean().nullable().default(null),
    commitment_learn_and_grow: z.boolean().nullable().default(null),
  })
  .strict()
  .superRefine((answers, context) => {
    if (!answers.google_maps_registered) {
      if (answers.has_google_reviews) {
        context.addIssue({
          code: "custom",
          path: ["has_google_reviews"],
          message: "Ulasan Google memerlukan bisnis terdaftar di Google Maps.",
        });
      }
      if (answers.google_rating_band !== "unknown") {
        context.addIssue({
          code: "custom",
          path: ["google_rating_band"],
          message: "Rating harus unknown bila belum terdaftar di Google Maps.",
        });
      }
    }
    if (
      answers.ecommerce_platforms.includes("other") &&
      !answers.ecommerce_other
    ) {
      context.addIssue({
        code: "custom",
        path: ["ecommerce_other"],
        message: "Nama platform lain wajib diisi.",
      });
    }
  });

export const businessSchema = z
  .object({
    business_name: z.string().trim().min(2).max(160),
    owner_name: z.string().trim().min(2).max(160),
    whatsapp: z.string().trim().min(10).max(20),
    email: z.string().trim().email().max(254).nullable().default(null),
  })
  .strict();

export const checkupSubmissionSchema = z
  .object({
    schema_version: z.literal("1.0"),
    external_submission_id: z.string().trim().min(1).max(160).optional(),
    submitted_at: z.string().datetime({ offset: true }).optional(),
    business: businessSchema,
    answers: checkupAnswersSchema,
  })
  .strict();

export const updateCheckupSchema = z
  .object({
    version: z.number().int().positive(),
    business: businessSchema,
    answers: checkupAnswersSchema,
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const verificationSchema = z
  .object({
    version: z.number().int().positive(),
    status: z.enum(["unverified", "verified"]),
    reason: z.string().trim().min(3).max(500),
  })
  .strict();

export type CheckupSubmission = z.infer<typeof checkupSubmissionSchema>;
export type UpdateCheckupInput = z.infer<typeof updateCheckupSchema>;
