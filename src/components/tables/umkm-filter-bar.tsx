"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SelectNative } from "@/components/ui/select-native";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { UmkmFilters } from "@/features/umkm/filters";

interface ModuleOption {
  slug: string;
  name: string;
}
const labels: Record<string, string> = {
  category: "Kategori",
  verification: "Verifikasi",
  nib: "NIB",
  googleMaps: "Google Maps",
  whatsappBusiness: "WA Business",
  socialActive: "Media sosial",
  ecommerce: "Marketplace",
  module: "Modul",
  minScore: "Skor min.",
  maxScore: "Skor maks.",
};

function FilterFields({ filters, modules, search }: { filters: UmkmFilters; modules: ModuleOption[]; search: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SelectNative name="category" defaultValue={filters.category} aria-label="Kategori kesiapan"><option value="all">Semua kategori</option><option>Rendah</option><option>Menengah</option><option>Siap</option></SelectNative>
      <SelectNative name="verification" defaultValue={filters.verification} aria-label="Status verifikasi"><option value="all">Semua verifikasi</option><option value="unverified">Belum diverifikasi</option><option value="verified">Terverifikasi</option></SelectNative>
      <SelectNative name="nib" defaultValue={filters.nib} aria-label="Kepemilikan NIB"><option value="all">Semua NIB</option><option value="yes">Sudah NIB</option><option value="no">Belum NIB</option></SelectNative>
      <SelectNative name="googleMaps" defaultValue={filters.googleMaps} aria-label="Google Maps"><option value="all">Semua Google Maps</option><option value="yes">Sudah Google Maps</option><option value="no">Belum Google Maps</option></SelectNative>
      <SelectNative name="whatsappBusiness" defaultValue={filters.whatsappBusiness} aria-label="WhatsApp Business"><option value="all">Semua WA Business</option><option value="yes">Pakai WA Business</option><option value="no">Belum WA Business</option></SelectNative>
      <SelectNative name="socialActive" defaultValue={filters.socialActive} aria-label="Aktivitas sosial"><option value="all">Semua aktivitas sosial</option><option value="yes">Sosial aktif</option><option value="no">Sosial tidak aktif</option></SelectNative>
      <SelectNative name="ecommerce" defaultValue={filters.ecommerce} aria-label="Platform e-commerce"><option value="all">Semua marketplace</option><option value="shopee">Shopee</option><option value="tokopedia">Tokopedia</option><option value="tiktok_shop">TikTok Shop</option><option value="other">Platform lain</option></SelectNative>
      <SelectNative name="module" defaultValue={filters.module} aria-label="Modul pendampingan"><option value="all">Semua modul</option>{modules.map((module) => <option key={module.slug} value={module.slug}>{module.name}</option>)}</SelectNative>
      <div className="flex items-center gap-2 sm:col-span-2"><Input name="minScore" type="number" min={0} max={100} defaultValue={filters.minScore} aria-label="Skor minimum" /><span className="text-[var(--text-tertiary)]">–</span><Input name="maxScore" type="number" min={0} max={100} defaultValue={filters.maxScore} aria-label="Skor maksimum" /></div>
      <SelectNative name="pageSize" defaultValue={filters.pageSize} aria-label="Baris per halaman"><option value="10">10 baris</option><option value="25">25 baris</option><option value="50">50 baris</option><option value="100">100 baris</option></SelectNative>
      <input type="hidden" name="q" value={search} /><input type="hidden" name="sort" value={filters.sort} /><input type="hidden" name="direction" value={filters.direction} />
      <Button type="submit">Terapkan filter</Button>
    </div>
  );
}

export function UmkmFilterBar({ filters, modules }: { filters: UmkmFilters; modules: ModuleOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useSearchParams();
  const [search, setSearch] = useState(filters.q);

  useEffect(() => {
    if (search === filters.q) return;
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(current.toString());
      if (search) params.set("q", search); else params.delete("q");
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, filters.q, current, pathname, router]);

  const defaults: Record<string, string> = { category: "all", verification: "all", nib: "all", googleMaps: "all", whatsappBusiness: "all", socialActive: "all", ecommerce: "all", module: "all", minScore: "0", maxScore: "100" };
  const active = Object.entries(defaults).filter(([key, defaultValue]) => String(filters[key as keyof UmkmFilters]) !== defaultValue);
  function without(key: string) {
    const params = new URLSearchParams(current.toString());
    params.delete(key); params.set("page", "1");
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="border-b border-[var(--border)] p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1"><Search className="absolute top-3 left-3 size-4 text-[var(--text-tertiary)]" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama UMKM, pemilik, atau nomor..." aria-label="Cari UMKM" className="pl-9" /></div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild><Button type="button" variant="outline" className="hidden md:inline-flex"><SlidersHorizontal />Filter{active.length ? <Badge className="ml-1 px-1.5 py-0.5">{active.length}</Badge> : null}</Button></PopoverTrigger>
            <PopoverContent className="w-[520px] p-4"><div className="mb-4"><p className="font-semibold">Filter Data UMKM</p><p className="text-xs text-[var(--text-secondary)]">Filter diterapkan pada data, pagination, dan export.</p></div><form method="get"><FilterFields filters={filters} modules={modules} search={search} /></form></PopoverContent>
          </Popover>
          <Sheet>
            <SheetTrigger asChild><Button type="button" variant="outline" className="md:hidden"><SlidersHorizontal />Filter{active.length ? ` (${active.length})` : ""}</Button></SheetTrigger>
            <SheetContent side="bottom" className="p-5"><SheetHeader><SheetTitle>Filter Data UMKM</SheetTitle><SheetDescription>Pilih kriteria lalu terapkan.</SheetDescription></SheetHeader><form method="get" className="mt-5"><FilterFields filters={filters} modules={modules} search={search} /></form></SheetContent>
          </Sheet>
          {(active.length || search) ? <Button asChild variant="ghost"><Link href="/dashboard/umkm"><RotateCcw />Reset</Link></Button> : null}
        </div>
      </div>
      {active.length ? <div className="mt-3 flex flex-wrap gap-2" aria-label="Filter aktif">{active.map(([key]) => { const value = String(filters[key as keyof UmkmFilters]); return <Link key={key} href={without(key)} className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-primary-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand-primary)]">{labels[key] ?? key}: {value}<X className="size-3" aria-hidden="true" /></Link>; })}</div> : null}
    </div>
  );
}
