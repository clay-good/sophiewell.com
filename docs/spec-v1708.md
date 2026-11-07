# spec-v1708 — IV thrombolysis checklist (AHA/ASA 2026)

> Status: **SHIPPED (2026-11-07)**: `tpa-eligibility`. Closes the
> [tpa-eligibility](../openspec/changes/tpa-eligibility/) change, which waited since July 2026 for the 2026 guideline to
> be read.

## Sources

The AHA/ASA 2026 guideline for the early management of acute ischemic stroke (Stroke 2026;57(8),
doi:10.1161/STR.0000000000000513, Free Access) and its correction (doi:10.1161/STR.0000000000000530, July 27, 2026), read
November 7, 2026: sections 4.3 and 4.6 and Tables 7 and 8. The recommendation tables and Table 8 are published as
images and were read at full resolution; they already carry the correction's IVT items. The TNKase (v4, December 15,
2025) and Activase (v15, January 20, 2026) labels on DailyMed. The rewritten
[design.md](../openspec/changes/tpa-eligibility/design.md) records every rule; the guideline is paraphrased, never copied.

## What the tool does

- **Timing** by the guideline: within 4.5 hours (class 1); unknown onset within 4.5 hours of recognition with a DWI
  lesion under one-third of the MCA territory and no marked FLAIR change (2a); wake-up within 9 hours of the sleep
  midpoint or 4.5 to 9 hours, with penumbra on automated perfusion imaging and not a thrombectomy candidate (2a, as
  corrected); 4.5 to 24 hours with an LVO, penumbra and no thrombectomy (2b); beyond 24 hours, no recommendation. Each
  extended window says which condition is missing.
- **Disabling deficits** must be answered; non-disabling returns the 3: No Benefit recommendation.
- **Table 8**, every row by tier (below); labs fire the coagulopathy row by number.
- **BP and glucose** are stated as things the guideline asks to correct (below 185/110 before starting; correct glucose
  and reassess).
- **The labels beside the guideline**: both labels say within 3 hours and contraindicate several rows Table 8 grades
  differently; the result states the label status beside each and reconciles neither.
- Never eligible, never an order, never a computed dose (Table 7's doses are shown as information).

## Table 8 as built (tier, row, label status)

| Tier | Row | Label status |
|---|---|---|
| absolute | Extensive clear hypodensity on imaging explaining the symptoms |  |
| absolute | Acute intracranial hemorrhage on CT | both labels (active or current intracranial hemorrhage) |
| absolute | Moderate to severe traumatic brain injury within 14 days (over 30 min unconscious with GCS under 13, or hemorrhage, contusion or skull fracture on imaging) | both labels (head trauma within 2 months, TNKase; serious head trauma within 3 months, Activase) |
| absolute | Intracranial or spinal surgery within 14 days | both labels (within 2 months, TNKase; within 3 months, Activase) |
| absolute | Acute spinal cord injury within 3 months | Activase (intraspinal trauma within 3 months), and TNKase if within 2 months |
| absolute | Intra-axial intracranial neoplasm | both labels (intracranial neoplasm) |
| absolute | Symptoms consistent with infective endocarditis |  |
| absolute | Severe coagulopathy or thrombocytopenia (platelets under 100,000/mm³, INR over 1.7, aPTT over 40 s or PT over 15 s) | both labels (bleeding diathesis) |
| absolute | Known or suspected aortic arch dissection |  |
| absolute | Amyloid-related imaging abnormalities, or amyloid immunotherapy |  |
| relative | Pre-existing disability or frailty |  |
| relative | DOAC taken within 48 hours (timing, renal function, assays and reversal weighed individually) |  |
| relative | Ischemic stroke within 3 months |  |
| relative | Prior intracranial hemorrhage (amyloid angiopathy higher risk than a modifiable cause) |  |
| relative | Major non-CNS trauma within 14 days (surgical consultation) |  |
| relative | Major non-CNS surgery within 10 days (surgical consultation) |  |
| relative | GI or GU bleeding within 21 days (GI or GU consultation) | both labels if the bleeding is active (active internal bleeding) |
| relative | Intracranial arterial dissection (safety unknown) |  |
| relative | Unruptured, untreated intracranial vascular malformation (safety unknown) | both labels (arteriovenous malformation) |
| relative | STEMI within 3 months (emergent cardiology consultation) |  |
| relative | Acute pericarditis (with major, likely disabling stroke; emergent cardiology consultation) |  |
| relative | Left atrial or ventricular thrombus (with major, likely disabling stroke; emergent cardiology consultation) |  |
| relative | Systemic active malignancy (emergent oncology consultation) |  |
| relative | Pregnancy or the post-partum period (moderate or severe stroke; emergent obstetric consultation) |  |
| relative | Dural puncture within 7 days |  |
| relative | Puncture of a noncompressible artery within 7 days (safety unknown) |  |
| relative | Moderate to severe traumatic brain injury 14 days to 3 months ago (neurosurgical and neurocritical care consultation) | Activase (serious head trauma within 3 months), and TNKase if within 2 months |
| relative | Intracranial or spinal surgery 14 days to 3 months ago (neurosurgical consultation) | Activase (within 3 months), and TNKase if within 2 months |
| favorable | Extracranial cervical arterial dissection |  |
| favorable | Extra-axial intracranial neoplasm | both labels (intracranial neoplasm) |
| favorable | Stroke during or right after angiography |  |
| favorable | Unruptured intracranial aneurysm | both labels (aneurysm) |
| favorable | Remote, stable GI or GU bleeding (GI or GU consultation) |  |
| favorable | Remote myocardial infarction |  |
| favorable | Recreational drug use |  |
| favorable | Uncertain whether this is a stroke or a mimic |  |
| favorable | Moyamoya disease |  |

## Fail-closed on the labels

The tool calls `labelRow()` for both labels: if either is superseded by the weekly watch or lapses (12 months after its
last reading), the label statements are withheld with the reason, and the guideline checklist keeps answering.

## Proof

`test/unit/tpa-eligibility-v1708.test.js` (12 tests): the 10 / 18 / 9 row counts; every absolute row stops the checklist;
the 2026 moves to relative (prior ICH, stroke within 3 months, DOAC within 48 hours); each lab limit on both sides; the
non-disabling path; every extended window and its missing condition; the label statements; BP and glucose; blank answers
refused; the labels withheld once they lapse; and no output containing give, administer, start, push or infuse as an instruction.
