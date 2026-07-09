import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { demoStore } from "@/demo/store";
import { SESSION_COOKIE } from "@/server/auth/credentials";
import type { AppRole } from "@/lib/permissions";

export interface SessionProfile {
  id: string;
  email: string | null;
  fullName: string;
  role: AppRole;
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const cookieStore = await Promise.resolve(cookies());
  const sessionEmail = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionEmail) return null;
  const profile = demoStore().profiles.find(
    (item) => item.email.toLowerCase() === sessionEmail.toLowerCase(),
  );
  if (!profile || !profile.is_active) return null;
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
  };
}

export async function requireSession() {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  return session;
}

export async function requireApiSession() {
  return getSessionProfile();
}
