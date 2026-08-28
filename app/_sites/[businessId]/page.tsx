import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteConfig } from "@/lib/ai/config-store";
import { getTemplateById } from "@/lib/templates/template-store";
import { TemplateRenderer } from "@/components/TemplateRenderer";
import "@/styles/site.css";

interface SitePageProps {
  params: { businessId: string };
}

async function getPublishedBusiness(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, status, category")
    .eq("id", businessId)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const business = await getPublishedBusiness(params.businessId);
  return { title: business?.name ?? "Website Builder Africa" };
}

export default async function SitePage({ params }: SitePageProps) {
  const business = await getPublishedBusiness(params.businessId);
  if (!business) notFound();

  const config = await getSiteConfig(params.businessId);
  if (!config || config.status !== "published" || !config.template_id) notFound();

  const template = await getTemplateById(config.template_id);
  if (!template) notFound();

  const colorScheme = (config.color_scheme ?? {}) as {
    primary?: string;
    secondary?: string;
    accent?: string;
  };

  return (
    <div
      className="site"
      data-category={business.category}
      style={
        {
          "--color-primary": colorScheme.primary ?? "#111827",
          "--color-secondary": colorScheme.secondary ?? "#4b5563",
          "--color-accent": colorScheme.accent ?? "#2563eb",
        } as React.CSSProperties
      }
    >
      <TemplateRenderer structure={template.structure} contentBlocks={config.content_blocks} />
    </div>
  );
}
