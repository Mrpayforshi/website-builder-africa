import { getCachedMapsSync } from "@/lib/market-fit/google-places";

/** Standalone, same pattern as LoadSheddingBanner — fetches by businessId, renders nothing if not enabled/synced. */
export async function GoogleMapEmbed({ businessId }: { businessId: string }) {
  const synced = await getCachedMapsSync(businessId);
  if (!synced) return null;

  const { data } = synced;

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem" }}>
      <strong>{data.displayName}</strong>
      <p style={{ margin: "0.25rem 0" }}>{data.formattedAddress}</p>
      {data.phoneNumber && <p style={{ margin: "0.25rem 0" }}>{data.phoneNumber}</p>}
      {data.openingHoursDescriptions.length > 0 && (
        <ul style={{ margin: "0.5rem 0", paddingLeft: "1.2rem", fontSize: "0.9rem" }}>
          {data.openingHoursDescriptions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {data.googleMapsUri && (
        <a href={data.googleMapsUri} target="_blank" rel="noopener noreferrer">
          View on Google Maps
        </a>
      )}
    </div>
  );
}
