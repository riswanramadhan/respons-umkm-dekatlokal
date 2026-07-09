import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { demoUpdateProfile } from "@/demo/store";
import { apiError, zodApiError } from "@/server/api-response";
import { requireApiSession } from "@/server/auth/session";
import { requestContext } from "@/server/request-context";

const schema = z
  .object({ full_name: z.string().trim().min(2).max(120) })
  .strict();

export async function PATCH(request: NextRequest) {
  const context = requestContext(request);
  const session = await requireApiSession();
  if (!session)
    return apiError(
      401,
      "UNAUTHENTICATED",
      "Silakan login.",
      context.requestId,
    );
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return zodApiError(parsed.error, context.requestId);
  return NextResponse.json({
    data: demoUpdateProfile(parsed.data.full_name),
    request_id: context.requestId,
  });
}
