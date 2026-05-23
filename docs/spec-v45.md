# spec-v45.md — Bedside suicide-risk screen: C-SSRS

> Status: proposed (2026-05-22). v45 is a narrow, single-tile
> spec that closes the suicide-risk screening gap in Sophie's
> psychiatric / behavioral-health nursing surface. PHQ-9 and
> GAD-7 already ship as severity screens for depression and
> anxiety; Sophie has no validated suicide-risk triage tool.
> C-SSRS (Posner 2011) is the Joint-Commission-recommended
> bedside instrument used in routine ED, inpatient, and primary-
> care nursing screening. No other spec rule is amended.
>
> Catalog effect at v45 close: **253 + 1 = 254 tiles.**

## 1. Thesis

PHQ-9 item 9 captures "thoughts that you would be better off
dead or of hurting yourself in some way" but is not designed
as a suicide-risk triage instrument — a positive PHQ-9 item 9
does not by itself answer the bedside RN's question of "what
level of monitoring does this patient need right now." C-SSRS
is the instrument that answers that question. The Columbia
Lighthouse Project's *Suicide Risk Screener* (the recent /
ED triage version) is six questions performed by the bedside
RN, total time under 60 seconds; it is mandated by the Joint
Commission as a suicide-risk screen for all medical-surgical
inpatients with a positive depression screen and by SAMHSA for
ED triage.

The screener's positive items follow a clinical-severity
gradient. Items 1-2 ask about passive ideation; items 3-5 ask
about progressively-specific active ideation (methods, intent,
plan); item 6 asks about prior suicidal behavior with a
follow-up about whether the behavior occurred in the past three
months. The Columbia Lighthouse risk-triage poster — the
reference for ED implementations — stratifies risk as:

- **Low**: Yes to Q1 or Q2 only.
- **Moderate**: Yes to Q3, OR a lifetime Yes to Q6 not in the
  past three months.
- **High**: Yes to Q4 or Q5, OR a Yes to Q6 in the past three
  months.

The bedside RN uses the risk band to decide on 1:1 monitoring,
psychiatric consult timing, and discharge safety planning. Per
SAMHSA: "ask, listen, and refer" — the screener is the *ask*
step.

C-SSRS is publicly distributable for clinical use (Columbia
Lighthouse Project's free-for-clinical-use license). It passes
the v29 §3 one-line test (seven boolean inputs → computed risk
band + decision-support text) and is nurse-bedside-actionable.

## 2. What v45 adds (1 tile)

### 2.1 `cssrs` — Columbia Suicide Severity Rating Scale - Screener / Recent (Posner 2011)

- **Citation:** Posner K, Brown GK, Stanley B, Brent DA,
  Yershova KV, Oquendo MA, Currier GW, Melvin GA, Greenhill L,
  Shen S, Mann JJ. *The Columbia-Suicide Severity Rating Scale:
  initial validity and internal consistency findings from three
  multisite studies with adolescents and adults.* Am J
  Psychiatry. 2011;168(12):1266-1277.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-ed`, `nursing-floor`,
  `nursing-general`, `psychiatry`, `emergency-medicine`,
  `family-medicine`, `social-work`.
- **Inputs:** seven boolean items per the Columbia Lighthouse
  ED Triage Screener:
  - Q1: wish you were dead or could go to sleep and not wake up
    (past month)
  - Q2: any thoughts of killing yourself (past month)
  - Q3: thoughts about how you might do it (past month;
    methods, no plan / intent)
  - Q4: thoughts and some intention of acting on them (past
    month)
  - Q5: started to work out or worked out details of how to
    kill yourself; intend to carry it out (past month)
  - Q6: ever done anything, started to do anything, or prepared
    to do anything to end your life (lifetime)
  - Q6a: if Q6 yes — was it within the past 3 months
- **Output:** the risk band per the Columbia Lighthouse Project
  ED Triage Screener:
  - **No suicide risk reported**: all items No.
  - **Low risk**: Yes to Q1 or Q2 only.
  - **Moderate risk**: Yes to Q3, or a lifetime Yes to Q6 not in
    the past three months.
  - **High risk**: Yes to Q4 or Q5, or a Yes to Q6 in the past
    three months.
- **No clinical-action automation.** v45 does not auto-order 1:1
  observation, psychiatric consult, or discharge safety
  planning; the risk band is one input to those decisions, which
  depend on protocol and clinician judgment outside the scope of
  a single tile.

## 3. Files touched

```
docs/spec-v45.md                         (this file)
app.js                                   (+1 UTILITIES row)
lib/scoring-v4.js                        (+1 export: cssrs)
lib/meta.js                              (+1 META[id] entry)
views/group-g.js                         (+1 renderer)
test/unit/cssrs.test.js                  (new)
docs/audits/v11/cssrs.md                 (new)
docs/scope-mdcalc-parity.md              (catalog count 253 -> 254)
CHANGELOG.md                             (Unreleased: v45 entry)
README.md                                (catalog count 253 -> 254)
package.json                             (description count 253 -> 254)
```

## 4. Acceptance criteria

v45 is fully shipped when:

- This file exists.
- The tile in §2 is present: `META[id]` entry, ≥3 boundary
  worked examples in the test suite, primary citation visible
  inline, spec-v11 audit log in `docs/audits/v11/`.
- `UTILITIES.length` is 254.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v45 with the catalog-count delta.

## 5. Out of scope for v45

- Full C-SSRS Lifetime / Recent or C-SSRS Full Risk Assessment
  versions — additional items capturing intensity, frequency,
  duration, and controllability of ideation that are typically
  used by behavioral-health clinicians rather than bedside RNs.
  Candidate for a future spec if a maintainer's behavioral-
  health workflow calls for it.
- SAD PERSONS Scale (Patterson 1983) — older instrument with
  weaker validation than C-SSRS; not recommended by current
  Joint Commission / SAMHSA guidance. Out of scope.
- ASQ (Ask Suicide-Screening Questions; Horowitz 2012) — the
  pediatric equivalent. Candidate for a future spec if a
  maintainer's pediatric ED workflow calls for it.
- Beck Scale for Suicide Ideation (BSS; Beck 1979) — clinician-
  administered, copyrighted, and not Sophie-shaped. Out of
  scope.
- A 1:1-observation / safety-planning order-set generator from
  the C-SSRS band. Depends on local protocol and behavioral-
  health collaboration; out of scope.
