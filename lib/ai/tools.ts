/**
 * Tool-calling contract for the AI chat layer (Workstream B). Every tool
 * call is a REQUEST — validated and executed server-side in
 * tool-executor.ts, never a direct write from the LLM.
 */

export const AI_TOOLS = [
  {
    name: "set_business_info",
    description: "Set core business identity fields: name, category, and contact info.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        category: {
          type: "string",
          enum: ["retail", "services", "food", "professional", "ngo_community", "events_portfolio"],
        },
        contact: {
          type: "object",
          properties: {
            phone: { type: "string" },
            email: { type: "string" },
            whatsapp: { type: "string" },
          },
        },
      },
      required: ["name", "category"],
    },
  },
  {
    name: "set_color_scheme",
    description: "Set the site's primary, secondary, and accent colors.",
    input_schema: {
      type: "object",
      properties: {
        primary: { type: "string" },
        secondary: { type: "string" },
        accent: { type: "string" },
      },
      required: ["primary"],
    },
  },
  {
    name: "set_section_content",
    description:
      "Write structured content to a specific section of the site. Content is validated against the current template's section field schema before it is saved.",
    input_schema: {
      type: "object",
      properties: {
        section_id: { type: "string" },
        content: { type: "object" },
      },
      required: ["section_id", "content"],
    },
  },
  {
    name: "toggle_feature",
    description:
      "Enable or disable a platform feature (whatsapp, ecocash, layby, delivery, inventory_sync, invoicing, load_shedding_banner, low_bandwidth_mode, maps_sync).",
    input_schema: {
      type: "object",
      properties: {
        feature: {
          type: "string",
          enum: [
            "whatsapp",
            "delivery",
            "ecocash",
            "layby",
            "load_shedding_banner",
            "low_bandwidth_mode",
            "maps_sync",
            "inventory_sync",
            "invoicing",
          ],
        },
        enabled: { type: "boolean" },
      },
      required: ["feature", "enabled"],
    },
  },
  {
    name: "set_layby_config",
    description: "Configure layby terms. Only valid if the 'layby' feature is already enabled.",
    input_schema: {
      type: "object",
      properties: {
        deposit_pct: { type: "number", minimum: 1, maximum: 100 },
        schedule: { type: "string", description: "Cadence, e.g. 'weekly', 'biweekly', 'monthly'" },
        forfeiture_policy: {
          type: "string",
          description: "Human-readable forfeiture rule, e.g. 'forfeited if unpaid by end of grace day'",
        },
      },
      required: ["deposit_pct", "schedule", "forfeiture_policy"],
    },
  },
  {
    name: "set_hours",
    description: "Set opening and closing hours for a specific day of the week.",
    input_schema: {
      type: "object",
      properties: {
        day: { type: "string", enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] },
        open: { type: "string", description: "24h time, e.g. '09:00'" },
        close: { type: "string", description: "24h time, e.g. '18:00'" },
      },
      required: ["day", "open", "close"],
    },
  },
  {
    name: "publish_site",
    description: "Publish the site. Only callable once required sections have content.",
    input_schema: { type: "object", properties: {} },
  },
] as const;

export type AiToolName = (typeof AI_TOOLS)[number]["name"];
