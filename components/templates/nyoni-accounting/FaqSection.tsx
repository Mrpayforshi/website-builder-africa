"use client";

import { useState } from "react";
import styles from "./NyoniAccountingTemplate.module.css";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionContent {
  sectionId: string;
  sectionTitle: string;
  items: FaqItem[];
  defaultOpenIndex?: number;
}

export default function FaqSection({ content }: { content: FaqSectionContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(content.defaultOpenIndex ?? 0);

  return (
    <section id={content.sectionId} className={styles.sectionTight}>
      <div className={styles.wrap}>
        <h2 className={styles.sectionTitle}>{content.sectionTitle}</h2>
        <div className={styles.faqList}>
          {content.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div className={`${styles.faq} ${isOpen ? styles.faqOpen : ""}`} key={i}>
                <button
                  className={styles.faqButton}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  {item.question}
                  <span className={styles.toggle}>+</span>
                </button>
                <div className={styles.answer}>{item.answer}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
