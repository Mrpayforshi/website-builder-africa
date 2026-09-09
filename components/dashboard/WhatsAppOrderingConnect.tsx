"use client";

import { useState } from "react";
import { ConnectButton } from "360dialog-connect-button";

/**
 * Tenant-facing onboarding UI for the Mobis-style WhatsApp Flow ordering
 * module — a paid add-on distinct from the free wa.me deep-link CTA (see
 * lib/commerce/whatsapp-links.ts). Wraps 360dialog's own Connect Button,
 * which pops up their hosted Embedded Signup flow: the tenant logs into
 * their own Meta Business Manager, creates/attaches their WABA and
 * number, and grants us permission to manage that channel.
 *
 * This component only records that onboarding *started* — the callback
 * gives us a client_id/channel_id, which we store as a `pending` row via
 * POST /api/whatsapp/onboarding/start (see route below). The channel
 * doesn't become usable until 360dialog's Partner webhook confirms it's
 * live — see app/api/whatsapp/dialog360-webhook/route.ts, which does the
 * actual key generation and Flow deployment.
 */

interface WhatsAppOrderingConnectProps {
  businessId: string;
  /** From getChannelStatus() — null if the tenant hasn't started onboarding at all. */
  initialStatus: "pending" | "live" | "suspended" | "disconnected" | null;
}

export function WhatsAppOrderingConnect({ businessId, initialStatus }: WhatsAppOrderingConnectProps) {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);

  const partnerId = process.env.NEXT_PUBLIC_DIALOG360_PARTNER_ID;

  async function handleCallback(callbackObject: { client: string; channels: string[] }) {
    setError(null);
    try {
      // The package's actual TS types return channels as string[] — the
      // npm README's console.log examples are misleading on this point.
      const firstChannelId = callbackObject.channels[0]?.trim();
      if (!firstChannelId) {
        setError("Onboarding completed but no channel was returned — try again.");
        return;
      }
      const res = await fetch("/api/whatsapp/onboarding/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          dialog360ClientId: callbackObject.client,
          channelId: firstChannelId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start onboarding.");
    }
  }

  if (!partnerId) {
    return (
      <p className="whatsapp-connect__error">
        NEXT_PUBLIC_DIALOG360_PARTNER_ID is not configured — WhatsApp ordering setup is unavailable.
      </p>
    );
  }

  if (status === "live") {
    return <p className="whatsapp-connect__status whatsapp-connect__status--live">WhatsApp ordering is connected and live.</p>;
  }

  if (status === "pending") {
    return (
      <p className="whatsapp-connect__status whatsapp-connect__status--pending">
        Connection started — activating your WhatsApp ordering flow. This can take a few minutes.
      </p>
    );
  }

  return (
    <div className="whatsapp-connect">
      <p>
        Connect your own WhatsApp number to take orders the way Mobis does — customers pick from your
        menu right inside WhatsApp.
      </p>
      <ConnectButton partnerId={partnerId} callback={handleCallback} label="Connect WhatsApp" />
      {error && <p className="whatsapp-connect__error">{error}</p>}
    </div>
  );
}
