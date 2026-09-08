import { describe, expect, it } from "vitest";
import { DEFAULT_POLICY, UsageCache } from "../src/lib/cache";
import type { Payload, PricingModel } from "../src/lib/types";
import { MemoryStorage } from "./helpers/memory-storage";

const T0 = new Date("2026-09-08T10:00:00Z");
const HOUR = 60 * 60 * 1000;

function payload(updatedAt: string): Payload {
  return {
    windows: {
      rolling: { status: "ok", percent: 42, resetsAt: "x" },
      weekly: { status: "ok", percent: 31, resetsAt: "x" },
      monthly: { status: "ok", percent: 18, resetsAt: "x" },
    },
    models: [],
    picks: { stretch: null, bestValue: null, computedAt: updatedAt },
    updatedAt,
    offline: false,
  };
}

describe("last payload", () => {
  it("round-trips the last-known payload", () => {
    const cache = new UsageCache(new MemoryStorage());
    expect(cache.readLastPayload()).toBeNull();
    cache.writeLastPayload(payload(T0.toISOString()));
    expect(cache.readLastPayload()?.updatedAt).toBe(T0.toISOString());
  });

  it("returns null on corrupt stored JSON", () => {
    const storage = new MemoryStorage();
    storage.setItem("ocg.lastPayload", "{oops");
    expect(new UsageCache(storage).readLastPayload()).toBeNull();
  });
});

describe("pricing TTL", () => {
  it("treats missing pricing as stale", () => {
    const cache = new UsageCache(new MemoryStorage());
    expect(cache.isPricingStale(T0)).toBe(true);
  });

  it("is stale only after the 24h TTL", () => {
    const cache = new UsageCache(new MemoryStorage());
    cache.writePricing([], T0.toISOString());
    expect(cache.isPricingStale(new Date(T0.getTime() + 23 * HOUR))).toBe(false);
    expect(cache.isPricingStale(new Date(T0.getTime() + 25 * HOUR))).toBe(true);
  });

  it("round-trips pricing models", () => {
    const cache = new UsageCache(new MemoryStorage());
    const models: PricingModel[] = [{ id: "m1", cost: { input: 1, output: 2, cacheRead: 0 }, modalities: null }];
    cache.writePricing(models, T0.toISOString());
    expect(cache.readPricing()?.models[0].id).toBe("m1");
  });
});

describe("picks TTL", () => {
  it("recomputes picks when the 24h timestamp is missing or expired", () => {
    const cache = new UsageCache(new MemoryStorage());
    expect(cache.isPicksStale(T0)).toBe(true);
    cache.setPicksComputedAt(T0.toISOString());
    expect(cache.isPicksStale(new Date(T0.getTime() + 23 * HOUR))).toBe(false);
    expect(cache.isPicksStale(new Date(T0.getTime() + 25 * HOUR))).toBe(true);
  });
});

describe("usage staleness", () => {
  it("treats a payload as stale after the 60s usage TTL", () => {
    const cache = new UsageCache(new MemoryStorage());
    const p = payload(T0.toISOString());
    expect(cache.isUsageStale(p, new Date(T0.getTime() + 30_000))).toBe(false);
    expect(cache.isUsageStale(p, new Date(T0.getTime() + 70_000))).toBe(true);
  });
});

describe("DEFAULT_POLICY", () => {
  it("uses 24h for pricing and picks, 60s for usage", () => {
    expect(DEFAULT_POLICY).toEqual({ pricingTtlMs: 24 * HOUR, picksTtlMs: 24 * HOUR, usageTtlMs: 60_000 });
  });
});