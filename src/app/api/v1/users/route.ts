import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { demoInviteProfile } from "@/demo/store";
import { can } from "@/lib/permissions";
import { apiError, zodApiError } from "@/server/api-response";
import { requireApiSession } from "@/server/auth/session";
import { requestContext } from "@/server/request-context";

const schema = z
  .object({
    email: z.string().email(),
    full_name: z.string().trim().min(2).max(120),
    role: z.enum(["superadmin", "viewer"]),
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
  if (!can(session.role, "manage_users"))
    return apiError(
      403,
      "FORBIDDEN",
      "Hanya superadmin dapat menambah pengguna.",
      context.requestId,
    );
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return zodApiError(parsed.error, context.requestId);
  try {
    return NextResponse.json(
      {
        data: demoInviteProfile(parsed.data),
        request_id: context.requestId,
      },
      { status: 201 },
    );
  } catch {
    return apiError(
      409,
      "DEMO_USER_EXISTS",
      "Email sudah terdaftar.",
      context.requestId,
    );
  }
}
