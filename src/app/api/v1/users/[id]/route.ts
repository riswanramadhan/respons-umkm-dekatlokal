import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { demoUpdateUser } from "@/demo/store";
import { can } from "@/lib/permissions";
import { apiError, zodApiError } from "@/server/api-response";
import { requireApiSession } from "@/server/auth/session";
import { requestContext } from "@/server/request-context";

const schema = z
  .object({
    role: z.enum(["superadmin", "viewer"]),
    is_active: z.boolean(),
  })
  .strict();

export async function PATCH(
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
  if (!can(session.role, "manage_users"))
    return apiError(
      403,
      "FORBIDDEN",
      "Hanya superadmin dapat mengubah pengguna.",
      context.requestId,
    );
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return zodApiError(parsed.error, context.requestId);
  const { id } = await params;
  if (
    id === session.id &&
    (!parsed.data.is_active || parsed.data.role !== "superadmin")
  )
    return apiError(
      409,
      "SELF_LOCKOUT",
      "Anda tidak dapat menurunkan atau menonaktifkan akun sendiri.",
      context.requestId,
    );
  try {
    return NextResponse.json({
      data: demoUpdateUser(id, parsed.data.role, parsed.data.is_active),
      request_id: context.requestId,
    });
  } catch {
    return apiError(
      404,
      "NOT_FOUND",
      "Pengguna tidak ditemukan.",
      context.requestId,
    );
  }
}
