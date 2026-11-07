# Design — IV thrombolysis eligibility checklist (AHA/ASA 2026)

**Re-verified November 7, 2026 against the 2026 text.** Every rule below was read in the guideline itself (Prabhakaran S,
et al. 2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke. *Stroke* 2026;57(8),
doi:10.1161/STR.0000000000000513, Free Access) and its correction (doi:10.1161/STR.0000000000000530, July 27, 2026).
The recommendation tables and Table 8 are published as images; they were read at full resolution, and the images are
the corrected versions (the correction's items 12, 13 and 16 to 18 are already in them). The guideline is copyrighted:
the tool paraphrases each row in a few words and cites it, as the house rule for licensed sources requires.

The 2019-era sketch that stood here is **withdrawn**. It was wrong in ways that matter: the 2026 guideline has no
separate 3 to 4.5 hour tier and no ECASS-III relative exclusions (age over 80, NIHSS over 25, any anticoagulant,
diabetes with prior stroke), and it moves prior intracranial hemorrhage, ischemic stroke within 3 months and DOAC use
within 48 hours from absolute to **relative** contraindications.

## Sources, as read

| Part | What it says (paraphrased) |
|---|---|
| §4.6.1 recommendations (image) | Disabling deficits, regardless of NIHSS, eligible: treat fast (1, A). Within 4.5 h: start as quickly as possible, without waiting for CTA/MRA or perfusion imaging (1, B-NR). Glucose before IVT; treat severe hypo- or hyperglycemia (1, B-NR), typically below 50 or above 400 mg/dL in the text; if disabling deficits persist after correction, IVT recommended (1, C-LD). Mild to moderate early ischemic change, other than frank hypodensity explaining the presentation: IVT recommended (1, A). Mild **non-disabling** deficits within 4.5 h: not recommended (3: No Benefit, B-R). Single or dual antiplatelet: recommended (1, B-NR). Not delaying for labs when nothing suggests an abnormal result (2a). Unknown microbleed burden: do not wait for MRI (1); 1 to 10 microbleeds reasonable (2a); more than 10 uncertain (2b). Children 28 days to 18 years, disabling, within 4.5 h: alteplase may be considered (2b, C-LD) |
| §4.6.3 extended windows (image) | Unknown onset, within 4.5 h of symptom recognition, MRI-DWI lesion under one-third of the MCA territory and no marked FLAIR change (2a, B-R). Not eligible for thrombectomy, salvageable penumbra on automated perfusion imaging, and woke with symptoms within 9 h of the midpoint of sleep or 4.5 to 9 h from last known well (2a, B-R). Large-vessel occlusion with salvageable penumbra, 4.5 to 24 h, cannot receive thrombectomy, directed by thrombolysis experts (2b, B-R) |
| §4.3 blood pressure (image) | Elevated BP and otherwise eligible: lower SBP below 185 and DBP below 110 mm Hg before IVT is started (1, B-NR); after IVT, below 180/105 for at least 24 h (1, B-R) |
| Table 7 | Alteplase 0.9 mg/kg (max 90 mg) over 60 min, 10% as a 1-min bolus; tenecteplase 0.25 mg/kg (max 25 mg) bolus by weight band (under 60 kg 15 mg; 60 to under 70, 17.5; 70 to under 80, 20; 80 to under 90, 22.5; 90 or more, 25) |
| Table 8 (image), three tiers | Listed below |

**Table 8, benefit generally greater than bleeding risk (light teal):** extracranial cervical dissection; extra-axial
intracranial neoplasm; procedural stroke during or right after angiography; unruptured intracranial aneurysm; remote,
stable GI or GU bleeding; remote MI; recreational drug use; uncertainty whether this is a stroke or a mimic; moyamoya.

**Relative contraindications (peach):** pre-existing disability or frailty; DOAC within 48 h; ischemic stroke within
3 months; prior intracranial hemorrhage; major non-CNS trauma within 14 days; major non-CNS surgery within 10 days; GI or
GU bleeding within 21 days; intracranial arterial dissection; unruptured, untreated intracranial vascular malformation;
STEMI within 3 months; acute pericarditis; left atrial or ventricular thrombus; systemic active malignancy; pregnancy and
the post-partum period; dural puncture within 7 days; puncture of a noncompressible artery within 7 days; moderate to
severe TBI 14 days to 3 months ago; intracranial or spinal surgery 14 days to 3 months ago. Each row names the
consultation or judgment the guideline asks for.

**Absolute contraindications (pinkish red):** extensive regions of clear hypodensity on imaging explaining the symptoms;
acute intracranial hemorrhage on CT; moderate to severe TBI within 14 days (more than 30 min unconscious with GCS below
13, or hemorrhage, contusion or skull fracture on imaging); intracranial or spinal surgery within 14 days; acute spinal
cord injury within 3 months; intra-axial intracranial neoplasm; symptoms consistent with infective endocarditis;
platelets below 100,000/mm³, INR above 1.7, aPTT above 40 s or PT above 15 s (without recent warfarin or heparin,
treatment may start before results and stops if they come back abnormal); known or suspected aortic arch dissection;
amyloid-related imaging abnormalities or amyloid immunotherapy.

## Compute contract

`tpaEligibility({ timing, disabling, imaging[], sbp, dbp, glucose, platelets, inr, aptt, pt, recentWarfarinOrHeparin,
absolute[], relative[], favorable[] })`:

- **timing** (enum): `within-4.5h`; `unknown-onset-4.5h-recognition`; `wake-up-9h-midpoint`; `4.5-9h`; `4.5-24h`;
  `beyond-24h`. Each extended option names the imaging condition it needs (`imaging[]`: `dwi-flair-mismatch`,
  `perfusion-penumbra`, `lvo`, `not-evt-candidate`) and returns the recommendation's class, or says which condition
  is missing. `beyond-24h` returns no IVT recommendation from this guideline.
- **disabling** (yes / no / unsure): "no" returns the 3: No Benefit recommendation; never a silent default.
- **BP**: SBP 185 or more, or DBP 110 or more, returns "lower below 185/110 before IVT is started (1, B-NR)" as the
  guideline's statement, not an order. **Glucose** below 50 or above 400 returns "correct and reassess".
- **Labs**, when entered, fire the coagulopathy row by number; blank labs say they were not entered and quote 2a on not
  waiting for them when nothing suggests an abnormal result.
- **Table 8**: any absolute row present returns "absolute contraindication (Table 8): [rows]"; relative rows return
  "relative contraindication: weigh individually" with each row's consultation; favorable rows are listed as such.
- Output never says "give", "administer" or a dose as an instruction; doses are shown as Table 7 information.

## Decisions

**D1 — Table 8's three tiers replace absolute/relative lists.** The tool mirrors the guideline's structure and wording
level; it does not invent a tier for a row.

**D2 — The verdict is a checklist result, never an order (spec-v11 §5.3).** "No absolute contraindication was
checked" is not "eligible": every result says the decision rests with the stroke team and that only the boxes ticked
were considered.

**D3 — Unanswered is not "no".** A blank disabling-deficit question, blank timing or blank labs never reads as the
favorable answer.

**D4 — No pediatric dosing.** Table 7 states pediatric dosing is not determined; the pediatric recommendation is shown
as text only.

## Risks

- Overstating eligibility: mitigated by D2 and D3 and a unit test that no output contains an administration verb as
  an instruction.
- Transcription error from the images: every row is tested against `design.md`, and the build record lists each row
  with its tier so a reviewer can check them against Table 8 side by side.
- Criteria drift: the AHA is a tracked issuer; a citation-staleness row and the correction date are required.
