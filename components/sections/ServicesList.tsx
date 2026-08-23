interface Service {
  name: string;
  description?: string;
  price?: number | string;
}

interface ServicesListProps {
  items?: Service[];
}

export function ServicesList({ items = [] }: ServicesListProps) {
  if (items.length === 0) {
    return <section className="services-list services-list--empty">Services coming soon.</section>;
  }

  return (
    <section className="services-list">
      {items.map((service) => (
        <article key={service.name} className="services-list__item">
          <h3>{service.name}</h3>
          {service.description && <p>{service.description}</p>}
          {service.price && <span className="price">{service.price}</span>}
        </article>
      ))}
    </section>
  );
}
