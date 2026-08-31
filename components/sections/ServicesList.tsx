import { buildWhatsappEnquiryLink } from "@/lib/commerce/whatsapp-links";

interface Service {
  name: string;
  description?: string;
  price?: number | string;
}

interface ServicesListProps {
  items?: Service[];
  whatsappNumber?: string | null;
}

export function ServicesList({ items = [], whatsappNumber }: ServicesListProps) {
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
          {whatsappNumber && (
            <a
              className="whatsapp-cta"
              href={buildWhatsappEnquiryLink(whatsappNumber, service.name)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Enquire via WhatsApp
            </a>
          )}
        </article>
      ))}
    </section>
  );
}
