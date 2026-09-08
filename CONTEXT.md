# OpenCode Go usage extension

A planned Raycast extension for macOS that surfaces the user's OpenCode Go subscription: limit windows, model catalog, and daily picks, in a full view and a menu-bar command.

## Language

**Go key**:
The OpenCode Go credential used to authenticate against the OCG API.
_Avoid_: API key, token, secret

**auth.json**:
The opencode credentials file at `~/.local/share/opencode/auth.json`; the Go key lives under `opencode-go.key` and is the extension's primary key source.
_Avoid_: config, settings file

**Limit windows**:
The three OCG usage windows — rolling 5h ($12), weekly ($30), monthly ($60) — each with a used-percent and a reset time.

**Model catalog**:
The live list of OpenCode Go models with current $/M pricing, sorted by cost, quota, or name.

**Picks**:
The daily model recommendations (stretch quota and best value), computed from current pricing.

**Modality**:
A model's input/output capability — text, image, video, audio — shown as plain text (`in text, image · out text`), sourced from models.dev `modalities`.
_Avoid_: icons for modalities

**Surface**:
One of the two places the extension renders usage: the **full view** (a normal Raycast command) or the **menu-bar command** (pill in the macOS menu bar).

**Failure class**:
The extension's four error states: **no-key**, **bad-key** (401), **no-entitlement** (403), **offline**. No-key/bad-key/no-entitlement show error states; only offline keeps last-known data.