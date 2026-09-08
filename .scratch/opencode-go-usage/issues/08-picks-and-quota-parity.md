# Picks and quota parity

Status: open
Type: grilling
Blocked by: 04

## Question

How faithfully should the Mac version reproduce omarchy's quota estimates and daily picks, per the behavior spec from **Reference plugin behavior spec**?

Decide:

- Parity of numbers: must the extension produce the *same* quota figures and stretch/best-value picks as the Linux widget (same token-turn assumptions, same exclusion of Muse Spark, same daily recompute), or is that an omarchy-specific heuristic we may relax on Mac?
- Which models are eligible and whether any are excluded and why.
- Whether the "typical agent turn" cost basis (830 input + 71.5K cached + 295 output tokens) is something the user can tune, or fixed to match the reference.
- Refresh coupling: picks recompute daily from current pricing while limits/catalog refresh more often — confirm that split holds on Mac too.

Record the decision; **Raycast UI layout** and **Menu-bar surface** then render whatever parity this sets.
