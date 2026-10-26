export const SITE_ORIGIN = 'https://www.bizsearch.in';

export function siteUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}

export const DEFAULT_OG_IMAGE = siteUrl('/og-image.jpg');

export const COMPANY_NAME = 'BizSearch';

export const CONTACT_EMAIL = 'support@bizsearch.in';

/** Public office city shown on About and Contact. */
export const CONTACT_CITY =
  (import.meta.env.VITE_CONTACT_CITY as string | undefined)?.trim() || 'Hyderabad, Telangana';

/** Public support line. Override with VITE_CONTACT_PHONE. */
export const CONTACT_PHONE =
  (import.meta.env.VITE_CONTACT_PHONE as string | undefined)?.trim() || '+91 40 4567 8900';

/** Extra office line. Leave unset to show the city only. */
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
