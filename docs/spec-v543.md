# spec-v543.md — SAVE score (survival after veno-arterial ECMO) tile

> Status: **SHIPPED (2026-07-28).** Builds the `save-score` tile — survival after VA-ECMO for refractory
> cardiogenic shock. Catalog **1392 → 1393**, group G.

## Why

`save score` and `veno-arterial` were zero-hit across `corpus.json`, `app.js`, and `lib/meta.js`.

**A companion gap and a distinct question.** The catalog has `resp-score` (RESP), which predicts survival
after **respiratory, veno-venous** ECMO — SAVE is its **veno-arterial** counterpart, a different population
with entirely different predictors. It is also distinct from `cardshock-score` and `scai-shock`, which grade
cardiogenic shock *before and without reference to* ECMO. SAVE answers a narrower question: given that
VA-ECMO is being started, what was the survival of patients who looked like this one.

## What it does

### There is a constant of −6, and forgetting it shifts every patient a full risk class

The published table lists it as its own row. A patient whose components sum to 0 has a SAVE score of **−6,
not 0** — and since the class boundaries sit at 5, 0, −5 and −10, a six-point shift moves most patients
across at least one, always in the optimistic direction. The tile applies it, reports `componentTotal`,
`constant` and `total` **separately** so the arithmetic is auditable, and a test pins that an all-negative
patient scores −6 and lands in class IV rather than the class III a missing constant would give.

### The diagnosis groups and organ failures are additive, not exclusive

The source says "select one or more" for both. Myocarditis **plus** refractory VT scores +3 **and** +2; liver
plus CNS plus renal failure scores **−9**. Modelling either as a single-choice list — the natural schema
shape — would under-score the most salvageable and the sickest patients in opposite directions. Tests cover
both stacks.

| | Weights |
| --- | --- |
| Diagnosis | myocarditis +3, refractory VT/VF +2, post heart/lung transplant +3, congenital heart disease **−3**, other 0 |
| Age | 18-38 **+7**, 39-52 +4, 53-62 +3, ≥63 0 |
| Weight | ≤65 kg +1, 65-89 +2, ≥90 0 |
| Acute organ failure (each) | liver **−3**, CNS **−3**, renal **−3** |
| Chronic renal failure | **−6** |
| Intubation before ECMO | ≤10 h 0, 11-29 h −2, ≥30 h **−4** |
| Other | PIP ≤20 +3, pre-ECMO arrest −2, diastolic ≥40 +3, pulse pressure ≤20 −2, HCO₃ ≤15 −3 |

Range **−35 to 23**. Classes: **>5** I (75%), **1-5** II (58%), **−4 to 0** III (42%), **−9 to −5** IV (30%),
**≤−10** V (18%). Zero was constructed to sit near a fifty-fifty chance.

**Two secondary-source errors are corrected here.** One states the range as −35 to 17; the primary table says
23. Another renders class I as "≥5" and class II as "1-4", which mis-assigns a score of **exactly 5** — the
primary says class I is *above* 5. A test pins that 5 is class II and 6 is class I.

- `lib/save-score-v543.js` — pure inputs → component subtotal, constant, total, class, survival. Exports
  `SAVE_DIAGNOSES`, `SAVE_ORGAN_FAILURES`, `SAVE_AGE_BANDS`, `SAVE_WEIGHT_BANDS`,
  `SAVE_INTUBATION_BANDS`, `SAVE_BINARY`, `SAVE_CONSTANT`.
- `views/group-v543.js` (RV543) — bands and independent yes/no flags under four **h2** headings, each option
  labeled with its signed weight.
- `lib/meta.js` — Schmidt and colleagues 2015 citation + accessed date + bands, related to `resp-score`. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 11 worked-example unit tests + fuzz registration; synonym entry; corpus → 1393.

**HIGH-STAKES:** these are survival figures for a **derivation and validation cohort** — groups of patients
who resembled this one. They are not a prediction for the individual, and the score is **not a tool for
deciding whether to offer ECMO or for withdrawing it once started**. Refractory cardiogenic shock is fatal
without support, so a low predicted survival is **not the same as futility**, and patients in the lowest
class still survived — the copy says so, and a test asserts it. It does not diagnose cardiogenic shock, does
not choose a cannulation strategy, does not address the ECMO-specific complications that drive much of the
mortality, and does not account for what happens *after* cannulation — bleeding, limb ischemia, neurologic
injury, or the availability of a durable device or transplant ([spec-v11](spec-v11.md) §5.3).

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the score name (`save score`), the modality
(`veno-arterial`, `ecmo`), the first author (`schmidt`), and the condition (`cardiogenic shock`) — each
against **both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. The non-zero hits
are `ecmo-titration`, `resp-score`, `cardshock-score`, and `scai-shock`, all addressed above.

## Sourcing (spec-v97)

- **Citation:** Schmidt M, Burrell A, Roberts L, et al. Predicting survival after ECMO for refractory
  cardiogenic shock: the survival after veno-arterial-ECMO (SAVE)-score. *Eur Heart J.*
  2015;36(33):2246-2256.
- Every weight, the constant, the range, and all five class boundaries were read **directly from the primary
  publication's own scoring table**, and independently corroborated. Where secondary sources disagreed with
  the primary — on the range and on the class I/II boundary — the primary was shipped and the discrepancies
  are documented above rather than silently discarded.

## Verification

Lint (all catalog-truth surfaces at 1393), unit suite (+11 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not compute the RESP score, diagnose cardiogenic shock, select a cannulation strategy, model
post-cannulation complications, or produce a survival estimate for an individual. The MCP adapter +
golden-probe promotion ship in the same wave (368).
