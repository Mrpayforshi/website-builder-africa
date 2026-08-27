import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Google Business/Maps sync — IMPLEMENTATION NOTE: the spec describes this
 * as a Google Business Profile sync, but the Business Profile APIs require
 * the business to have a verified GBP listing AND grant OAuth consent, and
 * Google gates production access to those APIs behind a manual per-project
 * approval that isn't guaranteed to be granted. This uses the Places API
 * (New) instead, keyed off a Place ID the owner finds themselves via
 * Google's Place ID Finder tool. Same one-way pull-only outcome the spec
 * asks for (address/hours/pin), reachable with a standard Places API key.
 * If GBP OAuth access is later approved, this can be swapped without
 * changing the feature_toggles.config shape below.
 */

const PLACES_FIELD_MASK =
  "displayName,formattedAddress,location,regularOpeningHours,nationalPhoneNumber,googleMapsUri";

export interface GoogleBusinessSyncData {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  location: { lat: number; lng: number } | null;
  openingHoursDescriptions: string[];
  phoneNumber: string | null;
  googleMapsUri: string | null;
  syncedAt: string;
}

export async function fetchGooglePlaceDetails(placeId: string): Promise<GoogleBusinessSyncData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY is not set.");

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACES_FIELD_MASK,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`google_places_api_error_${res.status}: ${body}`);
  }

  const data = await res.json();
  return {
    placeId,
    displayName: data.displayName?.text ?? "",
    formattedAddress: data.formattedAddress ?? "",
    location: data.location ? { lat: data.location.latitude, lng: data.location.longitude } : null,
    openingHoursDescriptions: data.regularOpeningHours?.weekdayDescriptions ?? [],
    phoneNumber: data.nationalPhoneNumber ?? null,
    googleMapsUri: data.googleMapsUri ?? null,
    syncedAt: new Date().toISOString(),
  };
}

/**
 * Staff-triggered sync. Authorization happens in the API route via RLS
 * before this is called — this function itself uses the admin client only
 * to do the upsert atomically alongside the external API call.
 */
export async function syncGoogleBusinessProfile(
  businessId: string,
  placeId: string
): Promise<GoogleBusinessSyncData> {
  const data = await fetchGooglePlaceDetails(placeId);
  const admin = createAdminClient();

  const { error } = await admin.from("feature_toggles").upsert(
    {
      business_id: businessId,
      feature_key: "maps_sync",
      enabled: true,
      config: { place_id: placeId, cached: data },
    },
    { onConflict: "business_id,feature_key" }
  );
  if (error) throw new Error(error.message);

  return data;
}

export async function getCachedMapsSync(
  businessId: string
): Promise<{ placeId: string; data: GoogleBusinessSyncData } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feature_toggles")
    .select("enabled, config")
    .eq("business_id", businessId)
    .eq("feature_key", "maps_sync")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.enabled || !data.config?.cached) return null;

  return { placeId: data.config.place_id, data: data.config.cached as GoogleBusinessSyncData };
}

/** Re-syncs every business with maps_sync enabled — meant for a scheduled route, not request-time. */
export async function refreshAllMapsSyncs(): Promise<{ refreshed: number; failed: number }> {
  const admin = createAdminClient();
  const { data: toggles, error } = await admin
    .from("feature_toggles")
    .select("business_id, config")
    .eq("feature_key", "maps_sync")
    .eq("enabled", true);

  if (error) throw new Error(error.message);

  let refreshed = 0;
  let failed = 0;

  for (const toggle of toggles ?? []) {
    const placeId = (toggle.config as any)?.place_id;
    if (!placeId) continue;
    try {
      await syncGoogleBusinessProfile(toggle.business_id, placeId);
      refreshed += 1;
    } catch {
      failed += 1;
    }
  }

  return { refreshed, failed };
}
