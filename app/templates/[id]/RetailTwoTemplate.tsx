"use client";

import styles from "./retail2.module.css";

interface ProductItem {
  sku?: string;
  name: string;
  price: number | string;
  image?: string;
  description?: string;
}

interface RetailTwoTemplateProps {
  /** Brand name shown in the nav logo and footer — comes from the
   * template's own `name` (gallery_templates.name / templates.name), not
   * a section field, same as how other templates get their brand name. */
  brandName: string;
  hero?: { headline?: string; subheadline?: string; image?: string };
  products?: { items?: ProductItem[] };
  about?: { headline?: string; body?: string; credentials?: string[] };
  contact?: { address?: string; phone?: string; email?: string };
}

/**
 * Bespoke renderer for retail-2 (Harare Fashion House), matching the
 * uploaded design exactly while staying driven by the same content-block
 * shape as every other template (hero/product_grid/about/contact — see
 * section-schemas.ts). Business content (hero copy, products, about copy,
 * contact info) is fully editable through the normal content pipeline.
 * The nav links and the newsletter box copy are NOT tied to content
 * fields — they're static page chrome, same as e.g. a fixed "Use this
 * template" button elsewhere, not business data.
 */
export function RetailTwoTemplate({ brandName, hero, products, about, contact }: RetailTwoTemplateProps) {
  const items = products?.items ?? [];

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <a className={styles.logo} href="#">{brandName}</a>
        <ul className={styles.navLinks}>
          <li><a href="#shop">Shop</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className={styles.navIcons}>
          <a href="#" aria-label="Instagram">◌</a>
          <a href="#" aria-label="Cart">▢</a>
        </div>
      </nav>

      <header
        className={styles.hero}
        style={
          hero?.image
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(20,15,10,.55) 0%, rgba(20,15,10,.2) 60%, rgba(20,15,10,.05) 100%), url(${hero.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {hero?.headline && <h1>{hero.headline}</h1>}
        {hero?.subheadline && <p>{hero.subheadline}</p>}
      </header>

      <section className={styles.products} id="shop">
        <div className={styles.productsInner}>
          <h2>Handcrafted knitwear
            <br />for every season.</h2>
          <div className={styles.grid}>
            {items.map((item) => (
              <div className={styles.card} key={item.sku ?? item.name}>
                <div className={styles.cardImg}>
                  {item.image && <img src={item.image} alt={item.name} loading="lazy" decoding="async" />}
                </div>
                <p>{item.name}</p>
                <p className={styles.price}>{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {about && (about.headline || about.body) && (
        <section className={styles.about} id="about">
          {about.headline && <h2>{about.headline}</h2>}
          {about.body && <p>{about.body}</p>}
          {about.credentials && about.credentials.length > 0 && (
            <ul className={styles.credentials}>
              {about.credentials.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {contact && (contact.address || contact.phone || contact.email) && (
        <div className={styles.contactStrip}>
          {contact.address && (
            <div><strong>Visit</strong>{contact.address}</div>
          )}
          {contact.phone && (
            <div><strong>Call</strong>{contact.phone}</div>
          )}
          {contact.email && (
            <div><strong>Email</strong>{contact.email}</div>
          )}
        </div>
      )}

      <section className={styles.newsletter}>
        <h2>Monthly Dispatch</h2>
        <p>Sign up to receive news and updates.</p>
        <form
          className={styles.signup}
          onSubmit={(e) => {
            e.preventDefault();
            e.currentTarget.reset();
            alert("Thanks for signing up!");
          }}
        >
          <input type="email" placeholder="Email Address" required />
          <button type="submit">Sign Up</button>
        </form>
      </section>

      <footer className={styles.siteFooter} id="contact">
        <span>© 2026 {brandName}</span>
        <span>Made with Rivo</span>
      </footer>
    </div>
  );
}
