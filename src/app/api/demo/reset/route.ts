import { resetDemoStore } from "@/demo/store";
import { requestContext } from "@/server/request-context";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const context = requestContext(request);
  const state = resetDemoStore();
  return NextResponse.json(
    {
      data: { reset: true, total: state.businesses.length },
      request_id: context.requestId,
    },
    {
      headers: {
        "X-Request-Id": context.requestId,
        "Cache-Control": "no-store",
      },
    },
  );
}
