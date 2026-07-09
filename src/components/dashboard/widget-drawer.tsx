"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  BookOpenCheck,
  ChartNoAxesCombined,
  Clock3,
  Gauge,
  MapPin,
  MessageCircle,
  PieChart,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { DashboardWidgetId } from "@/features/overview/widgets";

export const widgetCatalog: Array<{
  id: DashboardWidgetId;
  name: string;
  description: string;
  category: "Analytics" | "Operations" | "Intervention";
  icon: typeof PieChart;
}> = [
  { id: "distribution", name: "Distribusi Kesiapan", description: "Komposisi kategori Rendah, Menengah, dan Siap.", category: "Analytics", icon: PieChart },
  { id: "trend", name: "Tren Submission", description: "Pergerakan jumlah checkup pada periode aktif.", category: "Analytics", icon: ChartNoAxesCombined },
  { id: "readiness", name: "Indeks Kesiapan", description: "Gauge rata-rata skor kesiapan digital.", category: "Analytics", icon: Gauge },
  { id: "gaps", name: "Gap Digitalisasi", description: "Indikator intervensi dengan gap terbesar.", category: "Analytics", icon: BarChart3 },
  { id: "channels", name: "Adopsi Kanal", description: "Perbandingan kanal digital yang telah digunakan.", category: "Analytics", icon: SlidersHorizontal },
  { id: "priorities", name: "UMKM Prioritas", description: "UMKM dengan skor dan gap paling mendesak.", category: "Operations", icon: UsersRound },
  { id: "latest", name: "Submission Terbaru", description: "Lima hasil checkup yang paling baru masuk.", category: "Operations", icon: Clock3 },
  { id: "verification", name: "Status Verifikasi", description: "Antrean data yang belum selesai ditinjau.", category: "Operations", icon: ShieldCheck },
  { id: "modules", name: "Modul Prioritas", description: "Lima modul pendampingan paling dibutuhkan.", category: "Intervention", icon: BookOpenCheck },
  { id: "without-nib", name: "Belum Memiliki NIB", description: "Jumlah UMKM yang belum memiliki legalitas NIB.", category: "Intervention", icon: AlertCircle },
  { id: "without-maps", name: "Google Maps Adoption", description: "Jumlah UMKM yang belum terdaftar di Maps.", category: "Intervention", icon: MapPin },
  { id: "without-wa", name: "WhatsApp Business Adoption", description: "Jumlah UMKM yang belum memakai WA Business.", category: "Intervention", icon: MessageCircle },
  { id: "inactive-social", name: "Marketplace & Social", description: "UMKM yang membutuhkan aktivasi kanal penjualan.", category: "Intervention", icon: ShoppingBag },
];

export function WidgetDrawer({
  trigger,
  availableIds,
  activeIds,
  onAdd,
  onReset,
}: {
  trigger: React.ReactNode;
  availableIds: DashboardWidgetId[];
  activeIds: DashboardWidgetId[];
  onAdd: (id: DashboardWidgetId) => void;
  onReset: () => void;
}) {
  const [query, setQuery] = useState("");
  const items = useMemo(
    () =>
      widgetCatalog.filter(
        (item) =>
          availableIds.includes(item.id) &&
          `${item.name} ${item.description} ${item.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [availableIds, query],
  );

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="max-w-[440px] p-0 max-sm:max-w-none">
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-white px-5 py-5">
          <SheetHeader>
            <SheetTitle>Tambah Widget</SheetTitle>
            <SheetDescription>Susun dashboard sesuai fokus pendampingan Anda.</SheetDescription>
          </SheetHeader>
          <div className="relative mt-4">
            <Search className="absolute top-3 left-3 size-4 text-[var(--text-tertiary)]" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari widget..." className="pl-9" />
          </div>
        </div>
        <div className="space-y-6 px-5 py-5 pb-24">
          {(["Analytics", "Operations", "Intervention"] as const).map((category) => {
            const categoryItems = items.filter((item) => item.category === category);
            if (!categoryItems.length) return null;
            return (
              <section key={category} aria-labelledby={`widget-${category}`}>
                <h3 id={`widget-${category}`} className="mb-2 text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">{category}</h3>
                <div className="space-y-2">
                  {categoryItems.map((item) => {
                    const Icon = item.icon;
                    const active = activeIds.includes(item.id);
                    return (
                      <div key={item.id} className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-3 transition-colors hover:border-[#B2CCFF] hover:bg-[var(--surface-muted)]">
                        <div className="rounded-[10px] bg-[var(--brand-primary-soft)] p-2 text-[var(--brand-primary)]"><Icon className="size-[18px]" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2"><p className="text-sm font-semibold">{item.name}</p><Badge variant="neutral" className="px-2 py-0.5 text-[10px]">{item.category}</Badge></div>
                          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{item.description}</p>
                        </div>
                        <Button type="button" size="sm" variant={active ? "secondary" : "outline"} disabled={active} onClick={() => onAdd(item.id)} aria-label={active ? `${item.name} aktif` : `Tambahkan ${item.name}`}>
                          {active ? "Aktif" : "Tambahkan"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {!items.length ? <p className="py-10 text-center text-sm text-[var(--text-secondary)]">Widget tidak ditemukan.</p> : null}
        </div>
        <div className="fixed right-0 bottom-0 w-full max-w-[440px] border-t border-[var(--border)] bg-white p-4 max-sm:max-w-none">
          <Button variant="outline" className="w-full" onClick={onReset}><RotateCcw />Reset komposisi default</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
