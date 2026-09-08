import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewProjectForm } from "./NewProjectForm";
import { SignOutButton } from "./SignOutButton";
import styles from "./dashboard.module.css";

const CATEGORY_LABELS: Record<string, string> = {
  retail: "Retail",
  services: "Services",
  food: "Food & Restaurant",
  professional: "Professional",
  ngo_community: "NGO / Community",
  events_portfolio: "Events & Portfolio",
};

const CATEGORY_COLORS: Record<string, string> = {
  retail: "linear-gradient(135deg, #4e6bff, #2d3fa8)",
  services: "linear-gradient(135deg, #9b4eff, #5c2ba8)",
  food: "linear-gradient(135deg, #ff4ec7, #a82b7a)",
  professional: "linear-gradient(135deg, #4e6bff, #9b4eff)",
  ngo_community: "linear-gradient(135deg, #2ba88a, #1a6b58)",
  events_portfolio: "linear-gradient(135deg, #ff9d4e, #a85b2b)",
};

interface ProjectRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  category: string | null;
  created_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("business_users")
    .select("business:businesses(id, name, slug, status, category, created_at)")
    .eq("user_id", user.id);

  const projects: ProjectRow[] = (memberships ?? [])
    .map((m) => m.business as unknown as ProjectRow | null)
    .filter((b): b is ProjectRow => Boolean(b))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const recents = projects.slice(0, 5);

  const displayName =
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "there";

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.logo} href="/">
          <span className={styles.logoMark}>R</span>
          Rivo
        </Link>

        <nav className={styles.nav}>
          <span className={`${styles.navItem} ${styles.navItemActive}`}>Dashboard</span>
          <Link className={styles.navItem} href="/templates">
            Templates
          </Link>
          <Link className={styles.navItem} href="/dashboard/connectors">
            Connectors
          </Link>
        </nav>

        <div className={styles.sidebarSection}>
          <p className={styles.sidebarSectionLabel}>Recents</p>
          {recents.length === 0 ? (
            <p className={styles.recentEmpty}>No projects yet</p>
          ) : (
            recents.map((p) => (
              <Link key={p.id} className={styles.recentItem} href={`/dashboard/${p.id}`}>
                {p.name}
              </Link>
            ))
          )}
        </div>

        <div className={styles.sidebarFooter}>
          <span className={styles.userEmail}>{user.email}</span>
          <SignOutButton />
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>What should we build, {displayName}?</h1>
          <NewProjectForm />
        </div>

        <section className={styles.panel}>
          <div className={styles.tabs}>
            <div className={styles.tabsLeft}>
              <span className={`${styles.tab} ${styles.tabActive}`}>My projects</span>
              <Link className={styles.tab} href="/templates">
                Templates
              </Link>
            </div>
            <Link className={styles.browseAll} href="/templates">
              Browse all →
            </Link>
          </div>

          {projects.length === 0 ? (
            <p className={styles.empty}>No projects yet — describe your business above to start your first one.</p>
          ) : (
            <div className={styles.grid}>
              {projects.map((p) => (
                <Link key={p.id} href={`/dashboard/${p.id}`} className={styles.card}>
                  <div
                    className={styles.thumb}
                    style={{ background: (p.category && CATEGORY_COLORS[p.category]) || "linear-gradient(135deg, #4e6bff, #9b4eff)" }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                    <span className={styles.cardStatus} data-status={p.status}>
                      {p.status}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <h3>{p.name}</h3>
                    <p>
                      {(p.category && CATEGORY_LABELS[p.category]) || "Uncategorized"} · {formatDate(p.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
