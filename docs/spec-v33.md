# spec-v33.md — Nurse-bedside opioid-sedation + neonatal-pain extensions: N-PASS, CRIES, POSS

> Status: proposed (2026-05-21). v33 is a narrow, three-tile
> spec that extends the v32 non-verbal pain catalog with the
> three remaining bedside-necessary pain / sedation scales noted
> as out-of-scope in [spec-v32 §5](spec-v32.md). It does not
> amend any other spec rule and rides under the spec-v11 audit
> floor and the spec-v12 §5 shipping contract.
>
> Catalog effect at v33 close: **236 + 3 = 239 tiles.**

## 1. Thesis

v32 shipped the three non-ICU non-verbal pain surfaces (FLACC,
PAINAD, NIPS) and explicitly deferred N-PASS, CRIES, and POSS to
a future spec. v33 ships exactly those three. Each is named in
v32 §5 as a candidate for follow-on work; each is a small
ordinal sum with a banded interpretation that a nurse acts on at
the bedside; each consumes structured inputs and produces a
computed result; each passes the v29 §3 one-line test.

After v33 the nurse-bedside pain / sedation surface is complete
for the non-self-report population: ICU (CPOT, BPS), peds /
dementia / neonatal non-verbal (FLACC, PAINAD, NIPS), neonatal
extended (N-PASS, CRIES), and opioid-sedation monitoring (POSS).

## 2. What v33 adds (3 tiles)

### 2.1 `npass` — Neonatal Pain, Agitation, and Sedation Scale

- **Citation:** Hummel P, Puchalski M, Creech SD, Weiss MG.
  *Clinical reliability and validity of the N-PASS: neonatal
  pain, agitation and sedation scale with prolonged pain.*
  J Perinatol 2008;28(1):55-60.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-nicu`, `nursing-peds`, `nursing-general`, `pediatrics`, `neonatology`.
- **Inputs:** 5 ordinal pickers, each −2 to +2 (Crying/Irritability;
  Behavior/State; Facial expression; Extremities/Tone; Vital
  signs HR/RR/BP/SaO₂). Negative values score sedation; positive
  values score pain/agitation. Plus one number input: gestational
  age in weeks (20-44).
- **Bands:** Pain score >3 indicates pain/agitation requiring
  intervention; preterm infants <30 weeks gestational age add 1
  point to the pain side per week below 30 (Hummel 2008). Sedation:
  0 no sedation, −1 to −2 light sedation, −3 to −4 deep sedation,
  ≤−5 over-sedation.

### 2.2 `cries` — CRIES neonatal postoperative pain scale

- **Citation:** Krechel SW, Bildner J. *CRIES: a new neonatal
  postoperative pain measurement score. Initial testing of
  validity and reliability.* Paediatr Anaesth 1995;5(1):53-61.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-nicu`, `nursing-peds`, `nursing-general`, `pediatrics`, `neonatology`, `anesthesiology`.
- **Inputs:** 5 ordinal pickers, each 0-2: Crying (high-pitched);
  Requires increased O₂ for SaO₂ <95%; Increased vital signs
  (HR/BP); Expression; Sleeplessness.
- **Bands:** Total 0-10. Score ≥4 indicates need for analgesia
  per Krechel 1995; ≥7 suggests severe pain.

### 2.3 `poss` — Pasero Opioid-induced Sedation Scale

- **Citation:** Pasero C. *Assessment of sedation during opioid
  administration for pain management.* J Perianesth Nurs
  2009;24(3):186-190.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-floor`, `nursing-icu`, `nursing-general`, `anesthesiology`, `pain-medicine`, `palliative-care`.
- **Inputs:** 1 ordinal picker (single 5-level scale): S (sleep,
  easy to arouse) / 1 (awake & alert) / 2 (slightly drowsy,
  easily aroused) / 3 (frequently drowsy, drifts off mid-
  conversation) / 4 (somnolent, minimal/no response to physical
  stimulation).
- **Bands:** S / 1 / 2 are acceptable — opioid dosing may
  proceed. 3 is unacceptable — decrease opioid dose 25-50%, add
  non-opioid, monitor closely. 4 is unacceptable — stop opioid,
  consider naloxone, call rapid response (Pasero 2009).

## 3. Files touched

```
docs/spec-v33.md                         (this file)
app.js                                   (+3 UTILITIES rows)
lib/scoring-v4.js                        (+3 exports: npass, cries, poss)
lib/meta.js                              (+3 META[id] entries)
views/group-g.js                         (+3 renderers)
test/unit/npass.test.js                  (new)
test/unit/cries.test.js                  (new)
test/unit/poss.test.js                   (new)
docs/audits/v11/npass.md                 (new)
docs/audits/v11/cries.md                 (new)
docs/audits/v11/poss.md                  (new)
docs/scope-mdcalc-parity.md              (catalog count 236 -> 239)
docs/spec-v32.md                         (§5 cross-reference back-link: "Resolved by spec-v33")
CHANGELOG.md                             (Unreleased: v33 entry)
README.md                                (catalog count 236 -> 239)
package.json                             (description count 236 -> 239)
```

## 4. Acceptance criteria

v33 is fully shipped when:

- This file exists.
- All three tiles in §2 are present: `META[id]` entries, ≥3
  boundary worked examples in the test suite, primary citation
  visible inline, spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 239.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v33 with the catalog-count delta.

## 5. Out of scope for v33

- COMFORT and COMFORT-B (Ambuel 1992 / van Dijk 2005) — pediatric
  ICU sedation; multi-item with vital-sign sub-scoring complex
  enough to merit its own spec.
- RASS and SAS adult sedation scales — already deferred under
  v29 nursing-floor scope; the adult equivalents to POSS are
  best handled in a future ICU-focused spec.
- Self-report pain scales (NRS, VAS, Wong-Baker FACES). The
  numeric / verbal / faces self-report tools are not calculators
  — they are direct patient input and require no math. Sophie
  declines to ship them per the v29 §3 one-line test (carried
  forward from v32 §5).
