"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
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
import { SelectNative } from "@/components/ui/select-native";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { calculateScore } from "@/lib/scoring/calculate-score";
import { recommendModules } from "@/lib/scoring/recommend-modules";
import {
  checkupAnswersSchema,
  updateCheckupSchema,
  type UpdateCheckupInput,
} from "@/lib/validation/checkup";
import type { AppRole } from "@/lib/permissions";
import { can } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { AnimatedCircularProgress } from "@/components/ui/animated-circular-progress";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

interface ModuleRelation {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
}
interface CheckupModuleRow {
  module_id: string;
  priority: number;
  status: string;
  origin: string;
  reason: string | null;
  is_current: boolean;
  intervention_modules: ModuleRelation | ModuleRelation[];
}
interface CheckupRow {
  id: string;
  version: number;
  effective_score: number;
  calculated_score: number;
  overridden_score: number | null;
  readiness_category: "Rendah" | "Menengah" | "Siap";
  verification_status: string;
  source: string;
  data_status: string;
  submitted_at: string;
  verified_at: string | null;
  created_at: string;
  modules: CheckupModuleRow[];
  has_nib: boolean;
  product_active: boolean;
  pricing_status: "clear" | "variable" | "none";
  stock_system: "ready_stock" | "pre_order" | "both";
  has_fixed_brand_name: boolean;
  has_logo: boolean;
  visual_consistency: "consistent" | "partial" | "none";
  instagram_username: string | null;
  tiktok_username: string | null;
  google_maps_url: string | null;
  google_maps_registered: boolean;
  has_google_reviews: boolean;
  google_rating_band: "above_4" | "below_4" | "unknown";
  has_facebook_page: boolean;
  uses_whatsapp_business: boolean;
  ecommerce_platforms: string[];
  ecommerce_other: string | null;
  social_active_recently: boolean;
  posting_frequency: "regular" | "sometimes" | "never";
  payment_methods: "cash" | "digital" | "both";
  ships_orders: boolean;
  order_channel: "whatsapp" | "social_media_dm" | "in_store";
  commitment_manage_website: boolean | null;
  commitment_update_information: boolean | null;
  commitment_learn_and_grow: boolean | null;
}
interface DetailData {
  business: {
    id: string;
    legacyNo: number | null;
    slug: string;
    businessName: string;
    ownerName: string;
    whatsappMasked: string;
    emailMasked: string;
    contact: {
      whatsapp: string;
      email: string | null;
    } | null;
    contactQuality: string;
    contactQualityNote: string | null;
    moduleSentToUmkm: boolean;
    moduleSentAt: string | null;
    moduleSentBy: string | null;
    createdAt: string;
    updatedAt: string;
  };
  checkups: CheckupRow[];
  audits: Array<{
    id: number;
    action: string;
    before_data: unknown;
    after_data: unknown;
    reason: string | null;
    created_at: string;
    profiles?: { full_name?: string } | Array<{ full_name?: string }> | null;
  }>;
}
interface ModuleCatalogItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

function categoryVariant(category: string) {
  return category === "Siap"
    ? "success"
    : category === "Menengah"
      ? "warning"
      : "danger";
}
function yesNo(value: boolean) {
  return value ? "Sudah" : "Belum";
}
function moduleRelation(row: CheckupModuleRow) {
  return Array.isArray(row.intervention_modules)
    ? row.intervention_modules[0]
    : row.intervention_modules;
}

function initialAnswers(checkup: CheckupRow) {
  return checkupAnswersSchema.parse({
    has_nib: checkup.has_nib,
    product_active: checkup.product_active,
    pricing_status: checkup.pricing_status,
    stock_system: checkup.stock_system,
    has_fixed_brand_name: checkup.has_fixed_brand_name,
    has_logo: checkup.has_logo,
    visual_consistency: checkup.visual_consistency,
    instagram_username: checkup.instagram_username,
    tiktok_username: checkup.tiktok_username,
    google_maps_url: checkup.google_maps_url,
    google_maps_registered: checkup.google_maps_registered,
    has_google_reviews: checkup.has_google_reviews,
    google_rating_band: checkup.google_rating_band,
    has_facebook_page: checkup.has_facebook_page,
    uses_whatsapp_business: checkup.uses_whatsapp_business,
    ecommerce_platforms: checkup.ecommerce_platforms,
    ecommerce_other: checkup.ecommerce_other,
    social_active_recently: checkup.social_active_recently,
    posting_frequency: checkup.posting_frequency,
    payment_methods: checkup.payment_methods,
    ships_orders: checkup.ships_orders,
    order_channel: checkup.order_channel,
    commitment_manage_website: checkup.commitment_manage_website,
    commitment_update_information: checkup.commitment_update_information,
    commitment_learn_and_grow: checkup.commitment_learn_and_grow,
  });
}

export function UmkmDetailClient({
  detail,
  role,
  catalog,
}: {
  detail: DetailData;
  role: AppRole;
  catalog: ModuleCatalogItem[];
}) {
  const router = useRouter();
  const current = detail.checkups[0]!;
  const [editOpen, setEditOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [contact, setContact] = useState(detail.business.contact);
  const [contactVisible, setContactVisible] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState("verified");
  const [verifyReason, setVerifyReason] = useState(
    "Data telah diperiksa oleh superadmin",
  );
  const [overrideScore, setOverrideScore] = useState(current.effective_score);
  const [overrideReason, setOverrideReason] = useState("");
  const [saving, setSaving] = useState(false);
  const form = useForm<UpdateCheckupInput>({
    defaultValues: {
      version: current.version,
      business: {
        business_name: detail.business.businessName,
        owner_name: detail.business.ownerName,
        whatsapp: "",
        email: null,
      },
      answers: initialAnswers(current),
      reason: "",
    },
  });

  async function reveal(reason: string) {
    const response = await fetch(`/api/v1/umkm/${detail.business.id}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
      toast.error("Kontak tidak dapat dibuka.");
      return null;
    }
    const payload = (await response.json()) as {
      data: { whatsapp: string; email: string | null };
    };
    setContact(payload.data);
    return payload.data;
  }
  async function toggleContact() {
    if (contactVisible) {
      setContactVisible(false);
      return;
    }
    if (contact) {
      setContactVisible(true);
      return;
    }
    setContactLoading(true);
    const fullContact = await reveal("Membuka kontak dari halaman detail");
    setContactLoading(false);
    if (fullContact) setContactVisible(true);
  }
  async function openEdit() {
    const fullContact =
      contact ?? (await reveal("Membuka kontak untuk mengedit checkup"));
    if (!fullContact) return;
    form.reset({
      version: current.version,
      business: {
        business_name: detail.business.businessName,
        owner_name: detail.business.ownerName,
        whatsapp: fullContact.whatsapp,
        email: fullContact.email,
      },
      answers: initialAnswers(current),
      reason: "",
    });
    setEditOpen(true);
  }
  async function submitEdit(values: UpdateCheckupInput) {
    const parsed = updateCheckupSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Form belum valid.");
      return;
    }
    setSaving(true);
    const response = await fetch(`/api/v1/checkups/${current.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setSaving(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.error?.message ?? "Perubahan gagal disimpan.");
      return;
    }
    toast.success("Perubahan disimpan; skor dan modul telah dihitung ulang.");
    setEditOpen(false);
    router.refresh();
  }
  async function verify() {
    setSaving(true);
    const response = await fetch(`/api/v1/checkups/${current.id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version: current.version,
        status: verifyStatus,
        reason: verifyReason,
      }),
    });
    setSaving(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.error?.message ?? "Status gagal diperbarui.");
      return;
    }
    toast.success(
      verifyStatus === "verified"
        ? "Data terverifikasi dan modul tercatat terkirim."
        : "Status verifikasi diperbarui.",
    );
    setVerifyOpen(false);
    router.refresh();
  }
  async function override() {
    setSaving(true);
    const response = await fetch(`/api/v1/checkups/${current.id}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version: current.version,
        score: overrideScore,
        reason: overrideReason,
      }),
    });
    setSaving(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.error?.message ?? "Override gagal.");
      return;
    }
    toast.success("Penyesuaian skor berhasil disimpan.");
    setOverrideOpen(false);
    router.refresh();
  }
  async function updateModule(moduleId: string, status: string) {
    const response = await fetch(
      `/api/v1/checkups/${current.id}/modules/${moduleId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reason: `Status modul diubah menjadi ${status}`,
        }),
      },
    );
    if (response.ok) {
      toast.success("Progres modul diperbarui.");
      router.refresh();
    } else toast.error("Progres modul gagal diperbarui.");
  }
  async function openWhatsapp() {
    const fullContact =
      contact ?? (await reveal("Menghubungi UMKM melalui WhatsApp"));
    if (fullContact)
      window.open(
        `https://wa.me/${fullContact.whatsapp.replace(/\D/g, "").replace(/^0/, "62")}`,
        "_blank",
        "noopener,noreferrer",
      );
  }
  async function removeCheckup() {
    if (
      !window.confirm(
        "Hapus checkup ini? Data dapat dipulihkan oleh superadmin dari halaman Modul Pendampingan.",
      )
    )
      return;
    const response = await fetch(`/api/v1/checkups/${current.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version: current.version,
        reason: "Dihapus superadmin dari halaman detail UMKM",
      }),
    });
    if (response.ok) {
      toast.success("Checkup dipindahkan ke data terhapus.");
      router.push("/dashboard/umkm");
      router.refresh();
    } else toast.error("Checkup gagal dihapus.");
  }

  const activeModules = current.modules.filter((row) => row.is_current);
  const existingModuleIds = new Set(
    current.modules.map((row) => row.module_id),
  );
  const watchedAnswers = useWatch({ control: form.control, name: "answers" });
  const parsedPreview = checkupAnswersSchema.safeParse(watchedAnswers);
  const previewScore = parsedPreview.success
    ? calculateScore(parsedPreview.data)
    : null;
  const previewModules = parsedPreview.success
    ? recommendModules(parsedPreview.data)
    : [];
  const currentAutomaticModules = activeModules
    .filter((row) => row.origin !== "manual")
    .map((row) => moduleRelation(row))
    .filter((row): row is ModuleRelation => Boolean(row));
  const previewSlugs = new Set(previewModules.map((item) => item.slug));
  const currentSlugs = new Set(currentAutomaticModules.map((item) => item.slug));
  const addedModules = previewModules.filter((item) => !currentSlugs.has(item.slug));
  const removedModules = currentAutomaticModules.filter((item) => !previewSlugs.has(item.slug));
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <AnimatedCircularProgress
                value={current.effective_score}
                sizeClassName="size-24"
                innerClassName="size-20"
                valueClassName="text-2xl"
                suffix=""
                caption={<span className="text-[10px] text-[#667085]">/100</span>}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-semibold">
                    {detail.business.businessName}
                  </h1>
                  <Badge variant={categoryVariant(current.readiness_category)}>
                    {current.readiness_category}
                  </Badge>
                  <Badge
                    variant={current.verification_status === "verified" ? "success" : "neutral"}
                  >
                    {current.verification_status === "verified"
                      ? "Terverifikasi"
                      : "Belum Diverifikasi"}
                  </Badge>
                  <Badge
                    variant={
                      detail.business.moduleSentToUmkm ? "success" : "warning"
                    }
                  >
                    {detail.business.moduleSentToUmkm
                      ? "Modul terkirim"
                      : "Modul belum dikirim"}
                  </Badge>
                </div>
                <div className="mt-2 space-y-1 text-sm text-[#667085]">
                  <p>{detail.business.ownerName}</p>
                  <p className="flex flex-wrap items-center gap-1.5">
                    <span>
                      {contactVisible && contact
                        ? contact.whatsapp
                        : detail.business.whatsappMasked}
                    </span>
                    {can(role, "reveal_pii") ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-[#667085]"
                        onClick={() => void toggleContact()}
                        disabled={contactLoading}
                        aria-pressed={contactVisible}
                        aria-label={contactVisible ? "Sembunyikan kontak" : "Tampilkan kontak"}
                        title={contactVisible ? "Sembunyikan kontak" : "Tampilkan kontak"}
                      >
                        {contactLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : contactVisible ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    ) : null}
                  </p>
                  <p>
                    {contactVisible && contact
                      ? contact.email
                      : detail.business.emailMasked}
                  </p>
                </div>
                {detail.business.contactQuality === "duplicate" ? (
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[#B45309]">
                    <AlertTriangle className="size-3.5" />
                    {detail.business.contactQualityNote}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {can(role, "reveal_pii") ? (
                <Button variant="outline" className="text-[#128C7E]" onClick={openWhatsapp}>
                  <WhatsAppIcon className="size-4" />
                  Hubungi
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <a
                  href={`/api/v1/export?format=xlsx&umkmId=${detail.business.id}`}
                >
                  <Download />
                  Export
                </a>
              </Button>
              {can(role, "verify") ? (
                <Button variant="secondary" onClick={() => setVerifyOpen(true)}>
                  <ShieldCheck />
                  Verifikasi
                </Button>
              ) : null}
              {can(role, "edit") ? (
                <Button onClick={openEdit}>
                  <Pencil />
                  Edit
                </Button>
              ) : null}
              {can(role, "delete_restore") ? (
                <Button
                  variant="danger"
                  size="icon"
                  onClick={removeCheckup}
                  aria-label="Hapus checkup"
                >
                  <Trash2 />
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-12 xl:items-start">
      <div className="min-w-0 xl:col-span-8">
      <Tabs defaultValue="summary">
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="summary">Ringkasan</TabsTrigger>
          <TabsTrigger value="answers">Jawaban Checkup</TabsTrigger>
          <TabsTrigger value="modules">Modul</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <SummaryTab checkup={current} />
        </TabsContent>
        <TabsContent value="answers">
          <AnswersTab checkup={current} />
        </TabsContent>
        <TabsContent value="modules">
          <div className="grid gap-4 lg:grid-cols-2">
            {activeModules.map((row) => {
              const moduleInfo = moduleRelation(row);
              if (!moduleInfo) return null;
              return (
                <Card key={row.module_id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{moduleInfo.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {row.reason ?? moduleInfo.description}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          row.origin === "manual" ? "default" : "neutral"
                        }
                      >
                        {row.origin === "manual"
                          ? "Manual"
                          : `Prioritas ${row.priority}`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SelectNative
                      value={row.status}
                      disabled={
                        !can(role, "progress_modules") &&
                        !can(role, "manage_modules")
                      }
                      onChange={(event) =>
                        updateModule(row.module_id, event.target.value)
                      }
                      aria-label={`Status ${moduleInfo.name}`}
                    >
                      <option value="recommended">Direkomendasikan</option>
                      <option value="planned">Direncanakan</option>
                      <option value="in_progress">Sedang berjalan</option>
                      <option value="completed">Selesai</option>
                      <option value="dismissed">Dilewati</option>
                    </SelectNative>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {can(role, "progress_modules") || can(role, "manage_modules") ? (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Tambahkan modul manual</CardTitle>
                <CardDescription>
                  Assignment manual tidak dihapus saat skor dihitung ulang.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SelectNative
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value)
                      void updateModule(event.target.value, "planned");
                  }}
                >
                  <option value="" disabled>
                    Pilih modul...
                  </option>
                  {catalog
                    .filter(
                      (moduleItem) => !existingModuleIds.has(moduleItem.id),
                    )
                    .map((moduleItem) => (
                      <option key={moduleItem.id} value={moduleItem.id}>
                        {moduleItem.name}
                      </option>
                    ))}
                </SelectNative>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>
      </div>
      <DetailSummaryCard checkup={current} business={detail.business} modules={activeModules} />
      </div>

      <Sheet
        open={editOpen}
        onOpenChange={(open) => {
          if (
            !open &&
            form.formState.isDirty &&
            !window.confirm("Batalkan perubahan yang belum disimpan?")
          )
            return;
          setEditOpen(open);
        }}
      >
        <SheetContent className="max-w-[640px] p-0 max-sm:max-w-none">
          <div className="border-b border-[var(--border)] p-5">
          <SheetHeader>
            <SheetTitle>Edit Digital Checkup</SheetTitle>
            <SheetDescription>
              Perubahan jawaban menghitung ulang skor dan rekomendasi serta
              membatalkan override lama.
            </SheetDescription>
          </SheetHeader>
          </div>
          <form onSubmit={form.handleSubmit(submitEdit)} className="space-y-4 px-5 pb-2">
            {form.formState.isDirty && previewScore ? (
              <div className="mt-5 rounded-2xl border border-[#B2CCFF] bg-[var(--brand-primary-soft)] p-4">
                <p className="text-sm font-semibold text-[#1849A9]">Pratinjau dampak perubahan</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-3"><p className="text-xs text-[var(--text-secondary)]">Sebelum</p><p className="mt-1 text-xl font-semibold"><AnimatedNumber value={current.effective_score} /></p><Badge variant={categoryVariant(current.readiness_category)}>{current.readiness_category}</Badge></div>
                  <div className="rounded-xl bg-white p-3"><p className="text-xs text-[var(--text-secondary)]">Setelah</p><p className="mt-1 text-xl font-semibold"><AnimatedNumber value={previewScore.score} /></p><Badge variant={categoryVariant(previewScore.category)}>{previewScore.category}</Badge></div>
                </div>
                {(addedModules.length || removedModules.length) ? <div className="mt-3 space-y-1 text-xs text-[#344054]">{addedModules.length ? <p><strong>Ditambah:</strong> {addedModules.map((item) => item.name).join(", ")}</p> : null}{removedModules.length ? <p><strong>Dihapus:</strong> {removedModules.map((item) => item.name).join(", ")}</p> : null}</div> : <p className="mt-3 text-xs text-[#344054]">Rekomendasi modul tidak berubah.</p>}
              </div>
            ) : null}
            <EditSections form={form} />
            {form.formState.isDirty ? (
              <div className="rounded-xl bg-[#FEF3C7] p-3 text-sm text-[#92400E]">
                Perubahan ini dapat memengaruhi skor, kategori, dan modul
                pendampingan.
              </div>
            ) : null}
            <div className="sticky bottom-0 -mx-5 flex justify-end gap-2 border-t border-[var(--border)] bg-white px-5 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <RotateCcw className="animate-spin" /> : <Save />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perbarui status verifikasi</DialogTitle>
            <DialogDescription>
              Status tidak mengubah skor. Terverifikasi menandai data sudah
              dicek dan modul sudah dikirim.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="verify-status">Status</Label>
              <SelectNative
                id="verify-status"
                className="mt-1.5 w-full"
                value={verifyStatus}
                onChange={(event) => setVerifyStatus(event.target.value)}
              >
                <option value="verified">Terverifikasi</option>
                <option value="unverified">Belum diverifikasi</option>
              </SelectNative>
            </div>
            <div>
              <Label htmlFor="verify-reason">Alasan/catatan</Label>
              <Textarea
                id="verify-reason"
                className="mt-1.5"
                value={verifyReason}
                onChange={(event) => setVerifyReason(event.target.value)}
              />
            </div>
            <Button
              onClick={verify}
              disabled={saving || verifyReason.length < 3}
              className="w-full"
            >
              <CheckCircle2 />
              Simpan status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override skor</DialogTitle>
            <DialogDescription>
              Hanya superadmin. Alasan wajib dan seluruh tindakan dicatat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="override-score">Skor efektif</Label>
              <Input
                id="override-score"
                type="number"
                min={0}
                max={100}
                value={overrideScore}
                onChange={(event) =>
                  setOverrideScore(Number(event.target.value))
                }
              />
            </div>
            <div>
              <Label htmlFor="override-reason">Alasan</Label>
              <Textarea
                id="override-reason"
                value={overrideReason}
                onChange={(event) => setOverrideReason(event.target.value)}
              />
            </div>
            <Button
              onClick={override}
              disabled={saving || overrideReason.length < 3}
              className="w-full"
            >
              Simpan override
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {can(role, "override_score") ? (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOverrideOpen(true)}
          >
            Override skor dengan alasan
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function DetailSummaryCard({
  checkup,
  business,
  modules,
}: {
  checkup: CheckupRow;
  business: DetailData["business"];
  modules: CheckupModuleRow[];
}) {
  const gaps = [
    !checkup.has_nib ? "NIB" : null,
    !checkup.has_logo ? "Logo" : null,
    !checkup.google_maps_registered ? "Google Maps" : null,
    !checkup.uses_whatsapp_business ? "WhatsApp Business" : null,
    !checkup.social_active_recently ? "Aktivitas media sosial" : null,
  ].filter((item): item is string => Boolean(item));
  return (
    <Card className="xl:sticky xl:top-24 xl:col-span-4">
      <CardHeader>
        <CardTitle>Ringkasan Checkup</CardTitle>
        <CardDescription>Snapshot terbaru dan fokus intervensi.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex items-end justify-between"><div><p className="text-xs text-[var(--text-secondary)]">Skor kesiapan</p><p className="mt-1 text-3xl font-semibold"><AnimatedNumber value={checkup.effective_score} /><span className="text-sm font-normal text-[var(--text-tertiary)]">/100</span></p></div><Badge variant={categoryVariant(checkup.readiness_category)}>{checkup.readiness_category}</Badge></div>
          <Progress className="mt-3 h-2" value={checkup.effective_score} label={`Skor kesiapan ${checkup.effective_score} dari 100`} />
        </div>
        <div className="border-t border-[var(--border)] pt-4"><p className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">Gap utama</p><div className="mt-2 flex flex-wrap gap-1.5">{gaps.length ? gaps.map((gap) => <Badge key={gap} variant="warning">{gap}</Badge>) : <Badge variant="success">Tidak ada gap utama</Badge>}</div></div>
        <div className="border-t border-[var(--border)] pt-4"><p className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">Modul prioritas</p><div className="mt-2 space-y-2">{modules.slice(0, 4).map((row) => { const item = moduleRelation(row); return item ? <div key={row.module_id} className="flex items-center justify-between gap-2 text-xs"><span className="line-clamp-1 text-[#344054]">{item.name}</span><Badge variant="neutral">P{row.priority}</Badge></div> : null; })}{!modules.length ? <p className="text-xs text-[var(--text-secondary)]">Tidak ada modul aktif.</p> : null}</div></div>
        <dl className="space-y-2 border-t border-[var(--border)] pt-4 text-xs">
          <div className="flex justify-between gap-3"><dt className="text-[var(--text-secondary)]">Status</dt><dd className="font-medium">{checkup.verification_status === "verified" ? "Terverifikasi" : "Belum diverifikasi"}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-[var(--text-secondary)]">Submission</dt><dd className="text-right font-medium">{formatDateTime(checkup.submitted_at)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-[var(--text-secondary)]">Diperbarui</dt><dd className="text-right font-medium">{formatDateTime(business.updatedAt)}</dd></div>
        </dl>
      </CardContent>
    </Card>
  );
}

function SummaryTab({ checkup }: { checkup: CheckupRow }) {
  const dimensions = [
    { title: "Legalitas", items: [["NIB", yesNo(checkup.has_nib)]] },
    {
      title: "Produk",
      items: [
        ["Produk aktif", yesNo(checkup.product_active)],
        [
          "Harga",
          { clear: "Jelas", variable: "Kadang berubah", none: "Belum" }[
            checkup.pricing_status
          ],
        ],
        ["Stok", checkup.stock_system.replaceAll("_", " ")],
      ],
    },
    {
      title: "Branding",
      items: [
        ["Nama brand", yesNo(checkup.has_fixed_brand_name)],
        ["Logo", yesNo(checkup.has_logo)],
        ["Visual", checkup.visual_consistency],
      ],
    },
    {
      title: "Digitalisasi",
      items: [
        ["Google Maps", yesNo(checkup.google_maps_registered)],
        ["WA Business", yesNo(checkup.uses_whatsapp_business)],
        [
          "Marketplace",
          checkup.ecommerce_platforms.length
            ? checkup.ecommerce_platforms.join(", ")
            : "Belum",
        ],
      ],
    },
    {
      title: "Konsistensi",
      items: [
        [
          "Media sosial",
          checkup.social_active_recently ? "Aktif" : "Tidak aktif",
        ],
        ["Konten", checkup.posting_frequency],
      ],
    },
    {
      title: "Operasional",
      items: [
        ["Pembayaran", checkup.payment_methods],
        ["Pengiriman", yesNo(checkup.ships_orders)],
        ["Pemesanan", checkup.order_channel.replaceAll("_", " ")],
      ],
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {dimensions.map((dimension) => (
        <Card key={dimension.title}>
          <CardHeader>
            <CardTitle>{dimension.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dimension.items.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 border-b pb-2 last:border-0"
              >
                <span className="text-sm text-[#667085]">{label}</span>
                <span className="text-right text-sm font-semibold capitalize">
                  {value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AnswersTab({ checkup }: { checkup: CheckupRow }) {
  const rows: Array<[string, string]> = [
    ["Instagram", checkup.instagram_username ?? "Belum"],
    ["TikTok", checkup.tiktok_username ?? "Belum"],
    ["Link Google Maps", checkup.google_maps_url ?? "Belum disalin"],
    ["Ulasan Google", yesNo(checkup.has_google_reviews)],
    ["Rating Google", checkup.google_rating_band],
    ["Halaman Facebook", yesNo(checkup.has_facebook_page)],
    ["Aktif media sosial", yesNo(checkup.social_active_recently)],
    [
      "Komitmen mengelola website",
      checkup.commitment_manage_website === null
        ? "Tidak ditanyakan"
        : yesNo(checkup.commitment_manage_website),
    ],
    [
      "Komitmen memperbarui informasi",
      checkup.commitment_update_information === null
        ? "Tidak ditanyakan"
        : yesNo(checkup.commitment_update_information),
    ],
    [
      "Komitmen belajar",
      checkup.commitment_learn_and_grow === null
        ? "Tidak ditanyakan"
        : yesNo(checkup.commitment_learn_and_grow),
    ],
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jawaban lengkap</CardTitle>
        <CardDescription>
          Nilai lemah diberi penanda ringan untuk memudahkan peninjauan.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 md:grid-cols-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className={`rounded-xl border p-3 ${value === "Belum" || value === "Tidak aktif" ? "bg-[#FFF7ED]" : "bg-[#F9FAFB]"}`}
          >
            <p className="text-xs text-[#667085]">{label}</p>
            <p className="mt-1 text-sm font-semibold capitalize">{value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EditSections({
  form,
}: {
  form: ReturnType<typeof useForm<UpdateCheckupInput>>;
}) {
  const { register } = form;
  const sectionClass = "rounded-xl border bg-[#F9FAFB] p-4 open:bg-white";
  const gridClass = "mt-4 grid gap-4 sm:grid-cols-2";
  const boolOptions = (
    <>
      <option value="true">Iya/Sudah</option>
      <option value="false">Belum/Tidak</option>
    </>
  );
  return (
    <div className="space-y-3">
      <details open className={sectionClass}>
        <summary className="cursor-pointer font-semibold">1. Identitas</summary>
        <div className={gridClass}>
          <Field label="Nama UMKM">
            <Input {...register("business.business_name")} />
          </Field>
          <Field label="Nama pemilik">
            <Input {...register("business.owner_name")} />
          </Field>
          <Field label="WhatsApp">
            <Input {...register("business.whatsapp")} />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              {...register("business.email", {
                setValueAs: (value) => value || null,
              })}
            />
          </Field>
        </div>
      </details>
      <details className={sectionClass}>
        <summary className="cursor-pointer font-semibold">2. Legalitas</summary>
        <div className={gridClass}>
          <Field label="Memiliki NIB">
            <SelectNative
              className="w-full"
              {...register("answers.has_nib", {
                setValueAs: (value) => value === "true",
              })}
            >
              {boolOptions}
            </SelectNative>
          </Field>
        </div>
      </details>
      <details className={sectionClass}>
        <summary className="cursor-pointer font-semibold">3. Produk</summary>
        <div className={gridClass}>
          <Field label="Produk aktif">
            <SelectNative
              className="w-full"
              {...register("answers.product_active", {
                setValueAs: (value) => value === "true",
              })}
            >
              {boolOptions}
            </SelectNative>
          </Field>
          <Field label="Kejelasan harga">
            <SelectNative
              className="w-full"
              {...register("answers.pricing_status")}
            >
              <option value="clear">Iya jelas</option>
              <option value="variable">Kadang berubah</option>
              <option value="none">Belum</option>
            </SelectNative>
          </Field>
          <Field label="Sistem stok">
            <SelectNative
              className="w-full"
              {...register("answers.stock_system")}
            >
              <option value="ready_stock">Ready stok</option>
              <option value="pre_order">Pre-order</option>
              <option value="both">Keduanya</option>
            </SelectNative>
          </Field>
        </div>
      </details>
      <details className={sectionClass}>
        <summary className="cursor-pointer font-semibold">4. Branding</summary>
        <div className={gridClass}>
          <Field label="Nama brand tetap">
            <SelectNative
              className="w-full"
              {...register("answers.has_fixed_brand_name", {
                setValueAs: (value) => value === "true",
              })}
            >
              {boolOptions}
            </SelectNative>
          </Field>
          <Field label="Memiliki logo">
            <SelectNative
              className="w-full"
              {...register("answers.has_logo", {
                setValueAs: (value) => value === "true",
              })}
            >
              {boolOptions}
            </SelectNative>
          </Field>
          <Field label="Konsistensi visual">
            <SelectNative
              className="w-full"
              {...register("answers.visual_consistency")}
            >
              <option value="consistent">Konsisten</option>
              <option value="partial">Sebagian</option>
              <option value="none">Belum</option>
            </SelectNative>
          </Field>
        </div>
      </details>
      <details className={sectionClass}>
        <summary className="cursor-pointer font-semibold">
          5. Digitalisasi
        </summary>
        <div className={gridClass}>
          <Field label="Username Instagram">
            <Input
              {...register("answers.instagram_username", {
                setValueAs: (value) => value || null,
              })}
            />
          </Field>
          <Field label="Username TikTok">
            <Input
              {...register("answers.tiktok_username", {
                setValueAs: (value) => value || null,
              })}
            />
          </Field>
          <Field label="Link Google Maps">
            <Input
              {...register("answers.google_maps_url", {
                setValueAs: (value) => value || null,
              })}
            />
          </Field>
          <Field label="Terdaftar Google Maps">
            <SelectNative
              className="w-full"
              {...register("answers.google_maps_registered", {
                setValueAs: (value) => value === "true",
              })}
            >
              {boolOptions}
            </SelectNative>
          </Field>
          <Field label="Ulasan Google">
            <SelectNative
              className="w-full"
              {...register("answers.has_google_reviews", {
                setValueAs: (value) => value === "true",
              })}
            >
              {boolOptions}
            </SelectNative>
          </Field>
          <Field label="Rating Google">
            <SelectNative
              className="w-full"
              {...register("answers.google_rating_band")}
            >
              <option value="above_4">≥ 4.0</option>
              <option value="below_4">&lt; 4.0</option>
              <option value="unknown">Belum/tidak tahu</option>
            </SelectNative>
          </Field>
          <Field label="Halaman Facebook">
            <SelectNative
              className="w-full"
              {...register("answers.has_facebook_page", {
                setValueAs: (value) => value === "true",
              })}
            >
              {boolOptions}
            </SelectNative>
          </Field>
          <Field label="WhatsApp Business">
            <SelectNative
              className="w-full"
              {...register("answers.uses_whatsapp_business", {
                setValueAs: (value) => value === "true",
              })}
            >
              {boolOptions}
            </SelectNative>
          </Field>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium text-[#344054]">
              Platform e-commerce
            </legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {[
                ["shopee", "Shopee"],
                ["tokopedia", "Tokopedia"],
                ["bukalapak", "Bukalapak"],
                ["lazada", "Lazada"],
                ["blibli", "Blibli"],
                ["tiktok_shop", "TikTok Shop"],
                ["other", "Lainnya"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    value={value}
                    {...register("answers.ecommerce_platforms")}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Nama platform lain">
            <Input
              {...register("answers.ecommerce_other", {
                setValueAs: (value) => value || null,
              })}
            />
          </Field>
        </div>
      </details>
      <details className={sectionClass}>
        <summary className="cursor-pointer font-semibold">
          6. Konsistensi
        </summary>
        <div className={gridClass}>
          <Field label="Aktif 1–3 bulan">
            <SelectNative
              className="w-full"
              {...register("answers.social_active_recently", {
                setValueAs: (value) => value === "true",
              })}
            >
              {boolOptions}
            </SelectNative>
          </Field>
          <Field label="Frekuensi konten">
            <SelectNative
              className="w-full"
              {...register("answers.posting_frequency")}
            >
              <option value="regular">Rutin</option>
              <option value="sometimes">Kadang</option>
              <option value="never">Tidak</option>
            </SelectNative>
          </Field>
        </div>
      </details>
      <details className={sectionClass}>
        <summary className="cursor-pointer font-semibold">
          7. Operasional dan Komitmen
        </summary>
        <div className={gridClass}>
          <Field label="Metode pembayaran">
            <SelectNative
              className="w-full"
              {...register("answers.payment_methods")}
            >
              <option value="cash">Tunai</option>
              <option value="digital">QRIS/Transfer</option>
              <option value="both">Keduanya</option>
            </SelectNative>
          </Field>
          <Field label="Mengirim pesanan">
            <SelectNative
              className="w-full"
              {...register("answers.ships_orders", {
                setValueAs: (value) => value === "true",
              })}
            >
              {boolOptions}
            </SelectNative>
          </Field>
          <Field label="Channel pemesanan">
            <SelectNative
              className="w-full"
              {...register("answers.order_channel")}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="social_media_dm">DM media sosial</option>
              <option value="in_store">Hanya toko</option>
            </SelectNative>
          </Field>
          <Field label="Siap mengelola website">
            <TriStateSelect
              {...register("answers.commitment_manage_website", {
                setValueAs: triState,
              })}
            />
          </Field>
          <Field label="Siap memperbarui informasi">
            <TriStateSelect
              {...register("answers.commitment_update_information", {
                setValueAs: triState,
              })}
            />
          </Field>
          <Field label="Siap belajar dan berkembang">
            <TriStateSelect
              {...register("answers.commitment_learn_and_grow", {
                setValueAs: triState,
              })}
            />
          </Field>
          <Field label="Alasan perubahan">
            <Textarea {...register("reason")} />
          </Field>
        </div>
      </details>
    </div>
  );
}

function triState(value: string) {
  return value === "" ? null : value === "true";
}
function TriStateSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <SelectNative className="w-full" {...props}>
      <option value="">Tidak ditanyakan</option>
      <option value="true">Ya, siap</option>
      <option value="false">Tidak siap</option>
    </SelectNative>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
