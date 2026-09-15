import styles from "./NyoniAccountingTemplate.module.css";

export interface HeroSectionContent {
  brandName: string;
  navLinks: { label: string; href: string }[];
  signInText: string;
  badgeText: string;
  headline: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  backgroundImage: string;
}

export default function HeroSection({ content }: { content: HeroSectionContent }) {
  return (
    <header
      className={styles.hero}
      style={{ ["--hero-bg-image" as string]: `url("${content.backgroundImage}")` }}
    >
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <span className={styles.dot}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <path d="M3 12h4l2.5-6 4 12 2.5-6h5" />
            </svg>
          </span>
          {content.brandName}
        </div>
        <div className={styles.navLinks}>
          {content.navLinks.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
          <button className={styles.btnSignin}>{content.signInText}</button>
        </div>
      </nav>

      <div className={styles.heroInner}>
        <span className={styles.pill}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l8 3v6c0 5-3.5 9.4-8 11-4.5-1.6-8-6-8-11V5l8-3z" />
          </svg>
          {content.badgeText}
        </span>
        <h1 className={styles.heroTitle}>{content.headline}</h1>
        <p className={styles.heroSubtitle}>{content.subheadline}</p>
        <div className={styles.heroCta}>
          <button className={styles.btnPrimary}>{content.primaryCtaText}</button>
          <button className={styles.btnGhost}>{content.secondaryCtaText}</button>
        </div>
      </div>
    </header>
  );
}
