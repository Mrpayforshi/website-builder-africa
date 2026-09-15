import styles from "./NyoniAccountingTemplate.module.css";

export interface FooterSectionContent {
  brandName: string;
  tagline: string;
  showBuiltWithRivo: boolean;
}

export default function FooterSection({ content }: { content: FooterSectionContent }) {
  return (
    <footer className={styles.footer}>
      <b>{content.brandName}</b> · {content.tagline}
      {content.showBuiltWithRivo && (
        <>
          {" "}
          · built with <b>Rivo</b>
        </>
      )}
    </footer>
  );
}
