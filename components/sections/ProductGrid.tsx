import { buildWhatsappOrderLink } from "@/lib/commerce/whatsapp-links";
import { LITE_MODE_PRODUCT_IMAGE_LIMIT } from "@/lib/market-fit/bandwidth";

interface Product {
  name: string;
  price: string;
  image?: string;
  description?: string;
  sku?: string;
}

interface ProductGridProps {
  items?: Product[];
  whatsappNumber?: string | null;
  /** In lite mode, only the first LITE_MODE_PRODUCT_IMAGE_LIMIT products render an image at all. */
  liteMode?: boolean;
}

export function ProductGrid({ items = [], whatsappNumber, liteMode = false }: ProductGridProps) {
  if (items.length === 0) {
    return <section className="product-grid product-grid--empty">No products added yet.</section>;
  }

  return (
    <section className="product-grid">
      {items.map((item, index) => (
        <article key={item.sku ?? item.name} className="product-grid__item">
          {item.image && (!liteMode || index < LITE_MODE_PRODUCT_IMAGE_LIMIT) && (
            <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
          )}
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
