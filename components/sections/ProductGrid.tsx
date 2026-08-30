import { buildWhatsappOrderLink } from "@/lib/commerce/whatsapp-links";

interface Product {
  name: string;
  price: number | string;
  image?: string;
  description?: string;
  sku?: string;
}

interface ProductGridProps {
  items?: Product[];
  whatsappNumber?: string | null;
}

export function ProductGrid({ items = [], whatsappNumber }: ProductGridProps) {
  if (items.length === 0) {
    return <section className="product-grid product-grid--empty">No products added yet.</section>;
  }

  return (
    <section className="product-grid">
      {items.map((item) => (
        <article key={item.sku ?? item.name} className="product-grid__item">
          {item.image && <img src={item.image} alt={item.name} />}
          <h3>{item.name}</h3>
          {item.description && <p>{item.description}</p>}
          <span className="price">{item.price}</span>
          {whatsappNumber && (
            
              className="whatsapp-cta"
              href={buildWhatsappOrderLink(whatsappNumber, item.name)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Order via WhatsApp
            </a>
          )}
        </article>
      ))}
    </section>
  );
}
