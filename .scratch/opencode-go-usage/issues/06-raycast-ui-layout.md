# Raycast UI layout

Status: open
Type: prototype
Blocked by: 03

## Question

How should the full Raycast command lay out the OpenCode Go view, given the component capabilities from **Raycast extension scaffold and store conventions**?

Build a cheap, rough prototype (stub UI or component sketch) to react to. It should resolve:

- Command structure: one main command or several (e.g. separate "Go limits" / "Catalog" / "Picks" commands vs one command with sections)? Search/filter behavior?
- How each surface renders: limit windows as rows with progress + reset countdown (accessoryTitle/icons?), the model catalog sorted by cost/quota/name with $/M pricing and "other" folding, and picks placement.
- Detail view vs pure list; markdown Detail for per-model or window drill-down, or skip.
- Actions: force refresh, open opencode.ai/go, open Extension Preferences, copy a value.
- What the empty/error/loading states look like (deferred detail to **Auth and key handling**'s outcomes).

Link the prototype as an asset from this ticket.
