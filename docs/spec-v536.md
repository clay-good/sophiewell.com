# spec-v536.md — Hardman index (ruptured abdominal aortic aneurysm) tile

> Status: **SHIPPED (2026-07-28).** Builds the `hardman` tile — the five-factor index for mortality after a
> ruptured abdominal aortic aneurysm, shipped **with its refutation**. Catalog **1385 → 1386**, group G.

## Why

`hardman` and `glasgow aneurysm` were zero-hit across `corpus.json`, `app.js`, and `lib/meta.js`. The
catalog's existing aneurysm tiles are all **intracranial** (`hunt-hess-wfns`, `phases`, `elapss`,
`ogilvy-carter`) or describe **anatomic extent** rather than outcome (`crawford-taaa`). There was no
abdominal aortic aneurysm outcome instrument at all.

## What it does

Five factors, one point each, total **0-5**:

| Factor | Threshold |
| --- | --- |
| Age | over 76 years |
| Serum creatinine | over 190 µmol/L (0.19 mmol/L, ~2.15 mg/dL) |
| Hemoglobin | below 9.0 g/dL (90 g/L) |
| Loss of consciousness | after presentation |
| ECG ischemia | ST depression >1 mm and/or associated T-wave changes |

### This tile exists as much to carry the refutation as the score

The original 1996 series reported that **every patient with three or more factors died — 8 of 8**. That
figure entered practice as a rule for **denying surgery**. It has since been repeatedly refuted:

- A pooled analysis of ~970 patients found mortality at ≥3 to be **77%**, not 100, and concluded that an
  index of ≥3 **cannot be used as an absolute limit for denial of surgery**.
- A 178-patient validation found mortality of 44/46/68/79/100% at scores 0-4, and found that loss of
  consciousness, hemoglobin <9, and creatinine >0.19 mmol/L were **not individually significant predictors**.
  Its conclusion: high-risk patients may still survive and should not be denied repair on the basis of the
  scoring system alone.
- A 59-patient validation found **no significant association** between an index of ≥3 and death at all.

So the tile reports the score and the original series' mortality as **history** — labeled as a single small
1996 cohort of 154 patients with only 8 in the highest group — and states the refutation **in the result
itself** at every score of 3 or more. A calculator that printed "100% mortality" and stopped would reproduce
the exact error the subsequent literature exists to correct. Three tests enforce this: every score ≥3 carries
the refutation and the 77% figure; the 100% is always paired with its denominator; and **no score, at any
value, reads as an instruction to deny surgery**.

**On the 16/37/72% figures:** only the 100%-at-≥3 element is independently restated in later work. The lower
bands trace to the original abstract alone, so they are reported as *that series' observation* rather than as
validated performance.

**Units are spelled out because one source disagrees.** The creatinine threshold is **190** µmol/L; a single
secondary paper renders it as 180, a transcription error against the original's own ">0.19 mmol/L".

- `lib/hardman-v536.js` — pure factors → index, the original series' observation as a *sentence*, and a
  `refutation` field. Exports `HARDMAN_CRITERIA`.
- `views/group-v536.js` (RV536) — five yes/no selects (dom `hard-*`) under an **h2** heading.
- `lib/meta.js` — Hardman and colleagues 1996 citation + accessed date + bands, related to `crawford-taaa`.
  No citation-staleness row (a named-author article, no guideline-issuer acronym).
- 9 worked-example unit tests + fuzz registration; synonym entry; corpus → 1386.

**HIGH-STAKES:** a ruptured abdominal aortic aneurysm is **fatal without repair**, so a wrongly withheld
operation is not a conservative choice. This score does **not** identify patients who should be denied an
operation, and the literature is explicit that it must not be used that way. It does not diagnose rupture,
does not choose between open and endovascular repair, and does not substitute for a conversation about
**goals of care** — the decision it is most often wrongly invoked to settle
([spec-v11](spec-v11.md) §5.3).

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the eponym (`hardman`), the competing score
(`glasgow aneurysm`), and the anatomy (`aneurysm`, `aortic`, `crawford`) — each against **both**
`corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. The non-zero hits were enumerated
and are the intracranial and anatomic tiles listed above.

## Sourcing (spec-v97)

- **Citation:** Hardman DT, Fisher CM, Patel MI, et al. Ruptured abdominal aortic aneurysms: who should be
  offered surgery? *J Vasc Surg.* 1996;23(1):123-129.
- The five criteria and thresholds were confirmed across a pooled systematic review and multiple independent
  validation cohorts, which also supply the refutation figures quoted above. Where a single secondary paper
  gave creatinine as 180 µmol/L, the original's own value was shipped.

## Verification

Lint (all catalog-truth surfaces at 1386), unit suite (+9 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not compute the Glasgow Aneurysm Score, the Vancouver score, or any of the other ruptured-AAA
models, diagnose rupture, choose a repair strategy, or produce a survival estimate for an individual. The MCP
adapter + golden-probe promotion ship in the same wave (361).
