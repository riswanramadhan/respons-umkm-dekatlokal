import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

function hashIp(ip: string) {
  const secret =
    process.env.AUDIT_HASH_SECRET ?? "local-development-audit-secret";
  return createHmac("sha256", secret).update(ip).digest("hex");
}

export function requestContext(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return {
    requestId,
    ipHash: hashIp(ip),
    userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? "unknown",
  };
}
