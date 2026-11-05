import { currentStaff } from "@/lib/authz";
import { globalSearch } from "@/server/search/global-search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const staff = await currentStaff();
  if (!staff) return Response.json({ error: "Sign in required." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (query.trim().length < 2) return Response.json({ query: "", groups: [] }, { headers: { "Cache-Control": "no-store" } });
  const result = await globalSearch(staff, query);
  return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
