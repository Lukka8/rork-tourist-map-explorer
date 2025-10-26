const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

async function forward(request: Request) {
  if (!baseUrl) {
    return new Response(JSON.stringify({ error: 'Missing EXPO_PUBLIC_RORK_API_BASE_URL' }), { status: 500 });
  }

  const incomingUrl = new URL(request.url);
  const target = `${baseUrl.replace(/\/$/, '')}${incomingUrl.pathname}${incomingUrl.search}`;

  const init: RequestInit = {
    method: request.method,
    headers: request.headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.clone().arrayBuffer().then((b) => new Uint8Array(b)) as any,
    redirect: 'manual',
  };

  try {
    const res = await fetch(target, init);
    return res;
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Proxy error', details: e instanceof Error ? e.message : String(e) }), { status: 502 });
  }
}

export async function GET(request: Request) {
  return forward(request);
}

export async function POST(request: Request) {
  return forward(request);
}

export async function PUT(request: Request) {
  return forward(request);
}

export async function DELETE(request: Request) {
  return forward(request);
}

export async function PATCH(request: Request) {
  return forward(request);
}
