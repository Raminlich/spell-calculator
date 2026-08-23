const WORKSPACE_ID_KEY = "spell-calculator:workspace-id";
export const WORKSPACE_URL_PARAM = "workspace";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidWorkspaceId(id: string): boolean {
  return UUID_RE.test(id);
}

export function getWorkspaceIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const param = new URLSearchParams(window.location.search).get(
    WORKSPACE_URL_PARAM
  );
  if (param && isValidWorkspaceId(param)) return param;
  return null;
}

function syncWorkspaceIdToUrl(id: string): void {
  const url = new URL(window.location.href);
  if (url.searchParams.get(WORKSPACE_URL_PARAM) === id) return;
  url.searchParams.set(WORKSPACE_URL_PARAM, id);
  window.history.replaceState(null, "", url.toString());
}

/** Resolve workspace id from URL, localStorage, or create a new one. */
export function ensureWorkspaceId(): string {
  const fromUrl = getWorkspaceIdFromUrl();
  if (fromUrl) {
    window.localStorage.setItem(WORKSPACE_ID_KEY, fromUrl);
    return fromUrl;
  }

  const stored = window.localStorage.getItem(WORKSPACE_ID_KEY);
  if (stored && isValidWorkspaceId(stored)) {
    syncWorkspaceIdToUrl(stored);
    return stored;
  }

  const id = crypto.randomUUID();
  window.localStorage.setItem(WORKSPACE_ID_KEY, id);
  syncWorkspaceIdToUrl(id);
  return id;
}

export function workspaceHref(pathname: string, workspaceId: string): string {
  const base = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${base}?${WORKSPACE_URL_PARAM}=${encodeURIComponent(workspaceId)}`;
}

export function copyWorkspaceUrl(workspaceId: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set(WORKSPACE_URL_PARAM, workspaceId);
  return url.toString();
}
