import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { demoRestoreCheckup } from "@/demo/store";
import { can } from "@/lib/permissions";
import { apiError, mapDatabaseError, zodApiError } from "@/server/api-response";
import { requireApiSession } from "@/server/auth/session";
import { requestContext } from "@/server/request-context";

const schema = z.object({ reason: z.string().trim().min(3).max(500) }).strict();

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
  if (!can(session.role, "delete_restore"))
    return apiError(
      403,
      "FORBIDDEN",
      "Hanya superadmin dapat memulihkan.",
      context.requestId,
    );
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return zodApiError(parsed.error, context.requestId);
  const { id } = await params;
  try {
    const data = demoRestoreCheckup(id, parsed.data.reason);
    return NextResponse.json({ data, request_id: context.requestId });
  } catch (error) {
    return mapDatabaseError(
      error instanceof Error ? error.message : "DEMO_ERROR",
      context.requestId,
    );
  }
}
