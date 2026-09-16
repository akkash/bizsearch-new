/**
 * `/` is served from static index.html (filesystem wins over rewrites),
 * and that static HTML is what sent Access-Control-Allow-Origin: *.
 * Middleware runs before the filesystem, so the homepage can use Edge prerender.
 * Do not match /index.html — prerender loads the shell from that path.
 */
export const config = {
  matcher: ['/'],
};

export default async function middleware(request) {
  const dest = new URL('/api/prerender?type=page&path=home', request.url);
  const incoming = new Headers(request.headers);
  incoming.set('accept', 'text/html');
  incoming.delete('host');
  const res = await fetch(dest, {
    method: 'GET',
    headers: incoming,
    redirect: 'manual',
  });
  const headers = new Headers(res.headers);
  headers.delete('access-control-allow-origin');
  headers.delete('Access-Control-Allow-Origin');
  return new Response(res.body, { status: res.status, headers });
}
