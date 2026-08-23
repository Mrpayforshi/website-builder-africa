"use client";

import type { SectionType } from "@/lib/templates/section-schemas";
import type { SectionFormProps } from "@/components/dashboard/forms/types";
import { HeroForm } from "@/components/dashboard/forms/HeroForm";

// Dispatcher — same pattern as TemplateRenderer's SECTION_COMPONENTS map.
// Partial because forms are added incrementally; unmapped types fall back
// to the "no editor yet" message below instead of crashing.
const SECTION_FORM_COMPONENTS: Partial<Record<SectionType, React.ComponentType<SectionFormProps>>> = {
  hero: HeroForm,
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
