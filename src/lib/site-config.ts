export const SITE_ORIGIN = 'https://www.bizsearch.in';

export function siteUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}

export const DEFAULT_OG_IMAGE = siteUrl('/og-image.jpg');

export const CONTACT_EMAIL = 'support@bizsearch.in';

/** Real phone only. Leave unset to hide the phone block. */
export const CONTACT_PHONE = (import.meta.env.VITE_CONTACT_PHONE as string | undefined)?.trim() || '';

/** Real office line. Leave unset to hide the address block. */
export const CONTACT_OFFICE = (import.meta.env.VITE_CONTACT_OFFICE as string | undefined)?.trim() || '';

export function isSafeInternalPath(value: string | null | undefined): value is string {
  if (!value) return false;
  if (!value.startsWith('/')) return false;
  if (value.startsWith('//')) return false;
  if (value.includes('://')) return false;
  if (value.toLowerCase().startsWith('/\\')) return false;
  return true;
}

export function safeInternalPath(value: string | null | undefined, fallback = '/'): string {
  return isSafeInternalPath(value) ? value : fallback;
}
