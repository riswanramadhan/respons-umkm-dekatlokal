import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { demoSaveModule } from "@/demo/store";
import { can } from "@/lib/permissions";
import { apiError, zodApiError } from "@/server/api-response";
import { requireApiSession } from "@/server/auth/session";
import { requestContext } from "@/server/request-context";

const schema = z
  .object({
    id: z.string().uuid().optional(),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]+$/)
      .max(80),
    name: z.string().trim().min(3).max(160),
    description: z.string().trim().max(500).nullable(),
    display_order: z.number().int().min(0).max(10_000),
    is_active: z.boolean(),
  })
  .strict();

export async function POST(request: NextRequest) {
  const context = requestContext(request);
  const session = await requireApiSession();
  if (!session)
    return apiError(
      401,
      "UNAUTHENTICATED",
      "Silakan login.",
      context.requestId,
    );
  if (!can(session.role, "manage_modules"))
    return apiError(
      403,
      "FORBIDDEN",
      "Hanya superadmin dapat mengelola katalog.",
      context.requestId,
    );
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return zodApiError(parsed.error, context.requestId);
  try {
    return NextResponse.json({
      data: demoSaveModule(parsed.data),
      request_id: context.requestId,
    });
  } catch {
    return apiError(
      409,
      "MODULE_MUTATION_FAILED",
      "Modul gagal disimpan.",
      context.requestId,
    );
  }
}
