import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabaseProxyUrl = import.meta.env.VITE_SUPABASE_PROXY_URL?.replace(/\/$/, '');

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('G12 Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
}

const projectHost = (() => {
  try { return new URL(supabaseUrl).host; } catch { return null; }
})();

const gatewayFetch = async (input, init) => {
  const requestUrl = typeof input === 'string' ? input : input?.url;
  if (!supabaseProxyUrl || !projectHost || !requestUrl) return fetch(input, init);
  let parsed;
  try { parsed = new URL(requestUrl); } catch { return fetch(input, init); }
  const shouldProxy = parsed.host === projectHost &&
    ['/auth/v1/','/rest/v1/','/storage/v1/','/functions/v1/'].some((prefix) => parsed.pathname.startsWith(prefix));
  if (!shouldProxy) return fetch(input, init);
  const proxied = new URL(supabaseProxyUrl + parsed.pathname + parsed.search);
  return fetch(proxied, init);
};

const supabase = createClient(
  supabaseUrl || 'https://invalid.supabase.co',
  supabasePublishableKey || 'invalid-public-key',
  {
    auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true },
    global: { fetch: gatewayFetch }
  }
);

export default supabase;
