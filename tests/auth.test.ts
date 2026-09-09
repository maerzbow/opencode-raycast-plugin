import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveGoKey } from "../src/lib/auth";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ocg-auth-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function authPath(contents: string): string {
  const p = join(dir, "auth.json");
  writeFileSync(p, contents);
  return p;
}

describe("resolveGoKey", () => {
  it("reads the opencode-go key from auth.json", async () => {
    const p = authPath(JSON.stringify({ "opencode-go": { type: "api", key: "abc123" } }));
    expect(await resolveGoKey({ authJsonPath: p, prefKey: null })).toBe("abc123");
  });

  it("returns null when auth.json is missing and no pref is set", async () => {
    expect(await resolveGoKey({ authJsonPath: join(dir, "missing.json"), prefKey: null })).toBeNull();
  });

  it("falls back to the preference when auth.json has no opencode-go entry", async () => {
    const p = authPath(JSON.stringify({ anthropic: { key: "x" } }));
    expect(await resolveGoKey({ authJsonPath: p, prefKey: "prefkey" })).toBe("prefkey");
  });

  it("prefers the auth.json key over the preference", async () => {
    const p = authPath(JSON.stringify({ "opencode-go": { key: "authed" } }));
    expect(await resolveGoKey({ authJsonPath: p, prefKey: "prefkey" })).toBe("authed");
  });

  it("falls back to the preference on invalid JSON", async () => {
    const p = authPath("{ not json ");
    expect(await resolveGoKey({ authJsonPath: p, prefKey: "prefkey" })).toBe("prefkey");
  });

  it("treats an empty preference as absent", async () => {
    const p = authPath(JSON.stringify({ some: "provider" }));
    expect(await resolveGoKey({ authJsonPath: p, prefKey: "  " })).toBeNull();
  });

  it("treats an empty opencode-go key as absent and uses the preference", async () => {
    const p = authPath(JSON.stringify({ "opencode-go": { key: "" } }));
    expect(await resolveGoKey({ authJsonPath: p, prefKey: "prefkey" })).toBe("prefkey");
  });
});