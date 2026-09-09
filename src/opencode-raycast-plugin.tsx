import { useState } from "react";
import { Action, ActionPanel, Clipboard, Icon, List, open, openExtensionPreferences } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { foldModels } from "./lib/catalog";
import { PICK_COLOR, PICK_ICON, pickLabel, progressIcon, windowRows } from "./lib/display";
import { modalityText, moneyPerMillion } from "./lib/format";
import { isKeyProblem } from "./lib/types";
import type { Failure } from "./lib/types";
import { collectUsage, maxModelsFromPreferences, readInitialPayload } from "./lib/usage";

function ErrorView({ failure, onRefresh }: { failure: Failure; onRefresh: () => void }) {
  const keyProblem = isKeyProblem(failure.type);
  const description: Record<Failure["type"], string | undefined> = {
    "no-key": "Run opencode /connect, or paste a key in Extension Preferences.",
    "bad-key": "Re-run opencode /connect, or paste a new key.",
    "no-entitlement": "An OpenCode Go subscription is required.",
    offline: undefined,
  };
  return (
    <List>
      <List.EmptyView
        icon={Icon.Warning}
        title={failure.message}
        description={description[failure.type]}
        actions={
          <ActionPanel>
            {keyProblem && (
              <Action title="Open Extension Preferences" icon={Icon.Gear} onAction={() => openExtensionPreferences()} />
            )}
            <Action title="Force refresh" icon={Icon.RotateClockwise} onAction={onRefresh} />
          </ActionPanel>
        }
      />
    </List>
  );
}

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const { data, isLoading, mutate } = useCachedPromise(() => collectUsage(false), [], {
    initialData: readInitialPayload(),
    keepPreviousData: true,
  });

  const refresh = () => mutate(collectUsage(true), { shouldRevalidateAfter: false });

  if (!data) {
    return <List isLoading={isLoading} searchBarPlaceholder="Loading opencode usage…" />;
  }

  if (!data.ok) {
    return <ErrorView failure={data.failure} onRefresh={refresh} />;
  }

  const { payload } = data;
  const maxModels = maxModelsFromPreferences();
  const { models: visibleModels, folded } = foldModels(payload.models, maxModels, searchText);
  const rows = windowRows(payload.windows, new Date());

  return (
    <List
      isLoading={isLoading}
      filtering={true}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search models, limits, picks…"
      navigationTitle="opencode usage"
    >
      {payload.offline && <List.Item icon={Icon.Cloud} title="Offline · showing last-known data" />}
      <List.Section title="Go limits">
        {rows.map((r) => (
          <List.Item key={r.key} icon={progressIcon(r.pct)} title={r.title} subtitle={r.subtitle} />
        ))}
      </List.Section>

      <List.Section title="Model catalog">
        {visibleModels.map((m) => {
          const cost = m.cost;
          return (
            <List.Item
              key={m.id}
              icon={m.isPick ? PICK_ICON[m.isPick] : Icon.Bolt}
              title={m.id}
              subtitle={modalityText(m.modalities)}
              accessories={[
                ...(cost ? [{ text: `${moneyPerMillion(cost.input)}/${moneyPerMillion(cost.output)}` }] : []),
                ...(m.quota != null ? [{ text: `~${m.quota} req/5h` }] : []),
                ...(m.isPick
                  ? [
                      {
                        tag: {
                          value: pickLabel(m.isPick),
                          color: PICK_COLOR[m.isPick],
                        },
                      },
                    ]
                  : []),
              ]}
              actions={
                <ActionPanel>
                  {cost && (
                    <Action
                      title="Copy price"
                      icon={Icon.Clipboard}
                      onAction={() =>
                        Clipboard.copy(`${m.id}: ${moneyPerMillion(cost.input)} in / ${moneyPerMillion(cost.output)} out`)
                      }
                    />
                  )}
                  <Action title="Open in browser" icon={Icon.Globe} onAction={() => open("https://opencode.ai")} />
                  <Action title="Force refresh" icon={Icon.RotateClockwise} onAction={refresh} />
                  <Action title="Open Extension Preferences" icon={Icon.Gear} onAction={() => openExtensionPreferences()} />
                </ActionPanel>
              }
            />
          );
        })}
        {folded > 0 && (
          <List.Item
            icon={Icon.Ellipsis}
            title={`and ${folded} more models (folded)`}
            subtitle="Type to search all models"
            actions={
              <ActionPanel>
                <Action title="Force refresh" icon={Icon.RotateClockwise} onAction={refresh} />
              </ActionPanel>
            }
          />
        )}
      </List.Section>
    </List>
  );
}