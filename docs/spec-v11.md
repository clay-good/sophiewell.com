# spec-v11.md — sophiewell.com: correctness-first audit, specialty-named groups, optional interpretation field

> Status: proposed (2026-05-17). Implementation spec. No new tiles
> ship under v11; the entire scope is **make the 178 tiles already
> shipped provably correct**, rename the internal group letters to
> specialty names so the navigation matches the audience's mental
> model, and introduce a tightly-scoped optional `interpretation`
> field for tiles whose primary citation already says what the score
> means. Long-horizon scope (full MDCalc-equivalent coverage) is
> committed separately in
> [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md); v11 is the
> quality bar that scope is held to.
>
> Every prior spec (v4 through v10) remains in force. v11 narrows
> execution focus, it does not amend any hard rule.

## 1. Why v11 exists

[spec-v10](spec-v10.md) committed Sophie's positioning: the
calculator a clinician pulls up at 2 a.m., MDCalc without the
nonsense, deterministic and citable. The strategic implication is
uncomfortable: **before adding any new tile, the existing 178 tiles
must be provably correct**. A wrong result on a tile a nurse trusts
at 2 a.m. is the only failure mode that breaks the entire product.
Breadth is worthless on top of an unreliable foundation.

v11 is the audit pass that earns the right to expand.

The second motivation is navigation. The existing group letters
(`A`, `C`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`, `O`,
plus the v5/v6 extension groups) are an artifact of how the catalog
grew. They mean nothing to a clinician. MDCalc organizes by
specialty; Sophie's audience expects the same. v11 renames the
groups to specialty names so the front-door navigation matches what
a pulmonologist, hospitalist, or ED nurse already thinks in.

The third motivation is the **interpretation** question raised
during the v10 review: a deterministic, quoted-from-the-citation
short statement of what a score *means* is still reference, not
prescription, **if and only if** the rules in §4 below are obeyed.
v11 introduces the field and the guardrails together.

## 2. Non-goals

- **No new tiles.** Not one. Every tile that exists on 2026-05-17
  is in scope for audit; nothing new is added by v11.
- **No new dependencies.** The v10 §2.2 dependency budget is
  unspent and remains so.
- **No new spec contracts past §3 / §4 / §5 below.** v11 is
  audit + rename + one optional field; it is not a redesign.
- **No removal of any currently-shipping tile** without a §3.6
  defect finding that justifies it and a 90-day deprecation notice
  per [docs/stability.md](stability.md).

## 3. The correctness audit

Every shipped tile passes through a five-step audit. The audit is
the work; the deliverable is a per-tile audit log committed under
`docs/audits/v11/<tile-id>.md`.

### 3.1 The five steps, per tile

1. **Citation re-verification.** Open the source named in
   `META[id].citation`. Confirm the formula, threshold, table, or
   procedure Sophie implements matches the source verbatim. If the
   source has been updated since the citation was written, update
   the citation and re-verify against the current version. If
   Sophie's implementation diverges from the source, fix Sophie or
   amend the citation to point at the source Sophie actually
   implements (no fabricating intermediate sources).
2. **Boundary-case worked examples.** For every numeric tile, add
   at least three worked examples covering: (a) the low edge of
   the input range, (b) the high edge of the input range,
   (c) a representative mid-range value. Each worked example is
   an additional row in `META[id].example` *or* an additional
   unit test that pins the expected output to a number computed
   by hand from the source formula. Lookup tiles add at least three
   coverage rows hitting different shards / categories.
3. **Cross-implementation differential.** For every formula tile,
   compute the same example through at least one independent
   implementation (a peer-reviewed online calculator, a published
   worked example in a textbook, or a manual computation traceable
   to the source). Record the differential in the audit log. Any
   numeric disagreement >0.5% (or one category for ordinal scores)
   is a defect under §3.6 and blocks v11 from advancing past that
   tile.
4. **Edge-input handling review.** Read the renderer for every
   input field. Confirm: (a) the input rejects out-of-range values
   with an inline message, not a silent failure or a wrong number;
   (b) unit-bearing inputs label the unit prominently and reject
   mismatched units; (c) optional inputs default to a value that
   produces the same result the source formula gives for "not
   provided"; (d) the example value is inside the typical clinical
   range and produces a "normal-looking" result, not an alarming
   edge case.
5. **A11y + keyboard pass.** Tab through every input in order.
   Confirm screen-reader labels match the visible label, error
   states are announced, and the "Reset to example" link is
   reachable by keyboard. Run `npm run test:a11y` after every fix.

### 3.2 Audit-log format

Each `docs/audits/v11/<tile-id>.md` carries:

```markdown
# v11 audit — <tile name> (`<tile-id>`)

- Auditor: <name or initials>
- Date: <YYYY-MM-DD>
- Citation re-verified against: <source, edition or access date>

## Boundary examples added
- low: <inputs → expected>
- mid: <inputs → expected>
- high: <inputs → expected>

## Cross-implementation differential
- Reference implementation: <name, URL or citation>
- Test case: <inputs>
- Sophie result: <value>
- Reference result: <value>
- Delta: <%, with PASS/FAIL>

## Edge-input handling notes
- <observations + fixes if any>

## A11y / keyboard notes
- <observations + fixes if any>

## Defects opened
- <link to GitHub issue, or "none">

## Status
- PASS  /  FAIL (defect open)  /  PASS-WITH-FIXES (fixes shipped this PR)
```

The audit log is the contract. A tile is not audited until its log
file exists, is committed, and is PASS or PASS-WITH-FIXES.

### 3.3 Audit order

Audit in this order, highest-stakes first. The order is also the
order of the v11 sub-PRs.

1. **Medication and dosing** (current group F; spec-v11 will rename
   to "Medication & Infusion"). Wrong drug math is the worst
   failure mode this site has. Audit first.
2. **Critical care scoring** (qSOFA, SOFA, MELD, MELD-3.0,
   Child-Pugh, Ranson, BISAP, APACHE-adjacent fragments). Wrong
   ICU scores drive wrong escalation decisions.
3. **Stroke and neuro** (NIHSS, GCS, mRS). Wrong NIHSS misroutes
   stroke patients.
4. **Cardiology scoring** (CHA2DS2-VASc, HAS-BLED, HEART, TIMI,
   GRACE, Wells PE/DVT, PERC, Geneva). Anticoagulation and
   admission-or-discharge calls hang on these.
5. **Pulmonary scoring** (CURB-65, PSI). Admission decisions.
6. **Renal / electrolyte math** (eGFR suite, FENa/FEUrea,
   Adrogue-Madias, free water deficit, anion gap with
   delta-delta, corrected Ca/Na, osmolal gap, Winter's). Wrong
   replacement math kills.
7. **OB and pediatrics** (Bishop, APGAR, pregnancy dating,
   peds-weight-conv, peds-dose-bounds). Pediatric dose errors are
   especially high-stakes.
8. **Psychiatry screeners** (PHQ-9, GAD-7, AUDIT-C, CAGE, EPDS,
   Mini-Cog, CIWA-Ar, COWS). Score thresholds drive referrals.
9. **Conversions and physical math** (BMI, BSA suite, MAP, pulse
   pressure, shock index, A-a gradient, P/F, QTc suite, pack-years,
   unit-converter). High-frequency, lower stakes per call.
10. **Code lookups** (ICD-10-CM, HCPCS, CPT, NDC, ICD-10-PCS,
    RxNorm, MS-DRG, APC, NUBC TOB / revenue / condition /
    occurrence / value, modifiers, place-of-service, CARC, RARC).
    Audit consists of: (a) confirm the bundled shard hash matches
    the manifest in [docs/operations.md](operations.md), (b)
    confirm at least one lookup per shard produces the
    authoritative label.
11. **Regulatory and patient-literacy** (NSA tree, ABN, appeal
    letter, HIPAA RoA / authorization, ROI request, birthday
    rule, COBRA, Medicare enrollment, ACA SEP, CMS-1500, UB-04,
    EOB / MSN decoders, bill decoder). Audit confirms the cited
    CFR / USC / form version is the current one as of the audit
    date.
12. **Workflow and EMS / field** (current groups H and I).
13. **Patient education generators** (discharge instructions,
    wallet card, specialty visit generator). These are
    documented templates with required-fields audits.

The order is deliberate: drug math first, code lookups late,
generators last. A tile can ship its audit out of order if the
auditor has stronger domain familiarity in a later group — the
*order* is a default, not a constraint.

### 3.4 Tooling

Two new scripts ship under v11 to make the audit mechanical where
it can be:

- **`scripts/audit-coverage.mjs`** — reads `docs/audits/v11/*.md`
  and reports per-group audit-completion percentage. Wired into
  CI as an informational check (not a gate; the gate is the
  per-tile audit log existing).
- **`scripts/audit-skeleton.mjs <tile-id>`** — generates a
  pre-filled `docs/audits/v11/<tile-id>.md` template so the
  auditor types only the findings, not the format.

Both scripts are pure Node, no dependencies, consistent with the
v10 §2.2 budget.

### 3.5 CI guards added

- **`test/unit/audit-format.test.js`** — every file under
  `docs/audits/v11/` must parse to the schema in §3.2.
- **`test/unit/meta-citation-verify.test.js`** — every citation
  string is non-empty, ≤300 chars, and does not contain a bare
  URL (URLs rot; spec-v9 §4.2 already enforces this style — v11
  pins it in CI).
- **`test/unit/meta-example-result.test.js`** — every
  `META[id].example.expected` string is non-empty. (spec-v9 wave 3
  already added this in hard mode; v11 re-asserts it after the
  boundary-example additions in §3.1.2.)

### 3.6 Defects

A defect is any audit finding that means Sophie's current output is
*wrong* (not "could be improved"). The handling protocol:

1. Open a GitHub issue titled `defect: <tile-id> — <one-line>`.
2. Add a `defects/` row to the audit log linking the issue.
3. Ship the fix in the same PR as the audit log if the fix is
   small. Ship it in a follow-on PR if the fix needs review,
   leaving the audit log in FAIL state.
4. Every defect fix updates the citation if the source has
   changed, the example values + expected output if the formula
   has changed, and the CHANGELOG under a `### Fixed` heading.
5. If a defect is severe enough that wrong results have been
   served (formula error, not cosmetic), the CHANGELOG entry
   must say so plainly and link to the audit log.

## 4. Specialty-named groups

### 4.1 The mapping

The current group letters map to specialty names as follows. The
specialty name is the visible label everywhere a user sees it; the
group letter is retained only as a legacy id inside `UTILITIES`
entries so the change is non-breaking for deep links.

| Current letter | Specialty / category name (visible)         |
|----------------|---------------------------------------------|
| A              | Billing & Coding                            |
| C              | Insurance & Patient Literacy                |
| E              | Clinical Math & Conversions                 |
| F              | Medication & Infusion                       |
| G              | Clinical Scoring & Risk                     |
| H              | Workflow & Documentation                    |
| I              | EMS & Field Medicine                        |
| J              | Immunization & Infectious Disease           |
| K              | Reference Ranges                            |
| L              | Insurance Glossary                          |
| M              | State & Coverage Reference                  |
| N              | Pediatrics & Neonatal                       |
| O              | High-Alert & Safety                         |
| v5 extension   | (merge into the destination specialty above)|
| v6 extension   | (merge into the destination specialty above)|

The names above are deliberately broad rather than MDCalc-narrow
("Clinical Scoring & Risk" rather than splitting Cardiology /
Pulm / Critical Care into separate groups). Reasons:

1. Many Sophie tiles serve multiple specialties (Wells DVT belongs
   to cardiology, hematology, and ED). A coarser specialty axis
   avoids forcing every tile into one home.
2. The fine-grained specialty axis is better served by an
   *additive* `META[id].specialties` array (§4.3) that the v8
   audience chips + a new specialty chip rail can filter on,
   without changing the home grouping.
3. The home grid stays the size it is today (13 sections, not
   25+).

### 4.2 The visible navigation

The home grid renders one section per specialty in the §4.1 order.
Section headers show the specialty name and the tile count, e.g.
*"Clinical Scoring & Risk · 42 tiles"*. The collapsed-grid
disclosure ([spec-v8 §4.6](spec-v8.md)) wraps the entire grid as
today.

Audience chips (`All / Patient / Biller and Coder / Nurse and
Clinician / EMS and Field / Educator`) continue to filter as today.
v11 does **not** add a new specialty chip rail; that is deferred
to a future spec if the §4.3 metadata is found to be load-bearing.

### 4.3 `META[id].specialties` (optional, additive)

A new optional field on `META[id]`:

```js
META['wells-dvt'] = {
  // existing fields …
  specialties: ['cardiology', 'hematology', 'emergency-medicine'],
};
```

- Defaults to `[]` when missing.
- Vocabulary is fixed: `cardiology`, `pulmonology`, `critical-care`,
  `neurology`, `gastroenterology`, `hepatology`, `endocrinology`,
  `nephrology`, `hematology`, `infectious-disease`,
  `emergency-medicine`, `obstetrics-gynecology`, `pediatrics`,
  `psychiatry`, `toxicology`, `surgery`, `anesthesiology`,
  `geriatrics`, `palliative`, `oncology`, `rheumatology`,
  `dermatology`, `ophthalmology`, `otolaryngology`,
  `radiology`, `pharmacy`, `nursing-general`. The vocabulary is
  closed for v11; additions go through a one-line spec amendment.
- Consumed by the prompt ranker ([lib/prompt.js](../lib/prompt.js))
  as additional tokens in the search document, weighted the same
  as `audiences` (+1 per matched token). This is the only
  behavior change; the visible grouping (§4.1) uses the existing
  group letter, not the specialty array.

### 4.4 Migration

- `app.js` `UTILITIES[i].group` remains a single-letter id (no
  data migration). A new `GROUP_LABELS` constant maps the letter
  to the visible name in §4.1.
- All header strings, ARIA labels, and topic-hub pages render the
  visible name; tests that asserted on group letters are updated
  to assert on the visible name.
- URL-hash deep links are unchanged: tiles are addressed by id,
  not by group.
- The five audience hubs under `dist/for/` are unaffected (they
  are organized by audience, not group).
- The eight topic pages under `dist/topics/` are inspected for
  hard-coded group letters; any that appear are replaced with the
  visible name.

## 5. The `interpretation` field

### 5.1 What it is

An optional new field on `META[id]`:

```js
META['cha2ds2-vasc'] = {
  citation: 'Lip GYH et al. Chest 2010;137(2):263-272.',
  example: { fields: { /* … */ }, expected: 'Score 4' },
  interpretation: {
    bands: [
      { range: '0',     text: 'Low risk. Anticoagulation not recommended per source.' },
      { range: '1',     text: 'Low-moderate risk. Anticoagulation may be considered per source.' },
      { range: '≥2',    text: 'Moderate-to-high risk. Anticoagulation recommended per source.' },
    ],
    sourceQuoted: true,
    sourceCitation: 'Lip GYH et al. Chest 2010;137(2):263-272.',
  },
};
```

- `bands` is an ordered list of `{ range, text }` rows. `range` is
  a string describing the input range (a score, a category, a
  threshold); `text` is the interpretation for that range.
- `sourceQuoted: true` is mandatory and asserts that every `text`
  is a direct quote or close paraphrase of `sourceCitation`. A
  tile cannot opt into `interpretation` without `sourceQuoted: true`.
- `sourceCitation` must equal `META[id].citation` or name a
  citation that is itself a guideline derived from the primary
  source (e.g., the same author's later guideline review).
- The field is optional. Tiles without a published per-band
  interpretation do not invent one.

### 5.2 What it renders as

Inside the References region, **below** the citation line:

```
References
  Source: Lip GYH et al. Chest 2010;137(2):263-272.
  Per source:
    Score 0   — Low risk. Anticoagulation not recommended.
    Score 1   — Low-moderate risk. Anticoagulation may be considered.
    Score ≥2  — Moderate-to-high risk. Anticoagulation recommended.
```

The header word "Per source:" is mandatory and is the entire
guardrail: every word below it is the source's, not Sophie's.

### 5.3 What it must not become

- **Not a "What to do next" section.** Reject any text of the
  form "Order X" / "Admit to Y" / "Start Z" unless the source
  literally says that and the source is a major society guideline,
  not an editorial or a single-center study.
- **Not authored by Sophie.** If the source doesn't say it,
  Sophie doesn't say it. No "Sophie suggests."
- **Not a tile-specific UI surface.** It lives inside the
  References region, not above it, not in a sidebar, not as a
  modal.
- **Not load-bearing.** Tiles without `interpretation` render
  exactly as today. Coverage is not a target.

### 5.4 CI guard

`test/unit/meta-interpretation.test.js`:

1. Every tile with `interpretation` has `sourceQuoted: true` and
   a non-empty `sourceCitation`.
2. Every `bands[i].text` is ≤200 chars (a quoted band, not a
   paragraph).
3. No `text` field contains the strings "Sophie", "we recommend",
   "you should", "consider ordering" — heuristic guard against
   accidental authoring.
4. If `sourceCitation` ≠ `META[id].citation`, the audit log under
   `docs/audits/v11/<tile-id>.md` must record the justification.

## 6. Acceptance criteria

v11 is shippable when:

- Every shipped tile has a corresponding
  `docs/audits/v11/<tile-id>.md` in PASS or PASS-WITH-FIXES state.
- `scripts/audit-coverage.mjs` reports 100% (178/178) audited.
- All §3.6 defects are either fixed or have a CHANGELOG entry
  documenting the regression and the user-visible mitigation.
- `app.js` `GROUP_LABELS` maps every group letter to a visible
  name per §4.1, and every header / hub / topic page reflects the
  new label.
- The optional `META[id].specialties` field is consumed by
  `lib/prompt.js`; the vocabulary in §4.3 is the closed set; the
  CI guard in §5.4 passes.
- `npm run lint`, `npm run test`, `npm run build`,
  `npm run test:e2e` (where Playwright is available) all pass.

## 7. Sequencing

v11 is large. It ships in waves, each a single PR:

- **Wave 0**: this spec, the audit tooling
  (`scripts/audit-skeleton.mjs`, `scripts/audit-coverage.mjs`),
  the CI guards in §3.5, the empty `docs/audits/v11/` directory.
- **Wave 1**: §4 specialty rename + `META[id].specialties` field
  + `GROUP_LABELS` constant + visible-label test updates. No
  audit work; pure refactor + new metadata.
- **Wave 2**: §5 `interpretation` field + CI guard, no per-tile
  population yet.
- **Waves 3a–3m**: per-group audit, one wave per §3.3 group, in
  the §3.3 order. Each wave ships the audit logs + any fixes for
  that group. `interpretation` is populated only where the source
  unambiguously dictates per-band interpretation; absence is fine.
- **Wave 4**: final pass — `scripts/audit-coverage.mjs` hits
  100%, CHANGELOG summary written, v11 marked complete.

Sub-waves under wave 3 may ship in any order if the auditor has
domain familiarity. The default order is §3.3.

## 8. Out of scope (deliberate)

- **New tiles.** See [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md)
  for the long-horizon commitment; v11 is the quality floor that
  scope must clear before any tile lands.
- **A specialty chip rail.** Deferred until the §4.3 metadata is
  in place and the prompt-ranker usage signals whether visible
  specialty filtering would add value.
- **Specialty-level landing pages** (e.g., a `/cardiology` hub
  page). Tactically interesting; deferred so v11 does not balloon.
- **Author-attributed "Sophie pearls" prose.** Permanently
  rejected per §5.3 and spec-v10 §2.3.

## 9. What v11 promises and does not promise

- v11 promises that on completion, every shipped tile has been
  re-verified against its primary source by a named auditor and
  the audit is auditable.
- v11 does not promise that no future error will ever ship.
  Sources change; transcription errors happen. v11 promises a
  pipeline (audit log → CI guard → CHANGELOG `### Fixed`) that
  catches them faster.
- v11 does not promise speed. The audit is deliberately slow.
  [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md) §3 sets
  the cadence rationale; v11 inherits it.
