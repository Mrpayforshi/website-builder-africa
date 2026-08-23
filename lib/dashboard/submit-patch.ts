import { createClient } from "@/lib/supabase/client";

export interface SubmitSectionPatchInput {
  businessId: string;
  sectionId: string;
  expectedVersion: number;
  content: Record<string, unknown>;
}

export interface SubmitSectionPatchResult {
  ok: boolean;
  newVersion?: number;
  conflict?: boolean;
  error?: string;
}

/**
 * Posts one section's content to app/api/site-config/[businessId]/route.ts,
 * which wraps apply_site_config_patch — same version-conflict semantics the
 * AI chat layer uses. On a 409, refetches the live version from Supabase and
 * retries once, mirroring config-store.ts's applyPatchWithRetry server-side.
 * A second conflict is surfaced to the caller rather than retried again.
 */
export async function submitSectionPatch(
  input: SubmitSectionPatchInput
): Promise<SubmitSectionPatchResult> {
  const attempt = async (expectedVersion: number) => {
    const res = await fetch(`/api/site-config/${input.businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expectedVersion,
        contentBlocksPatch: { [input.sectionId]: input.content },
      }),
    });
    const body = await res.json();
    return { res, body };
  };

  let { res, body } = await attempt(input.expectedVersion);

  if (res.status === 409 && body.conflict) {
    const supabase = createClient();
    const { data: latest } = await supabase
      .from("site_configs")
      .select("version")
      .eq("business_id", input.businessId)
      .single();

    if (!latest) {
      return { ok: false, error: "Could not reload site config after conflict" };
    }

    ({ res, body } = await attempt(latest.version));
  }

  if (res.status === 409) {
    return {
      ok: false,
      conflict: true,
      error: "This section was edited elsewhere. Reload the page and try again.",
    };
  }

  if (!res.ok) {
    return { ok: false, error: body.error ?? `Request failed (${res.status})` };
  }

  return { ok: true, newVersion: body.newVersion };
}
