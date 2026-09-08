import type { Payload, PricingModel } from "./types";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface CachePolicy {
  pricingTtlMs: number;
  picksTtlMs: number;
  usageTtlMs: number;
}

export const DEFAULT_POLICY: CachePolicy = {
  pricingTtlMs: 24 * 60 * 60 * 1000,
  picksTtlMs: 24 * 60 * 60 * 1000,
  usageTtlMs: 60_000,
};

const KEYS = {
  lastPayload: "ocg.lastPayload",
  pricing: "ocg.pricing",
  picksComputedAt: "ocg.picksComputedAt",
} as const;

interface PricingEntry {
  models: PricingModel[];
  fetchedAt: string;
}

function readJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export class UsageCache {
  constructor(
    private readonly storage: StorageLike,
    private readonly policy: CachePolicy = DEFAULT_POLICY,
  ) {}

  readLastPayload(): Payload | null {
    return readJson<Payload>(this.storage.getItem(KEYS.lastPayload));
  }

  writeLastPayload(payload: Payload): void {
    this.storage.setItem(KEYS.lastPayload, JSON.stringify(payload));
  }

  readPricing(): PricingEntry | null {
    return readJson<PricingEntry>(this.storage.getItem(KEYS.pricing));
  }

  writePricing(models: PricingModel[], fetchedAt: string): void {
    this.storage.setItem(KEYS.pricing, JSON.stringify({ models, fetchedAt }));
  }

  isPricingStale(now: Date): boolean {
    const entry = this.readPricing();
    if (!entry) return true;
    return now.getTime() - new Date(entry.fetchedAt).getTime() > this.policy.pricingTtlMs;
  }

  setPicksComputedAt(iso: string): void {
    this.storage.setItem(KEYS.picksComputedAt, iso);
  }

  isPicksStale(now: Date): boolean {
    const at = this.storage.getItem(KEYS.picksComputedAt);
    if (!at) return true;
    return now.getTime() - new Date(at).getTime() > this.policy.picksTtlMs;
  }

  isUsageStale(payload: Payload, now: Date): boolean {
    return now.getTime() - new Date(payload.updatedAt).getTime() > this.policy.usageTtlMs;
  }
}