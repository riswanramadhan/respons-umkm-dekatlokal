import { parsePhoneNumberFromString } from "libphonenumber-js";

export interface NormalizedWhatsapp {
  raw: string;
  e164: string;
  waMe: string;
}

export function normalizeWhatsapp(input: string): NormalizedWhatsapp {
  const raw = input.trim();
  const parsed = parsePhoneNumberFromString(raw, "ID");
  if (!parsed?.isValid() || parsed.country !== "ID") {
    throw new Error("Nomor WhatsApp harus berupa nomor Indonesia yang valid.");
  }
  return { raw, e164: parsed.number, waMe: parsed.number.replace(/^\+/, "") };
}
