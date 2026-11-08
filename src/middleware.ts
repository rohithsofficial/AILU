import { NextRequest, NextResponse } from "next/server";
import { LANDING_TEST, chooseVariant } from "@/lib/experiments";

const COOKIE = "ailu_preview";

// Lets the request through. On the landing page it also puts the visitor into the A/B test (docs/AB_TESTING.md).
function allow(req: NextRequest) {
  if (req.nextUrl.pathname !== LANDING_TEST.path) return NextResponse.next();
  const { variant, assign } = chooseVariant({
    forced: req.nextUrl.searchParams.get("v"),
    cookie: req.cookies.get(LANDING_TEST.cookie)?.value,
    userAgent: req.headers.get("user-agent"),
    random: Math.random(),
  });
  // The page reads the version from this header, because the cookie only reaches it on the next visit.
  const headers = new Headers(req.headers);
  headers.set(LANDING_TEST.header, variant);
  const res = NextResponse.next({ request: { headers } });
  if (assign) {
    res.cookies.set(LANDING_TEST.cookie, variant, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * LANDING_TEST.days });
  }
  return res;
}

export function middleware(req: NextRequest) {
  // The admin system is staff-authenticated separately and stays reachable while the site is hidden.
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (process.env.COMING_SOON !== "true") return allow(req);

  const secret = process.env.PREVIEW_SECRET;
  const { searchParams } = req.nextUrl;

  // Visit /?preview=YOUR_SECRET once to unlock the real site in this browser.
  if (secret && searchParams.get("preview") === secret) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("preview");
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }
  if (secret && req.cookies.get(COOKIE)?.value === secret) return allow(req);

  // While hidden, the enquiry API is closed to the public too.
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Not available yet." }, { status: 503 });

  if (pathname === "/coming-soon") {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  return NextResponse.redirect(new URL("/coming-soon", req.url));
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)$).*)"],
};
