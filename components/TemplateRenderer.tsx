import { Hero } from "@/components/sections/Hero";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { Menu } from "@/components/sections/Menu";
import { ServicesList } from "@/components/sections/ServicesList";
import { About } from "@/components/sections/About";
import { Programs } from "@/components/sections/Programs";
import { Gallery } from "@/components/sections/Gallery";
import { Contact } from "@/components/sections/Contact";
import type { TemplateStructure, SectionType } from "@/lib/templates/section-schemas";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_COMPONENTS: Record<SectionType, React.ComponentType<any>> = {
  hero: Hero,
  product_grid: ProductGrid,
  menu: Menu,
  services_list: ServicesList,
  about: About,
  programs: Programs,
  gallery: Gallery,
  contact: Contact,
};

interface TemplateRendererProps {
  structure: TemplateStructure;
  contentBlocks: Record<string, unknown>;
  /**
   * WhatsApp order/enquiry number, already resolved from feature_toggles by
   * the page (see getWhatsappCtaConfig) — null when the toggle is off or no
   * number is set. Passed as a sibling prop, not folded into contentBlocks,
   * because whatsapp isn't a valid field on any section per
   * SECTION_FIELD_SCHEMAS. Only product_grid, menu, and services_list read
   * it; other sections ignore the extra prop harmlessly.
   */
  whatsappNumber?: string | null;
  /**
   * When true, sections skip rendering non-essential images/embeds
   * entirely (see lib/market-fit/bandwidth.ts) instead of the CSS-only
   * hide used elsewhere. Sections that don't render media ignore this
   * prop harmlessly, same as whatsappNumber.
   */
  liteMode?: boolean;
}

export function TemplateRenderer({
  structure,
  contentBlocks,
  whatsappNumber = null,
  liteMode = false,
}: TemplateRendererProps) {
  return (
    <>
      {structure.sections.map((section) => {
        const Component = SECTION_COMPONENTS[section.type];

        if (!Component) {
          if (process.env.NODE_ENV === "development") {
            throw new Error(`No component registered for section type "${section.type}" (section id "${section.id}")`);
          }
          return (
            <section key={section.id} data-missing-section={section.type}>
              [Section &quot;{section.id}&quot; could not be rendered]
            </section>
          );
        }

        const content = (contentBlocks?.[section.id] as Record<string, unknown>) ?? {};
        return <Component key={section.id} {...content} whatsappNumber={whatsappNumber} liteMode={liteMode} />;
      })}
    </>
  );
}
