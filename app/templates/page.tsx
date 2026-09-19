import type { ReactNode } from "react";
import { getGalleryPreviewDetails } from "@/lib/templates/template-store";
import styles from "./templates.module.css";
import { TemplatesGallery } from "./TemplatesGallery";
import { TemplateThumb } from "./TemplateThumb";
import { getGalleryTemplateCards, CATEGORIES } from "./data";

export default async function TemplatesPage() {
  const [templates, previews] = await Promise.all([
    getGalleryTemplateCards(),
    getGalleryPreviewDetails(),
  ]);

  // Server-rendered thumbnails, handed to the client gallery by template id.
  // Templates without seeded content have no entry and keep the gradient.
  const thumbs: Record<string, ReactNode> = Object.fromEntries(
    previews.map((t) => [t.id, <TemplateThumb key={t.id} template={t} />])
  );

  return (
    <div className={styles.scene}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <header className={styles.nav}>
        <div className={styles.navInner}>
          <a className={styles.logo} href="/">
            <span className={styles.logoMark}>R</span>
            Rivo
          </a>
          <nav className={styles.navLinks}>
            <a href="/#product">Product</a>
            <a href="/templates" className={styles.active}>Templates</a>
            <a href="/#pricing">Pricing</a>
            <a href="/#resources">Resources</a>
            <a href="/#payments">WhatsApp &amp; EcoCash</a>
          </nav>
          <div className={styles.navRight}>
            <a className={styles.navSignin} href="/login">Log in</a>
            <a className={styles.btnWhite} href="/signup">Get started</a>
          </div>
        </div>
      </header>

      <div className={styles.wrap}>
        <header className={styles.pageHead}>
          <span className={styles.eyebrowTag}>Template library</span>
          <h1>Start from a site that already knows your business</h1>
          <p>
            Every template ships with WhatsApp ordering, EcoCash checkout, and layby
            wired in — pick the closest match, then describe what&apos;s different.
          </p>
        </header>

        <TemplatesGallery templates={templates} categories={CATEGORIES} thumbs={thumbs} />
      </div>
    </div>
  );
}
