"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage { role: "assistant" | "user"; content: string; }
const starterMessages: ChatMessage[] = [{ role: "assistant", content: "Halo, saya **DEKAT AI**. Saya membantu menganalisis data dashboard Respons UMKM DekatLokal, prioritas pendampingan, skor kesiapan, dan distribusi modul." }];
const suggestions = ["Apa temuan utama dashboard saat ini?", "Modul apa yang paling banyak dibutuhkan?", "Bagaimana prioritas tindak lanjut admin?"];

function renderContent(content: string) {
  return content.split("\n").map((line, index) => {
    const html = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    const bullet = /^\s*[-•]\s+(.+)/.exec(line);
    const bulletText = bullet?.[1] ?? "";
    return <span key={`${index}-${line.slice(0, 8)}`} className={cn("block", bullet && "pl-4 before:absolute before:-ml-3 before:content-['•']")} dangerouslySetInnerHTML={{ __html: bulletText ? bulletText.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") : html || " " }} />;
  });
}

export function AiChatBubble() {
  const [open, setOpen] = useState(false); const [input, setInput] = useState(""); const [messages, setMessages] = useState<ChatMessage[]>(starterMessages); const [thinking, setThinking] = useState(false); const [typing, setTyping] = useState(false); const endRef = useRef<HTMLDivElement>(null); const timerRef = useRef<number | null>(null);
  useEffect(() => () => { if (timerRef.current !== null) window.clearInterval(timerRef.current); }, []);
  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open, thinking]);
  async function send(value = input) {
    const question = value.trim(); if (!question || thinking || typing) return;
    setInput(""); setThinking(true); setMessages((current) => [...current, { role: "user", content: question }]);
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question, history: messages.slice(-6) }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Gagal memproses pertanyaan.");
      setThinking(false); setTyping(true); setMessages((current) => [...current, { role: "assistant", content: "" }]);
      let index = 0; const answer = String(data.answer); timerRef.current = window.setInterval(() => { index += Math.max(1, Math.ceil(answer.length / 240)); setMessages((current) => { const copy = [...current]; copy[copy.length - 1] = { role: "assistant", content: answer.slice(0, index) }; return copy; }); if (index >= answer.length) { if (timerRef.current !== null) window.clearInterval(timerRef.current); timerRef.current = null; setTyping(false); } }, 18);
    } catch (error) { setThinking(false); setMessages((current) => [...current, { role: "assistant", content: `**DEKAT AI belum bisa menjawab.**\n- ${error instanceof Error ? error.message : "Silakan coba lagi."}` }]); }
  }
  return <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end sm:right-6 sm:bottom-6">
    {open ? <section aria-label="DEKAT AI" className="ai-chat-window mb-4 flex max-h-[min(620px,calc(100vh-112px))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[24px] border border-[#C7D7FE] bg-white/95 shadow-[0_28px_80px_rgba(16,24,40,0.24)] sm:w-[430px]">
      <header className="flex items-center justify-between border-b border-[#E0E7FF] bg-[linear-gradient(135deg,#F8FBFF,#ECFEFF)] px-4 py-3.5"><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-[#DBEAFE] text-[#0255F5]"><Sparkles className="absolute size-3 translate-x-3 -translate-y-3 text-[#0EA5E9]" /><Bot className="size-5" /></div><div><p className="text-sm font-semibold">DEKAT AI</p><p className="text-xs text-[var(--text-secondary)]">{thinking || typing ? "Sedang merangkai jawaban..." : "Analisis dashboard UMKM"}</p></div></div><button type="button" onClick={() => setOpen(false)} aria-label="Tutup DEKAT AI"><X className="size-4" /></button></header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#F8FAFC] px-4 py-4" aria-live="polite">{messages.slice(-9).map((message, index) => <div key={`${index}-${message.role}`} className={cn("ai-chat-message flex", message.role === "user" ? "justify-end" : "justify-start")}><div className={cn("max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 shadow-sm", message.role === "user" ? "bg-[#0255F5] text-white" : "border border-[#EAECF0] bg-white text-[#344054]")}>{renderContent(message.content)}</div></div>)}{thinking ? <div className="flex items-center gap-2 rounded-2xl border bg-white px-3.5 py-2.5 text-sm text-[#667085]">{[0,1,2].map((item) => <span key={item} className="ai-thinking-dot" style={{ animationDelay: `${item * 120}ms` }} />)} Menyusun analisis...</div> : null}{messages.length === 1 ? <div className="flex flex-wrap gap-2">{suggestions.map((item) => <button key={item} type="button" onClick={() => send(item)} className="rounded-full border border-[#C7D7FE] bg-white px-3 py-1.5 text-xs text-[#1849A9]">{item}</button>)}</div> : null}<div ref={endRef} /></div>
      <form className="flex items-end gap-2 border-t bg-white p-3" onSubmit={(event) => { event.preventDefault(); void send(); }}><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} disabled={thinking || typing} rows={1} placeholder="Tanya analisis dashboard..." className="min-h-10 flex-1 resize-none rounded-2xl border px-3.5 py-2.5 text-sm outline-none focus:border-[#0255F5]" /><button type="submit" disabled={!input.trim() || thinking || typing} aria-label="Kirim pertanyaan" className="flex size-11 items-center justify-center rounded-2xl bg-[#0255F5] text-white disabled:bg-[#D0D5DD]"><Send className="size-4" /></button></form>
    </section> : null}<button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Tutup DEKAT AI" : "Buka DEKAT AI"} className="ai-chat-launcher relative flex size-16 items-center justify-center rounded-[22px] bg-[linear-gradient(145deg,#0266FF,#0B2F86)] text-white shadow-[0_22px_42px_rgba(2,85,245,.34)]"><span className="ai-chat-launcher-glow absolute -inset-2 rounded-[28px] bg-[#0EA5E9] opacity-40 blur-md" /><span className="relative flex size-12 items-center justify-center rounded-[18px] bg-[#DBEAFE] text-[#0255F5]"><Bot className="size-6" /></span></button>
  </div>;
}
