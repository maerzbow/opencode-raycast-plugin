# Auth and key handling

Status: open
Type: grilling
Blocked by: 02

## Question

How should the extension obtain and manage the OpenCode Go key, and what should each failure mode look like?

Ground this on the facts from **OCG API and pricing schema** (key file path on macOS, auth header, error semantics). Decide:

- Auto-read `~/.local/share/opencode/auth.json` (parse `opencode-go.key`) at fetch time, versus storing a copy in a Raycast secure preference, versus both (auth.json wins, pref is an override/fallback). Where in the flow is the key read?
- Refresh semantics when the key file appears or changes (e.g. after the user runs opencode `/connect`) — does the extension pick it up without reconfiguration?
- Failure modes and their UX: file missing / key missing / key invalid (401) / network offline. Per mode: what each surface (full view, menu bar) shows, and whether the extension should hint at `/connect` or opening Extension Preferences.
- Whether reading `~/.local/share/opencode/auth.json` raises macOS sandbox/permission concerns for a Raycast extension, and if so, the workaround.

Record the decision in the ticket; this feeds every other design ticket's error-state work.
