import { existsSync } from "node:fs";
import { join } from "node:path";

import { ModuleCatalogClient } from "@/components/forms/module-catalog-client";
import { requireSession } from "@/server/auth/session";
import { getModulesDashboard } from "@/server/repositories/modules";

export default async function ModulesPage() {
  const session = await requireSession();
  const modules = await getModulesDashboard();
  const withMaterials = modules.map((module) => {
    const slug = String(module.slug);
    const file = join(process.cwd(), "public", "modul-pendampingan", `${slug}.pdf`);
    return { ...module, materialHref: existsSync(file) ? `/modul-pendampingan/${slug}.pdf` : null };
  });
  return <ModuleCatalogClient modules={withMaterials as never} role={session.role} />;
}
