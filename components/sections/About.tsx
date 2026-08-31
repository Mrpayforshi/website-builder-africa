interface AboutProps {
  headline?: string;
  body?: string;
  image?: string;
  credentials?: string[];
  /** Image omitted entirely in lite mode. */
  liteMode?: boolean;
}

export function About({ headline, body, image, credentials = [], liteMode = false }: AboutProps) {
  return (
    <section className="about">
      {image && !liteMode && <img src={image} alt={headline ?? "About us"} loading="lazy" decoding="async" />}
      {headline && <h2>{headline}</h2>}
      {body && <p>{body}</p>}
      {credentials.length > 0 && (
        <ul className="about__credentials">
          {credentials.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
