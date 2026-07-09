export function maskWhatsapp(value: string | null | undefined) {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 7) return "••••••";
  return `${digits.slice(0, 4)}••••${digits.slice(-4)}`;
}

export function maskEmail(value: string | null | undefined) {
  if (!value) return "—";
  const [local, domain] = value.split("@");
  if (!local || !domain) return "••••••";
  return `${local.slice(0, Math.min(2, local.length))}•••@${domain}`;
}

export function redactAuditData(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactAuditData);
  if (!value || typeof value !== "object") return value;

  const sensitive = new Set([
    "whatsapp_raw",
    "whatsapp",
    "email",
    "whatsapp_normalized",
  ]);
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      sensitive.has(key) ? "[REDACTED]" : redactAuditData(entry),
    ]),
  );
}
