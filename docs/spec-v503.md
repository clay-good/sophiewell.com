# spec-v503.md — Simpson grade (meningioma resection) tile

> Status: **SHIPPED (2026-07-23).** Builds the `simpson-meningioma` tile — the Simpson grade of meningioma
> resection completeness, grades I-V. Catalog **1353 → 1354**, group G.

## Why

The catalog had no extent-of-resection descriptor of any kind. The Simpson grade is the standard record of how
complete a meningioma removal was, recorded by the surgeon at operation, and it is the number every operative
note and tumor board quotes. `simpson` (as a resection grade) was zero-hit — the one corpus mention was the
echocardiographic Simpson biplane LVEF method, unrelated.

## What it does

The surgeon records the grade; the tile reports the grade and its resection description.

- `lib/simpson-meningioma-v503.js` — pure grade → description, the five Simpson grades. **I:** complete
  removal with the dural attachment and abnormal bone. **II:** complete removal with coagulation of the dural
  attachment. **III:** complete removal without treating the dural attachment. **IV:** partial removal, tumor
  left in situ. **V:** decompression only. Accepts I-V and 1-5.
- `views/group-v503.js` (RV503) — one select (dom `simpson-grade`), real `<label for>`.
- `lib/meta.js` — Simpson 1957 (J Neurol Neurosurg Psychiatry) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v223 → v224); corpus → 1354.

**HIGH-STAKES:** it reports the resection grade the surgeon has recorded, never a diagnosis, an individual
recurrence prediction, or a decision about adjuvant radiotherapy ([spec-v11](spec-v11.md) §5.3). The lower
grades were associated with a lower reported recurrence rate; the tile states that as the general association
Simpson reported, descriptively, not as a prognosis for a particular patient. The management decision stays
with the neurosurgery and neuro-oncology team.

## Sourcing (spec-v97)

- **Citation:** Simpson D. The recurrence of intracranial meningiomas after surgical treatment. *J Neurol
  Neurosurg Psychiatry.* 1957;20(1):22-39 — the original description.
- Cross-verified against neurosurgical references reproducing the same grade I (complete with dura and bone)
  through grade V (decompression only) definitions.

## Verification

Lint (all catalog-truth surfaces at 1354), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: grade II renders the dural-coagulation description, I and V flip to their endpoints; the tile does not
scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the surgeon records; it does not read the operative note or the postoperative MRI,
grade the resection itself, or weigh radiotherapy. The proposed Simpson grade 0 (an extended grade I with a
margin of surrounding dura) is a later modification and is not modeled. The MCP adapter + golden-probe
promotion follow in the next wave (328).
