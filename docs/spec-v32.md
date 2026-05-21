# spec-v32.md — Non-verbal pain scales for nurse-bedside use: FLACC, PAINAD, NIPS

> Status: proposed (2026-05-21). v32 is a narrow, three-tile
> spec that extends the v29 nursing-shift catalog with the three
> validated non-verbal pain scales nurses reach for at the
> bedside when the patient cannot self-report on a numeric rating
> scale. It does not amend any other spec rule and rides under
> the spec-v11 audit floor and the spec-v12 §5 shipping contract.
>
> Catalog effect at v32 close: **233 + 3 = 236 tiles.**

## 1. Thesis

Sophie already ships the two ICU-specific non-self-report pain
tools that landed in v29 (CPOT for any ICU patient, BPS for the
intubated patient). What is missing is the *non-ICU* non-verbal
pain surface: pediatrics (`FLACC`), advanced dementia (`PAINAD`),
and neonatal (`NIPS`). These are the three highest-frequency
non-verbal pain scales on med-surg, peds, NICU, geriatric, and
palliative-care nursing units. Each is a small ordinal sum with
a banded interpretation; each consumes structured inputs and
produces a computed result; each passes the v29 §3 one-line test.

## 2. What v32 adds (3 tiles)

### 2.1 `flacc` — FLACC scale (Face, Legs, Activity, Cry, Consolability)

- **Citation:** Merkel SI, Voepel-Lewis T, Shayevitz JR, Malviya S.
  *The FLACC: a behavioral scale for scoring postoperative pain
  in young children.* Pediatr Nurs 1997;23(3):293-297.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-floor`, `nursing-peds`, `nursing-nicu`, `nursing-general`, `pediatrics`, `anesthesiology`.
- **Inputs:** 5 ordinal pickers, each 0-2: Face, Legs, Activity, Cry, Consolability.
- **Bands:** 0 relaxed/comfortable; 1-3 mild discomfort; 4-6 moderate pain; 7-10 severe pain or severe discomfort (Merkel 1997).

### 2.2 `painad` — Pain Assessment in Advanced Dementia

- **Citation:** Warden V, Hurley AC, Volicer L. *Development and
  psychometric evaluation of the Pain Assessment in Advanced
  Dementia (PAINAD) scale.* J Am Med Dir Assoc 2003;4(1):9-15.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-floor`, `nursing-general`, `geriatrics`, `palliative-care`, `internal-medicine`, `family-medicine`.
- **Inputs:** 5 ordinal pickers, each 0-2: Breathing independent of vocalization; Negative vocalization; Facial expression; Body language; Consolability.
- **Bands:** 0 no pain; 1-3 mild; 4-6 moderate; 7-10 severe (Warden 2003).

### 2.3 `nips` — Neonatal Infant Pain Scale

- **Citation:** Lawrence J, Alcock D, McGrath P, Kay J, MacMurray
  SB, Dulberg C. *The development of a tool to assess neonatal
  pain.* Neonatal Netw 1993;12(6):59-66.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-nicu`, `nursing-peds`, `nursing-general`, `pediatrics`, `neonatology`.
- **Inputs:** 6 ordinal pickers — Facial expression (0/1), Cry (0/1/2), Breathing patterns (0/1), Arms (0/1), Legs (0/1), State of arousal (0/1). Total 0-7.
- **Bands:** 0-2 no/mild pain; 3-4 mild-to-moderate pain; >4 severe pain — interpretation per Lawrence 1993.

## 3. Files touched

```
docs/spec-v32.md                         (this file)
app.js                                   (+3 UTILITIES rows)
lib/scoring-v4.js                        (+3 exports: flacc, painad, nips)
lib/meta.js                              (+3 META[id] entries)
views/group-g.js                         (+3 renderers)
test/unit/flacc.test.js                  (new)
test/unit/painad.test.js                 (new)
test/unit/nips.test.js                   (new)
docs/audits/v11/flacc.md                 (new)
docs/audits/v11/painad.md                (new)
docs/audits/v11/nips.md                  (new)
docs/scope-mdcalc-parity.md              (catalog count 233 -> 236)
CHANGELOG.md                             (Unreleased: v32 entry)
README.md                                (catalog count 233 -> 236)
package.json                             (description count 233 -> 236)
```

## 4. Acceptance criteria

v32 is fully shipped when:

- This file exists.
- All three tiles in §2 are present: `META[id]` entries, ≥3
  boundary worked examples in the test suite, primary citation
  visible inline, spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 236.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v32 with the catalog-count delta.

## 5. Out of scope for v32

- N-PASS (Hummel 2008), CRIES (Krechel 1995), and other
  neonatal/pediatric non-verbal pain scales — candidates for a
  future spec. **Resolved by [spec-v33](spec-v33.md):** N-PASS
  and CRIES ship in v33 wave 33-1.
- Self-report pain scales (NRS, VAS, Wong-Baker FACES). The
  numeric / verbal / faces self-report tools are not calculators
  — they are direct patient input and require no math. Sophie
  declines to ship them per the v29 §3 one-line test.
- POSS (Pasero Opioid-induced Sedation Scale) — opioid-sedation
  monitoring; candidate for a future spec. **Resolved by
  [spec-v33](spec-v33.md):** POSS ships in v33 wave 33-1.
