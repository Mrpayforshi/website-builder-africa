import {
  createCipheriv,
  createDecipheriv,
  generateKeyPairSync,
  privateDecrypt,
  randomBytes,
  constants as cryptoConstants,
} from "crypto";

/**
 * Two unrelated encryption concerns live in this file, both required
 * before any tenant WhatsApp Flow can go live:
 *
 * 1. Meta's WhatsApp Flow data-exchange protocol (generateFlowKeyPair,
 *    decryptFlowRequest, encryptFlowResponse) — per-WABA RSA key pair,
 *    hybrid RSA-OAEP + AES-128-GCM, per Meta's published Flow endpoint
 *    spec. This is Meta's wire format, not ours — field names and sizes
 *    below are fixed by that spec.
 *
 * 2. An application-layer AES-256-GCM envelope (encryptSecret/
 *    decryptSecret) used to store the resulting RSA private key and the
 *    360dialog channel API key at rest in whatsapp_channels — those
 *    columns must never hold plaintext secrets, same principle as
 *    SUPABASE_SERVICE_ROLE_KEY never shipping to the browser (see
 *    lib/supabase/admin.ts).
 */

const ENVELOPE_ALGORITHM = "aes-256-gcm";
const ENVELOPE_IV_LENGTH = 12; // bytes, standard for GCM

function getEnvelopeKey(): Buffer {
  const secret = process.env.WHATSAPP_FLOW_KMS_SECRET;
  if (!secret) {
    throw new Error(
      "WHATSAPP_FLOW_KMS_SECRET is not set — required to encrypt/decrypt per-tenant WhatsApp secrets at rest."
    );
  }
  // Expect a 64-char hex string (32 bytes) — generate with `openssl rand -hex 32`.
  const key = Buffer.from(secret, "hex");
  if (key.length !== 32) {
    throw new Error("WHATSAPP_FLOW_KMS_SECRET must decode to exactly 32 bytes (64 hex chars).");
  }
  return key;
}

/**
 * Encrypts an arbitrary secret string (RSA private key PEM, 360dialog API
 * key) for storage in whatsapp_channels. Output layout: base64(iv (12) ||
 * authTag (16) || ciphertext) — self-contained, single column, no
 * separate IV/tag columns needed.
 */
export function encryptSecret(plaintext: string): string {
  const key = getEnvelopeKey();
  const iv = randomBytes(ENVELOPE_IV_LENGTH);
  const cipher = createCipheriv(ENVELOPE_ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

/** Reverses encryptSecret(). Throws if the envelope key is wrong or the blob was tampered with. */
export function decryptSecret(encoded: string): string {
  const key = getEnvelopeKey();
  const blob = Buffer.from(encoded, "base64");
  const iv = blob.subarray(0, ENVELOPE_IV_LENGTH);
  const authTag = blob.subarray(ENVELOPE_IV_LENGTH, ENVELOPE_IV_LENGTH + 16);
  const ciphertext = blob.subarray(ENVELOPE_IV_LENGTH + 16);
  const decipher = createDecipheriv(ENVELOPE_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export interface FlowKeyPair {
  /** PEM, registered with 360dialog/Meta for this WABA — safe to store as-is. */
  publicKeyPem: string;
  /** PEM, must be passed through encryptSecret() before it touches the database. */
  privateKeyPem: string;
}

/**
 * Generates the 2048-bit RSA key pair Meta requires per WABA for Flow
 * data-exchange encryption. Called once per tenant, the first time their
 * WhatsApp Flow ordering module is activated (see lib/whatsapp/channel-store.ts).
 */
export function generateFlowKeyPair(): FlowKeyPair {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKeyPem: publicKey, privateKeyPem: privateKey };
}

export interface EncryptedFlowRequestBody {
  encrypted_flow_data: string;
  encrypted_aes_key: string;
  initial_vector: string;
}

export interface DecryptedFlowRequest {
  /** Parsed JSON body: { version, action, screen, data, flow_token } per Meta's Flow JSON spec. */
  payload: Record<string, unknown>;
  /** The AES key recovered from this request — reused (with a flipped IV) to encrypt the response. */
  aesKey: Buffer;
  /** The IV from this request — flipped per-byte before reuse, per Meta's spec. */
  iv: Buffer;
}

/**
 * Decrypts an inbound WhatsApp Flow data-exchange request per Meta's
 * hybrid RSA-OAEP(SHA-256) + AES-128-GCM protocol: encrypted_aes_key is
 * RSA-decrypted with this tenant's private key to recover a one-time AES
 * key, which then decrypts encrypted_flow_data (the final 16 bytes of
 * that base64 blob are the GCM auth tag, not part of the ciphertext).
 *
 * privateKeyPem must already be decryptSecret()-ed by the caller — this
 * function never touches WHATSAPP_FLOW_KMS_SECRET itself.
 */
export function decryptFlowRequest(
  body: EncryptedFlowRequestBody,
  privateKeyPem: string
): DecryptedFlowRequest {
  const aesKey = privateDecrypt(
    {
      key: privateKeyPem,
      padding: cryptoConstants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(body.encrypted_aes_key, "base64")
  );

  const iv = Buffer.from(body.initial_vector, "base64");
  const flowDataBuffer = Buffer.from(body.encrypted_flow_data, "base64");
  const authTag = flowDataBuffer.subarray(flowDataBuffer.length - 16);
  const ciphertext = flowDataBuffer.subarray(0, flowDataBuffer.length - 16);

  const decipher = createDecipheriv("aes-128-gcm", aesKey, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return { payload: JSON.parse(decrypted.toString("utf8")), aesKey, iv };
}

/**
 * Encrypts a Flow data-exchange response with the same AES key as the
 * request, but the IV flipped bit-for-bit (XOR 0xFF each byte) — required
 * by Meta's spec so the response can't be replayed as a request. Returns
 * the raw base64 string the endpoint should send back with
 * Content-Type: text/plain (not JSON — Meta expects the encrypted blob
 * as the entire response body).
 */
export function encryptFlowResponse(
  responsePayload: Record<string, unknown>,
  aesKey: Buffer,
  requestIv: Buffer
): string {
  const flippedIv = Buffer.from(requestIv.map((byte) => byte ^ 0xff));
  const cipher = createCipheriv("aes-128-gcm", aesKey, flippedIv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(responsePayload), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([ciphertext, authTag]).toString("base64");
}
