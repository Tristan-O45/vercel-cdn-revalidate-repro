import { addCacheTag } from "@vercel/functions";
import { TAGS } from "@/lib/tags";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const generatedAt = new Date().toISOString();
  const responseId = crypto.randomUUID();

  await addCacheTag(TAGS.addCacheTag);

  return Response.json(
    {
      path: "/control/add-cache-tag",
      tag: TAGS.addCacheTag,
      tagSource: "addCacheTag() from @vercel/functions",
      generatedAt,
      responseId,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Vercel-CDN-Cache-Control": "public, max-age=31536000",
        "X-Repro-Tag": TAGS.addCacheTag,
        "X-Repro-Tag-Source": "add-cache-tag",
        "X-Repro-Generated-At": generatedAt,
        "X-Repro-Response-Id": responseId,
      },
    },
  );
}
