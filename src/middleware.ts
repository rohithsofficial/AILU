import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (process.env.COMING_SOON !== "true") return NextResponse.next();

  const { pathname, searchParams } = req.nextUrl;

  // Let you preview the real site: visit /?preview=YOUR_SECRET once
  if (searchParams.get("preview") === process.env.PREVIEW_SECRET) {
    const res = NextResponse.redirect(new URL(pathname, req.url));
    res.cookies.set("preview", "1", { httpOnly: true, path: "/" });
    return res;
  }
  if (req.cookies.get("preview")?.value === "1") return NextResponse.next();

  // Everyone else sees the coming soon page
  if (pathname === "/coming-soon") return NextResponse.next();
  return NextResponse.redirect(new URL("/coming-soon", req.url));
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)$).*)"],
};