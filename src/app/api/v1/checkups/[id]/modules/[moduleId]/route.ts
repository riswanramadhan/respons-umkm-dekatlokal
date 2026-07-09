import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { demoSetModule } from "@/demo/store";
import { can } from "@/lib/permissions";
import { apiError, zodApiError } from "@/server/api-response";
import { requireApiSession } from "@/server/auth/session";
import { requestContext } from "@/server/request-context";

const schema = z
  .object({
    status: z.enum([
      "recommended",
      "planned",
      "in_progress",
      "completed",
      "dismissed",
    ]),
    reason: z.string().trim().min(3).max(500),
  })
  .strict();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> },
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
  if (
    !can(session.role, "progress_modules") &&
    !can(session.role, "manage_modules")
  )
    return apiError(
      403,
      "FORBIDDEN",
      "Role ini tidak dapat mengubah progres modul.",
      context.requestId,
    );
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return zodApiError(parsed.error, context.requestId);
  const { id, moduleId } = await params;
  const data = demoSetModule(
    id,
    moduleId,
    parsed.data.status,
    parsed.data.reason,
  );
  return NextResponse.json({ data, request_id: context.requestId });
}
