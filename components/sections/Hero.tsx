interface HeroProps {
  headline?: string;
  subheadline?: string;
  image?: string;
}

export function Hero({ headline, subheadline, image }: HeroProps) {
  return (
    <section className="hero">
      {image && <img src={image} alt={headline ?? "Hero image"} />}
      {headline && <h1>{headline}</h1>}
      {subheadline && <p>{subheadline}</p>}
    </section>
  );
}
