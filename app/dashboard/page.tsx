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

interface ProjectRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  category: string | null;
  created_at: string;
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

  const displayName =
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "there";

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <a className={styles.logo} href="/">
          <span className={styles.logoMark}>R</span>
          Rivo
        </a>
        <nav className={styles.nav}>
          <span className={`${styles.navItem} ${styles.navItemActive}`}>Projects</span>
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.userEmail}>{user.email}</span>
          <SignOutButton />
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Good to see you, {displayName}</h1>
          <p>What would you like to build today?</p>
        </header>

        <NewProjectForm />

        <section className={styles.projects}>
          <h2>Your projects</h2>
          {projects.length === 0 ? (
            <p className={styles.empty}>No projects yet — start your first one above.</p>
          ) : (
            <div className={styles.grid}>
              {projects.map((p) => (
                <a key={p.id} href={`/dashboard/${p.id}`} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.cardStatus} data-status={p.status}>
                      {p.status}
                    </span>
                  </div>
                  <h3>{p.name}</h3>
                  <p>{(p.category && CATEGORY_LABELS[p.category]) || "Uncategorized"}</p>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
