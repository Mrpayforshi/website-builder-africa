import { getLoadSheddingConfig, resolveDisplayMessage } from "@/lib/market-fit/load-shedding";

const BANNER_STYLES: Record<string, string> = {
  normal: "background:#e6f4ea;color:#1e4620;",
  limited: "background:#fff4e5;color:#663c00;",
  closed: "background:#fdecea;color:#611a15;",
};

/**
 * Fully standalone — fetches its own data by businessId, no props threaded
 * from a template structure. Drop it anywhere in a site's layout; per the
 * spec's definition of done, it works without touching other workstreams'
 * code either way.
 */
export async function LoadSheddingBanner({ businessId }: { businessId: string }) {
  const result = await getLoadSheddingConfig(businessId);
  if (!result?.enabled) return null;

  const style = BANNER_STYLES[result.config.status] ?? BANNER_STYLES.normal;

  return (
    <div style={{ padding: "0.5rem 1rem", textAlign: "center", fontSize: "0.9rem", ...parseInlineStyle(style) }}>
      {resolveDisplayMessage(result.config)}
    </div>
  );
}

function parseInlineStyle(css: string): React.CSSProperties {
  const style: Record<string, string> = {};
  for (const decl of css.split(";").filter(Boolean)) {
    const [prop, value] = decl.split(":");
    const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    style[camelProp] = value;
  }
  return style as React.CSSProperties;
}
