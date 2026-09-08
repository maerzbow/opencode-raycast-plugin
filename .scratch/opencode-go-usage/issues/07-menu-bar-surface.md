# Menu-bar surface

Status: open
Type: prototype
Blocked by: 01

## Question

What should the Raycast menu-bar command show and do, given the refresh-cadence constraints found by **Raycast menu-bar command limits**?

Build a rough prototype (stub menu-bar command or sketch) to react to. Resolve:

- Icon + title text: exactly what text (e.g. rolling-window usage % like omarchy's pill) and which icon; what it shows when data is stale/missing.
- Dropdown contents when clicked: the three windows with counts/progress, top catalog models, picks?, force-refresh item, "Open full view" item, error affordances.
- Refresh policy given the cadence the research found: how often it re-fetches, whether refresh happens on-open or on a schedule, and interaction with the full command's data/cache (shared or separate?).
- Which window/metric the primary text tracks (rolling 5h vs monthly) and whether it's user-configurable.

Link the prototype as an asset from this ticket.
