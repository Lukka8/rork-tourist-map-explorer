const BASE_URL = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || process.env.API_BASE_URL || '';

async function proxyFetch(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const pathAndQuery = `${url.pathname}${url.search}`;

    if (!BASE_URL) {
      return new Response(JSON.stringify({ error: 'API base URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const target = `${BASE_URL}${pathAndQuery}`;
    const headers: Record<string, string> = {};

    request.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'host') return;
      headers[key] = value;
    });

    const init: RequestInit = {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method.toUpperCase()) ? undefined : await request.clone().text(),
    };

    const res = await fetch(target, init);
    const resHeaders = new Headers();
    res.headers.forEach((value, key) => resHeaders.set(key, value));

    return new Response(res.body, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (error) {
    console.log('[API PROXY] Proxy error', error);
    return new Response(JSON.stringify({ error: 'Proxy request failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

const api = { fetch: proxyFetch } as const;

export default api;
