# spec-v542.md — TWSTRS severity subscale (cervical dystonia) tile

> Status: **SHIPPED (2026-07-28).** Builds the `twstrs-severity` tile — the ten-item motor subscale, scored
> out of 35. Catalog **1391 → 1392**, group G.

## Why

Whole-concept gap: `twstrs`, `torticollis`, `dystonia`, `consky`, `laterocollis`, and `cervical dystonia`
were **all** zero-hit. The catalog's movement-disorder tiles (Hoehn-Yahr, Schwab & England, Simpson-Angus,
AIMS) are all parkinsonian or drug-induced; dystonia was uncovered entirely.

## What it does

**This tile scores the severity subscale only, and says so — because that is what could be verified.** The
full TWSTRS is severity 0-35 + disability 0-30 + pain 0-20 = **0-85**. The subscale maxima and every severity
item and range were double-confirmed. The verbatim anchors for the six disability items, and the arithmetic
deriving the pain-severity item, were **not** — each rested on a single source. Shipping a "TWSTRS total"
built on half-verified halves would produce a number that *looks* like the published instrument and is not
it. So the tile scores severity, reports it out of 35, and states in every result that it is one of three
subscales.

| Item | Range |
| --- | --- |
| Rotation | 0-4 |
| Laterocollis | 0-3 |
| Sagittal deviation (anterocollis **or** retrocollis) | 0-3 |
| Lateral shift | 0-1 |
| Sagittal shift | 0-1 |
| **Duration** | 0-5, **×2 → 0-10** |
| Effect of sensory tricks | 0-2 |
| Shoulder elevation | 0-3 |
| Range of motion | 0-4 |
| Time held in neutral | 0-4 |

`12 + 10 + 2 + 3 + 4 + 4 = 35`. That arithmetic is itself a check on the item ranges, and a test asserts it —
which is what gave confidence here, since the two available copies of the form are separately hosted but may
not be independently transcribed.

**Duration is the only weighted item.** Rated 0-5, then **doubled**. Summing it raw would cap the subscale at
**30** instead of 35 and systematically under-weight the item the scale deliberately emphasises: how much of
the time the patient is actually dystonic. The tile stores the raw rating and the weighted contribution
separately so the doubling is visible rather than buried, and a test asserts the raw-sum maximum really is 30.

**Anterocollis and retrocollis are mutually exclusive.** A neck cannot be flexed and extended at once, so the
scale gives them one 0-3 slot with a direction, not two additive items — scoring both would push the subscale
to **38**. The tile makes this structural: there is a single sagittal-deviation item and no second field to
score.

- `lib/twstrs-severity-v542.js` — pure items → total, excursion subtotal, and the duration raw/weighted pair.
  Exports `TWSTRS_ITEMS` and the derived `TWSTRS_SEVERITY_MAX`.
- `views/group-v542.js` (RV542) — ten selects (dom `twstrs-*`) under two **h2** headings.
- `lib/meta.js` — Consky and Lang 1994 with the Comella 1997 motor-section validation + accessed date +
  bands. No citation-staleness row (a named-author source, no guideline-issuer acronym).
- 10 worked-example unit tests + fuzz registration; synonym entry; corpus → 1392.

**HIGH-STAKES:** this rates the **motor appearance** at one moment. It does not diagnose cervical dystonia or
distinguish it from the other causes of an abnormal head posture — structural cervical spine disease, ocular
torticollis, vestibular disorders, drug-induced acute dystonic reaction, and in a child **posterior fossa
pathology** — some of which are urgent and none of which this scale can see. It does not measure **disability
or pain**, which are the other two subscales and often matter more to the patient than the posture does. It
is not an indication for botulinum toxin, does not select a muscle or a dose, and does not assess deep brain
stimulation candidacy ([spec-v11](spec-v11.md) §5.3).

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`twstrs`), the condition (`torticollis`,
`dystonia`, `cervical dystonia`), the first author (`consky`), and an item name (`laterocollis`) — each
against **both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. All zero.

## Sourcing (spec-v97)

- **Citation:** Consky ES, Lang AE. Clinical assessments of patients with cervical dystonia. In: Jankovic J,
  Hallett M, eds. *Therapy with Botulinum Toxin.* New York: Marcel Dekker; 1994:211-237. Motor section
  validated in Comella CL, Stebbins GT, Goetz CG, et al. *Mov Disord.* 1997;12(4):570-575.
- Items and ranges transcribed from two independently hosted copies of the rating form agreeing on every
  item, with the **sum-to-35** arithmetic as independent corroboration.
- The disability and pain subscales are **deliberately not implemented** — see above. This is a scoping
  decision recorded so a future session does not "complete" the tile by adding single-sourced wording.

## Verification

Lint (all catalog-truth surfaces at 1392), unit suite (+10 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not score the disability or pain subscales, produce a TWSTRS total out of 85, apply the TWSTRS-2
revision, guide botulinum toxin muscle selection or dosing, or diagnose cervical dystonia. The MCP adapter +
golden-probe promotion ship in the same wave (367).
