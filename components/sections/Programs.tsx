interface Program {
  name: string;
  description?: string;
  image?: string;
}

interface ProgramsProps {
  items?: Program[];
}

export function Programs({ items = [] }: ProgramsProps) {
  if (items.length === 0) {
    return <section className="programs programs--empty">Programs coming soon.</section>;
  }

  return (
    <section className="programs">
      {items.map((program) => (
        <article key={program.name} className="programs__item">
          {program.image && <img src={program.image} alt={program.name} />}
          <h3>{program.name}</h3>
          {program.description && <p>{program.description}</p>}
        </article>
      ))}
    </section>
  );
}
