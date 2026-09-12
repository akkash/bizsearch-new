const BLOCKED_HOST_FRAGMENTS = ['franchiseindia.com'];

export function sanitizePublicWebsite(
  url?: string | null
): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (BLOCKED_HOST_FRAGMENTS.some((fragment) => host.includes(fragment))) {
      return undefined;
    }
    return parsed.toString();
  } catch {
    return undefined;
  }
}
