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
}

export function TemplateRenderer({ structure, contentBlocks }: TemplateRendererProps) {
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
        return <Component key={section.id} {...content} />;
      })}
    </>
  );
}
