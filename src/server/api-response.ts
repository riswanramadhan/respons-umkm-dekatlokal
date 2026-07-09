import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function apiError(
  status: number,
  code: string,
  message: string,
  requestId: string,
  fieldErrors?: Record<string, string[] | undefined>,
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(fieldErrors ? { field_errors: fieldErrors } : {}),
        request_id: requestId,
      },
    },
    {
      status,
      headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" },
    },
  );
}

export function zodApiError(error: ZodError, requestId: string) {
  return apiError(
    422,
    "VALIDATION_ERROR",
    "Payload tidak valid.",
    requestId,
    error.flatten().fieldErrors,
  );
}

export function mapDatabaseError(message: string, requestId: string) {
  if (message.includes("VERSION_CONFLICT"))
    return apiError(
      409,
      "VERSION_CONFLICT",
      "Data telah diubah pengguna lain.",
      requestId,
    );
  if (message.includes("IDEMPOTENCY_CONFLICT"))
    return apiError(
      409,
      "IDEMPOTENCY_CONFLICT",
      "Idempotency-Key telah dipakai untuk payload lain.",
      requestId,
    );
  if (message.includes("IDEMPOTENCY_IN_PROGRESS"))
    return apiError(
      409,
      "IDEMPOTENCY_IN_PROGRESS",
      "Request dengan key ini sedang diproses.",
      requestId,
    );
  if (message.includes("IDENTITY_AMBIGUOUS"))
    return apiError(
      409,
      "IDENTITY_AMBIGUOUS",
      "Nomor terhubung ke beberapa UMKM; nama usaha harus cocok.",
      requestId,
    );
  if (message.includes("CONTACT_CONFLICT"))
    return apiError(
      409,
      "CONTACT_CONFLICT",
      "Nomor WhatsApp sudah digunakan UMKM lain.",
      requestId,
    );
  if (message.includes("NOT_FOUND"))
    return apiError(404, "NOT_FOUND", "Data tidak ditemukan.", requestId);
  if (message.includes("FORBIDDEN"))
    return apiError(403, "FORBIDDEN", "Anda tidak memiliki izin.", requestId);
  return apiError(
    500,
    "DEMO_OPERATION_ERROR",
    "Operasi data gagal.",
    requestId,
  );
}
