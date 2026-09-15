import styles from "./NyoniAccountingTemplate.module.css";

export interface FeatureItem {
  iconPath: string;
  title: string;
  description: string;
}

export interface FeatureGridSectionContent {
  sectionId: string;
  sectionTitle: string;
  items: FeatureItem[];
}

export default function FeatureGridSection({ content }: { content: FeatureGridSectionContent }) {
  return (
    <section id={content.sectionId} className={styles.section}>
      <div className={styles.wrap}>
        <h2 className={styles.sectionTitle}>{content.sectionTitle}</h2>
        <div className={styles.grid4}>
          {content.items.map((item, i) => (
            <div className={styles.card} key={i}>
              <div className={styles.icon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.iconPath} />
                </svg>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
