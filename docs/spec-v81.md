# spec-v81.md — Drug & infusion billing: HCPCS units, JW/JZ wastage, and the infusion hierarchy; +3 tiles

> Status: **PROPOSED (2026-06-13).** Fourth feature spec of the
> [spec-v77](spec-v77.md) billing & coding program. Drug administration is where
> claims hemorrhage money and trigger audits: the **HCPCS billing unit** rarely
> equals the milligrams given, the **JW/JZ** discarded-drug rules are mandatory and
> error-prone, and the **infusion/injection CPT hierarchy** (96360–96379) makes the
> primary code depend on the *timeline*, not the drug. v81 adds **3 deterministic
> tiles** that get all three right.
>
> Catalog effect: **353 → 356 (+3).** Home: **Group B — Billing & Reimbursement**
> ([spec-v77](spec-v77.md) §3).
>
> Every tile obeys the [spec-v77](spec-v77.md) §2 doctrine. These compose with the
> existing `ndc-convert` (10↔11 format) and `mme-factors` tiles without shadowing
> them — see §1.

## 1. Thesis

Three drug-billing computations are deterministic, high-dollar, and have no tool:

1. **HCPCS billing units ≠ dose.** A J-code's billing unit is a fixed amount
   ("per 10 mg," "per 1 mg," "per 50 mcg"). The dose administered must be divided
   by that unit — and rounded per the unit's rule — to get units. Off-by-a-factor
   errors here are the most common drug-claim mistake.
2. **JW/JZ wastage.** Medicare requires the discarded portion of a single-dose vial
   to be billed on a separate line with **JW**, and (since 2023) requires **JZ**
   to attest **zero** waste. Getting the JW units wrong, or omitting JZ, is an
   active audit target.
3. **Infusion hierarchy.** When a patient gets hydration, a therapeutic infusion,
   a chemo infusion, and two pushes in one encounter, exactly **one** service is
   the "initial" code and the rest are sequential/concurrent/additional — and the
   primary is chosen by a CMS **hierarchy** (chemo > therapeutic > hydration;
   infusion > push > injection), not by what came first on the clock.

Each is input→output. v81 ships all three; none duplicates `ndc-convert` (a digit-
format converter) or `mme-factors` (opioid morphine-equivalents) — different jobs,
all retained.

## 2. The three tiles

Each passes [spec-v29](spec-v29.md) §3, inherits the [spec-v59](spec-v59.md)
contract, cites the CMS source inline with `accessed` + ledger row, and renders the
[spec-v77](spec-v77.md) §2 posture note.

### 2.1 `ndc-hcpcs-units` — dose → HCPCS billing units
- **Citation:** CMS HCPCS Level II drug code descriptors (each J-code's billing
  unit of measure); CMS Pub. 100-04 Ch. 17 (drugs and biologicals); the NDC↔HCPCS
  units-of-measure conversion (UN/ML/GR/F2) CMS publishes for drug billing.
- **citationUrl:** https://www.cms.gov/medicare/coding-billing/healthcare-common-procedure-system
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `billers`, `coders`,
  `infusion-billing`, `pharmacy-billing`.
- **Inputs:** the dose administered (with its unit — mg / mcg / units / mL); the
  HCPCS code's **billing-unit definition** (e.g., "1 unit = 10 mg" — entered from
  the code descriptor, or looked up where we ship the value); the rounding rule
  (whole units; partial-unit handling per the code).
- **Output:** the **number of HCPCS billing units** to report (dose ÷ unit size,
  rounded per the rule), the **exact ratio** shown as a derivation, and a flag when
  the dose isn't a clean multiple of the unit (the case that produces fractional-
  unit and rounding errors). Pairs with `drug-wastage` to split administered vs
  discarded units. **Near-neighbor:** `ndc-convert` converts the *NDC digit
  format*; this converts *dose to billing units* — different, both kept.

### 2.2 `drug-wastage` — JW (discarded) / JZ (zero waste) units from a single-dose vial
- **Citation:** CMS Pub. 100-04 Ch. 17 §40 and CMS MLN drug-wastage guidance:
  for a single-dose vial, bill the administered amount on one line and the
  **discarded** amount with **modifier JW**; when **no** drug is discarded, append
  **JZ** (required since July 2023). Multi-dose vials are **not** eligible for JW.
- **citationUrl:** https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits/jw-modifier-information
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `billers`, `coders`,
  `infusion-billing`, `pharmacy-billing`.
- **Inputs:** the vial size (and the HCPCS unit size, so the math is in **billing
  units** — reuses `ndc-hcpcs-units`); the dose administered; the vial type
  (single-dose vs multi-dose); optionally the available vial sizes, to compute the
  **least-waste vial selection**.
- **Output:** the **administered units** and the **discarded (JW) units** when the
  vial exceeds the dose, or the explicit **"zero waste → append JZ"** verdict when
  the dose uses the full vial; a hard **"multi-dose vial — JW does not apply, do
  not bill waste"** gate for multi-dose; and, when vial sizes are supplied, the
  **combination that minimizes billable waste**. Stops both the missing-JZ audit
  hit and the improper-JW-on-a-multidose-vial denial. **Near-neighbor:**
  `ndc-hcpcs-units` (supplies the unit math this splits).

### 2.3 `infusion-hierarchy` — the IV infusion/injection/hydration primary-code picker
- **Citation:** AMA CPT 96360–96379 (hydration, therapeutic/prophylactic/
  diagnostic infusions and injections, chemotherapy administration) and the CMS
  **hierarchy** for selecting the single **initial** code per encounter: chemo/
  complex > therapeutic/prophylactic/diagnostic > hydration; and within a category,
  **infusion > push > injection**; only one "initial" per IV site/encounter, the
  rest sequential/concurrent/additional-hour add-ons.
- **citationUrl:** https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/clm104c12.pdf
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `coders`, `billers`,
  `infusion-billing`.
- **Inputs:** the list of administrations in the encounter — for each: type
  (hydration / therapeutic infusion / therapeutic push / chemo infusion / chemo
  push), and duration where it matters (the 16-minute infusion floor; the
  sequential vs concurrent timing); single IV site vs multiple.
- **Output:** which administration is the **initial** code (chosen by the cited
  hierarchy, **not** chronology), and how every other administration is reported —
  **sequential infusion, concurrent infusion, additional-hour, or additional push**
  — with the **initial/subsequent/add-on code roles assigned** and the
  infusion-vs-push duration thresholds applied (e.g., an infusion under 16 minutes
  reported as a push). The notorious "which one is the initial code" puzzle, solved
  from the administration timeline.

## 3. Robustness

- **Unit math is exact and integer where the rule is.** Dose-to-unit conversion and
  JW/JZ splitting work in the HCPCS billing unit, with the rounding rule explicit
  and tested at fractional boundaries (e.g., a dose of 35 mg against a 10 mg unit →
  4 units administered, 1 unit discarded for a 50 mg vial). No silent floor/ceiling
  mismatch; the [spec-v59](spec-v59.md) fuzz harness gate applies.
- **The vial-type gate is hard.** Multi-dose → JW is refused, not warned;
  single-dose with full use → JZ is required, not optional. The least-waste vial
  selection is a small exact search over the supplied sizes, deterministic and
  tested.
- **The hierarchy is encoded once, ordered, and tested against a multi-drug
  encounter.** Chemo-over-therapeutic-over-hydration and infusion-over-push-over-
  injection are a single ranked table; the 16-minute infusion/push threshold is a
  cited constant; "one initial per site" is enforced. A worked example with chemo +
  therapeutic + hydration + two pushes is a unit test.
- **Dated constants ledger-tracked.** The JZ-required date, the 16-minute infusion
  floor, and the hierarchy ordering get `pa-staleness-ledger.json` rows (ruleFamily
  `billing-v81`); `check-pa-staleness` guards them.

## 4. Files touched

```
docs/spec-v81.md                 (this file)
app.js                           (+3 UTILITIES rows in Group B)
views/group-b.js                 (renderers for the 3 drug/infusion tiles; per-administration list input + role-assignment output)
lib/billing-v81.js               (new compute exports: ndcHcpcsUnits, drugWastage, infusionHierarchy)
lib/meta.js                      (+3 META entries: inline citation, citationUrl, accessed; cross-links to ndc-convert/mme-factors)
pa-staleness-ledger.json         (+rows: JZ-required date, 16-min infusion floor, infusion hierarchy ordering — ruleFamily billing-v81)
lib/pa/staleness-ledger.js, scripts/check-pa-staleness.mjs   (recognize ruleFamily billing-v81)
test/unit/ndc-hcpcs-units.test.js, drug-wastage.test.js, infusion-hierarchy.test.js  (3 unit tests, ≥3 boundary worked examples each, incl. JZ/JW/multidose gate + chemo+therapeutic+hydration+push encounter)
test/integration/fuzz-tools.spec.js   (import lib/billing-v81.js)
docs/audits/v12/<each new tile>.md     (spec-v11 audit logs)
docs/scope-mdcalc-parity.md            (catalog 353 → 356)
README.md, package.json                (catalog count 353 → 356; spec-progression line → v81)
CHANGELOG.md                           (Unreleased: v81 entry, +3)
```

## 5. Acceptance criteria

- All 3 tiles in §2 are live in Group B with a `META[id]` entry, inline cited
  output + `citationUrl` + `accessed`, ≥3 boundary worked examples per unit test, a
  [spec-v11](spec-v11.md) audit log, and pass [spec-v29](spec-v29.md) §3.
- `ndc-hcpcs-units` converts dose→units for a "per 10 mg" code and flags a
  non-multiple dose; `drug-wastage` returns the correct JW units for a partially
  used single-dose vial, the JZ verdict for full use, the multi-dose refusal, and
  (when sizes are supplied) the least-waste vial combination; `infusion-hierarchy`
  selects the correct initial code from the cited hierarchy (not chronology) on a
  four-administration encounter and assigns every add-on role.
- `ndc-convert` and `mme-factors` are untouched and cross-linked; no duplication.
- Every dated constant has a `pa-staleness-ledger.json` row (ruleFamily
  `billing-v81`); `check-pa-staleness` passes.
- `lib/billing-v81.js` is in the fuzz harness with zero non-finite leaks;
  `UTILITIES.length` is **356** and catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, `npm run build`,
  `npm run check-pa-staleness` pass; CHANGELOG records v81 with +3.

## 6. Out of scope for v81

- **No bundled J-code → unit-size master file.** The billing-unit size is entered
  from the code descriptor (or read where we already ship the value), per
  [spec-v77](spec-v77.md) doctrine clause 2; v81 ships no licensed full drug-pricing
  file (ASP pricing is a payment input to v78-style math, not bundled here).
- **No clinical dosing.** The tiles compute *billing* units and waste; they do not
  recommend a dose. Clinical dose calculators live in the clinical groups and are
  unaffected.
- **No 340B / discount-program modifiers** (JG/TB) pricing logic in this spec; the
  wastage/units math is program-agnostic and those modifiers are entered as
  informational if needed.
