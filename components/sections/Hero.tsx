interface HeroProps {
  headline?: string;
  subheadline?: string;
  image?: string;
  /** In lite mode, the hero image (usually the single largest asset on the page) is omitted, not just hidden. */
  liteMode?: boolean;
}

export function Hero({ headline, subheadline, image, liteMode = false }: HeroProps) {
  return (
    <section className="hero">
      {image && !liteMode && <img src={image} alt={headline ?? "Hero image"} loading="eager" decoding="async" />}
      {headline && <h1>{headline}</h1>}
      {subheadline && <p>{subheadline}</p>}
    </section>
  );
}
