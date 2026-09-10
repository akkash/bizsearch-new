/** First usable image URL from listing `images` / logo fields. No placeholders. */
export function listingImageUrl(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = listingImageUrl(item);
      if (url) return url;
    }
    return null;
  }
  if (typeof value === "object") {
    const record = value as { url?: unknown; src?: unknown; path?: unknown };
    return listingImageUrl(record.url) || listingImageUrl(record.src) || listingImageUrl(record.path);
  }
  return null;
}

export function listingLogoUrl(item: {
  logo?: unknown;
  logo_url?: unknown;
}): string | null {
  return listingImageUrl(item.logo_url) || listingImageUrl(item.logo);
}

export function listingCoverUrl(item: { images?: unknown }): string | null {
  return listingImageUrl(item.images);
}
