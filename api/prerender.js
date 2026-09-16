/**
 * Edge SSR for public HTML.
 * Listing URLs, catalog/static titles, SPA shells (no ACAO), and unknown-path 404s.
 * Fetches franchise_public / business_public only (never select=*).
 */
export const config = { runtime: 'edge' };

const SITE_ORIGIN = 'https://www.bizsearch.in';
const DEFAULT_OG = `${SITE_ORIGIN}/og-image.jpg`;
const SHELL_TTL_MS = 60_000;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/i;

const FRANCHISE_SELECT = [
  'id',
  'slug',
  'brand_name',
  'tagline',
  'industry',
  'description',
  'logo_url',
  'images',
  'franchise_fee',
  'total_investment_min',
  'total_investment_max',
  'established_year',
  'total_outlets',
  'verified_at',
].join(',');

const BUSINESS_SELECT = [
  'id',
  'slug',
  'name',
  'tagline',
  'industry',
  'description',
  'city',
  'state',
  'price',
  'logo_url',
  'images',
  'established_year',
  'verified_at',
  'meta_title',
  'meta_description',
].join(',');

const PAGE_ALIASES = {
  home: '/',
  franchises: '/franchises',
  businesses: '/businesses',
  docs: '/docs',
  about: '/about',
  contact: '/contact',
};

const STATIC_PAGES = {
  '/': staticPage(
    '/',
    'BizSearch — Find the right franchise',
    'Discover franchises in India by investment, location, industry and expected returns. Compare opportunities and connect with brands.',
    'Find the right franchise'
  ),
  '/franchises': staticPage(
    '/franchises',
    'Franchise opportunities in India | BizSearch',
    'Browse public franchise listings by industry, investment, and location. Compare brands and enquire when you find a fit.',
    'Franchise opportunities in India'
  ),
  '/businesses': staticPage(
    '/businesses',
    'Businesses for sale in India | BizSearch',
    'Browse businesses for sale by industry, location, and asking price.',
    'Businesses for sale in India'
  ),
  '/docs': staticPage(
    '/docs',
    'BizSearch API | BizSearch',
    'Access business and franchise data programmatically. Build integrations and custom applications.',
    'BizSearch API'
  ),
  '/about': staticPage(
    '/about',
    'About BizSearch | BizSearch',
    'BizSearch is a franchise and business marketplace in India. Browse listings, compare opportunities, and connect with brands.',
    'About BizSearch'
  ),
  '/contact': staticPage(
    '/contact',
    'Contact BizSearch | BizSearch',
    'Questions about buying, selling, or franchising? Email support@bizsearch.in and we will reply within one business day.',
    'Contact BizSearch'
  ),
};

let shellCache = { html: '', at: 0 };

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const url = new URL(request.url);
  const kind = (url.searchParams.get('type') || 'franchise').trim();
  const origin = requestOrigin(request);

  let shell = '';
  try {
    shell = await loadShell(origin);
  } catch (error) {
    console.error('prerender shell failed', error);
    return new Response('Service Unavailable', { status: 503 });
  }

  if (kind === 'notfound') {
    return htmlResponse(applyNotFound(shell, 'page'), 404, 'public, s-maxage=300, stale-while-revalidate=3600');
  }

  if (kind === 'spa') {
    return htmlResponse(shell, 200, 'public, s-maxage=600, stale-while-revalidate=86400');
  }

  if (kind === 'page') {
    const path = resolvePagePath(url.searchParams.get('path'));
    const page = STATIC_PAGES[path];
    if (!page) {
      return htmlResponse(applyNotFound(shell, 'page'), 404, 'private, max-age=60');
    }
    return htmlResponse(applyListingHead(shell, page), 200, 'public, s-maxage=3600, stale-while-revalidate=86400');
  }

  const type = kind === 'business' ? 'business' : 'franchise';
  const slug = (url.searchParams.get('slug') || '').trim();
  if (!isSafeSlug(slug)) {
    return htmlResponse(applyNotFound(shell, type), 404, 'private, max-age=60');
  }

  try {
    const row = await fetchListing(type, slug);
    if (!row) {
      return htmlResponse(applyNotFound(shell, type), 404, 'public, s-maxage=300, stale-while-revalidate=3600');
    }
    const page = type === 'business' ? businessPage(row) : franchisePage(row);
    return htmlResponse(
      applyListingHead(shell, page),
      200,
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );
  } catch (error) {
    console.error('prerender failed', error);
    return htmlResponse(shell, 200, 'private, max-age=0');
  }
}

function staticPage(path, title, description, heading) {
  return {
    title,
    description,
    canonical: `${SITE_ORIGIN}${path}`,
    image: DEFAULT_OG,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      url: `${SITE_ORIGIN}${path}`,
      description,
    },
    heading,
    noindex: false,
  };
}

function resolvePagePath(raw) {
  const key = (raw || '').trim();
  if (PAGE_ALIASES[key]) return PAGE_ALIASES[key];
  if (STATIC_PAGES[key]) return key;
  return '';
}

function requestOrigin(request) {
  const url = new URL(request.url);
  const forwarded = request.headers.get('x-forwarded-host');
  const host = (forwarded || request.headers.get('host') || url.host).split(',')[0].trim();
  const proto = (request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '')).split(',')[0].trim();
  return `${proto}://${host}`;
}

function isSafeSlug(value) {
  return UUID_RE.test(value) || SLUG_RE.test(value);
}

async function loadShell(origin) {
  const now = Date.now();
  if (shellCache.html && now - shellCache.at < SHELL_TTL_MS) {
    return shellCache.html;
  }
  const res = await fetch(new URL('/index.html', origin), {
    headers: { accept: 'text/html' },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`shell ${res.status}`);
  }
  const html = await res.text();
  if (!html.includes('<div id="root"></div>')) {
    throw new Error('shell missing root');
  }
  shellCache = { html, at: now };
  return html;
}

async function fetchListing(type, slug) {
  const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anon) {
    throw new Error('missing supabase env');
  }

  const table = type === 'business' ? 'business_public' : 'franchise_public';
  const select = type === 'business' ? BUSINESS_SELECT : FRANCHISE_SELECT;
  const filter = UUID_RE.test(slug) ? `id=eq.${slug}` : `slug=eq.${encodeURIComponent(slug)}`;
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${filter}&select=${select}&limit=1`, {
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`${table} ${res.status}`);
  }
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

function franchisePage(row) {
  const name = String(row.brand_name || 'Franchise').trim();
  const path = `/franchise/${row.slug || row.id}`;
  const description =
    truncate(plainText(row.description || row.tagline || `Explore the ${name} franchise opportunity on BizSearch.`), 160);
  return {
    title: `${name} | BizSearch`,
    description,
    canonical: `${SITE_ORIGIN}${path}`,
    image: absoluteImage(row.logo_url, firstImage(row.images)),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_ORIGIN}${path}`,
      name,
      description: description || undefined,
      logo: absoluteImage(row.logo_url) || undefined,
      foundingDate: row.established_year ? String(row.established_year) : undefined,
      makesOffer: {
        '@type': 'Offer',
        name: `${name} Franchise Opportunity`,
        description: row.industry ? `Franchise opportunity in ${row.industry}` : undefined,
        price: row.total_investment_min ?? row.franchise_fee,
        priceCurrency: 'INR',
        priceSpecification:
          row.total_investment_min != null || row.total_investment_max != null
            ? {
                '@type': 'PriceSpecification',
                minPrice: row.total_investment_min,
                maxPrice: row.total_investment_max,
                priceCurrency: 'INR',
              }
            : undefined,
      },
      ...(row.verified_at ? { award: 'BizSearch Verified Franchise' } : {}),
    },
    heading: name,
    noindex: false,
  };
}

function businessPage(row) {
  const name = String(row.name || 'Business').trim();
  const path = `/business/${row.slug || row.id}`;
  const description = truncate(
    plainText(row.meta_description || row.description || row.tagline || `View ${name} listed for sale on BizSearch.`),
    160
  );
  return {
    title: String(row.meta_title || `${name} | BizSearch`).replace(/\s+\|\s+BizSearch$/i, '') + ' | BizSearch',
    description,
    canonical: `${SITE_ORIGIN}${path}`,
    image: absoluteImage(row.logo_url, firstImage(row.images)),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${SITE_ORIGIN}${path}`,
      name,
      description: description || undefined,
      image: firstImage(row.images) || undefined,
      address: {
        '@type': 'PostalAddress',
        addressLocality: row.city || undefined,
        addressRegion: row.state || undefined,
        addressCountry: 'IN',
      },
      ...(row.verified_at ? { award: 'BizSearch Verified Business' } : {}),
    },
    heading: name,
    noindex: false,
  };
}

function applyNotFound(html, type) {
  const kind = type === 'business' ? 'Business' : type === 'franchise' ? 'Franchise' : 'Page';
  return applyListingHead(html, {
    title: `${kind} not found | BizSearch`,
    description: 'No details found in the table.',
    canonical: SITE_ORIGIN,
    image: DEFAULT_OG,
    jsonLd: null,
    heading: 'No details found in the table.',
    noindex: true,
  });
}

function applyListingHead(html, page) {
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);
  out = setMeta(out, 'title', page.title, false);
  out = setMeta(out, 'description', page.description, false);
  out = setMeta(out, 'robots', page.noindex ? 'noindex, nofollow' : 'index, follow', false);
  out = setMeta(out, 'og:title', page.title, true);
  out = setMeta(out, 'og:description', page.description, true);
  out = setMeta(out, 'og:url', page.canonical, true);
  out = setMeta(out, 'og:image', page.image, true);
  out = setMeta(out, 'og:type', 'website', true);
  out = setMeta(out, 'twitter:title', page.title, false);
  out = setMeta(out, 'twitter:description', page.description, false);
  out = setMeta(out, 'twitter:image', page.image, false);
  out = setCanonical(out, page.canonical);
  out = upsertJsonLd(out, page.jsonLd);
  out = upsertNoscript(out, page.heading, page.description);
  return out;
}

function setMeta(html, key, value, isProperty) {
  const attr = isProperty ? 'property' : 'name';
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(value)}" />`;
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`, 'i');
  if (re.test(html)) return html.replace(re, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function setCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeAttr(href)}" />`;
  if (/<link\s+rel="canonical"/i.test(html)) {
    return html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, tag);
  }
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertJsonLd(html, schema) {
  const cleaned = html.replace(/<script type="application\/ld\+json" id="prerender-jsonld">[\s\S]*?<\/script>/i, '');
  if (!schema) return cleaned;
  const json = JSON.stringify(schema, (_, value) => (value == null || value === '' ? undefined : value)).replace(
    /</g,
    '\\u003c'
  );
  const tag = `    <script type="application/ld+json" id="prerender-jsonld">${json}</script>\n`;
  return cleaned.replace('</head>', `${tag}  </head>`);
}

function upsertNoscript(html, heading, description) {
  const block = `<noscript><main><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(description)}</p></main></noscript>`;
  const without = html.replace(/<noscript><main>[\s\S]*?<\/main><\/noscript>/, '');
  return without.replace('<div id="root"></div>', `${block}<div id="root"></div>`);
}

function htmlResponse(html, status, cacheControl) {
  const headers = {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': cacheControl,
    'x-content-type-options': 'nosniff',
    'cross-origin-resource-policy': 'same-origin',
    'vary': 'Accept',
  };
  if (status === 404) headers['x-robots-tag'] = 'noindex, nofollow';
  return new Response(html, { status, headers });
}

function firstImage(images) {
  if (Array.isArray(images) && typeof images[0] === 'string') return images[0];
  if (typeof images === 'string' && images.startsWith('http')) return images;
  return '';
}

function absoluteImage(...candidates) {
  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('/')) return `${SITE_ORIGIN}${raw}`;
  }
  return DEFAULT_OG;
}

function plainText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, max) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}
