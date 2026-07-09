"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Building2,
  Download,
  EyeOff,
  FileWarning,
  LayoutGrid,
  MapPinOff,
  MessageCircleOff,
  ShieldAlert,
  SignalZero,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import {
  CategoryChart,
  ChannelChart,
  GapChart,
  ModulePriorityCard,
  ReadinessGauge,
  TrendChart,
} from "@/components/charts/overview-charts";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { WidgetDrawer } from "@/components/dashboard/widget-drawer";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OverviewData } from "@/features/overview/types";
import {
  dashboardWidgetIds,
  defaultWidgetPreference,
  parseWidgetPreference,
  type DashboardWidgetId,
  type DashboardWidgetPreference,
} from "@/features/overview/widgets";
import type { OverviewPeriod } from "@/server/repositories/overview";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

const STORAGE_KEY = "dekatlokal:dashboard-widgets:v1";
const periods: Array<{ value: OverviewPeriod; label: string }> = [
  { value: "30d", label: "30 hari" },
  { value: "90d", label: "90 hari" },
  { value: "1y", label: "1 tahun" },
  { value: "all", label: "Semua" },
];

interface NotificationData {
  count: number;
  items: Array<{
    id: string;
    slug: string;
    businessName: string;
    status: string;
    submittedAt: string;
  }>;
}

function categoryVariant(category: unknown) {
  return category === "Siap"
    ? "success"
    : category === "Menengah"
      ? "warning"
      : "danger";
}

function WidgetFrame({
  id,
  index,
  total,
  className,
  onMove,
  onHide,
  children,
}: {
  id: DashboardWidgetId;
  index: number;
  total: number;
  className?: string;
  onMove: (id: DashboardWidgetId, direction: -1 | 1) => void;
  onHide: (id: DashboardWidgetId) => void;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("group relative", className)}>
      <div className="absolute top-3 right-3 z-10 flex rounded-lg border border-[var(--border)] bg-white/95 p-0.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(id, -1)}
          className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] disabled:opacity-30"
          aria-label="Pindahkan widget ke atas"
        >
          <ArrowUp className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={() => onMove(id, 1)}
          className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] disabled:opacity-30"
          aria-label="Pindahkan widget ke bawah"
        >
          <ArrowDown className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onHide(id)}
          className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
          aria-label="Sembunyikan widget"
        >
          <EyeOff className="size-3.5" />
        </button>
      </div>
      {children}
    </div>
  );
}

export function OverviewDashboard({
  data,
  period,
  notifications,
}: {
  data: OverviewData;
  period: OverviewPeriod;
  notifications: NotificationData;
}) {
  const [preference, setPreference] = useState<DashboardWidgetPreference>(
    defaultWidgetPreference,
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        setPreference(
          parseWidgetPreference(window.localStorage.getItem(STORAGE_KEY)),
        ),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);

  function save(next: DashboardWidgetPreference) {
    setPreference(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const availableIds = [...dashboardWidgetIds];
  const visible = preference.order.filter(
    (id) => availableIds.includes(id) && !preference.hidden.includes(id),
  );

  function addWidget(id: DashboardWidgetId) {
    save({
      ...preference,
      hidden: preference.hidden.filter((item) => item !== id),
    });
  }

  function hideWidget(id: DashboardWidgetId) {
    save({ ...preference, hidden: [...new Set([...preference.hidden, id])] });
  }

  function moveWidget(id: DashboardWidgetId, direction: -1 | 1) {
    const visibleIndex = visible.indexOf(id);
    const target = visible[visibleIndex + direction];
    if (!target) return;
    const order = [...preference.order];
    const from = order.indexOf(id);
    const to = order.indexOf(target);
    [order[from], order[to]] = [order[to]!, order[from]!];
    save({ ...preference, order });
  }

  function resetWidgets() {
    save(defaultWidgetPreference());
  }

  const kpi = data.kpi;
  const widgetClass: Record<DashboardWidgetId, string> = {
    trend: "xl:col-span-8",
    distribution: "xl:col-span-4",
    gaps: "xl:col-span-8",
    readiness: "xl:col-span-4",
    priorities: "xl:col-span-8",
    modules: "xl:col-span-4",
    latest: "xl:col-span-12",
    channels: "xl:col-span-8",
    "without-nib": "md:col-span-6 xl:col-span-3",
    "without-maps": "md:col-span-6 xl:col-span-3",
    "without-wa": "md:col-span-6 xl:col-span-3",
    "inactive-social": "md:col-span-6 xl:col-span-3",
    verification: "xl:col-span-4",
  };

  function renderWidget(id: DashboardWidgetId) {
    switch (id) {
      case "trend":
        return <TrendChart data={data.trend ?? []} className="h-full" />;
      case "distribution":
        return (
          <CategoryChart data={data.categories ?? []} className="h-full" />
        );
      case "gaps":
        return <GapChart data={data.gaps ?? []} className="h-full" />;
      case "readiness":
        return <ReadinessGauge value={kpi.average_score} className="h-full" />;
      case "channels":
        return <ChannelChart data={data.channels ?? []} className="h-full" />;
      case "modules":
        return (
          <ModulePriorityCard data={data.modules ?? []} className="h-full" />
        );
      case "without-nib":
        return (
          <KpiCard
            label="Belum memiliki NIB"
            value={kpi.without_nib}
            icon={FileWarning}
            tone="red"
            helper="Perlu legalitas usaha"
            className="h-full"
          />
        );
      case "without-maps":
        return (
          <KpiCard
            label="Belum Google Maps"
            value={kpi.without_google_maps}
            icon={MapPinOff}
            tone="amber"
            helper="Peluang visibilitas lokal"
            className="h-full"
          />
        );
      case "without-wa":
        return (
          <KpiCard
            label="Belum WA Business"
            value={kpi.without_whatsapp_business}
            icon={MessageCircleOff}
            tone="amber"
            helper="Perlu kanal komunikasi"
            className="h-full"
          />
        );
      case "inactive-social":
        return (
          <KpiCard
            label="Media sosial tidak aktif"
            value={kpi.inactive_social}
            icon={SignalZero}
            tone="red"
            helper="Perlu aktivasi konten"
            className="h-full"
          />
        );
      case "priorities":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>UMKM Prioritas</CardTitle>
              <CardDescription>
                Skor terendah dan gap paling mendesak.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {(data.priorities ?? []).map((item) => (
                <Link
                  key={String(item.checkup_id)}
                  href={`/dashboard/umkm/${String(item.slug ?? item.umkm_id)}`}
                  className="rounded-xl border border-[var(--border)] p-3 transition-colors hover:border-[#B2CCFF] hover:bg-[var(--surface-muted)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {String(item.business_name)}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-[var(--text-secondary)]">
                        {Array.isArray(item.reasons)
                          ? item.reasons.join(" · ")
                          : "Perlu tindak lanjut"}
                      </p>
                    </div>
                    <Badge variant="danger">
                      <AnimatedNumber value={Number(item.score)} />
                    </Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        );
      case "latest":
        return (
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between pr-28">
              <div>
                <CardTitle>Submission Terbaru</CardTitle>
                <CardDescription>Lima checkup paling baru.</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/umkm">Lihat semua</Link>
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0 sm:p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UMKM</TableHead>
                    <TableHead>Skor</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Masuk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.latest ?? []).map((item) => (
                    <TableRow key={String(item.checkup_id)}>
                      <TableCell>
                        <Link
                          href={`/dashboard/umkm/${String(item.slug ?? item.umkm_id)}`}
                          className="font-semibold hover:text-[var(--brand-primary)]"
                        >
                          {String(item.business_name)}
                        </Link>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {String(item.owner_name)}
                        </p>
                      </TableCell>
                      <TableCell className="font-semibold">
                        <AnimatedNumber value={Number(item.score)} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={categoryVariant(item.category)}>
                          {String(item.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "verified" ? "success" : "neutral"
                          }
                        >
                          {item.status === "verified"
                            ? "Terverifikasi"
                            : "Belum diverifikasi"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {formatDateTime(String(item.submitted_at))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      case "verification":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Status Verifikasi</CardTitle>
              <CardDescription>
                <AnimatedNumber value={notifications.count} /> data membutuhkan
                tindak lanjut.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/umkm/${item.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border p-3 hover:bg-[var(--surface-muted)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.businessName}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {formatDateTime(item.submittedAt)}
                    </p>
                  </div>
                  <Badge variant="neutral">Belum diverifikasi</Badge>
                </Link>
              ))}
              {!notifications.items.length ? (
                <EmptyState
                  title="Antrean selesai"
                  description="Tidak ada data yang menunggu verifikasi."
                />
              ) : null}
            </CardContent>
          </Card>
        );
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Kesiapan Digital"
        title="Dashboard"
        description="Pantau tingkat kesiapan digital dan kebutuhan pendampingan UMKM."
        actions={
          <>
            <div className="flex rounded-xl border border-[var(--border)] bg-white p-1">
              {periods.map((item) => (
                <Button
                  key={item.value}
                  asChild
                  size="sm"
                  variant={period === item.value ? "secondary" : "ghost"}
                >
                  <Link href={`/dashboard?period=${item.value}`}>
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
            <WidgetDrawer
              trigger={
                <Button variant="outline">
                  <LayoutGrid />
                  Tambah Widget
                </Button>
              }
              availableIds={availableIds}
              activeIds={visible}
              onAdd={addWidget}
              onReset={resetWidgets}
            />
            <Button asChild>
              <Link href="/dashboard/export">
                <Download />
                Export
              </Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total UMKM"
          value={kpi.total_umkm}
          icon={UsersRound}
          helper="Identitas unik"
        />
        <KpiCard
          label="Kesiapan Rendah"
          value={kpi.rendah}
          icon={ShieldAlert}
          tone="red"
          helper="Perlu intervensi prioritas"
        />
        <KpiCard
          label="Kesiapan Menengah"
          value={kpi.menengah}
          icon={TrendingUp}
          tone="amber"
          helper="Sedang bertumbuh"
        />
        <KpiCard
          label="Siap Digital"
          value={kpi.siap}
          icon={Building2}
          tone="green"
          helper="Siap dikembangkan"
          href="https://monitoringumkm.dekatlokal.com"
          target="_blank"
          rel="noopener noreferrer"
          ariaLabel="Buka monitoring UMKM siap digital"
          className="border-[#BBF7D0] bg-[#F0FDF4] hover:-translate-y-0.5 hover:border-[#16A34A] hover:bg-white hover:shadow-[0_14px_32px_rgba(22,163,74,0.16)]"
        />
      </div>
      {visible.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {visible.map((id, index) => (
            <WidgetFrame
              key={id}
              id={id}
              index={index}
              total={visible.length}
              className={widgetClass[id]}
              onMove={moveWidget}
              onHide={hideWidget}
            >
              {renderWidget(id)}
            </WidgetFrame>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Dashboard belum memiliki widget"
          description="Tambahkan widget yang paling relevan untuk pekerjaan Anda."
          icon={AlertCircle}
          action={
            <WidgetDrawer
              trigger={
                <Button>
                  <LayoutGrid />
                  Tambah Widget
                </Button>
              }
              availableIds={availableIds}
              activeIds={visible}
              onAdd={addWidget}
              onReset={resetWidgets}
            />
          }
        />
      )}
    </div>
  );
}
