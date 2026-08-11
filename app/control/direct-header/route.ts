import { TAGS } from "@/lib/tags";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  const generatedAt = new Date().toISOString();
  const responseId = crypto.randomUUID();

  return Response.json(
    {
      path: "/control/direct-header",
      tag: TAGS.directHeader,
      tagSource: "Response headers returned by the Route Handler",
      generatedAt,
      responseId,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Vercel-CDN-Cache-Control": "public, max-age=31536000",
        "Vercel-Cache-Tag": TAGS.directHeader,
        "X-Repro-Tag": TAGS.directHeader,
        "X-Repro-Tag-Source": "route-handler-header",
        "X-Repro-Generated-At": generatedAt,
        "X-Repro-Response-Id": responseId,
      },
    },
  );
}
