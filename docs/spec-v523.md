# spec-v523.md — Scadding stage (sarcoidosis chest radiograph) tile

> Status: **SHIPPED (2026-07-27).** Builds the `scadding` tile — the five radiographic stages of intrathoracic
> sarcoidosis. Catalog **1372 → 1373**, group G.

## Why

Whole-concept gap, the best kind: `scadding`, `sarcoidosis`, `sarcoid`, and `siltzbach` were **all** zero-hit
across `corpus.json`, `app.js`, and `lib/meta.js`. The catalog had no sarcoidosis content of any kind.

## What it does

Five stages read off one chest radiograph:

| Stage | Radiograph |
| --- | --- |
| 0 | Normal |
| I | Bilateral hilar lymphadenopathy, clear lung fields |
| II | Bilateral hilar lymphadenopathy **with** parenchymal infiltrates |
| III | Parenchymal infiltrates **without** hilar lymphadenopathy |
| IV | Fibrosis |

### The numbering invites three wrong readings, and the tile refuses all three

1. **Not a progression.** A patient does not pass through I, then II, then III on the way to IV. Stage III is
   defined by the **absence** of the adenopathy that defines I and II — it is not "II plus more," it is a
   different picture. The stage-III result says so in words.
2. **Not a measure of how the patient is doing.** The published caveat is blunt: the scale correlates poorly
   with functional parameters. A stage IV film does not establish impaired lung function and a stage I film
   does not establish preserved function. Spirometry answers that; this does not.
3. **Not reliable between readers.** Interobserver consistency is a documented limitation, and the III/IV
   boundary in particular depends on whether a reader takes "fibrosis" to mean *any concern for* fibrosis or
   *end-stage* fibrosis — a choice that materially shifts how many films land in each stage. The stage-IV
   result names this.

A unit test asserts every one of the five results carries the "not a severity scale, not a sequence, and not
a measure of lung function" disclaimer.

**On prognosis.** Cohorts have reported that spontaneous remission becomes less likely as the stage rises.
The tile states that **direction** as a cohort-level observation and deliberately attaches **no percentage**
to any stage — the widely quoted remission figures vary between series and none of them are a prediction
about the patient in front of you. A test asserts no remission percentage appears in the output.

- `lib/scadding-v523.js` — pure stage → description plus the caveats. Exports `SCADDING_STAGES`. Accepts
  `1`-`4` and lowercase as aliases for the roman numerals.
- `views/group-v523.js` (RV523) — one select (dom `scad-stage`) under an **h2** heading, whose option text
  carries each stage's defining features so the reader picks the *picture* rather than a number.
- `lib/meta.js` — Scadding 1961 citation + accessed date + bands. No citation-staleness row (a named-author
  article, no guideline-issuer acronym).
- 10 worked-example unit tests + fuzz registration; synonym entry; corpus → 1373.

**HIGH-STAKES:** a radiographic description, **not** a diagnosis and **not** a treatment threshold.
Sarcoidosis is supported by histology and by excluding infection and other granulomatous disease; no
radiographic appearance establishes it, and a normal film is **stage 0, not "no sarcoidosis."** The stage is
not an indication to start, continue, or stop corticosteroids or any other therapy, which turns on symptoms,
organ involvement, and lung function rather than the film ([spec-v11](spec-v11.md) §5.3). It also describes
**only the chest** — eye, heart, skin, nervous system, and liver involvement are invisible to it, and cardiac
involvement in particular is a leading cause of death this staging cannot see. A test asserts the copy names
that blind spot.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the eponym (`scadding`), the disease (`sarcoidosis`,
`sarcoid`), and the neighboring eponym (`siltzbach`) — each against **both** `corpus.json` and `app.js` (and
`lib/meta.js`), plus a `test/unit/` scan. All zero.

## Sourcing (spec-v97)

- **Citation:** Scadding JG. Prognosis of intrathoracic sarcoidosis in England. *Br Med J.*
  1961;2(5261):1165-1172.
- Cross-verified against thoracic-imaging references reproducing the same five stages with the same defining
  features, and stating the interobserver-consistency and poor-functional-correlation limitations that the
  tile carries into its copy.

## Verification

Lint (all catalog-truth surfaces at 1373), unit suite (+10 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not read a CT (which shows parenchymal change a radiograph misses and does not map onto these
stages), stage extrathoracic sarcoidosis, score the Siltzbach or any CT-based severity system, assess cardiac
sarcoidosis, or recommend corticosteroids. The MCP adapter + golden-probe promotion follow in the next wave
(348).
