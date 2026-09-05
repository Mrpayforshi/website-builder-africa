import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkBusinessMembership, getSiteConfig } from "@/lib/ai/config-store";
import { IntakeChat } from "./IntakeChat";

export default async function IntakePage({ params }: { params: { businessId: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const membership = await checkBusinessMembership(user.id, params.businessId);
  if (!membership) {
    notFound();
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("id", params.businessId)
    .single();

  if (!business) {
    notFound();
  }

  const config = await getSiteConfig(params.businessId);
  if (config?.template_id) {
    // A template's already assigned — chat's job here is done.
    redirect(`/dashboard/${params.businessId}`);
  }

  return <IntakeChat businessId={params.businessId} businessName={business.name} />;
}
