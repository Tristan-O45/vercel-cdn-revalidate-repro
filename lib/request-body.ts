import { ALLOWED_TAGS } from "@/lib/tags";

export async function readTag(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { error: "Expected a JSON body with a tag field." } as const;
  }

  const tag =
    typeof body === "object" && body !== null && "tag" in body
      ? (body as { tag?: unknown }).tag
      : undefined;

  if (typeof tag !== "string" || !ALLOWED_TAGS.has(tag)) {
    return {
      error: `Tag must be one of: ${[...ALLOWED_TAGS].join(", ")}`,
    } as const;
  }

  return { tag } as const;
}
