import type { CheckupAnswers, ReadinessCategory, ScoreResult } from "./types";

const yes = (value: boolean) => (value ? 1 : 0);
const present = (value: string | null) => (value?.trim() ? 1 : 0);

export function categoryForScore(score: number): ReadinessCategory {
  if (score < 50) return "Rendah";
  if (score < 70) return "Menengah";
  return "Siap";
}

export function calculateScore(answers: CheckupAnswers): ScoreResult {
  let points = 0;

  points += yes(answers.has_nib);
  points += yes(answers.product_active);
  points += { clear: 1, variable: 0.5, none: 0 }[answers.pricing_status];
  points += { ready_stock: 0.75, pre_order: 0.75, both: 1 }[
    answers.stock_system
  ];
  points += yes(answers.has_fixed_brand_name);
  points += yes(answers.has_logo);
  points += { consistent: 1, partial: 0.5, none: 0 }[
    answers.visual_consistency
  ];
  points += present(answers.instagram_username);
  points += present(answers.tiktok_username) * 0.5;
  points += yes(answers.google_maps_registered);
  points += yes(answers.has_google_reviews);
  points += { above_4: 1, below_4: 0.5, unknown: 0 }[
    answers.google_rating_band
  ];
  points += yes(answers.has_facebook_page) * 0.5;
  points += yes(answers.uses_whatsapp_business);
  points += answers.ecommerce_platforms.length > 0 ? 1 : 0;
  points += yes(answers.social_active_recently);
  points += { regular: 1, sometimes: 0.5, never: 0 }[answers.posting_frequency];
  points += { cash: 0.25, digital: 0.75, both: 1 }[answers.payment_methods];
  points += yes(answers.ships_orders);
  points += { whatsapp: 1, social_media_dm: 0.75, in_store: 0.25 }[
    answers.order_channel
  ];

  const score = Math.round((points / 19) * 100);
  return { points, maxPoints: 19, score, category: categoryForScore(score) };
}
