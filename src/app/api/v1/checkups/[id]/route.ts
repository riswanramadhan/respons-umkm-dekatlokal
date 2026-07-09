import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  demoDeleteCheckup,
  demoStore,
  demoUmkmDetail,
  demoUpdateCheckup,
} from "@/demo/store";
import { can } from "@/lib/permissions";
import { updateCheckupSchema } from "@/lib/validation/checkup";
import { apiError, mapDatabaseError, zodApiError } from "@/server/api-response";
import { requireApiSession } from "@/server/auth/session";
import { requestContext } from "@/server/request-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const deleteSchema = z
  .object({
    version: z.number().int().positive(),
    reason: z.string().trim().min(3).max(500),
  })
  .strict();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession();
  const requestId = crypto.randomUUID();
  if (!session)
    return apiError(401, "UNAUTHENTICATED", "Silakan login.", requestId);
  const { id } = await params;
  const checkup = demoStore().checkups.find((item) => item.id === id);
  if (!checkup)
    return apiError(404, "NOT_FOUND", "Checkup tidak ditemukan.", requestId);
  return NextResponse.json(
    {
      data: demoUmkmDetail(
        demoStore().businesses.find((item) => item.id === checkup.umkm_id)
          ?.slug ?? checkup.umkm_id,
      ),
      request_id: requestId,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

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
  if (!can(session.role, "edit"))
    return apiError(
      403,
      "FORBIDDEN",
      "Role ini tidak dapat mengedit.",
      context.requestId,
    );
  const parsed = updateCheckupSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return zodApiError(parsed.error, context.requestId);
  const { id } = await params;
  try {
    return NextResponse.json({
      data: demoUpdateCheckup(id, parsed.data),
      request_id: context.requestId,
    });
  } catch (error) {
    return mapDatabaseError(
      error instanceof Error ? error.message : "DEMO_ERROR",
      context.requestId,
    );
  }
}

export async function DELETE(
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
      "Hanya superadmin dapat menghapus.",
      context.requestId,
    );
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return zodApiError(parsed.error, context.requestId);
  const { id } = await params;
  try {
    demoDeleteCheckup(id, parsed.data.version, parsed.data.reason);
    return NextResponse.json({
      data: { id, deleted: true },
      request_id: context.requestId,
    });
  } catch (error) {
    return mapDatabaseError(
      error instanceof Error ? error.message : "DEMO_ERROR",
      context.requestId,
    );
  }
}
