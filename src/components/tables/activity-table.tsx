"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

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
import { formatDateTime } from "@/lib/utils";

interface AuditRow {
  id: number;
  actor_type: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_data: unknown;
  after_data: unknown;
  reason: string | null;
  request_id: string | null;
  created_at: string;
  profiles: { full_name?: string } | Array<{ full_name?: string }> | null;
}
interface DeletedRow {
  id: string;
  effective_score: number;
  readiness_category: string;
  deleted_at: string;
  business: { business_name?: string; owner_name?: string } | null;
}

export function ActivityTable({
  rows,
  deleted,
  isSuperadmin,
}: {
  rows: AuditRow[];
  deleted: DeletedRow[];
  isSuperadmin: boolean;
}) {
  const router = useRouter();
  async function restore(id: string) {
    const response = await fetch(`/api/v1/checkups/${id}/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Dipulihkan dari halaman Aktivitas" }),
    });
    if (response.ok) {
      toast.success("Checkup berhasil dipulihkan.");
      router.refresh();
    } else toast.error("Checkup gagal dipulihkan.");
  }
  return (
    <div className="space-y-5">
      {isSuperadmin && deleted.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Data Terhapus</CardTitle>
            <CardDescription>
              Soft-deleted checkup dapat dipulihkan tanpa kehilangan histori.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {deleted.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-3 rounded-xl border p-3 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {item.business?.business_name ?? "UMKM"}
                  </p>
                  <p className="text-xs text-[#667085]">
                    Dihapus {formatDateTime(item.deleted_at)} · skor{" "}
                    {item.effective_score}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restore(item.id)}
                >
                  <RotateCcw />
                  Pulihkan
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
      <div className="hidden overflow-x-auto rounded-2xl border bg-white md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Aktor</TableHead>
              <TableHead>Aktivitas</TableHead>
              <TableHead>Entitas</TableHead>
              <TableHead>Alasan</TableHead>
              <TableHead>Perubahan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const profile = Array.isArray(row.profiles)
                ? row.profiles[0]
                : row.profiles;
              return (
                <TableRow key={row.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatDateTime(row.created_at)}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">
                      {profile?.full_name ??
                        (row.actor_type === "integration"
                          ? "Web Utama"
                          : "Sistem")}
                    </p>
                    <Badge variant="neutral">{row.actor_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge>{row.action.replaceAll("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{row.entity_type}</p>
                    <p className="font-mono text-[10px] text-[#98A2B3]">
                      {row.entity_id?.slice(0, 8) ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-56 text-xs">
                    {row.reason ?? "—"}
                  </TableCell>
                  <TableCell>
                    <details>
                      <summary className="cursor-pointer text-xs font-semibold text-[#0255F5]">
                        Lihat diff
                      </summary>
                      <pre className="mt-2 max-h-64 w-80 overflow-auto rounded-lg bg-[#101828] p-3 text-[10px] text-white">
                        {JSON.stringify(
                          { before: row.before_data, after: row.after_data },
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
          return (
            <article key={row.id} className="rounded-2xl border bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary-soft)] text-xs font-bold text-[var(--brand-primary)]">{(profile?.full_name ?? (row.actor_type === "integration" ? "Web Utama" : "Sistem")).slice(0, 2).toUpperCase()}</div>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{profile?.full_name ?? (row.actor_type === "integration" ? "Web Utama" : "Sistem")}</p><Badge>{row.action.replaceAll("_", " ")}</Badge></div><p className="mt-1 text-xs text-[var(--text-secondary)]">{row.entity_type}{row.reason ? ` · ${row.reason}` : ""}</p><time className="mt-2 block text-[11px] text-[var(--text-tertiary)]">{formatDateTime(row.created_at)}</time></div>
              </div>
              <details className="mt-3 border-t pt-3"><summary className="cursor-pointer text-xs font-semibold text-[var(--brand-primary)]">Lihat perubahan</summary><pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-[#101828] p-3 text-[10px] text-white">{JSON.stringify({ before: row.before_data, after: row.after_data }, null, 2)}</pre></details>
            </article>
          );
        })}
      </div>
    </div>
  );
}
