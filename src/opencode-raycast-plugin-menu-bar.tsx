import { Icon, LaunchType, MenuBarExtra, launchCommand, openExtensionPreferences } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { PICK_ICON, barAsset, pickLabel, windowRows } from "./lib/display";
import { modalityText, moneyPerMillion } from "./lib/format";
import { isKeyProblem } from "./lib/types";
import { collectUsage, maxModelsFromPreferences, readInitialPayload } from "./lib/usage";

function openFullView() {
  launchCommand({ name: "opencode-raycast-plugin", type: LaunchType.UserInitiated }).catch(() => undefined);
}

export default function Command() {
  const { data, isLoading, mutate } = useCachedPromise(() => collectUsage(false), [], {
    initialData: readInitialPayload(),
    keepPreviousData: true,
  });

  const refresh = () => mutate(collectUsage(true), { shouldRevalidateAfter: false });

  const result = data ?? null;

  const renderContent = () => {
    if (!result) return <MenuBarExtra.Item title={isLoading ? "Loading…" : "No data"} onAction={refresh} />;
    if (!result.ok) {
      const keyProblem = isKeyProblem(result.failure.type);
      return (
        <>
          <MenuBarExtra.Item icon={Icon.Warning} title={result.failure.message} />
          {keyProblem && (
            <MenuBarExtra.Item icon={Icon.Gear} title="Open Extension Preferences" onAction={() => openExtensionPreferences()} />
          )}
          <MenuBarExtra.Separator />
          <MenuBarExtra.Item icon={Icon.RotateClockwise} title="Force refresh" onAction={refresh} />
          <MenuBarExtra.Item icon={Icon.Maximize} title="Open full view" onAction={openFullView} />
        </>
      );
    }

    const { payload } = result;
    const maxModels = maxModelsFromPreferences();
    const visibleModels = payload.models.slice(0, maxModels);
    const folded = payload.models.length - visibleModels.length;
    const rows = windowRows(payload.windows, new Date());

    return (
      <>
        {payload.offline && <MenuBarExtra.Item icon={Icon.Cloud} title="Offline · showing last-known data" />}
        <MenuBarExtra.Section title="Go limits">
          {rows.map((r) => (
            <MenuBarExtra.Item key={r.key} icon={barAsset(r.pct)} title={r.title} subtitle={r.subtitle} />
          ))}
        </MenuBarExtra.Section>
        <MenuBarExtra.Section title="Model catalog">
          {visibleModels.map((m) => (
            <MenuBarExtra.Item
              key={m.id}
              icon={m.isPick ? PICK_ICON[m.isPick] : Icon.Bolt}
              title={m.id}
              subtitle={[
                modalityText(m.modalities),
                m.cost ? `${moneyPerMillion(m.cost.input)}/${moneyPerMillion(m.cost.output)}` : "",
                m.quota != null ? `~${m.quota} req/5h` : "",
                m.isPick ? pickLabel(m.isPick) : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            />
          ))}
          {folded > 0 && <MenuBarExtra.Item icon={Icon.Ellipsis} title={`and ${folded} more models (folded)`} />}
        </MenuBarExtra.Section>
        <MenuBarExtra.Separator />
        <MenuBarExtra.Item icon={Icon.RotateClockwise} title="Force refresh" onAction={refresh} />
        <MenuBarExtra.Item icon={Icon.Maximize} title="Open full view" onAction={openFullView} />
        <MenuBarExtra.Item icon={Icon.Gear} title="Open Extension Preferences" onAction={() => openExtensionPreferences()} />
      </>
    );
  };

  return (
    <MenuBarExtra icon={{ source: "menubar-icon.png" }} tooltip="opencode usage">
      {renderContent()}
    </MenuBarExtra>
  );
}