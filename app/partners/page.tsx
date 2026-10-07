import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PageTop } from "@/components/marketing/ResourceBits";
import m from "@/components/marketing/marketing.module.css";
import r from "@/components/marketing/resources.module.css";

export const metadata: Metadata = {
  title: "Partners — Rivo",
  description: "Build more together: agencies, communities and riders working with Rivo.",
};

const WAYS = [
  {
    tag: "Agencies and freelancers",
    title: "Build sites for local businesses",
    text: "Use Rivo to put your clients online quickly, with WhatsApp ordering and EcoCash already wired in.",
  },
  {
    tag: "Business networks and communities",
    title: "Help your members get online",
    text: "Associations, markets and community groups can introduce members to a site they can run themselves.",
  },
  {
    tag: "Riders and couriers",
    title: "Take delivery jobs on WhatsApp",
    text: "Rivo businesses broadcast deliveries to riders, and the first rider to claim a job gets it. No app to install.",
  },
];

export default function PartnersPage() {
  // Set these in Vercel to show contact buttons. They render only when present.
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsapp = (process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "").replace(/\D/g, "");

  return (
    <MarketingShell>
      <PageTop
        eyebrow="Partners"
        title="Build more together"
        sub="Rivo works best when the people who already serve local businesses build on it with us."
      />

      <section className={r.group}>
        <h2 className={r.groupHead}>Ways to work together</h2>
        <div className={r.grid}>
          {WAYS.map((w) => (
            <div key={w.title} className={r.card}>
              <div className={r.cardTag}>{w.tag}</div>
              <h3 className={r.cardTitle}>{w.title}</h3>
              <p className={r.cardText}>{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={r.empty}>
        <h2>The partner programme is taking shape</h2>
        <p>
          We are still working out the details with our first partners, so there are no fixed terms to publish yet.
          Tell us how you would like to work together.
        </p>
        <div className={r.actions}>
          {email && (
            <a className={`${m.btnDark} ${m.btnLg}`} href={`mailto:${email}?subject=Rivo%20partnership`}>
              Email us
            </a>
          )}
          {whatsapp && (
            <a
              className={`${m.btnLight} ${m.btnLg}`}
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi, I'd like to talk about partnering with Rivo.")}`}
              target="_blank"
              rel="noreferrer"
            >
              Message us on WhatsApp
            </a>
          )}
          {!email && !whatsapp && (
            <a className={`${m.btnDark} ${m.btnLg}`} href="/signup">
              Create an account
            </a>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
