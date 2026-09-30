import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGalleryPreviewDetails } from "@/lib/templates/template-store";
import { getGalleryTemplateCards, CATEGORIES } from "@/app/templates/data";
import { TemplatesGallery } from "@/app/templates/TemplatesGallery";
import { TemplateThumb } from "@/app/templates/TemplateThumb";
import tplStyles from "@/app/templates/templates.module.css";
import styles from "../dashboard.module.css";
import { SignOutButton } from "../SignOutButton";

export default async function DashboardTemplatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [templates, previews] = await Promise.all([
    getGalleryTemplateCards(),
    getGalleryPreviewDetails(),
  ]);

  const thumbs: Record<string, ReactNode> = Object.fromEntries(
    previews.map((t) => [t.id, <TemplateThumb key={t.id} template={t} />])
  );

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.logo} href="/">
          <span className={styles.logoMark}>R</span>
          Rivo
        </Link>

        <nav className={styles.nav}>
          <Link className={styles.navItem} href="/dashboard">
            Dashboard
          </Link>
          <span className={`${styles.navItem} ${styles.navItemActive}`}>Templates</span>
          <Link className={styles.navItem} href="/dashboard/connectors">
            Connectors
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.userEmail}>{user.email}</span>
          <SignOutButton />
        </div>
      </aside>

      <main className={styles.main}>
        <div
          className={tplStyles.scene}
          style={{ minHeight: "auto", background: "transparent", overflow: "visible" }}
        >
          <TemplatesGallery
            templates={templates}
            categories={CATEGORIES}
            thumbs={thumbs}
            basePath="/dashboard/templates"
          />
        </div>
      </main>
    </div>
  );
}
