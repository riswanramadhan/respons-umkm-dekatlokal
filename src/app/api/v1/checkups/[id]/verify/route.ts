import { NextResponse, type NextRequest } from "next/server";

import { demoVerify } from "@/demo/store";
import { can } from "@/lib/permissions";
import { verificationSchema } from "@/lib/validation/checkup";
import { apiError, mapDatabaseError, zodApiError } from "@/server/api-response";
import { requireApiSession } from "@/server/auth/session";
import { requestContext } from "@/server/request-context";

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
  if (!can(session.role, "verify"))
    return apiError(
      403,
      "FORBIDDEN",
      "Role ini tidak dapat memverifikasi.",
      context.requestId,
    );
  const parsed = verificationSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return zodApiError(parsed.error, context.requestId);
  const { id } = await params;
  try {
    const data = demoVerify(
      id,
      parsed.data.version,
      parsed.data.status,
      parsed.data.reason,
    );
    return NextResponse.json({ data, request_id: context.requestId });
  } catch (error) {
    return mapDatabaseError(
      error instanceof Error ? error.message : "DEMO_ERROR",
      context.requestId,
    );
  }
}
