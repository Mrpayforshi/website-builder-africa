"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqProps {
  items?: FaqItem[];
}

export function Faq({ items = [] }: FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) {
    return <section className="faq faq--empty">FAQ coming soon.</section>;
  }

  return (
    <section className="faq">
      <div className="faq__list">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div className={`faq__item${isOpen ? " faq__item--open" : ""}`} key={item.question}>
              <button
                type="button"
                className="faq__question"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                {item.question}
                <span className="faq__toggle" aria-hidden="true">+</span>
              </button>
              <div className="faq__answer">{item.answer}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
