import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export interface HmacInput {
  secret: string;
  timestamp: string;
  idempotencyKey: string;
  rawBody: string;
}

export function createHmacSignature(input: HmacInput) {
  const message = `${input.timestamp}.${input.idempotencyKey}.${input.rawBody}`;
  return createHmac("sha256", input.secret).update(message).digest("hex");
}

export function verifyHmacSignature(input: HmacInput & { signature: string }) {
  const expected = Buffer.from(createHmacSignature(input), "hex");
  const suppliedHex = input.signature.replace(/^sha256=/, "");
  if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) return false;
  const supplied = Buffer.from(suppliedHex, "hex");
  return (
    expected.length === supplied.length && timingSafeEqual(expected, supplied)
  );
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function isFreshTimestamp(
  timestamp: string,
  now = Date.now(),
  toleranceMs = 5 * 60 * 1000,
) {
  const numeric = Number(timestamp);
  const milliseconds = Number.isFinite(numeric)
    ? numeric * 1000
    : Date.parse(timestamp);
  return (
    Number.isFinite(milliseconds) && Math.abs(now - milliseconds) <= toleranceMs
  );
}
