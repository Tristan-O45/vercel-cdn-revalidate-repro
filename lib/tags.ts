export const TAGS = {
  home: "cdn-home",
  route: "cdn-route",
  directHeader: "cdn-direct-header",
  addCacheTag: "cdn-add-cache-tag",
} as const;

export const ALLOWED_TAGS = new Set<string>(Object.values(TAGS));
