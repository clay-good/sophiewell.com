# Change: IV alteplase eligibility decision aid for acute ischemic stroke (AHA/ASA 2019)

## Why

The spec-v285–v291 search-quality program surfaced two catalog gaps it noted but left
un-forced: perioperative anticoagulation **bridging** and **tPA (thrombolytic) eligibility**.
The transfusion-threshold gap from the same sweep proved to be a legitimate, buildable tile
(spec-v292). This proposes the second: the catalog has stroke-risk and stroke-prognosis tiles
(`nihss`, `abcd2`, `dragon-stroke`, `thrive-stroke`, `atria-stroke`) but **nothing that helps a
stroke team walk the IV alteplase inclusion/exclusion checklist** for an acute ischemic stroke
patient in front of them. A nurse or resident typing "is this patient a tpa candidate" gets
routed to prognosis scores.

The AHA/ASA 2019 acute ischemic stroke guideline (Powers et al., *Stroke*) publishes the
time-window rules (≤ 3 h and the 3–4.5 h extended window) and the inclusion/exclusion criteria —
reproducible, citable, checklist-shaped content the catalog is built from, in the same
decision-rule genre as the shipped `perc`, `wells-pe`, and `canadian-ct-head` tiles.

## What Changes

- **One new clinical tile, `tpa-eligibility` (group G):** inputs = time from last-known-well
  (a window `select`: ≤ 3 h / 3–4.5 h / > 4.5 h) plus a checklist of the absolute exclusions
  (recent ICH, ischemic stroke or severe head trauma in the prior 3 months, intracranial/spinal
  surgery in the prior 3 months, active internal bleeding, platelets < 100 ×10⁹/L, INR > 1.7,
  DOAC within 48 h, BP > 185/110 despite treatment, glucose < 50 mg/dL, CT showing hemorrhage
  or extensive early infarct) and, when the 3–4.5 h window is selected, the ECASS-III relative
  exclusions (age > 80, NIHSS > 25, oral anticoagulant use, prior stroke + diabetes).
  **Output = a first-class eligibility verdict:** "no absolute contraindication met in the
  ≤ 3 h window — the patient meets the AHA/ASA 2019 checklist" / "excluded: [criteria]" /
  "> 4.5 h from last known well — outside the IV alteplase window; consider thrombectomy
  pathway." The tile reports which criteria fired; it **never says "give alteplase."**
- **Pure lib compute** (`M.tpaEligibility()`) so the tile is Class-A MCP-adaptable; a follow-up
  MCP wave exposes it.
- Catalog count live → live + 1 across every count surface; META example, bands, citation, and
  the standard test battery per the shipping checklist in `tasks.md`.

## Why this passes the spec-v29 §3 one-line test

It is not a googleable static table: the tile computes a per-patient verdict from the entered
window and criteria ("3–4.5 h window, age 82 → outside the extended-window criteria (age > 80);
alteplase not recommended per the 2019 relative-exclusion list"), the same shape as the shipped
PERC or Canadian CT Head decision rules. The time-window-dependent exclusion set (the 3–4.5 h
window adds four criteria the ≤ 3 h window does not) is exactly the nuance a flat checklist gets
wrong.

## Impact

- Affected specs: new `tpa-eligibility` capability (this change's `specs/` folder).
- **High-stakes posture (spec-v11 §5.3):** thrombolysis is an irreversible, hemorrhage-risking
  decision. The tile reports the guideline checklist result and **defers the treatment decision
  to the stroke team**, in the same voice as the existing decision-rule tiles — it must never
  emit "administer alteplase," a dose, or a go/no-go order. This posture requirement is a
  first-class acceptance criterion, not a footnote.
- Affected code at build: one lib module function, one view renderer, `lib/meta.js` entry, count
  surfaces, `data/synonyms.json` row ("tpa eligibility", "is this patient a tpa candidate",
  "thrombolysis checklist", "alteplase criteria"), golden-set probe promotion.
- **Docs-only proposal** (propose-first, per the spec-v292 / v279 / v264–v266 precedent). Every
  criterion, time window, and threshold in `design.md` MUST be re-verified against the AHA/ASA
  2019 guideline and the alteplase package insert at build (spec-v97 discipline); the sketch is
  not a source. A high-stakes tile with unverified criteria would be unsafe and MUST NOT ship
  until the criteria are re-verified.
