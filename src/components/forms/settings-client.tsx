"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Plus, Save, UserRoundCog } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SessionProfile } from "@/server/auth/session";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "superadmin" | "viewer";
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

export function SettingsClient({
  session,
  users,
  totalUmkm,
}: {
  session: SessionProfile;
  users: UserRow[];
  totalUmkm: number;
}) {
  const router = useRouter();
  const [name, setName] = useState(session.fullName);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({
    email: "",
    full_name: "",
    role: "viewer",
  });
  async function updateProfile() {
    const response = await fetch("/api/v1/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: name }),
    });
    if (response.ok) {
      toast.success("Profil diperbarui.");
      router.refresh();
    } else toast.error("Profil gagal diperbarui.");
  }
  async function sendInvite() {
    const response = await fetch("/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invite),
    });
    if (response.ok) {
      toast.success("Undangan dikirim.");
      setInviteOpen(false);
      setInvite({ email: "", full_name: "", role: "viewer" });
      router.refresh();
    } else {
      const body = await response.json().catch(() => null);
      toast.error(body?.error?.message ?? "Undangan gagal.");
    }
  }
  async function updateUser(id: string, role: string, isActive: boolean) {
    const response = await fetch(`/api/v1/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, is_active: isActive }),
    });
    if (response.ok) {
      toast.success("Akses pengguna diperbarui.");
      router.refresh();
    } else {
      const body = await response.json().catch(() => null);
      toast.error(body?.error?.message ?? "Akses gagal diperbarui.");
    }
  }
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pengaturan" title="Profil dan Akses" description="Kelola identitas pengguna dan izin akses dashboard." />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profil Saya</CardTitle>
            <CardDescription>
              Nama ini digunakan sebagai identitas Anda di dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profile-name">Nama lengkap</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={session.email ?? ""} disabled />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={session.role} disabled className="capitalize" />
            </div>
            <Button onClick={updateProfile} disabled={name.length < 2}>
              <Save />
              Simpan profil
            </Button>
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Status Sistem</CardTitle>
            <CardDescription>
              Ringkasan ketersediaan data dan akses dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <Database className="size-5 text-[#0255F5]" />
              <p className="mt-3 text-sm font-semibold">Sumber data</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge>Data operasional · <AnimatedNumber value={totalUmkm} /> UMKM</Badge>
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <UserRoundCog className="size-5 text-[#0255F5]" />
              <p className="mt-3 text-sm font-semibold">Status layanan</p>
              <Badge variant="success" className="mt-2">
                Aktif
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      {session.role === "superadmin" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Pengguna Dashboard</CardTitle>
              <CardDescription>
                Kelola role dan status pengguna yang memiliki akses.
              </CardDescription>
            </div>
            <Button onClick={() => setInviteOpen(true)}>
              <Plus />
              Undang pengguna
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Login terakhir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-semibold">{user.full_name}</p>
                      <p className="text-xs text-[#667085]">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      <SelectNative
                        value={user.role}
                        disabled={user.id === session.id}
                        onChange={(event) =>
                          updateUser(
                            user.id,
                            event.target.value,
                            user.is_active,
                          )
                        }
                      >
                        <option value="superadmin">Superadmin</option>
                        <option value="viewer">Viewer</option>
                      </SelectNative>
                    </TableCell>
                    <TableCell>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={user.is_active}
                          disabled={user.id === session.id}
                          onChange={(event) =>
                            updateUser(user.id, user.role, event.target.checked)
                          }
                        />
                        {user.is_active ? "Aktif" : "Nonaktif"}
                      </label>
                    </TableCell>
                    <TableCell className="text-xs">
                      {user.last_sign_in_at
                        ? formatDateTime(user.last_sign_in_at)
                        : "Belum pernah"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undang pengguna</DialogTitle>
            <DialogDescription>
              Tambahkan pengguna baru ke daftar akses dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-name">Nama lengkap</Label>
              <Input
                id="invite-name"
                value={invite.full_name}
                onChange={(event) =>
                  setInvite({ ...invite, full_name: event.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={invite.email}
                onChange={(event) =>
                  setInvite({ ...invite, email: event.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <SelectNative
                id="invite-role"
                className="w-full"
                value={invite.role}
                onChange={(event) =>
                  setInvite({ ...invite, role: event.target.value })
                }
              >
                <option value="viewer">Viewer</option>
                <option value="superadmin">Superadmin</option>
              </SelectNative>
            </div>
            <Button
              className="w-full"
              onClick={sendInvite}
              disabled={!invite.email || invite.full_name.length < 2}
            >
              Kirim undangan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
