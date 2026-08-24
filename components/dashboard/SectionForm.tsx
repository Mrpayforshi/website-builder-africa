"use client";

import type { SectionType } from "@/lib/templates/section-schemas";
import type { SectionFormProps } from "@/components/dashboard/forms/types";
import { HeroForm } from "@/components/dashboard/forms/HeroForm";
import { ProductGridForm } from "@/components/dashboard/forms/ProductGridForm";
import { MenuForm } from "@/components/dashboard/forms/MenuForm";
import { ServicesListForm } from "@/components/dashboard/forms/ServicesListForm";
import { AboutForm } from "@/components/dashboard/forms/AboutForm";
import { ProgramsForm } from "@/components/dashboard/forms/ProgramsForm";
import { GalleryForm } from "@/components/dashboard/forms/GalleryForm";
import { ContactForm } from "@/components/dashboard/forms/ContactForm";

// Dispatcher — same pattern as TemplateRenderer's SECTION_COMPONENTS map.
const SECTION_FORM_COMPONENTS: Record<SectionType, React.ComponentType<SectionFormProps>> = {
  hero: HeroForm,
  product_grid: ProductGridForm,
  menu: MenuForm,
  services_list: ServicesListForm,
  about: AboutForm,
  programs: ProgramsForm,
  gallery: GalleryForm,
  contact: ContactForm,
};

export function SectionForm(props: SectionFormProps) {
  const Component = SECTION_FORM_COMPONENTS[props.sectionType];

  if (!Component) {
    return (
      <p className="section-form section-form--unsupported">
        No editor yet for section type &quot;{props.sectionType}&quot;.
      </p>
    );
  }

  return <Component {...props} />;
}
