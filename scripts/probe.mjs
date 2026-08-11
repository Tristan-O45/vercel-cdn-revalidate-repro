const [baseInput, pathInput = "/", countInput = "1"] = process.argv.slice(2);

if (!baseInput) {
  console.error("Usage: npm run probe -- <base-url> [path] [count]");
  process.exit(1);
}

const count = Number.parseInt(countInput, 10);
if (!Number.isInteger(count) || count < 1 || count > 20) {
  console.error("count must be an integer between 1 and 20");
  process.exit(1);
}

const url = new URL(pathInput, baseInput.endsWith("/") ? baseInput : `${baseInput}/`);

function bodyField(body, label) {
  const pattern = new RegExp(
    `<dt>${label}</dt>\\s*<dd[^>]*>([^<]+)</dd>`,
    "i",
  );
  return body.match(pattern)?.[1] ?? null;
}

for (let requestNumber = 1; requestNumber <= count; requestNumber += 1) {
  const startedAt = new Date().toISOString();
  const response = await fetch(url, {
    headers: {
      "User-Agent": "vercel-cdn-revalidate-repro/1.0",
      Accept: "text/html,application/json",
    },
  });
  const body = await response.text();

  let json = null;
  try {
    json = JSON.parse(body);
  } catch {
    // The two primary routes return HTML.
  }

  console.log(
    JSON.stringify(
      {
        requestNumber,
        startedAt,
        url: url.toString(),
        status: response.status,
        xVercelCache: response.headers.get("x-vercel-cache"),
        age: response.headers.get("age"),
        xVercelId: response.headers.get("x-vercel-id"),
        reproTag: response.headers.get("x-repro-tag"),
        tagSource: response.headers.get("x-repro-tag-source"),
        generatedAt:
          response.headers.get("x-repro-generated-at") ??
          json?.generatedAt ??
          bodyField(body, "Generated at"),
        responseId:
          response.headers.get("x-repro-response-id") ??
          json?.responseId ??
          bodyField(body, "Response UUID"),
      },
      null,
      2,
    ),
  );
}
