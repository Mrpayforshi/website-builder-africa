import { redirect } from "next/navigation";

// Only reached on a hard refresh / direct link while a preview is open
// (normal clicks are intercepted by @modal). Send them back to the gallery.
export default function DashboardTemplateDirect() {
  redirect("/dashboard/templates");
}
