# spec-v519.md — Eckardt symptom score (achalasia) tile

> Status: **SHIPPED (2026-07-27).** Builds the `eckardt` tile — the four-symptom achalasia score, total 0-12
> with stages 0/I/II/III. Catalog **1368 → 1369**, group G.

## Why

Achalasia was a whole-concept gap: `achalasia`, `eckardt`, `gastroparesis`, and `demeester` were **all**
zero-hit across `corpus.json`, `app.js`, and `lib/meta.js`.

The catalog already reads the esophagus in several ways — `la-esophagitis` and `savary-miller` for reflux
injury, `prague` for Barrett segment length, `pas-swallow` for airway invasion on a swallow study. Every one
of those grades something an **endoscope or a fluoroscope sees**. The Eckardt score is the axis none of them
cover: **what the patient reports**, which is how achalasia treatment is actually followed over time.

## What it does

Four symptoms, each 0-3, total **0-12**:

| Item | Scored by | 0 / 1 / 2 / 3 |
| --- | --- | --- |
| Dysphagia | Frequency | none / occasional / daily / at every meal |
| Regurgitation | Frequency | none / occasional / daily / at every meal |
| Retrosternal chest pain | Frequency | none / occasional / daily / at every meal |
| Weight loss | **Amount** | none / under 5 kg / 5-10 kg / over 10 kg |

**The four items are not four of the same question.** Three are frequencies; the fourth is a weight in
kilograms. A view or adapter that reused one shared option list would silently ask *how often* the patient
lost weight, so each item carries its own option texts and `ECKARDT_ITEMS` is the one source of that wording
for the renderer, the MCP adapter, and the tests. A unit test asserts the weight-loss options never contain
frequency words.

Stages: **0-1 → stage 0**, **2-3 → stage I**, **4-6 → stage II**, **above 6 → stage III**.

**The total and the stage are different numbers.** A total of 2 is stage I — "stage 1" is not "1 point". Both
are returned and both are labeled, and a test pins the pair that most invites the confusion.

- `lib/eckardt-v519.js` — pure answers → total, stage, and remission flag. Exports `ECKARDT_ITEMS`.
- `views/group-v519.js` (RV519) — four selects (dom `eck-dysphagia`, `eck-regurgitation`, `eck-chestPain`,
  `eck-weightLoss`) under one **h2** section heading, each with a real `<label for>`.
- `lib/meta.js` — Eckardt and colleagues 1992 citation + accessed date + bands. No citation-staleness row (a
  named-author article, no guideline-issuer acronym).
- 11 worked-example unit tests + fuzz registration; synonym entry; corpus → 1369.

**HIGH-STAKES:** it is a symptom score. It is **not** a diagnosis of achalasia — that needs manometry — and a
low score does not exclude it. It does not grade the manometric subtype, does not measure esophageal
emptying, and is **not** an indication to dilate, to inject, or to operate ([spec-v11](spec-v11.md) §5.3).
Symptom relief and esophageal emptying can disagree: a treated patient can report a low score while the
esophagus still empties poorly, which is why follow-up conventionally pairs the score with objective testing.
The tile says so.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the eponym (`eckardt`), the concept (`achalasia`), and
neighbouring esophageal-motility terms (`gastroparesis`, `demeester`, `chicago`) — each against **both**
`corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. All zero. `dysphagia` and
`esophagitis` are present but belong to other tiles grading other things.

## Sourcing (spec-v97)

- **Citation:** Eckardt VF, Aignherr C, Bernhard G. Predictors of outcome in patients with achalasia treated
  by pneumatic dilation. *Gastroenterology.* 1992;103(6):1732-1738.
- Cross-verified against StatPearls (*Achalasia*), which reproduces the same four symptoms scored 0-3 and the
  same stage bands (0-1 → 0, 2-3 → I, 4-6 → II, above 6 → III), and against achalasia treatment series that
  define clinical success as a score of 3 or less and reproduce the same frequency anchors and kilogram
  bands.
- The **kilogram** bands are kept as the source defines them, with approximate pounds in parentheses for a US
  reader. Restating the cut points in pounds would move them.

## Verification

Lint (all catalog-truth surfaces at 1369), unit suite (+11 + fuzz), a11y, build — all green.

## Out of scope

The tile does not assign the Chicago Classification manometric subtype (I/II/III), compute a timed barium
esophagram column height, score the Achalasia-specific Quality of Life instrument, or recommend a treatment
modality. The MCP adapter + golden-probe promotion follow in the next wave (344).
