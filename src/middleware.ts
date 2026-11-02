import { NextRequest, NextResponse } from "next/server";

const COOKIE = "ailu_preview";

export function middleware(req: NextRequest) {
  if (process.env.COMING_SOON !== "true") return NextResponse.next();

  const secret = process.env.PREVIEW_SECRET;
  const { pathname, searchParams } = req.nextUrl;

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
  if (secret && req.cookies.get(COOKIE)?.value === secret) return NextResponse.next();

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
  matcher: ["/((?!_next/|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)$).*)"],
};
