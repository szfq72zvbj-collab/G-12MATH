import http from 'node:http';

const PORT = Number(process.env.PORT || 10000);
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

if (!SUPABASE_URL) throw new Error('SUPABASE_URL is required');
const supabase = new URL(SUPABASE_URL);
if (!supabase.hostname.endsWith('.supabase.co')) {
  throw new Error('SUPABASE_URL must point to a *.supabase.co project');
}

const HOP_BY_HOP = new Set([
  'connection','keep-alive','proxy-authenticate','proxy-authorization',
  'te','trailer','transfer-encoding','upgrade'
]);
const ALLOWED_PREFIXES = ['/auth/v1/','/rest/v1/','/storage/v1/','/functions/v1/'];
const isAllowedPath = (pathname) => ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGIN === '*' ? '*' : origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': 'authorization,apikey,content-type,x-client-info,x-supabase-api-version,prefer,range,accept-profile,content-profile',
    'access-control-expose-headers': 'content-range,content-location,location,apikey,x-request-id',
    'access-control-max-age': '86400',
    vary: 'Origin'
  };
}

function copyResponseHeaders(upstream) {
  const headers = {};
  for (const [key, value] of upstream.headers) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers[key] = value;
  }
  return headers;
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) { res.writeHead(400); res.end('Bad Request'); return; }
    if (req.method === 'GET' && req.url.split('?')[0] === '/') {
      res.writeHead(200, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        ...corsHeaders(req.headers.origin)
      });
      res.end(JSON.stringify({ ok:true, service:'g12math-supabase-gateway' }));
      return;
    }
    if (req.method === 'OPTIONS') { res.writeHead(204, corsHeaders(req.headers.origin)); res.end(); return; }
    const incoming = new URL(req.url, 'http://render.internal');
    if (!isAllowedPath(incoming.pathname)) {
      res.writeHead(404, { 'content-type':'application/json; charset=utf-8', ...corsHeaders(req.headers.origin) });
      res.end(JSON.stringify({ error:'Not found' }));
      return;
    }
    const target = new URL(incoming.pathname + incoming.search, supabase);
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const headers = new Headers();
    for (const [key,value] of Object.entries(req.headers)) {
      if (!value || HOP_BY_HOP.has(key.toLowerCase()) || key.toLowerCase() === 'host') continue;
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
    headers.set('x-g12math-gateway','1');
    const upstream = await fetch(target, {
      method:req.method, headers,
      body:['GET','HEAD'].includes(req.method) ? undefined : body,
      redirect:'manual'
    });
    res.writeHead(upstream.status, { ...copyResponseHeaders(upstream), ...corsHeaders(req.headers.origin) });
    if (req.method === 'HEAD') { res.end(); return; }
    for await (const chunk of upstream.body ?? []) res.write(chunk);
    res.end();
  } catch (error) {
    console.error('Gateway error:', error);
    res.writeHead(502, { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', ...corsHeaders(req.headers.origin) });
    res.end(JSON.stringify({ error:'Upstream request failed', message:error instanceof Error ? error.message : 'Unknown error' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('G-12MATH gateway listening on 0.0.0.0:' + PORT);
});
