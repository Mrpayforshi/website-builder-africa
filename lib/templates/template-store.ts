// Batched loader for the gallery card thumbnails: every gallery template with
// its structure + content blocks in two queries (instead of two per template).
export async function getGalleryPreviewDetails(): Promise<GalleryTemplateDetail[]> {
  const supabase = await createClient();

  const [templatesRes, blocksRes] = await Promise.all([
    supabase
      .from("gallery_templates")
      .select("id, category, category_label, name, description, features, structure"),
    supabase.from("gallery_content_blocks").select("template_id, section_id, content"),
  ]);

  if (templatesRes.error || !templatesRes.data) return [];

  const blocksByTemplate = new Map<string, Record<string, unknown>>();
  for (const block of blocksRes.data ?? []) {
    const existing = blocksByTemplate.get(block.template_id) ?? {};
    existing[block.section_id] = block.content;
    blocksByTemplate.set(block.template_id, existing);
  }

  return templatesRes.data.map((row) => ({
    id: row.id,
    category: row.category,
    categoryLabel: row.category_label,
    name: row.name,
    description: row.description,
    features: row.features ?? [],
    structure: row.structure as TemplateStructure,
    contentBlocks: blocksByTemplate.get(row.id) ?? {},
  }));
}
