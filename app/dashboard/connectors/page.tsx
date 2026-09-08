import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConnectorsBrowser, type ConnectorProject, type ConnectorToggleMap } from "./ConnectorsBrowser";
import styles from "../dashboard.module.css";
import { SignOutButton } from "../SignOutButton";
import Link from "next/link";

export default async function ConnectorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("business_users")
    .select("business:businesses(id, name)")
    .eq("user_id", user.id);

  const businesses = (memberships ?? [])
    .map((m) => m.business as unknown as { id: string; name: string } | null)
    .filter((b): b is { id: string; name: string } => Boolean(b));

  const businessIds = businesses.map((b) => b.id);

  const [{ data: configs }, { data: toggles }] =
    businessIds.length > 0
      ? await Promise.all([
          supabase.from("site_configs").select("business_id, version").in("business_id", businessIds),
          supabase
            .from("feature_toggles")
            .select("business_id, feature_key, enabled, config")
            .in("business_id", businessIds),
        ])
      : [{ data: [] }, { data: [] }];

  const versionByBusiness = new Map<string, number>();
  (configs ?? []).forEach((c) => versionByBusiness.set(c.business_id, c.version));

  const projects: ConnectorProject[] = businesses.map((b) => ({
    id: b.id,
    name: b.name,
    version: versionByBusiness.get(b.id) ?? 0,
  }));

  const toggleMap: ConnectorToggleMap = {};
  (toggles ?? []).forEach((t) => {
    toggleMap[t.business_id] ??= {};
    toggleMap[t.business_id][t.feature_key] = { enabled: t.enabled, config: t.config ?? {} };
  });

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
          <Link className={styles.navItem} href="/dashboard">
            Dashboard
          </Link>
          <Link className={styles.navItem} href="/templates">
            Templates
          </Link>
          <span className={`${styles.navItem} ${styles.navItemActive}`}>Connectors</span>
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.userEmail}>{user.email}</span>
          <SignOutButton />
        </div>
      </aside>

      <ConnectorsBrowser projects={projects} toggleMap={toggleMap} displayName={displayName} />
    </div>
  );
}
