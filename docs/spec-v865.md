# spec-v865 — Carboxyhemoglobin Level Interpretation

## What this gives you

Whether there was an exposure, and — stated on every result — why the number is not the
severity.

## §1 The baseline

| | |
|---|---|
| Up to about 3% | Non-smoker baseline |
| Up to about 10% | Smoker baseline |
| Above baseline | Confirms exposure |

The same 8% that confirms exposure in a non-smoker may be no more than baseline in a smoker, so
the tile asks and compares against the right line.

## §2 The level does not grade the poisoning

This is why the tile exists. Carboxyhemoglobin does not correlate with severity and does not
predict outcome. A modest level in someone who lost consciousness is still a serious poisoning,
and a level within baseline does not exclude one — oxygen given before the sample brings it down
fast.

What escalation actually rests on is a short list of clinical features, which the tile puts
**above** the readings on the page:

- Loss of consciousness at any point
- Any neurologic finding, including confusion
- Cardiac ischemia, arrhythmia, or a raised troponin
- Pregnancy
- Symptoms persisting after high-flow oxygen

Hyperbaric oxygen is considered on these. The numeric thresholds quoted for it vary between
sources, which is a further reason the tile does not quote one. A level of 40% with none of the
features entered does not manufacture a feature; the tile says none was entered.

## §3 The pulse oximeter fails in the reassuring direction

A standard oximeter cannot tell carboxyhemoglobin from oxyhemoglobin and reports the sum, so the
saturation reads **normal or high** however severe the poisoning is. This is the opposite failure
from methemoglobin ([spec-v864](spec-v864.md)), where the reading plateaus low, and the tile says
so. The arterial oxygen tension is normal too, for the same reason as there: it measures oxygen
dissolved in plasma, not what the hemoglobin can carry.

## §4 Timing understates the peak

| On | Approximate half-life |
|---|---|
| Room air | 4 to 5 hours |
| High-flow oxygen | 60 to 90 minutes |
| Hyperbaric oxygen | 20 to 30 minutes |

A level drawn after oxygen was started understates the peak, sometimes widely. Left unstated,
the tile raises it rather than passing over it. High-flow oxygen is given to anyone suspected of
exposure without waiting for a level, and that prints on every result too.

## §5 Sourcing (spec-v97 gate)

- Weaver LK. *Carbon monoxide poisoning.* N Engl J Med. 2009;360(12):1217-1225.

No tracked guideline issuer, so no `docs/citation-staleness.md` row is owed. Sources disagree on
the numeric carboxyhemoglobin threshold for hyperbaric oxygen, so under the spec-v97 gate no
threshold is quoted; the tile presents the clinical features instead, which the sources agree on.

## §6 Posture

Decision support, not a verdict. It reads a measured level against a baseline. It does not grade
severity, decide hyperbaric oxygen, or replace the regional poison center.

Catalog 1656 → 1657.
