"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

const starterMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Halo, saya AI demo DekatLokal. Saya bisa bantu membaca isi dashboard UMKM, modul pendampingan, kategori kesiapan, dan arah tindak lanjut data.",
  },
];

const suggestions = [
  "Data dashboard ini isinya apa saja?",
  "Modul apa yang paling sering dibutuhkan?",
  "Apa arti kategori Siap Digital?",
];

const THINKING_DELAY_BASE_MS = 900;
const THINKING_DELAY_MAX_EXTRA_MS = 650;

function replyFor(input: string) {
  const text = input.toLowerCase();
  const isDashboardTopic =
    /dashboard|umkm|data|modul|skor|kategori|siap|rendah|menengah|digital|export|ekspor|filter|pemilik|email|whatsapp|ig|instagram|website|pendampingan|legalitas|branding|promosi|keuangan|kemasan/.test(
      text,
    );

  if (!isDashboardTopic) {
    return "Saya masih mode demo dan hanya menjawab seputar dashboard UMKM DekatLokal. Coba tanyakan soal data UMKM, modul pendampingan, skor kesiapan, export, atau tindak lanjut dashboard.";
  }

  if (/isi|kolom|field|apa saja|data/.test(text)) {
    return "Data UMKM berisi nama usaha, pemilik, kontak, email, kanal sosial, status NIB, produk, branding, Google Maps, WA Business, marketplace, pembayaran, pengiriman, skor kesiapan, kategori, modul pendampingan, dan tanggal masuk.";
  }

  if (/modul|pendampingan|pdf/.test(text)) {
    return "Acuan modul saat ini ada 8: Digitalisasi UMKM, Branding UMKM, Legalitas Usaha, Produk dan Kemasan, Operasional dan Keuangan Dasar, Konsistensi Promosi, Profil Usaha dan Administrasi, serta Komitmen dan Growth.";
  }

  if (/siap|kategori|skor/.test(text)) {
    return "Kategori dihitung dari skor kesiapan. Rendah berarti butuh intervensi dasar, Menengah berarti sudah ada pondasi, dan Siap Digital berarti UMKM cukup matang untuk dikembangkan ke aset digital seperti profil usaha atau website.";
  }

  if (/export|ekspor|laporan/.test(text)) {
    return "Gunakan menu Export & Laporan untuk mengunduh data. Filter yang aktif di Data UMKM bisa dipakai untuk membatasi baris sebelum export.";
  }

  if (/email|ubah|edit|ganti|kontak/.test(text)) {
    return "Untuk data seed, email dan kontak ada di data/digital-checkup.seed.json pada field email, whatsapp, owner_name, dan business_name. Setelah diubah, restart dev server agar store demo membaca ulang seed.";
  }

  return "Untuk dashboard ini, langkah berikutnya yang bisa dianalisis adalah prioritas UMKM dengan gap terbesar, distribusi modul, data Siap Digital yang layak dibuatkan website, serta kebutuhan pendampingan per kanal digital.";
}

export function AiChatBubble() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [thinking, setThinking] = useState(false);
  const responseTimerRef = useRef<number | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const canSend = input.trim().length > 0 && !thinking;
  const latestMessages = useMemo(() => messages.slice(-7), [messages]);

  useEffect(() => {
    return () => {
      if (responseTimerRef.current) {
        window.clearTimeout(responseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open, thinking]);

  function send(value = input) {
    const question = value.trim();
    if (!question || thinking) return;
    const delay =
      THINKING_DELAY_BASE_MS +
      Math.min(question.length * 12, THINKING_DELAY_MAX_EXTRA_MS);

    setMessages((current) => [
      ...current,
      { role: "user", content: question },
    ]);
    setThinking(true);
    setInput("");

    responseTimerRef.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: replyFor(question) },
      ]);
      setThinking(false);
      responseTimerRef.current = null;
    }, delay);
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end sm:right-6 sm:bottom-6">
      {open ? (
        <section
          aria-label="AI chat dashboard"
          className="ai-chat-window mb-4 flex max-h-[min(590px,calc(100vh-112px))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[24px] border border-[#C7D7FE] bg-white/95 shadow-[0_28px_80px_rgba(16,24,40,0.24),0_12px_24px_rgba(2,85,245,0.12)] backdrop-blur sm:w-[410px]"
        >
          <header className="relative flex items-center justify-between gap-3 overflow-hidden border-b border-[#E0E7FF] bg-[linear-gradient(135deg,#F8FBFF_0%,#FFFFFF_48%,#ECFEFF_100%)] px-4 py-3.5">
            <div className="pointer-events-none absolute -top-10 right-8 size-24 rounded-full bg-[#7DD3FC]/30 blur-2xl" />
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#FFFFFF_0%,#DBEAFE_54%,#60A5FA_100%)] text-[#0255F5] shadow-[inset_0_2px_7px_rgba(255,255,255,0.9),inset_0_-10px_18px_rgba(2,85,245,0.22),0_10px_22px_rgba(2,85,245,0.28)]">
                <Sparkles className="absolute top-1.5 right-1.5 size-3 text-[#0EA5E9]" />
                <Bot className="size-5 drop-shadow-[0_2px_3px_rgba(2,85,245,0.24)]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#101828]">
                  AI Dashboard
                </p>
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  {thinking ? "Sedang berpikir..." : "Demo, khusus data UMKM"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="relative rounded-xl p-2 text-[var(--text-secondary)] transition-colors hover:bg-white hover:text-[var(--text-primary)]"
              aria-label="Tutup AI chat"
            >
              <X className="size-4" />
            </button>
          </header>

          <div
            className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] px-4 py-4"
            aria-live="polite"
          >
            {latestMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                className={cn(
                  "ai-chat-message flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <p
                  className={cn(
                    "max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 shadow-sm",
                    message.role === "user"
                      ? "bg-[linear-gradient(135deg,#0255F5_0%,#0EA5E9_100%)] text-white"
                      : "border border-[#EAECF0] bg-white text-[#344054]",
                  )}
                >
                  {message.content}
                </p>
              </div>
            ))}
            {thinking ? (
              <div className="ai-chat-message flex justify-start">
                <div className="flex max-w-[86%] items-center gap-3 rounded-2xl border border-[#EAECF0] bg-white px-3.5 py-2.5 text-sm text-[#344054] shadow-sm">
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <span className="ai-thinking-dot" />
                    <span className="ai-thinking-dot [animation-delay:120ms]" />
                    <span className="ai-thinking-dot [animation-delay:240ms]" />
                  </span>
                  <span>Sedang merangkai jawaban...</span>
                </div>
              </div>
            ) : null}
            {messages.length === starterMessages.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => send(item)}
                    disabled={thinking}
                    className="rounded-full border border-[#C7D7FE] bg-white px-3 py-1.5 text-left text-xs font-medium text-[#1849A9] shadow-sm transition-colors hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
            <div ref={messageEndRef} />
          </div>

          <form
            className="flex items-end gap-2 border-t border-[#E0E7FF] bg-white p-3"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              disabled={thinking}
              rows={1}
              placeholder={
                thinking
                  ? "Tunggu AI selesai menjawab..."
                  : "Tanya soal dashboard UMKM..."
              }
              className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-[#D0D5DD] bg-white px-3.5 py-2.5 text-sm transition-colors outline-none focus:border-[#0255F5] disabled:bg-[#F8FAFC] disabled:text-[#98A2B3]"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0255F5_0%,#0EA5E9_100%)] text-white shadow-[0_10px_22px_rgba(2,85,245,0.24)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-none disabled:bg-[#D0D5DD] disabled:shadow-none"
              aria-label="Kirim pertanyaan"
            >
              <Send className="size-4" />
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "ai-chat-launcher group relative flex size-16 items-center justify-center rounded-[22px] bg-[linear-gradient(145deg,#0266FF_0%,#0255F5_44%,#0B2F86_100%)] text-white shadow-[0_22px_42px_rgba(2,85,245,0.34),0_8px_0_rgba(11,47,134,0.55)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_28px_54px_rgba(2,85,245,0.38),0_9px_0_rgba(11,47,134,0.55)] active:translate-y-1 active:shadow-[0_14px_30px_rgba(2,85,245,0.3),0_4px_0_rgba(11,47,134,0.55)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#B2CCFF]",
          open && "translate-y-1 shadow-[0_14px_30px_rgba(2,85,245,0.3),0_4px_0_rgba(11,47,134,0.55)]",
        )}
        aria-label={open ? "Tutup AI chat dashboard" : "Buka AI chat dashboard"}
      >
        <span className="ai-chat-launcher-glow absolute -inset-2 rounded-[28px] bg-[conic-gradient(from_90deg,#0EA5E9,#0255F5,#7C3AED,#22C55E,#0EA5E9)] opacity-40 blur-md" />
        <span className="absolute inset-[3px] rounded-[19px] border border-white/30 bg-[linear-gradient(145deg,rgba(255,255,255,0.32),rgba(255,255,255,0.02)_54%,rgba(0,0,0,0.18))]" />
        <span className="ai-chat-icon-core relative flex size-12 items-center justify-center rounded-[18px] bg-[linear-gradient(145deg,#FFFFFF_0%,#DBEAFE_52%,#60A5FA_100%)] text-[#0255F5] shadow-[inset_0_2px_8px_rgba(255,255,255,0.95),inset_0_-12px_18px_rgba(2,85,245,0.24),0_12px_20px_rgba(0,24,80,0.28)]">
          <Sparkles className="absolute top-1.5 right-1.5 size-3 text-[#0EA5E9]" />
          <Bot className="size-6 drop-shadow-[0_2px_3px_rgba(2,85,245,0.24)]" />
        </span>
        <span className="absolute top-3 right-3 size-2.5 rounded-full border border-white/80 bg-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.9)]" />
      </button>
    </div>
  );
}
