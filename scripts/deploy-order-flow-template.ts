/**
 * One-time (or re-run-after-editing-the-JSON) script: authors the master
 * order-flow template in a REFERENCE WABA, uploads order-flow.json, and
 * publishes it. The resulting Flow id is what deployOrderFlowToTenant
 * (lib/whatsapp/dialog360.ts) clones into every tenant's own WABA via
 * clone_flow_id — this script is never run per-tenant, only once (or
 * whenever the template JSON changes and needs re-publishing).
 *
 * PREREQUISITE: a "reference" business must already exist in
 * whatsapp_channels with status "live" — i.e. you've run the normal
 * Connect Button onboarding (components/dashboard/WhatsAppOrderingConnect.tsx
 * -> upsertPendingChannel -> the 360dialog Partner webhook -> activateChannel)
 * against your OWN test/reference WABA, same as any tenant would. There's
 * deliberately no special-cased "master" onboarding path here — reusing
 * a real channel row means the master flow's endpoint_uri
 * (/api/whatsapp/flows/<channelId>) is a genuinely live, ping-answering
 * endpoint for Meta's health check, using the exact same code every
 * tenant's Flow will run through.
 *
 * UNVERIFIED: whether Meta's clone_flow_id requires the source flow to
 * already be in "published" status (vs. "draft" being clonable too) is
 * not confirmed against a live sandbox call — this script publishes the
 * master regardless, which is safe either way, but if tenant cloning via
 * deployOrderFlowToTenant fails with a state-related error, that's the
 * first thing to check.
 *
 * Usage:
 *   node --env-file=.env.local -r tsx/cjs scripts/deploy-order-flow-template.ts <referenceChannelId>
 * or, with the npm script added below:
 *   npm run deploy:order-flow-template -- <referenceChannelId>
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getChannelByChannelId } from "../lib/whatsapp/channel-store";
import { createFlow, uploadFlowJson, publishFlow } from "../lib/whatsapp/dialog360";

async function main() {
  const referenceChannelId = process.argv[2];
  if (!referenceChannelId) {
    console.error("Usage: deploy-order-flow-template.ts <referenceChannelId>");
    console.error("(the channel_id of your own live reference WABA in whatsapp_channels)");
    process.exit(1);
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (!rootDomain) {
    console.error("NEXT_PUBLIC_ROOT_DOMAIN is not set — needed to build the master flow's endpoint_uri.");
    process.exit(1);
  }

  const channel = await getChannelByChannelId(referenceChannelId);
  if (!channel || channel.status !== "live" || !channel.wabaId) {
    console.error(
      `Channel "${referenceChannelId}" is not a live, activated channel (status: ${channel?.status ?? "not found"}). ` +
        "Complete the normal Connect Button onboarding for your reference business first."
    );
    process.exit(1);
  }

  const flowJsonPath = join(__dirname, "..", "lib", "whatsapp", "flows", "order-flow.json");
  const flowJson = JSON.parse(readFileSync(flowJsonPath, "utf8"));

  console.log(`Creating master flow in WABA ${channel.wabaId}...`);
  const flow = await createFlow({
    wabaId: channel.wabaId,
    name: "Rivo Order Flow — Master Template",
    category: "OTHER",
    endpointUri: `https://${rootDomain}/api/whatsapp/flows/${referenceChannelId}`,
  });
  console.log(`Created flow ${flow.id}. Uploading order-flow.json...`);

  await uploadFlowJson(channel.wabaId, flow.id, flowJson);
  console.log("Uploaded. Publishing...");

  await publishFlow(channel.wabaId, flow.id);
  console.log("Published.");

  console.log("\nSet this in your environment (.env.local and your deploy platform):");
  console.log(`WHATSAPP_ORDER_FLOW_TEMPLATE_ID=${flow.id}`);
}

main().catch((err) => {
  console.error("deploy-order-flow-template failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
