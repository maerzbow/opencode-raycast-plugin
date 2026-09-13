/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** API Key - Your OpenCode Go API key. */
  "apiKey": string,
  /** Max catalog rows - How many models to show before folding into "other". */
  "maxModels": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `opencode-raycast-plugin` command */
  export type OpencodeRaycastPlugin = ExtensionPreferences & {}
  /** Preferences accessible in the `opencode-raycast-plugin-menu-bar` command */
  export type OpencodeRaycastPluginMenuBar = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `opencode-raycast-plugin` command */
  export type OpencodeRaycastPlugin = {}
  /** Arguments passed to the `opencode-raycast-plugin-menu-bar` command */
  export type OpencodeRaycastPluginMenuBar = {}
}

