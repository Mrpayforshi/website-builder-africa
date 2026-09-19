"use client";

import { useState } from "react";
import { LITE_MODE_GALLERY_IMAGE_LIMIT } from "@/lib/market-fit/bandwidth";
import { buildWhatsappOrderLink } from "@/lib/commerce/whatsapp-links";
import styles from "./TerracottaTableTemplate.module.css";

interface HeroContent {
  headline?: string;
  subheadline?: string;
  image?: string;
}

interface GalleryImage {
  url: string;
  caption?: string;
}

interface MenuItem {
  name: string;
  price?: string | number;
  description?: string;
}

interface MenuCategory {
  name: string;
  items?: MenuItem[];
}

interface ContactHours {
  [day: string]: { open: string; close: string };
}

interface ContactContent {
  address?: string;
  phone?: string;
  email?: string;
  hours?: ContactHours;
}

interface TerracottaTableTemplateProps {
  contentBlocks: Record<string, unknown>;
  businessName: string;
  whatsappNumber?: string | null;
  liteMode?: boolean;
}

const DAY_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export default function TerracottaTableTemplate({
  contentBlocks,
  businessName,
  whatsappNumber = null,
  liteMode = false,
}: TerracottaTableTemplateProps) {
  const hero = (contentBlocks.hero ?? {}) as HeroContent;
  const gallery = (contentBlocks.gallery ?? {}) as { images?: GalleryImage[] };
  const menu = (contentBlocks.menu ?? {}) as { categories?: MenuCategory[] };
  const contact = (contentBlocks.contact ?? {}) as ContactContent;

  const images = gallery.images ?? [];
  const visibleImages = liteMode ? images.slice(0, LITE_MODE_GALLERY_IMAGE_LIMIT) : images;
  const hiddenCount = images.length - visibleImages.length;
  const categories = menu.categories ?? [];

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Same asymmetric-grid rhythm as the sourced reference design, cycled by
  // index regardless of how many photos a business actually has.
  const SPAN_CLASSES = [styles.spanTall, styles.spanWide, styles.spanSquare, styles.spanMid];

  return (
    <div className={styles.wrapper}>
      {/* NAV */}
      <nav className={styles.nav}>
        <a href="#top" className={styles.brand}>
          {businessName}
        </a>
        <div className={styles.navLinks}>
          <a href="#top">Home</a>
          {images.length > 0 && <a href="#gallery">Gallery</a>}
          {categories.length > 0 && <a href="#menu">Menu</a>}
          <a href="#contact">Contact</a>
        </div>
      </nav>

      {/* HERO */}
      <header
        id="top"
        className={styles.hero}
        style={!liteMode && hero.image ? ({ ["--hero-image" as string]: `url("${hero.image}")` }) : undefined}
      >
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Table &amp; Kitchen</div>
          {hero.headline && <h1 className={styles.heroTitle}>{hero.headline}</h1>}
          {hero.subheadline && <p className={styles.heroSubtitle}>{hero.subheadline}</p>}
        </div>
      </header>

      {/* GALLERY */}
      {visibleImages.length > 0 && (
        <section id="gallery" className={styles.section}>
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrowSmall}>From the Kitchen</span>
                <h2 className={styles.sectionTitle}>Recent plates</h2>
              </div>
            </div>
            <div className={styles.galleryGrid}>
              {visibleImages.map((image, i) => (
                <figure
                  key={image.url}
                  className={`${styles.galleryItem} ${SPAN_CLASSES[i % SPAN_CLASSES.length]}`}
                  onClick={() => setLightboxSrc(image.url)}
                >
                  <img src={image.url} alt={image.caption ?? ""} loading="lazy" decoding="async" />
                  {image.caption && (
                    <figcaption className={styles.galleryMeta}>
                      <span>{image.caption}</span>
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
            {hiddenCount > 0 && (
              <p className={styles.liteNotice}>
                {hiddenCount} more photo{hiddenCount === 1 ? "" : "s"} hidden in lite mode.
              </p>
            )}
          </div>
        </section>
      )}

      {/* MENU */}
      {categories.length > 0 && (
        <section id="menu" className={styles.sectionAlt}>
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrowSmall}>On the Table</span>
                <h2 className={styles.sectionTitle}>Menu</h2>
              </div>
            </div>
            <div className={styles.menuGrid}>
              {categories.map((category) => (
                <div key={category.name} className={styles.menuCategory}>
                  <h3>{category.name}</h3>
                  <div className={styles.menuItems}>
                    {(category.items ?? []).map((item) => (
                      <div key={item.name} className={styles.menuItem}>
                        <div className={styles.menuItemRow}>
                          <span className={styles.menuItemName}>{item.name}</span>
                          {item.price && <span className={styles.menuItemPrice}>{item.price}</span>}
                        </div>
                        {item.description && <p className={styles.menuItemDesc}>{item.description}</p>}
                        {whatsappNumber && (
                          <a
                            className={styles.whatsappCta}
                            href={buildWhatsappOrderLink(whatsappNumber, item.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Order via WhatsApp
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" className={styles.contact}>
        <span className={styles.eyebrowSmall}>Visit or Order</span>
        <h2 className={styles.contactTitle}>Good food deserves a good table.</h2>
        <div className={styles.contactDetails}>
          {contact.address && <p className={styles.contactAddress}>{contact.address}</p>}
          {contact.phone && (
            <p className={styles.contactPhone}>
              <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>
            </p>
          )}
          {contact.email && (
            <p className={styles.contactEmail}>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
          )}
          {contact.hours && (
            <ul className={styles.contactHours}>
              {Object.entries(contact.hours).map(([day, times]) => (
                <li key={day}>
                  <span>{DAY_LABELS[day] ?? day}</span>
                  <span>
                    {times.open} – {times.close}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>{businessName}</div>
        <div>© {new Date().getFullYear()} · Built with Rivo</div>
      </footer>

      {/* LIGHTBOX */}
      {lightboxSrc && !liteMode && (
        <div
          className={styles.lightbox}
          onClick={() => setLightboxSrc(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className={styles.lightboxClose}
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxSrc(null);
            }}
          >
            ×
          </button>
          <img src={lightboxSrc} alt="" />
        </div>
      )}
    </div>
  );
}
