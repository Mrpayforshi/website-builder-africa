import Link from "next/link";
import { SiteNav } from "./SiteNav";
import styles from "./marketing.module.css";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <SiteNav />
      <main className={styles.wrap}>{children}</main>
      <footer className={`${styles.wrap} ${styles.footer}`}>
        <div className={styles.footerInner}>
          <span>© {new Date().getFullYear()} Rivo. All rights reserved.</span>
          <span>
            <Link href="/templates">Templates</Link>
            <Link href="/founders">Founders</Link>
            <Link href="/for-work">For work</Link>
            <Link href="/login">Log in</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
