# Map: OpenCode Go usage for Raycast

## Destination

A decided, build-ready spec for one Raycast extension in this repo that surfaces the user's **OpenCode Go** subscription on macOS: the three **limit windows** (rolling 5h / weekly / monthly) with progress and reset countdowns, the **model catalog** with current $/M pricing, and the daily **picks** — shown both in a normal Raycast command and in a Raycast **menu-bar command** (icon + live limit text + dropdown). The key is reused from `~/.local/share/opencode/auth.json`. The map is done when nothing is left to decide before someone builds the extension.

## Notes

- **Reference to mirror:** ardfard/omarchy-opencode-usage (Omarchy bar widget). Its `collector.sh`, `Model.js`, `Panel.qml`, `Service.qml` define the data flow and behavior to replicate; read them before any design ticket.
- **Data sources:** `https://opencode.ai/zen/go/v1/usage` and `/models` (Bearer key); pricing from `https://models.dev/api.json` under `opencode-go`. OpenCode Go product docs at https://opencode.ai/docs/go/.
- **Standing preferences (settled pre-map):** planning-first (map ends in decisions/spec, build is a follow-up); full parity with the reference (windows + catalog + picks); one extension covering both surfaces (menu-bar presence is a Raycast menu-bar command unless research forbids); key auto-read from auth.json with paste-key fallback; private/local scope, but scaffolded Store-compatible.
- **Working style:** one ticket resolved per session (research excepted, resolved by subagents). Tickets worked with a human go through grilling + domain-modeling; UI-shape questions are prototypes. Decisions live in their ticket only; the map never restates, only gists and links.
- **Repo state:** this repo is an empty scaffold (no code yet); `.scratch/` is the tracker, all under the local-markdown convention in `docs/agents/issue-tracker.md`.

## Decisions so far

<!-- the index: one line per closed ticket, enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [Raycast menu-bar command limits](issues/01-raycast-menu-bar-command-limits.md): `MenuBarExtra` is a supported macOS command type; dynamic title+icon re-render per launch/background/menu-click; refresh floor 10s (practical ~30s–1m) via manifest `interval` + background refresh; extensions aren't sandboxed so reading auth.json + calling the API is fine.
- [OCG API and pricing schema](issues/02-ocg-api-and-pricing-schema.md): `/usage` returns rolling/weekly/monthly windows each as `{status, percent, resetsAt}` (no dollar amounts; caps are $12/$30/$60 from docs); key lives at `~/.local/share/opencode/auth.json` → `opencode-go.key` (macOS = Linux); `/models` is public; pricing from models.dev `opencode-go.models` (no promos); errors classify as no-key / 401 bad-key / 403 no-entitlement / offline.
- [Raycast extension scaffold and store conventions](issues/03-raycast-extension-scaffold-conventions.md): scaffold with `create-raycast-extension`; `@raycast/api` latest 2.2.1; `List`/`Detail`/`MenuBarExtra`/`getProgressIcon`/`Cache`/`launchCommand` are the building blocks; background refresh via manifest `interval` (floor 10s), off by default on Store; strict TS.
- [Reference plugin behavior spec](issues/04-reference-plugin-behavior-spec.md): windows are OCG-native, quota is plugin-estimated (`floor($12 ÷ costPerTurn)` with 830/71.5K/295 token turn); picks = stretch + best-value (Muse Spark excluded, ≤1/day); defaults interval 3600s / maxModels 12 / sortBy cost; 32px icon pill with hover `5h · Weekly · Monthly`; silent failure + in-memory only.

## Not yet specified

- Degraded-mode UX: what each surface shows when there is no key, an invalid key, or no network (now groundable — errors classify as no-key / bad-key / no-entitlement / offline — sharpened when **Auth and key handling** resolves).
- Pricing-cache staleness and refresh-cadence defaults per surface (models.dev is slow-moving/cacheable; menu-bar floor is 10s but practical ~30s–1m; whether cadence differs by surface).
- Whether catalog row counts, "other" folding, and default sort on Mac mirror the reference's `maxModels`/`sortBy` exactly or get Mac defaults (partly sharpened by the behavior spec — defaults interval 3600 / maxModels 12 / sortBy cost).
- Naming, icon, and branding assets for the extension (last, only after surface decisions).

## Out of scope

- Tracking the user's own non-Go token/cost spend (opencode sessions/costs) — a different product from OCG subscription limits.
- Notifications when nearing limits.
- Cross-device sync of state.
- Raycast Store publishing for now (scaffold stays Store-compatible, that's all).
- Supporting agents other than opencode against the shared Go key.
