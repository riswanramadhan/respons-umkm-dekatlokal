import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { apiError } from "@/server/api-response";
import { requestContext } from "@/server/request-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const context = requestContext(request);
  return apiError(
    501,
    "DEMO_UI_ONLY",
    "Dashboard lokal ini tidak menerima submission eksternal. Hubungkan kontrak UI ini ke sistem produksi pada implementasi utama.",
    context.requestId,
  );
}

export function GET() {
  return NextResponse.json(
    {
      name: "DekatLokal Dashboard UI",
      version: "1.0",
      mode: "operational-ui",
      accepts_submissions: false,
      request_id: randomUUID(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
