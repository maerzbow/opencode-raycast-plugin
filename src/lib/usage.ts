import { getPreferenceValues } from "@raycast/api";
import { homedir } from "node:os";
import { join } from "node:path";
import { resolveGoKey } from "./auth";
import { fetchCatalog, fetchPricing, fetchUsage } from "./api";
import { UsageCache } from "./cache";
import { collect, type CollectorDeps } from "./collector";
import { createSyncedStorage } from "./storage";
import type { CollectResult } from "./types";

export interface Preferences {
  goKey?: string;
  maxModels?: string;
}

const BASE_URL = "https://opencode.ai/zen/go/v1";
const MODELS_DEV = "https://models.dev/api.json";
const AUTH_JSON = join(homedir(), ".local/share/opencode/auth.json");

export function maxModelsFromPreferences(): number {
  const raw = getPreferenceValues<Preferences>().maxModels;
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 12;
}

function makeDeps(): CollectorDeps {
  const storage = createSyncedStorage();
  return {
    resolveKey: () => resolveGoKey({ authJsonPath: AUTH_JSON, prefKey: getPreferenceValues<Preferences>().goKey ?? null }),
    fetchUsage: (key) => fetchUsage(key, BASE_URL),
    fetchCatalog: () => fetchCatalog(BASE_URL),
    fetchPricing: () => fetchPricing(MODELS_DEV),
    cache: new UsageCache(storage),
    now: () => new Date(),
  };
}

// Synchronous read of the last-known payload — renders instantly on first paint.
export function readInitialPayload(): CollectResult | undefined {
  const payload = new UsageCache(createSyncedStorage()).readLastPayload();
  return payload ? { ok: true, payload, fromCache: true } : undefined;
}

export async function collectUsage(force = false): Promise<CollectResult> {
  return collect(makeDeps(), { force });
}