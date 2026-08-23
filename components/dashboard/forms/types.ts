import type { SectionType } from "@/lib/templates/section-schemas";

export interface SectionFormProps {
  businessId: string;
  sectionId: string;
  sectionType: SectionType;
  /** Fields this section instance actually uses, per templates.structure —
   *  a subset of SECTION_FIELD_SCHEMAS[sectionType]. Forms only render
   *  inputs for fields in this list, not the full type-level schema. */
  allowedFields: string[];
  initialContent: Record<string, unknown>;
  expectedVersion: number;
}
