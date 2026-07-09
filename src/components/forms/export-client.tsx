"use client";

import { useMemo, useState } from "react";
import { Check, Download, FileSpreadsheet, FileText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppRole } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

export function ExportClient({ initialQuery, filteredTotal, allTotal, selectedCount, role }: { initialQuery: string; filteredTotal: number; allTotal: number; selectedCount: number; role: AppRole }) {
  const [format, setFormat] = useState<"csv" | "xlsx">(() => new URLSearchParams(initialQuery).get("format") === "xlsx" ? "xlsx" : "csv");
  const [scope, setScope] = useState<"current" | "all">(initialQuery ? "current" : "all");
  const exportHref = useMemo(() => {
    const params = scope === "current" ? new URLSearchParams(initialQuery) : new URLSearchParams();
    params.set("format", format);
    return `/api/v1/export?${params.toString()}`;
  }, [format, initialQuery, scope]);
  const rowCount = scope === "current" ? (selectedCount || filteredTotal) : allTotal;

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-8">
        <Card><CardHeader><CardTitle>Format file</CardTitle><CardDescription>Pilih format yang akan dibuat oleh server.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{([{ id: "csv", title: "CSV", description: "Ringan dan kompatibel dengan berbagai aplikasi.", icon: FileText }, { id: "xlsx", title: "Microsoft Excel", description: "Workbook terstruktur untuk analisis lanjutan.", icon: FileSpreadsheet }] as const).map((item) => { const Icon = item.icon; const active = format === item.id; return <button key={item.id} type="button" onClick={() => setFormat(item.id)} className={cn("flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors", active ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)]" : "border-[var(--border)] hover:bg-[var(--surface-muted)]")}><div className="rounded-xl bg-white p-2 text-[var(--brand-primary)]"><Icon className="size-5" /></div><div className="flex-1"><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{item.description}</p></div>{active ? <Check className="size-4 text-[var(--brand-primary)]" /> : null}</button>; })}</CardContent></Card>
        <Card><CardHeader><CardTitle>Cakupan data</CardTitle><CardDescription>Filter dan pilihan baris dari halaman Data UMKM tetap dipertahankan.</CardDescription></CardHeader><CardContent className="space-y-3"><label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4"><input type="radio" name="scope" checked={scope === "current"} onChange={() => setScope("current")} /><span><strong className="block text-sm">{selectedCount ? "Baris yang dipilih" : "Filter aktif"}</strong><span className="mt-1 block text-xs text-[var(--text-secondary)]"><AnimatedNumber value={selectedCount || filteredTotal} /> baris akan diekspor.</span></span></label><label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4"><input type="radio" name="scope" checked={scope === "all"} onChange={() => setScope("all")} /><span><strong className="block text-sm">Semua data</strong><span className="mt-1 block text-xs text-[var(--text-secondary)]"><AnimatedNumber value={allTotal} /> baris yang dapat diakses oleh role Anda.</span></span></label></CardContent></Card>
      </div>
      <Card className="h-fit lg:sticky lg:top-24 lg:col-span-4"><CardHeader><CardTitle>Ringkasan export</CardTitle><CardDescription>File disiapkan sesuai cakupan dan hak akses Anda.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="rounded-xl bg-[var(--surface-muted)] p-4"><p className="text-xs text-[var(--text-secondary)]">Jumlah baris</p><p className="mt-1 text-3xl font-semibold"><AnimatedNumber value={rowCount} /></p></div><dl className="space-y-2 text-sm"><div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Format</dt><dd className="font-semibold uppercase">{format}</dd></div><div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Kontak</dt><dd><Badge variant={role === "viewer" ? "warning" : "success"}>{role === "viewer" ? "Dimasking" : "Lengkap"}</Badge></dd></div></dl><div className="flex gap-2 rounded-xl bg-[var(--brand-primary-soft)] p-3 text-xs leading-5 text-[#1849A9]"><ShieldCheck className="mt-0.5 size-4 shrink-0" /><p>Hak akses dan perlindungan informasi kontak tetap diterapkan pada file export.</p></div><Button asChild className="w-full"><a href={exportHref}><Download />Download {format.toUpperCase()}</a></Button></CardContent></Card>
    </div>
  );
}
