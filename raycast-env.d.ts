/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Go key (fallback) - OpenCode Go key. Only used when ~/.local/share/opencode/auth.json has no opencode-go entry. */
  "goKey"?: string,
  /** Max catalog rows - How many models to show before folding into "other". */
  "maxModels": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `opencode-usage` command */
  export type OpencodeUsage = ExtensionPreferences & {}
  /** Preferences accessible in the `opencode-usage-menu-bar` command */
  export type OpencodeUsageMenuBar = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `opencode-usage` command */
  export type OpencodeUsage = {}
  /** Arguments passed to the `opencode-usage-menu-bar` command */
  export type OpencodeUsageMenuBar = {}
}

