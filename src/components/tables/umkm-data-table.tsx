"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  Columns3,
  Download,
  Eye,
  MoreHorizontal,
  Rows3,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UmkmListItem, UmkmPageResult } from "@/features/umkm/types";
import type { UmkmFilters } from "@/features/umkm/filters";
import type { AppRole } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

const columnHelper = createColumnHelper<UmkmListItem>();

function categoryVariant(value: string) {
  return value === "Siap"
    ? "success"
    : value === "Menengah"
      ? "warning"
      : "danger";
}
function verificationLabel(value: string) {
  return (
    {
      unverified: "Belum Diverifikasi",
      verified: "Terverifikasi",
    }[value] ?? value
  );
}

export function UmkmDataTable({
  result,
  filters,
  role,
}: {
  result: UmkmPageResult;
  filters: UmkmFilters;
  role: AppRole;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable",
  );
  const [visibility, setVisibility] = useState<VisibilityState>({
    ecommerce: false,
  });
  const [selection, setSelection] = useState<Record<string, boolean>>({});

  const setSort = useCallback(
    (column: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextDirection =
        filters.sort === column && filters.direction === "asc" ? "desc" : "asc";
      params.set("sort", column);
      params.set("direction", nextDirection);
      params.set("page", "1");
      router.push(`/dashboard/umkm?${params.toString()}`);
    },
    [filters.direction, filters.sort, router, searchParams],
  );

  const sortable = useCallback(
    (label: string, id: string) => (
        <button
          type="button"
          onClick={() => setSort(id)}
          className="flex items-center gap-1 hover:text-[#0255F5]"
          aria-label={`Urutkan berdasarkan ${label}`}
      >
        {label}
        {filters.sort === id ? (
          filters.direction === "asc" ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )
        ) : null}
      </button>
    ),
    [filters.direction, filters.sort, setSort],
  );
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Pilih semua baris"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Pilih ${row.original.businessName}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      }),
      columnHelper.accessor("businessName", {
        id: "business_name",
        header: () => sortable("Nama UMKM", "business_name"),
        cell: ({ row }) => (
          <div>
            <Link
              href={`/dashboard/umkm/${row.original.slug}`}
              className="font-semibold text-[#101828] transition-colors hover:text-[#0255F5]"
            >
              {row.original.businessName}
            </Link>
            <p className="mt-0.5 text-xs text-[#667085]">
              {row.original.ownerName} · {row.original.whatsappMasked}
            </p>
            {row.original.contactQuality === "duplicate" ? (
              <Badge variant="warning" className="mt-1">
                Kontak duplikat
              </Badge>
            ) : null}
          </div>
        ),
      }),
      columnHelper.accessor("score", {
        id: "effective_score",
        header: () => sortable("Skor", "effective_score"),
        cell: ({ row }) => (
          <div className="min-w-24">
            <div className="mb-1 flex items-center justify-between">
              <strong><AnimatedNumber value={row.original.score} /></strong>
              {row.original.hasOverride ? (
                <span className="text-[10px] text-[#B45309]">override</span>
              ) : null}
            </div>
            <Progress value={row.original.score} label={`Skor ${row.original.businessName}: ${row.original.score}`} />
          </div>
        ),
      }),
      columnHelper.accessor("category", {
        id: "readiness_category",
        header: () => sortable("Kategori", "readiness_category"),
        cell: ({ getValue }) => (
          <Badge variant={categoryVariant(getValue())}>{getValue()}</Badge>
        ),
      }),
      columnHelper.display({ id: "nib", header: "NIB", cell: ({ row }) => <Badge variant={row.original.hasNib ? "success" : "neutral"}>{row.original.hasNib ? "Sudah" : "Belum"}</Badge> }),
      columnHelper.display({ id: "google_maps", header: "Google Maps", cell: ({ row }) => <Badge variant={row.original.googleMaps ? "success" : "warning"}>{row.original.googleMaps ? "Aktif" : "Belum"}</Badge> }),
      columnHelper.display({ id: "whatsapp_business", header: "WA Business", cell: ({ row }) => <Badge variant={row.original.whatsappBusiness ? "success" : "warning"}>{row.original.whatsappBusiness ? "Aktif" : "Belum"}</Badge> }),
      columnHelper.accessor("postingFrequency", {
        id: "content_activity",
        header: "Aktivitas Konten",
        cell: ({ row }) => (
          <div>
            <p className="capitalize">
              {row.original.postingFrequency === "regular"
                ? "Rutin"
                : row.original.postingFrequency === "sometimes"
                  ? "Kadang"
                  : "Tidak"}
            </p>
            <p className="text-xs text-[#667085]">
              {row.original.socialActive ? "Aktif 1–3 bulan" : "Tidak aktif"}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("ecommercePlatforms", {
        id: "ecommerce",
        header: "E-commerce",
        cell: ({ getValue }) => getValue().join(", ") || "—",
      }),
      columnHelper.accessor("modules", {
        id: "modules",
        header: "Modul Prioritas",
        cell: ({ getValue }) => (
          <div className="flex max-w-64 flex-wrap gap-1">
            {getValue()
              .slice(0, 2)
              .map((module) => (
                <Badge
                  key={module.id}
                  variant="neutral"
                  className="max-w-40 truncate"
                >
                  {module.name}
                </Badge>
              ))}
            {getValue().length > 2 ? (
              <Badge variant="outline">+<AnimatedNumber value={getValue().length - 2} /></Badge>
            ) : null}
          </div>
        ),
      }),
      columnHelper.accessor("verificationStatus", {
        id: "verification",
        header: "Verifikasi",
        cell: ({ getValue }) => (
          <Badge
            variant={
              getValue() === "verified" ? "success" : "neutral"
            }
          >
            {verificationLabel(getValue())}
          </Badge>
        ),
      }),
      columnHelper.accessor("submittedAt", {
        id: "submitted_at",
        header: () => sortable("Tanggal Masuk", "submitted_at"),
        cell: ({ getValue }) => (
          <div className="text-xs whitespace-nowrap">
            {formatDateTime(getValue())}
          </div>
        ),
      }),
      columnHelper.display({
        id: "module_delivery",
        header: "Modul",
        cell: ({ row }) => (
          <div className="space-y-1">
            <Badge
              variant={row.original.moduleSentToUmkm ? "success" : "warning"}
            >
              {row.original.moduleSentToUmkm
                ? "Sudah dikirim"
                : "Belum dikirim"}
            </Badge>
            {row.original.moduleSentAt ? (
              <p className="text-[11px] text-[#667085]">
                {formatDateTime(row.original.moduleSentAt)}
              </p>
            ) : null}
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8" aria-label={`Aksi ${row.original.businessName}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent><DropdownMenuItem asChild><Link href={`/dashboard/umkm/${row.original.slug}`}><Eye />Lihat detail</Link></DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ],
    [sortable],
  );

  // TanStack Table intentionally exposes mutable callback APIs that React Compiler skips.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: result.rows,
    columns,
    state: { columnVisibility: visibility, rowSelection: selection },
    onColumnVisibilityChange: setVisibility,
    onRowSelectionChange: setSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getRowId: (row) => row.checkupId,
  });
  const selected = table.getSelectedRowModel().rows.map((row) => row.original);

  async function bulkVerify() {
    if (!selected.length) return;
    const responses = await Promise.all(
      selected.map((row) =>
        fetch(`/api/v1/checkups/${row.checkupId}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            version: row.version,
            status: "verified",
            reason: "Verifikasi massal dari tabel UMKM",
          }),
        }),
      ),
    );
    if (responses.every((response) => response.ok)) {
      toast.success(
        `${selected.length} checkup berhasil diverifikasi dan modul tercatat terkirim.`,
      );
      setSelection({});
      router.refresh();
    } else
      toast.error(
        "Sebagian data gagal diverifikasi. Muat ulang untuk melihat status terbaru.",
      );
  }

  const currentParams = new URLSearchParams(searchParams.toString());
  const exportParams = new URLSearchParams(currentParams);
  exportParams.set("format", "csv");
  if (selected.length)
    exportParams.set("ids", selected.map((row) => row.checkupId).join(","));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <p className="text-sm text-[#667085]">
          <strong className="text-[#344054]"><AnimatedNumber value={result.total} /></strong> UMKM
          ditemukan{selected.length ? ` · ${selected.length} dipilih` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {selected.length && role !== "viewer" ? (
            <Button variant="outline" size="sm" onClick={bulkVerify}>
              <ShieldCheck />
              Verifikasi dipilih
            </Button>
          ) : null}
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/export?${exportParams.toString()}`}>
              <Download />
              {selected.length ? "Export dipilih" : "Export filter"}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setDensity((value) =>
                value === "compact" ? "comfortable" : "compact",
              )
            }
          >
            <Rows3 />
            {density === "compact" ? "Nyaman" : "Rapat"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><Columns3 />Kolom</Button></DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">{table.getAllLeafColumns().filter((column) => column.getCanHide()).map((column) => <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(checked) => column.toggleVisibility(Boolean(checked))} className="capitalize">{column.id.replaceAll("_", " ")}</DropdownMenuCheckboxItem>)}</DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="hidden max-h-[68vh] overflow-auto border-y border-[var(--border)] bg-white lg:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className={density === "compact" ? "[&_td]:py-1.5" : ""}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-3 border-t border-[var(--border)] p-4 lg:hidden">
        {result.rows.map((row) => (
          <div key={row.checkupId} className="rounded-2xl border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={`/dashboard/umkm/${row.slug}`}
                  className="font-semibold transition-colors hover:text-[#0255F5]"
                >
                  {row.businessName}
                </Link>
                <p className="text-xs text-[#667085]">
                  {row.ownerName} · {row.whatsappMasked}
                </p>
              </div>
              <Badge variant={categoryVariant(row.category)}><AnimatedNumber value={row.score} /></Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {row.modules.slice(0, 2).map((module) => (
                <Badge key={module.id} variant="neutral">
                  {module.name}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Badge
                variant={
                  row.verificationStatus === "verified" ? "success" : "neutral"
                }
              >
                {verificationLabel(row.verificationStatus)}
              </Badge>
              <Badge variant={row.moduleSentToUmkm ? "success" : "warning"}>
                {row.moduleSentToUmkm ? "Modul terkirim" : "Belum terkirim"}
              </Badge>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/dashboard/umkm/${row.slug}`}>Lihat Detail</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Pagination result={result} />
    </div>
  );
}

function Pagination({ result }: { result: UmkmPageResult }) {
  const params = useSearchParams();
  function href(page: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(page));
    return `/dashboard/umkm?${next.toString()}`;
  }
  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-5">
      <p className="text-xs text-[#667085]">
        Halaman <AnimatedNumber value={result.page} /> dari <AnimatedNumber value={Math.max(result.pageCount, 1)} />
      </p>
      <div className="flex gap-2">
        <Button
          asChild={result.page > 1}
          disabled={result.page <= 1}
          variant="outline"
          size="sm"
        >
          {result.page > 1 ? (
            <Link href={href(result.page - 1)}>Sebelumnya</Link>
          ) : (
            <span>Sebelumnya</span>
          )}
        </Button>
        <Button
          asChild={result.page < result.pageCount}
          disabled={result.page >= result.pageCount}
          variant="outline"
          size="sm"
        >
          {result.page < result.pageCount ? (
            <Link href={href(result.page + 1)}>Berikutnya</Link>
          ) : (
            <span>Berikutnya</span>
          )}
        </Button>
      </div>
    </div>
  );
}
