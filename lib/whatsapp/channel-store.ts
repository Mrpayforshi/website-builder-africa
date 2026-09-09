import { createAdminClient } from "@/lib/supabase/admin";
import { decryptSecret, encryptSecret } from "@/lib/whatsapp/crypto";

export type WhatsAppChannelStatus = "pending" | "live" | "suspended" | "disconnected";
export type FlowStatus = "draft" | "published" | "deprecated";

/**
 * Row shape as read back with secrets decrypted — only ever constructed
 * server-side by getChannelWithSecrets(). Never pass this to a client
 * component or a route response; strip to WhatsAppChannelPublic first.
 */
export interface WhatsAppChannelWithSecrets {
  id: string;
  businessId: string;
  dialog360ClientId: string | null;
  wabaId: string | null;
  channelId: string | null;
  phoneNumber: string | null;
  status: WhatsAppChannelStatus;
  encryptionPublicKeyPem: string | null;
  /** Decrypted PEM — only present when secrets were requested. */
  encryptionPrivateKeyPem: string | null;
  /** Decrypted 360dialog Messaging API key — only present when secrets were requested. */
  apiKey: string | null;
  flowId: string | null;
  flowStatus: FlowStatus | null;
}

/** Safe subset for dashboard display — no key material. */
export interface WhatsAppChannelPublic {
  businessId: string;
  status: WhatsAppChannelStatus;
  phoneNumber: string | null;
  flowStatus: FlowStatus | null;
}

/** Dashboard-facing read — RLS-scoped client is fine here, "members can view whatsapp channel status" covers it, and this never selects the secret columns. */
export async function getChannelStatus(businessId: string): Promise<WhatsAppChannelPublic | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_channels")
    .select("business_id, status, phone_number, flow_status")
    .eq("business_id", businessId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    businessId: data.business_id,
    status: data.status,
    phoneNumber: data.phone_number,
    flowStatus: data.flow_status,
  };
}

/**
 * Admin-only read that decrypts key material — used exclusively by the
 * Flow data-exchange endpoint (to decrypt inbound requests) and the
 * 360dialog Partner API client (to authenticate Messaging API calls).
 * Never expose the return value outside server-side code.
 */
export async function getChannelWithSecrets(
  businessId: string
): Promise<WhatsAppChannelWithSecrets | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_channels")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    businessId: data.business_id,
    dialog360ClientId: data.dialog360_client_id,
    wabaId: data.waba_id,
    channelId: data.channel_id,
    phoneNumber: data.phone_number,
    status: data.status,
    encryptionPublicKeyPem: data.encryption_public_key,
    encryptionPrivateKeyPem: data.encryption_private_key_encrypted
      ? decryptSecret(data.encryption_private_key_encrypted)
      : null,
    apiKey: data.api_key_encrypted ? decryptSecret(data.api_key_encrypted) : null,
    flowId: data.flow_id,
    flowStatus: data.flow_status,
  };
}

/**
 * Same as getChannelWithSecrets but looked up by 360dialog's channel_id —
 * used by the Flow data-exchange endpoint and the Partner webhook, which
 * only have the channel_id on hand (Meta/360dialog identify the WABA, not
 * our business_id, in every inbound payload).
 */
export async function getChannelByChannelId(
  channelId: string
): Promise<WhatsAppChannelWithSecrets | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_channels")
    .select("*")
    .eq("channel_id", channelId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    businessId: data.business_id,
    dialog360ClientId: data.dialog360_client_id,
    wabaId: data.waba_id,
    channelId: data.channel_id,
    phoneNumber: data.phone_number,
    status: data.status,
    encryptionPublicKeyPem: data.encryption_public_key,
    encryptionPrivateKeyPem: data.encryption_private_key_encrypted
      ? decryptSecret(data.encryption_private_key_encrypted)
      : null,
    apiKey: data.api_key_encrypted ? decryptSecret(data.api_key_encrypted) : null,
    flowId: data.flow_id,
    flowStatus: data.flow_status,
  };
}

/**
 * Creates the pending row the moment a tenant starts Connect Button
 * onboarding (client_id/channel returned by the 360dialog callback,
 * before the "channel live" Partner webhook confirms it's actually
 * ready). Idempotent on business_id (unique constraint) — safe to call
 * again if onboarding is retried.
 */
export async function upsertPendingChannel(input: {
  businessId: string;
  dialog360ClientId: string;
  channelId: string;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("whatsapp_channels").upsert(
    {
      business_id: input.businessId,
      dialog360_client_id: input.dialog360ClientId,
      channel_id: input.channelId,
      status: "pending",
    },
    { onConflict: "business_id" }
  );
  if (error) throw new Error(error.message);
}

/**
 * Called once the Partner webhook confirms the channel is live — stores
 * the WABA id, phone number, generated key pair (private half encrypted
 * before it ever reaches this function's SQL), and the channel API key.
 */
export async function activateChannel(input: {
  channelId: string;
  wabaId: string;
  phoneNumber: string;
  publicKeyPem: string;
  privateKeyPem: string;
  apiKey: string;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("whatsapp_channels")
    .update({
      status: "live",
      waba_id: input.wabaId,
      phone_number: input.phoneNumber,
      encryption_public_key: input.publicKeyPem,
      encryption_private_key_encrypted: encryptSecret(input.privateKeyPem),
      encryption_key_registered_at: new Date().toISOString(),
      api_key_encrypted: encryptSecret(input.apiKey),
      updated_at: new Date().toISOString(),
    })
    .eq("channel_id", input.channelId);
  if (error) throw new Error(error.message);
}

export async function setFlowDeployment(input: {
  businessId: string;
  flowId: string;
  flowStatus: FlowStatus;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("whatsapp_channels")
    .update({
      flow_id: input.flowId,
      flow_status: input.flowStatus,
      flow_deployed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", input.businessId);
  if (error) throw new Error(error.message);
}
