# opencode usage

A [Raycast](https://www.raycast.com) extension for macOS that surfaces your [opencode](https://opencode.ai) usage in two places:

- **Full view** — a normal Raycast command.
- **Menu-bar command** — the OpenCode logo as a pill in the macOS menu bar, refreshed every 60 seconds.

It reports on the opencode product family. Today that is **OpenCode Go** — the subscription surface — and future opencode features may join under the same extension identity.

## Features

- **Limit windows** — the three OpenCode Go usage windows (rolling 5h, weekly, monthly), each with a used-percent and reset time.
- **Model catalog** — the live list of OpenCode Go models with current $/M pricing, sortable by cost, quota, or name.
- **Picks** — daily model recommendations (stretch quota and best value) computed from current pricing.
- **Quota** — per-model estimated request capacity for the rolling 5h window, plugin-estimated.
- **Failure classes** — distinct error states for no key, bad key (401), missing entitlement (403), and offline; offline keeps the last-known data.

## Status

**In development.** This extension is not yet published to the Raycast Store. It works against the OpenCode Go subscription surface, so you need an active subscription (and a Go key) to see data.

## Development

This is a standard Raycast extension (React + TypeScript).

```sh
npm install
npm run dev     # open in Raycast development mode
```

Useful commands:

| Command        | What it does                          |
| -------------- | ------------------------------------- |
| `npm run dev`  | Launch the extension in Raycast dev mode |
| `npm run build`| Build the production bundle           |
| `npm run typecheck` | Type-check with `tsc --noEmit`   |
| `npm test`     | Run the Vitest test suite             |

### Contributing

Contributions are welcome. To contribute:

1. Fork the repository and create a feature branch.
2. Make your change, keeping the extension's domain language consistent (see `CONTEXT.md`).
3. Run `npm run typecheck` and `npm test` before submitting.
4. Open a pull request describing what you changed and why.

Please report bugs and feature requests as GitHub issues. This is a small project, so expect maintainers to review and merge changes directly.

## License

[MIT](./LICENSE)