import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS entirely. Server-only, never import
 * this in a Client Component or anything that ships to the browser.
 *
 * Past incident on TauraNesu: the service role key was accidentally set as
 * NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, which shipped it to the browser
 * and caused silent 401s. Guard against that class of bug here:
 * SUPABASE_SERVICE_ROLE_KEY must never carry a NEXT_PUBLIC_ prefix, and this
 * file must never be imported from a "use client" module.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "createAdminClient() must never run in the browser — service role key would leak."
    );
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
