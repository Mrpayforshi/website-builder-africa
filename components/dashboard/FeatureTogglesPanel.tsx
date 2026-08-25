"use client";

export interface FeatureToggleState {
  feature_key: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

const FEATURE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp ordering",
  ecocash: "EcoCash checkout",
  layby: "Layby (installment) plans",
  delivery: "Rider delivery",
  inventory_sync: "Inventory sync",
  invoicing: "Receipts / invoicing",
  load_shedding_banner: "Load-shedding banner",
  low_bandwidth_mode: "Low-bandwidth mode",
  maps_sync: "Google Maps sync",
};

const FEATURE_ORDER = [
  "whatsapp",
  "ecocash",
  "layby",
  "delivery",
  "inventory_sync",
  "invoicing",
  "load_shedding_banner",
  "low_bandwidth_mode",
  "maps_sync",
];

interface FeatureTogglesPanelProps {
  toggles: FeatureToggleState[];
  onChange: (featureKey: string, enabled: boolean, config?: Record<string, unknown>) => void;
}

export function FeatureTogglesPanel({ toggles, onChange }: FeatureTogglesPanelProps) {
  function get(key: string): FeatureToggleState {
    return toggles.find((t) => t.feature_key === key) ?? { feature_key: key, enabled: false, config: {} };
  }

  return (
    <section style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
      <h2 style={{ fontSize: "1.1rem" }}>Features</h2>
      {FEATURE_ORDER.map((key) => {
        const toggle = get(key);
        return (
          <div key={key} style={{ marginBottom: "0.6rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={toggle.enabled}
                onChange={(e) => onChange(key, e.target.checked, toggle.config)}
              />
              {FEATURE_LABELS[key] ?? key}
            </label>

            {key === "layby" && toggle.enabled && (
              <div style={{ marginLeft: "1.6rem", marginTop: "0.4rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
                  Deposit %
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={(toggle.config.deposit_pct as number) ?? 20}
                    onChange={(e) => onChange(key, true, { ...toggle.config, deposit_pct: Number(e.target.value) })}
                    style={{ marginLeft: "0.5rem", width: "70px" }}
                  />
                </label>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
                  Schedule
                  <select
                    value={(toggle.config.schedule as string) ?? "weekly"}
                    onChange={(e) => onChange(key, true, { ...toggle.config, schedule: e.target.value })}
                    style={{ marginLeft: "0.5rem" }}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>
                <label style={{ display: "block", fontSize: "0.8rem" }}>
                  Forfeiture policy
                  <input
                    type="text"
                    value={(toggle.config.forfeiture_policy as string) ?? ""}
                    onChange={(e) => onChange(key, true, { ...toggle.config, forfeiture_policy: e.target.value })}
                    style={{ marginLeft: "0.5rem", width: "60%" }}
                  />
                </label>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
