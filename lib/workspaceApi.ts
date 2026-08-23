import { parseSnapshot, type WorkspaceSnapshot } from "@/lib/persistence";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

function workspaceUrl(id: string): string {
  return `${API_BASE}/api/workspace/${encodeURIComponent(id)}`;
}

export async function fetchWorkspaceFromServer(
  id: string
): Promise<WorkspaceSnapshot | "missing" | "error"> {
  try {
    const response = await fetch(workspaceUrl(id), {
      method: "GET",
      cache: "no-store",
    });
    if (response.status === 404) return "missing";
    if (!response.ok) return "error";
    const json: unknown = await response.json();
    const snapshot = parseSnapshot(json);
    return snapshot ?? "error";
  } catch {
    return "error";
  }
}

export async function saveWorkspaceToServer(
  id: string,
  snapshot: WorkspaceSnapshot
): Promise<boolean> {
  try {
    const response = await fetch(workspaceUrl(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
    return response.ok;
  } catch {
    return false;
  }
}
