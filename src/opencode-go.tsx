import { Action, ActionPanel, Clipboard, Icon, List, open, openExtensionPreferences } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { PICK_COLOR, PICK_ICON, pickLabel, progressIcon, windowRows } from "./lib/display";
import { modalityText, moneyPerMillion } from "./lib/format";
import { isKeyProblem } from "./lib/types";
import type { Failure, Payload } from "./lib/types";
import { collectUsage, maxModelsFromPreferences } from "./lib/usage";

type State =
  | { status: "loading" }
  | { status: "error"; failure: Failure }
  | { status: "ready"; payload: Payload };

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
  const [state, setState] = useState<State>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const forceRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    collectUsage(forceRef.current).then((result) => {
      if (cancelled) return;
      setState(result.ok ? { status: "ready", payload: result.payload } : { status: "error", failure: result.failure });
    });
    forceRef.current = false;
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refresh = () => {
    forceRef.current = true;
    setReloadKey((k) => k + 1);
  };

  if (state.status === "loading") {
    return <List isLoading={true} searchBarPlaceholder="Loading OpenCode Go…" />;
  }
  if (state.status === "error") {
    return <ErrorView failure={state.failure} onRefresh={refresh} />;
  }

  const { payload } = state;
  const maxModels = maxModelsFromPreferences();
  const visibleModels = payload.models.slice(0, maxModels);
  const folded = payload.models.length - visibleModels.length;
  const rows = windowRows(payload.windows, new Date());

  return (
    <List isLoading={false} searchBarPlaceholder="Search models, limits, picks…" navigationTitle="OpenCode Go">
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