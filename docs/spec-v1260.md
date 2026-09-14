# spec-v1260 — classify unreachable refusal states

`scripts/probe-refusal-unrendered.mjs` reported 181 browser renderers whose
compute function can refuse but whose renderer has no refusal branch. The report
correctly called them suspects, but left every subsequent audit to rediscover
which states were actually reachable.

The probe now classifies a no-branch row as `select-only-unreachable` only when
the renderer creates at least one inline populated select, creates no free or
boolean control, and contains no empty option. Wrong-key rows and any no-branch
row it cannot prove unreachable remain actionable. That stricter rule surfaced
`pirani-clubfoot`, whose options live in a module constant, and
`dimeglio-clubfoot`, which also has checkboxes. Both renderers now show the
library's refusal before reading result fields.

The default report is therefore 0 actionable rows and 179 excluded
populated-select-only states. JSON retains all 179 rows and their classification
so the exclusion remains inspectable rather than becoming an allowlist.

No scoring behavior, citation, dependency, or catalog count changed.
