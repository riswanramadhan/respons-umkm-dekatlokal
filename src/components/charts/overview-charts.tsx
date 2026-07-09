"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/states/empty-state";
import { Progress } from "@/components/ui/progress";
import type { AnalyticsPoint } from "@/features/overview/types";
import { cn } from "@/lib/utils";
import {
  AnimatedNumber,
  useInViewReplay,
} from "@/components/ui/animated-number";
import { AnimatedCircularProgress } from "@/components/ui/animated-circular-progress";

const categoryColors: Record<string, string> = {
  Rendah: "#EF4444",
  Menengah: "#F59E0B",
  Siap: "#16A34A",
};

const tooltipStyle = {
  border: "1px solid #E7EAF0",
  borderRadius: 10,
  boxShadow: "0 8px 24px rgba(16,24,40,.10)",
  fontSize: 12,
};

function Summary({ label, data }: { label: string; data: AnalyticsPoint[] }) {
  return (
    <p className="sr-only">
      {label}: {data.map((item) => `${item.name ?? item.date}: ${item.value}`).join(", ")}
    </p>
  );
}

export function CategoryChart({ data, className }: { data: AnalyticsPoint[]; className?: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const { ref, cycle, isVisible } = useInViewReplay<HTMLDivElement>();
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>Distribusi Kesiapan</CardTitle>
        <CardDescription>Snapshot kategori terbaru setiap UMKM.</CardDescription>
      </CardHeader>
      <CardContent>
        {total ? (
          <>
            <div ref={ref} className="relative h-52" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key={cycle}>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={82} paddingAngle={3} isAnimationActive={isVisible} animationDuration={1100} animationEasing="ease-out">
                    {data.map((item) => (
                      <Cell key={item.name} fill={categoryColors[item.name ?? ""] ?? "#98A2B3"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} UMKM`, "Jumlah"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-2xl text-[var(--text-primary)]"><AnimatedNumber value={total} /></strong>
                <span className="text-[11px] text-[var(--text-secondary)]">Total UMKM</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {data.map((item) => (
                <div key={item.name} className="text-center text-xs text-[var(--text-secondary)]">
                  <span className="mx-auto mb-1 block size-2 rounded-full" style={{ backgroundColor: categoryColors[item.name ?? ""] }} />
                  {item.name} <strong className="text-[var(--text-primary)]"><AnimatedNumber value={item.value} /></strong>
                </div>
              ))}
            </div>
            <Summary label="Distribusi kesiapan" data={data} />
          </>
        ) : (
          <EmptyState title="Belum ada checkup" description="Distribusi akan muncul setelah submission pertama masuk." />
        )}
      </CardContent>
    </Card>
  );
}

export function GapChart({ data, className }: { data: AnalyticsPoint[]; className?: string }) {
  const maximum = Math.max(...data.map((item) => item.value), 1);
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Gap Digitalisasi Terbesar</CardTitle>
        <CardDescription>Jumlah UMKM yang masih membutuhkan intervensi.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.some((item) => item.value > 0) ? (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item.name}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-[#344054]">{item.name}</span>
                  <strong><AnimatedNumber value={item.value} /> UMKM</strong>
                </div>
                <Progress value={(item.value / maximum) * 100} label={`${item.name}: ${item.value} UMKM`} />
              </div>
            ))}
            <Summary label="Gap indikator" data={data} />
          </div>
        ) : (
          <EmptyState title="Tidak ada gap" description="Semua indikator utama pada periode ini sudah terpenuhi." />
        )}
      </CardContent>
    </Card>
  );
}

export function TrendChart({ data, className }: { data: AnalyticsPoint[]; className?: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const { ref, cycle, isVisible } = useInViewReplay<HTMLDivElement>();
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Tren Submission</CardTitle>
          <CardDescription>Setiap UMKM dihitung satu kali saat digital checkup.</CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold"><AnimatedNumber value={total} /></p>
          <p className="text-[11px] text-[var(--text-secondary)]">submission</p>
        </div>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <>
            <div ref={ref} className="h-64" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart key={cycle} data={data} margin={{ left: -16, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0255F5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0255F5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EAF0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#667085" }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#667085" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="#0255F5" fill="url(#trendFill)" strokeWidth={2.5} name="Submission" activeDot={{ r: 5, fill: "#0255F5" }} isAnimationActive={isVisible} animationDuration={1250} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <Summary label="Tren submission" data={data} />
          </>
        ) : (
          <EmptyState title="Belum ada tren" description="Pilih periode lain atau tunggu submission baru." />
        )}
      </CardContent>
    </Card>
  );
}

export function ChannelChart({ data, className }: { data: AnalyticsPoint[]; className?: string }) {
  const { ref, cycle, isVisible } = useInViewReplay<HTMLDivElement>();
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Adopsi Kanal Digital</CardTitle>
        <CardDescription>Jumlah UMKM yang sudah memakai setiap kanal.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.some((item) => item.value > 0) ? (
          <>
            <div ref={ref} className="h-64" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart key={cycle} data={data} margin={{ left: -16, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EAF0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#667085" }} interval={0} angle={-12} height={54} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#667085" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#0255F5" radius={[6, 6, 0, 0]} name="UMKM" isAnimationActive={isVisible} animationDuration={1050} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Summary label="Adopsi kanal" data={data} />
          </>
        ) : (
          <EmptyState title="Belum ada kanal aktif" description="Adopsi kanal akan terlihat setelah data tersedia." />
        )}
      </CardContent>
    </Card>
  );
}

export function ReadinessGauge({ value, className }: { value: number; className?: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Indeks Kesiapan Digital</CardTitle>
        <CardDescription>Rata-rata skor UMKM pada periode aktif.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <AnimatedCircularProgress
          value={safe}
          caption={<span className="mt-1 text-xs text-[var(--text-secondary)]">Kesiapan rata-rata</span>}
        />
        <div className="mt-5 w-full rounded-xl bg-[var(--surface-muted)] p-3">
          <div className="mb-2 flex justify-between text-xs"><span className="text-[var(--text-secondary)]">Target</span><strong><AnimatedNumber value={70} suffix="%" /></strong></div>
          <Progress value={(safe / 70) * 100} label={`Progres menuju target 70 persen`} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ModulePriorityCard({ data, className }: { data: AnalyticsPoint[]; className?: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Modul Paling Dibutuhkan</CardTitle>
        <CardDescription>Rekomendasi aktif dari checkup terbaru.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.slice(0, 5).map((item) => (
          <Link key={item.slug ?? item.name} href={`/dashboard/modul?module=${item.slug ?? ""}`} className="block rounded-lg p-1 transition-colors hover:bg-[var(--surface-muted)]">
            <div className="mb-1.5 flex items-start justify-between gap-3 text-xs">
              <span className="line-clamp-1 font-medium text-[#344054]">{item.name}</span>
              <strong className="whitespace-nowrap"><AnimatedNumber value={item.value} /> UMKM</strong>
            </div>
            <Progress value={(item.value / max) * 100} label={`${item.name}: ${item.value} UMKM`} />
          </Link>
        ))}
        {!data.length ? <EmptyState title="Belum ada rekomendasi" description="Rekomendasi modul dihitung dari jawaban checkup." /> : null}
      </CardContent>
    </Card>
  );
}
