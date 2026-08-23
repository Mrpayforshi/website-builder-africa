interface AboutProps {
  headline?: string;
  body?: string;
  image?: string;
  credentials?: string[];
}

export function About({ headline, body, image, credentials = [] }: AboutProps) {
  return (
    <section className="about">
      {image && <img src={image} alt={headline ?? "About us"} />}
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
