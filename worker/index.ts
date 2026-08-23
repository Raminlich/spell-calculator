import { parseSnapshot, type WorkspaceSnapshot } from "../lib/persistence";

interface Env {
  WORKSPACE_KV: KVNamespace;
  ASSETS: Fetcher;
}

const WORKSPACE_PREFIX = "workspace:";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function workspaceKey(id: string): string {
  return `${WORKSPACE_PREFIX}${id}`;
}

function isValidWorkspaceId(id: string): boolean {
  return UUID_RE.test(id);
}

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

async function handleWorkspaceApi(
  request: Request,
  env: Env,
  url: URL
): Promise<Response> {
  if (request.method === "OPTIONS") {
    return withCors(request, new Response(null, { status: 204 }));
  }

  const match = url.pathname.match(/^\/api\/workspace\/([^/]+)\/?$/);
  if (!match) {
    return withCors(request, jsonResponse({ error: "Not found" }, 404));
  }

  const id = decodeURIComponent(match[1]);
  if (!isValidWorkspaceId(id)) {
    return withCors(request, jsonResponse({ error: "Invalid workspace id" }, 400));
  }

  const key = workspaceKey(id);

  if (request.method === "GET") {
    const raw = await env.WORKSPACE_KV.get(key);
    if (!raw) {
      return withCors(request, jsonResponse({ error: "Not found" }, 404));
    }
    try {
      const snapshot = parseSnapshot(JSON.parse(raw));
      if (!snapshot) {
        return withCors(request, jsonResponse({ error: "Corrupt workspace" }, 500));
      }
      return withCors(request, jsonResponse(snapshot));
    } catch {
      return withCors(request, jsonResponse({ error: "Corrupt workspace" }, 500));
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
      return withCors(request, jsonResponse({ error: "Invalid workspace" }, 400));
    }

    if (snapshot.version !== 1) {
      return withCors(request, jsonResponse({ error: "Unsupported version" }, 400));
    }

    await env.WORKSPACE_KV.put(key, JSON.stringify(snapshot as WorkspaceSnapshot));
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

    if (url.pathname.startsWith("/api/workspace")) {
      return handleWorkspaceApi(request, env, url);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
