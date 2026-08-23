import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { checkBusinessMembership, getSiteConfig } from "@/lib/ai/config-store";
import type { TemplateStructure } from "@/lib/templates/section-schemas";

export default async function DashboardPage({ params }: { params: { businessId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const membership = await checkBusinessMembership(user.id, params.businessId);
  if (!membership) redirect("/dashboard");

  const config = await getSiteConfig(params.businessId);
  if (!config) {
    return <p>No site config found for this business yet.</p>;
  }

  const { data: template } = await supabase
    .from("templates")
    .select("structure")
    .eq("id", config.template_id)
    .single();

  const structure = template?.structure as TemplateStructure | undefined;

  return (
    <div className="dashboard">
      <h1>Site sections</h1>
      <p>
        Status: {config.status} · Version: {config.version}
      </p>
      <ul className="dashboard__section-list">
        {structure?.sections.map((section) => (
          <li key={section.id}>
            <Link href={`/dashboard/${params.businessId}/sections/${section.id}`}>
              {section.type} — {section.id}
              {section.required && " (required)"}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
