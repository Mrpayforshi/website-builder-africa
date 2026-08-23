/**
 * Scoped degrade stylesheet — see lib/market-fit/bandwidth.ts for why this
 * approach was chosen over threading a prop through every section
 * component. Targets generic tags, not component-specific classnames, so
 * it works regardless of how C's sections are implemented internally.
 */
export function LiteModeStyles() {
  return (
    <style>{`
      [data-lite-mode="true"] img:nth-of-type(n+3) {
        display: none;
      }
      [data-lite-mode="true"] * {
        background-image: none !important;
        animation: none !important;
        transition: none !important;
      }
      [data-lite-mode="true"] {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
      }
      [data-lite-mode="true"] video,
      [data-lite-mode="true"] iframe {
        display: none;
      }
    `}</style>
  );
}
