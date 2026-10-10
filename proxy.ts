import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAuthCookie, refreshSession } from "@/lib/supabase/session";

// Slugs that must never resolve to a tenant site, so the platform's own
// marketing/auth/dashboard/api routes stay reachable at these hosts.
const RESERVED_SUBDOMAINS = new Set(["www", "app", "dashboard", "api"]);

function extractSubdomain(hostname: string, rootDomain: string): string | null {
  if (!hostname.endsWith(`.${rootDomain}`)) return null;
  const subdomain = hostname.slice(0, hostname.length - rootDomain.length - 1);
  if (!subdomain || subdomain.includes(".") || RESERVED_SUBDOMAINS.has(subdomain)) return null;
  return subdomain;
}

/**
 * Tenant resolution. Uses the admin client (bypasses RLS) deliberately:
 * distinguishing "no such site" from "site exists but suspended/draft"
 * requires reading business status regardless of the public-read RLS
 * policy, which only exposes published rows to anon callers.
 */
export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = (req.headers.get("host") ?? "").split(":")[0];
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || null;

  const isPlatformHost =
    hostname === "localhost" ||
    hostname.endsWith(".vercel.app") ||
    (rootDomain !== null && (hostname === rootDomain || hostname === `www.${rootDomain}`));

  if (isPlatformHost) {
    const pathname = url.pathname;

    // Convenience redirect only: a visitor with no auth cookie at all who
    // opens a dashboard URL goes to /login and is sent back afterwards. The
    // real gate is still each page/route's own getUser() check.
    const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
    if (isDashboard && !hasAuthCookie(req)) {
      const loginUrl = url.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      loginUrl.searchParams.set("next", pathname + url.search);
      return NextResponse.redirect(loginUrl);
    }

    // Refreshes an expiring Supabase session (Server Components can't write
    // cookies) and forwards the request pathname to Server Components (e.g.
    // the root layout) so lite mode can be scoped away from /dashboard.
    return refreshSession(req, pathname);
  }

  const admin = createAdminClient();
  const subdomain = rootDomain ? extractSubdomain(hostname, rootDomain) : null;

  let business: { id: string; status: string } | null = null;

  if (subdomain) {
    const { data } = await admin
      .from("businesses")
      .select("id, status")
      .eq("slug", subdomain)
      .maybeSingle();
    business = data;
  } else {
    // Not a platform subdomain — the only remaining possibility is a
    // verified custom domain pointed at this deployment.
    const { data: domainRow } = await admin
      .from("domains")
      .select("business_id, verified_at")
      .eq("domain", hostname)
      .maybeSingle();

    if (domainRow?.verified_at) {
      const { data } = await admin
        .from("businesses")
        .select("id, status")
        .eq("id", domainRow.business_id)
        .maybeSingle();
      business = data;
    }
  }

  if (!business) {
    url.pathname = "/_sites/tenant-not-found";
    return NextResponse.rewrite(url);
  }

  if (business.status !== "published") {
    url.pathname = "/_sites/tenant-unavailable";
    return NextResponse.rewrite(url);
  }

  url.pathname = `/_sites/${business.id}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|_sites).*)"],
};
