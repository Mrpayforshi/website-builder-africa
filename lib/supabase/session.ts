import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * True when the request carries a Supabase auth cookie (including chunked
 * `sb-<ref>-auth-token.0` style cookies). Used to skip the refresh round-trip
 * for anonymous visitors on marketing pages.
 */
export function hasAuthCookie(req: NextRequest): boolean {
  return req.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
}

/**
 * Refreshes the Supabase session for platform-host requests.
 *
 * Server Components can't write cookies, so without this an expired access
 * token can't be renewed during a page render and the user gets bounced to
 * /login. Here the refreshed cookies are written to both the incoming request
 * (so the page render sees them) and the outgoing response (so the browser
 * stores them).
 *
 * Also forwards `x-pathname` so Server Components can branch on route.
 * Never throws — a failed refresh must not take a page down; the page's own
 * getUser() check is the real gate.
 */
export async function refreshSession(
  req: NextRequest,
  pathname: string
): Promise<NextResponse> {
  const buildHeaders = () => {
    const headers = new Headers(req.headers);
    headers.set("x-pathname", pathname);
    return headers;
  };

  let response = NextResponse.next({ request: { headers: buildHeaders() } });

  if (!hasAuthCookie(req)) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: buildHeaders() } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    await supabase.auth.getUser();
  } catch {
    // Supabase unreachable — let the request through; pages re-check auth.
  }

  return response;
}
