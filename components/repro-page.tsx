import Link from "next/link";

type ReproPageProps = {
  path: string;
  tag: string;
};

export function ReproPage({ path, tag }: ReproPageProps) {
  const generatedAt = new Date().toISOString();
  const instance = crypto.randomUUID();

  return (
    <main>
      <div className="eyebrow">Vercel CDN tag invalidation reproduction</div>
      <h1>{path === "/" ? "Home route" : path}</h1>
      <p>
        This dynamic server response is intentionally cached at Vercel&apos;s CDN
        for one year. The timestamp and UUID change only when the origin runs
        again.
      </p>

      <dl>
        <div>
          <dt>Path</dt>
          <dd data-testid="path">{path}</dd>
        </div>
        <div>
          <dt>Cache tag</dt>
          <dd data-testid="cache-tag">{tag}</dd>
        </div>
        <div>
          <dt>Generated at</dt>
          <dd data-testid="generated-at">{generatedAt}</dd>
        </div>
        <div>
          <dt>Response UUID</dt>
          <dd data-testid="response-id">{instance}</dd>
        </div>
        <div>
          <dt>Tag source</dt>
          <dd>next.config.ts response header</dd>
        </div>
      </dl>

      <nav>
        <Link href="/" prefetch={false}>
          Home
        </Link>
        <Link href="/route" prefetch={false}>
          Route
        </Link>
        <Link href="/control/direct-header" prefetch={false}>
          Direct-header control
        </Link>
        <Link href="/control/add-cache-tag" prefetch={false}>
          addCacheTag control
        </Link>
        <Link href="/control/page-add-cache-tag" prefetch={false}>
          Page addCacheTag control
        </Link>
      </nav>
    </main>
  );
}
