const [baseInput, method = "vercel", tag] = process.argv.slice(2);
const secret = process.env.REVALIDATE_SECRET;

if (!baseInput || !tag || !secret || !["vercel", "next"].includes(method)) {
  console.error(
    "Usage: REVALIDATE_SECRET=... npm run invalidate -- <base-url> <vercel|next> <tag>",
  );
  process.exit(1);
}

const endpoint = method === "next" ? "/api/revalidate" : "/api/invalidate";
const url = new URL(endpoint, baseInput.endsWith("/") ? baseInput : `${baseInput}/`);
const response = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ tag }),
});
const body = await response.text();

console.log(`HTTP ${response.status}`);
console.log(body);

if (!response.ok) {
  process.exit(1);
}
