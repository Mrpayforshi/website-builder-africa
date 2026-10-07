import type { Block } from "@/lib/resources/content";
import m from "./marketing.module.css";
import r from "./resources.module.css";

/** Page heading used at the top of every Resources index page. */
export function PageTop({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <section className={r.top}>
      {eyebrow && <p className={r.eyebrow}>{eyebrow}</p>}
      <h1 className={r.title}>{title}</h1>
      {sub && <p className={r.sub}>{sub}</p>}
    </section>
  );
}

/** Renders an article body from the plain-text blocks in lib/resources/content.ts. */
export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className={r.prose}>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h2":
            return <h2 key={i}>{b.text}</h2>;
          case "p":
            return <p key={i}>{b.text}</p>;
          case "ul":
            return (
              <ul key={i}>
                {b.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {b.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ol>
            );
          case "note":
            return (
              <div key={i} className={r.note}>
                {b.text}
              </div>
            );
        }
      })}
    </div>
  );
}

/** Dark call-to-action band shared by the Resources pages. */
export function Cta({ title, label, href }: { title: string; label: string; href: string }) {
  return (
    <section className={m.cta}>
      <h2>{title}</h2>
      <a className={`${m.btnLight} ${m.btnLg}`} href={href}>
        {label}
      </a>
    </section>
  );
}
