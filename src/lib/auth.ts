import { readFileSync } from "node:fs";

export interface ResolveKeyOptions {
  authJsonPath: string;
  prefKey: string | null;
}

export function readAuthJson(path: string): Record<string, unknown> | null {
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function extractGoKey(auth: Record<string, unknown> | null): string | null {
  const entry = auth?.["opencode-go"];
  if (!entry || typeof entry !== "object") return null;
  const key = (entry as Record<string, unknown>).key;
  return typeof key === "string" && key.trim().length > 0 ? key : null;
}

export function resolveGoKey({ authJsonPath, prefKey }: ResolveKeyOptions): string | null {
  const fromAuth = extractGoKey(readAuthJson(authJsonPath));
  if (fromAuth) return fromAuth;
  if (prefKey && prefKey.trim().length > 0) return prefKey.trim();
  return null;
}