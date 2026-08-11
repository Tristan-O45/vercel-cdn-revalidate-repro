import { invalidateByTag } from "@vercel/functions";
import { authorize } from "@/lib/api-auth";
import { readTag } from "@/lib/request-body";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!authorize(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await readTag(request);
  if ("error" in result) {
    return Response.json(result, { status: 400 });
  }

  await invalidateByTag(result.tag);

  return Response.json(
    {
      ok: true,
      method: "@vercel/functions invalidateByTag()",
      tag: result.tag,
      calledAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
