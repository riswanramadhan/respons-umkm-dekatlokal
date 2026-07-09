import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { demoRecordExport } from "@/demo/store";
import { rowsToCsv, rowsToXlsx } from "@/lib/export";
import { can } from "@/lib/permissions";
import { umkmFilterSchema } from "@/features/umkm/filters";
import { apiError } from "@/server/api-response";
import { requireApiSession } from "@/server/auth/session";
import { getExportRows } from "@/server/repositories/export";
import { requestContext } from "@/server/request-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const context = requestContext(request);
  const session = await requireApiSession();
  if (!session)
    return apiError(
      401,
      "UNAUTHENTICATED",
      "Silakan login.",
      context.requestId,
    );
  if (!can(session.role, "export_full") && !can(session.role, "export_masked"))
    return apiError(
      403,
      "FORBIDDEN",
      "Role ini tidak dapat export.",
      context.requestId,
    );
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const format = z.enum(["csv", "xlsx"]).catch("csv").parse(params.format);
  const filters = umkmFilterSchema.parse(params);
  const ids = params.ids
    ? params.ids
        .split(",")
        .filter((id) => z.string().uuid().safeParse(id).success)
        .slice(0, 1000)
    : undefined;
  const umkmId =
    params.umkmId && z.string().uuid().safeParse(params.umkmId).success
      ? params.umkmId
      : undefined;
  try {
    const rows = await getExportRows({
      filters,
      ids,
      umkmId,
      role: session.role,
    });
    demoRecordExport(rows.length, format);
    const date = new Date().toISOString().slice(0, 10);
    if (format === "xlsx") {
      const buffer = await rowsToXlsx(rows);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="dekatlokal-checkup-${date}.xlsx"`,
          "Cache-Control": "no-store",
          "X-Request-Id": context.requestId,
        },
      });
    }
    return new NextResponse(rowsToCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="dekatlokal-checkup-${date}.csv"`,
        "Cache-Control": "no-store",
        "X-Request-Id": context.requestId,
      },
    });
  } catch {
    return apiError(
      500,
      "EXPORT_FAILED",
      "Export gagal dibuat.",
      context.requestId,
    );
  }
}
