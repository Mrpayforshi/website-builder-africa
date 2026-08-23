import { createClient } from "@/lib/supabase/server";
import type { TemplateStructure } from "@/lib/templates/section-schemas";

export interface Template {
  id: string;
  category: string;
  name: string;
  structure: TemplateStructure;
}

export async function getTemplateById(templateId: string): Promise<Template | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates")
    .select("id, category, name, structure")
    .eq("id", templateId)
    .single();

  if (error || !data) return null;
  return data as Template;
}

export async function listTemplatesByCategory(category: string): Promise<Template[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates")
    .select("id, category, name, structure")
    .eq("category", category);

  if (error || !data) return [];
  return data as Template[];
}

export async function listAllTemplates(): Promise<Template[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates")
    .select("id, category, name, structure");

  if (error || !data) return [];
  return data as Template[];
}
