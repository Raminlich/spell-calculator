import { parseSnapshot, type WorkspaceSnapshot } from "../lib/persistence";

interface Env {
  WORKSPACE_KV: KVNamespace;
  ASSETS: Fetcher;
}

/** Single shared save for the whole app (home ↔ work sync). */
const DATA_KEY = "app:data";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin");
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function withCors(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function handleDataApi(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method === "OPTIONS") {
    return withCors(request, new Response(null, { status: 204 }));
  }

  if (request.method === "GET") {
    const raw = await env.WORKSPACE_KV.get(DATA_KEY);
    if (!raw) {
      return withCors(request, jsonResponse({ error: "Not found" }, 404));
    }
    try {
      const snapshot = parseSnapshot(JSON.parse(raw));
      if (!snapshot) {
        return withCors(request, jsonResponse({ error: "Corrupt save" }, 500));
      }
      return withCors(request, jsonResponse(snapshot));
    } catch {
      return withCors(request, jsonResponse({ error: "Corrupt save" }, 500));
    }
  }

  if (request.method === "PUT") {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return withCors(request, jsonResponse({ error: "Invalid JSON" }, 400));
    }

    const snapshot = parseSnapshot(body);
    if (!snapshot) {
      return withCors(request, jsonResponse({ error: "Invalid save" }, 400));
    }

    if (snapshot.version !== 1) {
      return withCors(request, jsonResponse({ error: "Unsupported version" }, 400));
    }

    await env.WORKSPACE_KV.put(DATA_KEY, JSON.stringify(snapshot as WorkspaceSnapshot));
    return withCors(request, jsonResponse({ savedAt: snapshot.savedAt }));
  }

  return withCors(
    request,
    jsonResponse({ error: "Method not allowed" }, 405)
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/data" || url.pathname === "/api/data/") {
      return handleDataApi(request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
