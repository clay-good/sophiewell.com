# spec-v1759 — Negatives and half steps in fields the worked example left blank

> Status: **SHIPPED (2026-11-21)**: 18 tools. The catalog stays 2,387.

spec-v1758 found that the envelope finder skipped fields left blank in a tool's worked example. Two more committed
finders had the same blind spot: `scripts/probe-negative-as-zero.mjs` (a negative answered exactly as 0, spec-v1740)
and `scripts/probe-half-step.mjs` (a whole-number item scored at x + 0.5, spec-v1755). Both now fill a blank field
with a value the tool answers from before asking their question.

**Negatives (9 tools):** `toxic-alcohol` ethanol; `predicted-spirometry` measured FEV1 and FVC; `hiet-dosing` bolus
and rate overrides (-1 read "bolus 0 units"); `tls-cairo-bishop` baseline uric acid; `pk-suite` measured level and
dose; `cockcroft-gault` and `egfr-suite` height (computed in the adapter and the page, so guarded in both);
`insulin-correction` ISF; `crrt-dose` post-filter, systemic and total calcium. Blank keeps its meaning in each
(no ethanol term, the 1 unit/kg default, the 1800 rule).

**Half steps (9 tools):** modified Marshall cardiovascular score, PI-RADS T2W and DWI (3.5 was cut to 3; a T2W of 6
was read as blank, now refused), GUSS items in a stage the bedside test skipped, pSOFA vasoactive grade (2.5 scored
2.5), POSEIDON antral follicle count, M-CHAT-R/F follow-up score, Part D opioid prescriber and pharmacy counts,
device-infection ventilation episodes, suppository batch units.

As in spec-v1758, an entered value is checked whatever mode is chosen, including a field that mode does not read.

Left: naloxone bolus and methemoglobin weight (the finder lists them because 0 is refused too; -1 gets the same
range message); `o2-cylinder-duration` (owner decision of 2026-11-17); fractional by definition: CYP2D6 activity
score, oral bioavailability, fetal dose, HLB saponification and acid numbers.

Tests: `test/unit/negative-blank-field-v1759.test.js`, `test/unit/half-step-blank-field-v1759.test.js`.
