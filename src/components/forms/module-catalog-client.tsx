"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock3, Pencil, Plus, Send, UsersRound } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AppRole } from "@/lib/permissions";
import { PageHeader } from "@/components/dashboard/page-header";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface ModuleItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  neededCount: number;
  sentCount: number;
  notSentCount: number;
  materialHref: string | null;
  coverImageHref: string | null;
  assignedBusinesses?: Array<{
    id: string;
    slug: string;
    businessName: string;
    ownerName: string;
    moduleSentToUmkm: boolean;
  }>;
}
const empty = {
  id: undefined,
  slug: "",
  name: "",
  description: "",
  display_order: 100,
  is_active: true,
};

export function ModuleCatalogClient({
  modules,
  role,
}: {
  modules: ModuleItem[];
  role: AppRole;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedModule = searchParams.get("module");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    id?: string;
    slug: string;
    name: string;
    description: string;
    display_order: number;
    is_active: boolean;
  }>(empty);
  const [saving, setSaving] = useState(false);
  function edit(module?: ModuleItem) {
    setForm(
      module
        ? {
            id: module.id,
            slug: module.slug,
            name: module.name,
            description: module.description ?? "",
            display_order: module.display_order,
            is_active: module.is_active,
          }
        : empty,
    );
    setOpen(true);
  }
  async function save() {
    setSaving(true);
    const response = await fetch("/api/v1/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, description: form.description || null }),
    });
    setSaving(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.error?.message ?? "Modul gagal disimpan.");
      return;
    }
    toast.success("Katalog modul diperbarui.");
    setOpen(false);
    router.refresh();
  }
  return (
    <>
      <PageHeader eyebrow="Modul Pendampingan" title="Katalog dan Distribusi Modul" description="Pantau kebutuhan serta status pengiriman modul untuk setiap UMKM." actions={role === "superadmin" ? <Button onClick={() => edit()}><Plus />Tambah modul</Button> : undefined} />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Card
            key={module.id}
            className={`${!module.is_active ? "opacity-60" : ""} ${selectedModule === module.slug ? "border-[var(--brand-primary)] ring-2 ring-blue-100" : ""}`}
          >
            {module.coverImageHref ? (
              <div className="relative aspect-[16/8] overflow-hidden rounded-t-[var(--radius-card)] bg-[#EAF1FF]">
                <img src={module.coverImageHref} alt={`Sampul ${module.name}`} className="size-full object-cover object-center" />
              </div>
            ) : null}
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{module.name}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {module.description}
                  </CardDescription>
                </div>
                <Badge variant={module.is_active ? "success" : "neutral"}>
                  {module.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2"><Button asChild variant="outline" size="sm" className="w-full"><Link href={`/dashboard/umkm?module=${module.slug}`}>Lihat UMKM</Link></Button>{module.materialHref ? <Button asChild variant="outline" size="sm" className="w-full"><Link href={module.materialHref} target="_blank">Buka PDF Modul</Link></Button> : null}</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-[#EAF1FF] p-3">
                  <UsersRound className="size-4 text-[#0255F5]" />
                  <p className="mt-2 text-lg font-semibold">
                    <AnimatedNumber value={module.neededCount} />
                  </p>
                  <p className="text-[11px] text-[#667085]">Butuh modul</p>
                </div>
                <div className="rounded-xl bg-[#DCFCE7] p-3">
                  <Send className="size-4 text-[#16A34A]" />
                  <p className="mt-2 text-lg font-semibold">
                    <AnimatedNumber value={module.sentCount} />
                  </p>
                  <p className="text-[11px] text-[#667085]">Sudah dikirim</p>
                </div>
                <div className="rounded-xl bg-[#FEF3C7] p-3">
                  <Clock3 className="size-4 text-[#B45309]" />
                  <p className="mt-2 text-lg font-semibold">
                    <AnimatedNumber value={module.notSentCount} />
                  </p>
                  <p className="text-[11px] text-[#667085]">Belum dikirim</p>
                </div>
              </div>
              <div className="rounded-xl border bg-[#F9FAFB] p-3">
                <p className="text-xs font-semibold text-[#344054]">
                  UMKM penerima modul
                </p>
                {module.assignedBusinesses?.length ? (
                  <ul className="mt-2 max-h-44 space-y-1 overflow-auto pr-1 text-xs text-[#475467]">
                    {module.assignedBusinesses.map((business) => (
                      <li
                        key={business.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1.5"
                      >
                        <span className="truncate">{business.businessName}</span>
                        <Badge
                          variant={business.moduleSentToUmkm ? "success" : "warning"}
                        >
                          {business.moduleSentToUmkm ? "Sudah dikirim" : "Belum dikirim"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-[#667085]">Belum ada UMKM penerima.</p>
                )}
              </div>
              {role === "superadmin" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => edit(module)}
                >
                  <Pencil />
                  Edit katalog
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit modul" : "Tambah modul"}</DialogTitle>
            <DialogDescription>
              Perubahan katalog tidak menghapus histori assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="module-name">Nama</Label>
              <Input
                id="module-name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="module-slug">Slug</Label>
              <Input
                id="module-slug"
                value={form.slug}
                onChange={(event) =>
                  setForm({
                    ...form,
                    slug: event.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-"),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="module-description">Deskripsi</Label>
              <Textarea
                id="module-description"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="module-order">Urutan</Label>
                <Input
                  id="module-order"
                  type="number"
                  value={form.display_order}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      display_order: Number(event.target.value),
                    })
                  }
                />
              </div>
              <label className="mt-7 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    setForm({ ...form, is_active: event.target.checked })
                  }
                />
                Modul aktif
              </label>
            </div>
            <Button
              className="w-full"
              onClick={save}
              disabled={saving || form.name.length < 3 || !form.slug}
            >
              {saving ? "Menyimpan..." : "Simpan modul"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
