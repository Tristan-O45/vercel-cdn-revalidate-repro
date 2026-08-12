import { addCacheTag } from "@vercel/functions";
import { connection } from "next/server";
import { TAGS } from "@/lib/tags";

export const runtime = "nodejs";

export default async function PageAddCacheTagControl() {
  await connection();
  await addCacheTag(TAGS.pageAddCacheTag);

  const generatedAt = new Date().toISOString();
  const responseId = crypto.randomUUID();

  return (
    <main>
      <div className="eyebrow">Vercel CDN tag invalidation reproduction</div>
      <h1>Page addCacheTag control</h1>
      <p>
        This dynamic page is cached through a next.config.ts cache-control
        header, while its cache tag is registered during the page render with
        addCacheTag().
      </p>

      <dl>
        <div>
          <dt>Path</dt>
          <dd data-testid="path">/control/page-add-cache-tag</dd>
        </div>
        <div>
          <dt>Cache tag</dt>
          <dd data-testid="cache-tag">{TAGS.pageAddCacheTag}</dd>
        </div>
        <div>
          <dt>Generated at</dt>
          <dd data-testid="generated-at">{generatedAt}</dd>
        </div>
        <div>
          <dt>Response UUID</dt>
          <dd data-testid="response-id">{responseId}</dd>
        </div>
        <div>
          <dt>Tag source</dt>
          <dd>addCacheTag() from @vercel/functions in page.tsx</dd>
        </div>
      </dl>
    </main>
  );
}
