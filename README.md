# Vercel CDN cache-tag invalidation reproduction

This repository reproduces the confirmed shape of a customer report where a
tagged CDN response remains a cache `HIT` after tag invalidation.

The primary routes deliberately match the known project as closely as the
available evidence allows:

- Next.js `16.3.0`
- App Router
- dynamic server-rendered `/` and `/route` routes
- one-year Vercel CDN TTL through `Vercel-CDN-Cache-Control`
- raw `Vercel-Cache-Tag` headers named `cdn-home` and `cdn-route`
- visible generation timestamps and UUIDs to identify when the origin runs

The customer's private source was not available. The main implementation
assumption is that its tags are applied as custom response headers. Here, those
headers are configured in `next.config.ts` for the two primary routes.

## Routes

| Route | Tag | Tag registration path |
| --- | --- | --- |
| `/` | `cdn-home` | `next.config.ts` response header |
| `/route` | `cdn-route` | `next.config.ts` response header |
| `/control/direct-header` | `cdn-direct-header` | Header returned directly by a Route Handler |
| `/control/add-cache-tag` | `cdn-add-cache-tag` | `addCacheTag()` from `@vercel/functions` |

The control routes are intentionally separate from the customer-like routes.
They help distinguish a general invalidation failure from a path-specific tag
registration problem.

## Local setup

Use Node.js 20.9 or newer. The included `.nvmrc` selects Node 22.

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

CDN behavior cannot be validated through `next dev`; deploy the project to
Vercel for the actual reproduction.

## Push to GitHub

From this directory:

```bash
git init
git add .
git commit -m "Add CDN tag invalidation reproduction"
gh repo create vercel-cdn-revalidate-repro --private --source=. --push
```

You can also create an empty GitHub repository in the browser, add it as the
remote, and push normally.

## Deploy to Vercel

Import the GitHub repository in Vercel, or deploy it with the CLI:

```bash
npx vercel
npx vercel --prod
```

Create a long random secret and add it as `REVALIDATE_SECRET` in the Vercel
project's Production environment before using the programmatic endpoints.

```bash
openssl rand -hex 32
npx vercel env add REVALIDATE_SECRET production
npx vercel --prod
```

The dashboard and CLI invalidation tests do not require that environment
variable.

## Baseline probe

The probe always sends a real `GET`. Do not substitute `curl -I` or another
`HEAD` request because the HTTP method is part of the CDN cache key.

```bash
npm run probe -- https://YOUR-PROJECT.vercel.app / 3
npm run probe -- https://YOUR-PROJECT.vercel.app /route 3
```

For a correctly cached route, the usual baseline is:

1. First request: `MISS`, with generation timestamp A.
2. Later requests: `HIT`, with the same timestamp and UUID.
3. The `age` header increases on later hits.

The first request can already be a `HIT` if the deployment has previously been
visited. The important baseline is two `HIT` responses with the same generated
values before invalidation.

## Dashboard invalidation test

1. Establish the baseline with the probe.
2. Open the Vercel project and go to **CDN > Caches > Purge Cache**.
3. Select **Cache Tag** and enter `cdn-home` or `cdn-route`.
4. Select the environment matching the URL under test.
5. Select **Invalidate content**, then purge.
6. Record the exact UTC time shown in Cache History.
7. Immediately run the matching probe again, then repeat it after a short delay:

```bash
npm run probe -- https://YOUR-PROJECT.vercel.app / 3
```

Documented successful invalidation behavior is a `STALE` response followed by
background revalidation and a later `HIT` containing a new generation timestamp.
The suspected failure signature is repeated `HIT` responses with the old
timestamp, old UUID, and increasing `age`.

Repeat the same test for `/route` and `cdn-route`.

## CLI invalidation test

Run the command from the linked project directory:

```bash
npx vercel cache invalidate --tag cdn-home
npm run probe -- https://YOUR-PROJECT.vercel.app / 3
```

For a foreground deletion comparison:

```bash
npx vercel cache dangerously-delete --tag cdn-home
npm run probe -- https://YOUR-PROJECT.vercel.app / 2
```

The request after deletion should be a blocking `MISS`, not `STALE`.

## Programmatic invalidation tests

The `vercel` method calls `invalidateByTag()` from `@vercel/functions`:

```bash
REVALIDATE_SECRET='YOUR_SECRET' \
  npm run invalidate -- https://YOUR-PROJECT.vercel.app vercel cdn-home
npm run probe -- https://YOUR-PROJECT.vercel.app / 3
```

The `next` method calls `revalidateTag(tag, "max")` from `next/cache`:

```bash
REVALIDATE_SECRET='YOUR_SECRET' \
  npm run invalidate -- https://YOUR-PROJECT.vercel.app next cdn-home
npm run probe -- https://YOUR-PROJECT.vercel.app / 3
```

Run these methods separately. A successful dashboard operation does not by
itself establish what happened through the Next.js helper, and vice versa.

## A/B controls

If the two primary routes reproduce the failure, repeat the same procedure for:

```bash
npm run probe -- https://YOUR-PROJECT.vercel.app /control/direct-header 3
npm run probe -- https://YOUR-PROJECT.vercel.app /control/add-cache-tag 3
```

Use `cdn-direct-header` and `cdn-add-cache-tag` respectively when purging.

Interpretation:

- All routes fail: investigate invalidation delivery or tag-state lookup.
- Only `next.config.ts` routes fail: investigate where those custom headers enter
  the response/cache pipeline.
- Header routes fail but `addCacheTag()` works: investigate raw-header tag
  registration for the affected path types.
- Everything works: compare the customer's exact header-setting code and run a
  time-correlated reproduction in its deployment.

## Evidence to save

For every attempt, retain:

- deployment ID and tested hostname
- environment
- purge method and exact UTC timestamp
- tag and path
- `x-vercel-cache`, `age`, and `x-vercel-id`
- generated timestamp and response UUID
- relevant Runtime Log request IDs
- Cache History entry

This is a diagnostic fixture. A matching symptom narrows the problem but does
not by itself establish that the customer and this project share a root cause.

## References

- [Purging Vercel CDN Cache](https://vercel.com/docs/caching/cdn-cache/purge)
- [Cache-Control headers](https://vercel.com/docs/caching/cache-control-headers)
- [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [`@vercel/functions` cache helpers](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package)
