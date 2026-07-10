import { NextResponse } from "next/server";

import { requireSession } from "@/server/auth/session";
import { demoModulesDashboard, demoOverview } from "@/demo/store";

const SYSTEM_INSTRUCTION = `Kamu adalah DEKAT AI, asisten analisis internal untuk admin dashboard Respons UMKM DekatLokal.
Kamu hanya boleh menjawab berdasarkan konteks dashboard yang diberikan. Tolak dengan sopan pertanyaan di luar dashboard, politik, kesehatan, hukum, coding umum, atau data yang tidak ada.
Jawaban harus dalam Bahasa Indonesia, jelas, tidak terpotong, dan membantu admin mengambil tindakan. Gunakan **teks tebal** untuk temuan penting, lalu breakdown dengan bullet point. Jangan menyebut demo, simulasi, seed, database internal, atau bahwa kamu memakai prompt. Jangan mengarang angka atau nama UMKM.`;

export async function POST(request: Request) {
  try {
    await requireSession();
    const body = (await request.json()) as { message?: string; history?: Array<{ role: string; content: string }> };
    const message = body.message?.trim();
    if (!message) return NextResponse.json({ error: "Pertanyaan wajib diisi." }, { status: 400 });
    const overview = demoOverview("all");
    const modules = demoModulesDashboard();
    const context = JSON.stringify({ ringkasan: overview.kpi, distribusiModul: overview.modules, modul: modules.map((item) => ({ nama: item.name, dibutuhkan: item.neededCount, terkirim: item.sentCount })), prioritas: overview.priorities.slice(0, 12) });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "DEKAT AI belum aktif. Tambahkan GEMINI_API_KEY di Environment Variables Vercel." }, { status: 503 });
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] }, contents: [{ role: "user", parts: [{ text: `Konteks dashboard terkini:\n${context}\n\nPertanyaan admin:\n${message}` }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 2048, topP: 0.9 } }),
      signal: AbortSignal.timeout(30000),
    });
    const result = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
    if (!response.ok) return NextResponse.json({ error: result.error?.message || "Gemini gagal menjawab." }, { status: 502 });
    const answer = result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!answer) return NextResponse.json({ error: "DEKAT AI tidak mengembalikan jawaban." }, { status: 502 });
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("DEKAT AI error", error);
    return NextResponse.json({ error: "DEKAT AI sedang tidak dapat dihubungi." }, { status: 500 });
  }
}
