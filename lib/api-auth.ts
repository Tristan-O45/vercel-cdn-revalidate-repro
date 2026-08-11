import { timingSafeEqual } from "node:crypto";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function authorize(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  const provided = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");

  return Boolean(expected && provided && safeEqual(provided, expected));
}
