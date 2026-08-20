import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // Sanity check: reads a published business through RLS's public policy.
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("name, slug, status")
    .eq("status", "published");

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Website Builder Africa — scaffold</h1>
      <p>Stage 3 placeholder. Tenant resolution lands in Stage 4.</p>
      {error && <p style={{ color: "red" }}>Supabase error: {error.message}</p>}
      {businesses && (
        <ul>
          {businesses.map((b) => (
            <li key={b.slug}>
              {b.name} — /{b.slug}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
