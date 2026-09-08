import { ApiError } from "./api";
import { UsageCache } from "./cache";
import { picksFor, quotaFor } from "./quota";
import type { CollectResult, Failure, Model, Payload, PricingModel, Usage } from "./types";

export interface CollectorDeps {
  resolveKey: () => string | null;
  fetchUsage: (key: string) => Promise<Usage>;
  fetchCatalog: () => Promise<string[]>;
  fetchPricing: () => Promise<PricingModel[]>;
  cache: UsageCache;
  now: () => Date;
}

export interface CollectOptions {
  force?: boolean;
}

function fail(type: Failure["type"], message: string): CollectResult {
  return { ok: false, failure: { type, message } };
}

function buildModels(ids: string[], pricing: PricingModel[]): Model[] {
  const byId = new Map(pricing.map((p) => [p.id, p]));
  return ids.map((id) => {
    const p = byId.get(id);
    if (!p) return { id, cost: null, modalities: null, quota: null, isPick: null };
    return { id, cost: p.cost, modalities: p.modalities, quota: quotaFor(p.cost), isPick: null };
  });
}

function byQuotaDesc(a: Model, b: Model): number {
  return (b.quota ?? -1) - (a.quota ?? -1) || a.id.localeCompare(b.id);
}

function tagPicks(models: Model[], picks: Payload["picks"]): Model[] {
  return models.map((m) => {
    if (m.id === picks?.stretch) return { ...m, isPick: "stretch" as const };
    if (m.id === picks?.bestValue) return { ...m, isPick: "best-value" as const };
    return m;
  });
}

export async function collect(deps: CollectorDeps, opts: CollectOptions = {}): Promise<CollectResult> {
  const now = deps.now();
  const key = deps.resolveKey();
  if (!key) {
    return fail("no-key", "No OpenCode Go key found. Run opencode /connect, or paste a key in Extension Preferences.");
  }

  if (!opts.force) {
    const cached = deps.cache.readLastPayload();
    if (cached && !deps.cache.isUsageStale(cached, now)) {
      return { ok: true, payload: cached, fromCache: true };
    }
  }

  let usage: Usage;
  try {
    usage = await deps.fetchUsage(key);
  } catch (err) {
    if (err instanceof ApiError && (err.kind === "bad-key" || err.kind === "no-entitlement")) {
      return fail(err.kind, err.message);
    }
    const cached = deps.cache.readLastPayload();
    if (cached) return { ok: true, payload: { ...cached, offline: true }, fromCache: true };
    return fail("offline", "Can't reach the OpenCode Go API.");
  }

  let ids: string[];
  try {
    ids = await deps.fetchCatalog();
  } catch {
    ids = deps.cache.readLastPayload()?.models.map((m) => m.id) ?? [];
  }

  let pricing = deps.cache.readPricing()?.models ?? [];
  if (deps.cache.isPricingStale(now)) {
    try {
      pricing = await deps.fetchPricing();
      deps.cache.writePricing(pricing, now.toISOString());
    } catch {
      // keep whatever pricing we have (stale is better than none)
    }
  }

  const models = buildModels(ids, pricing).sort(byQuotaDesc);

  let picks = deps.cache.readLastPayload()?.picks ?? null;
  if (deps.cache.isPicksStale(now) || !picks) {
    picks = picksFor(models, now);
    deps.cache.setPicksComputedAt(now.toISOString());
  }

  const payload: Payload = {
    windows: usage,
    models: tagPicks(models, picks),
    picks,
    updatedAt: now.toISOString(),
    offline: false,
  };
  deps.cache.writeLastPayload(payload);
  return { ok: true, payload, fromCache: false };
}