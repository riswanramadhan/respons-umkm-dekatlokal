import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { demoReveal } from "@/demo/store";
import { can } from "@/lib/permissions";
import { apiError, mapDatabaseError, zodApiError } from "@/server/api-response";
import { requireApiSession } from "@/server/auth/session";
import { requestContext } from "@/server/request-context";

const schema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(3)
      .max(200)
      .default("Membuka kontak dari halaman detail"),
  })
  .strict();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = requestContext(request);
  const session = await requireApiSession();
  if (!session)
    return apiError(
      401,
      "UNAUTHENTICATED",
      "Silakan login.",
      context.requestId,
    );
  if (!can(session.role, "reveal_pii"))
    return apiError(
      403,
      "FORBIDDEN",
      "Role viewer tidak dapat membuka kontak.",
      context.requestId,
    );
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return zodApiError(parsed.error, context.requestId);
  const { id } = await params;
  try {
    return NextResponse.json(
      {
        data: demoReveal(id, parsed.data.reason),
        request_id: context.requestId,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return mapDatabaseError(
      error instanceof Error ? error.message : "DEMO_ERROR",
      context.requestId,
    );
  }
}
