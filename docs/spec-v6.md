# spec-v6.md — sophiewell.com: life-stage decoders + task-oriented home

> Status: proposed. Extends spec-v5 without amending its hard rules. Adds
> five new utilities and a single home-page UI evolution. Every addition
> obeys the v5 maintenance contract: deterministic, no AI, no live data,
> no servers, no accounts, no telemetry, bundled public sources only.

## 1. Purpose

Sophie's existing catalog answers two prompts well: *decode the opaque
billing artifact in front of me* and *do the clinical math at the
bedside*. There is a third class of artifact ordinary people hold and
cannot read: **the things their body, their pharmacy, and their
healthcare paperwork hand them at life-stage moments** — a lab result
PDF, a pile of pill bottles, a denial letter, a positive pregnancy test,
an end-of-life conversation they are not prepared for.

v6 adds five utilities aimed squarely at that gap, and one home-page
change that makes them discoverable to the person holding the artifact
— who is not a clinician, does not know Sophie's vocabulary, and types
verbs like *"my lab results"* before they type acronyms like *"CMP."*

v6 ships **no trackers, no stateful features, no localStorage state**.
Sophie remains a pure-function site. Stateful utilities are a separate
architectural decision and out of scope here.

## 2. What v6 inherits from v5 (non-negotiable)

Every v5 hard rule binds v6 without exception. Restated for clarity:

1. No live-data dependencies. No external API calls at runtime.
2. No ETL pipelines. Datasets are small, static, hand-maintained.
3. No AI of any kind. No models, embeddings, inference, or API keys.
4. Deterministic from input alone. Identical inputs, identical outputs.
5. Pure-function math in `lib/*.js`, separated from DOM renderers.
6. Citations on every formula in the `META` entry.
7. Test-with-example on every calculator, wired through `META[id].example`.
8. Offline-first single static page. No new CSP `connect-src` entries.

If a v6 addition cannot meet all eight rules in its bundled form, it
does not ship.

## 3. New utilities (five tiles)

### 3.1 Preeclampsia first-trimester risk (FIGO 2019)

- **Category:** Clinical Scoring & Reference.
- **Inputs:** maternal age, weight, height, race/ethnicity (algorithm
  variable), nulliparity / prior preeclampsia / family history flags,
  conception method, chronic hypertension, diabetes type, mean arterial
  pressure (uterine artery PI and PlGF optional — when absent, the tool
  computes the maternal-history-only stratum and labels the result as
  such).
- **Output:** numeric risk estimate for preeclampsia delivery <37 weeks,
  with the FIGO recommendation banding (high vs. low risk) and a plain-
  language note that *low-dose aspirin started before 16 weeks is the
  evidence-based intervention*. Output is reference, not advice;
  disclaimer per Sophie's standard pattern.
- **Source:** FIGO 2019 initiative on preeclampsia guidelines and the
  underlying Akolekar/Wright/Nicolaides Fetal Medicine Foundation
  competing-risks model. Citation block lists FIGO 2019, ASPRE trial
  (Rolnik 2017), and the FMF algorithm publication.
- **Why this fits v5:** formula is published, inputs are user-supplied,
  no live data, no staleness window (the FIGO 2019 thresholds have been
  stable through 2025). Algorithm coefficients are bundled in
  `lib/preeclampsia-figo.js`.
- **Why this matters:** ACOG and NICE both endorse first-trimester
  screening; the patient- and primary-care-facing implementations are
  fragmented or paywalled. A deterministic, citeable, free version is
  the kind of thing that genuinely reduces maternal mortality.

### 3.2 Medication interaction decoder

- **Category:** Medication & Infusion (extends current RxNorm tooling).
- **Inputs:** a list of medications. User can type, paste from a
  pharmacy printout, or pick from an autocomplete backed by the existing
  bundled RxNorm table.
- **Output:** per-pair interaction findings (severity band, mechanism in
  one sentence, plain-language note); per-drug "take with food / avoid
  grapefruit / avoid alcohol" flags; an aggregated "things to ask the
  pharmacist about" summary. Each finding cites the underlying rule and
  the dataset snapshot date.
- **Source:** bundled snapshot of DDInter 2.0 (open, peer-reviewed,
  permissive license) for pairwise interactions; FDA Structured Product
  Labeling extracts (openFDA, fetched at build time, **never at runtime**)
  for food / alcohol / grapefruit warnings; the existing RxNorm bundle
  for normalization. All three are vendored into `data/ddi/` as static
  JSON; CSP `connect-src 'self'` is preserved.
- **Why this fits v5:** drug-drug interactions move materially more
  slowly than recalls or pricing. The snapshot date is displayed
  prominently on every result (per v5's "degrades gracefully" posture).
  Sophie does not pretend to be Lexicomp; the output explicitly directs
  the user to verify novel or high-severity findings with a pharmacist.
- **Why this matters:** Lexicomp and Micromedex are clinician-paywalled
  and write for clinicians. A patient managing chronic conditions or
  caring for elderly parents currently has nothing usable.

### 3.3 Lab result interpreter

- **Category:** Patient Bill & Insurance Literacy (the catalog's
  patient-decoder home), with a cross-link from Reference Tables.
- **Inputs:** standard outpatient panels — CBC, CMP, lipid panel, A1C,
  TSH, plus a free-form "other value" row for individual analytes.
  Numeric value, unit (with unit conversion via the existing universal
  converter), patient age / sex / pregnancy status when relevant.
- **Output:** per-value calm plain-language explanation, the reference
  range used (citing source), an explicit flag among `{within range,
  borderline, flagged-mild, flagged-significant}`, and a single
  *"questions worth bringing to your clinician"* line per flagged value.
  No diagnosis. No probability statements. No links to disease pages.
- **Source:** the existing bundled adult and pediatric lab reference
  ranges (already shipped under Reference Tables), augmented with a
  small `lib/lab-narratives.js` table mapping analyte + flag-band to a
  vetted plain-language sentence. Each narrative cites a textbook or
  guideline source.
- **Why this fits v5:** lab reference ranges already ship and are
  hand-maintained. v6 only adds a deterministic narrative table on top.
  No new external data sources, no live calls.
- **Why this matters:** patient portals deliver lab results before
  clinicians have reviewed them. The current alternative is Googling
  *"high MCV"* at 11pm and ending up on cancer forums. Calm, accurate,
  bounded plain language directly reduces this category of suffering.
- **Critical constraint — calibration over engineering:** every narrative
  string is reviewed against the constraint "would a competent primary
  care physician be comfortable handing this to a patient at 11pm." The
  hard work here is the writing pass, not the code.

### 3.4 Advance directive generator

- **Category:** Patient Bill & Insurance Literacy (alongside HIPAA,
  appeal, and ROI generators — same pattern).
- **Inputs:** state of residence, the user's answers to a plain-language
  walkthrough of the standard advance-directive questions (life support
  preferences, artificial nutrition / hydration, mental-health
  preferences where applicable, organ donation, healthcare proxy
  designation, witness preferences).
- **Output:** a printable, state-statutory-form-aligned advance directive
  document the user can print, sign, and witness, along with a
  one-paragraph plain-language summary of each choice they made.
- **Source:** the state-by-state statutory forms encoded as small static
  templates in `data/advance-directives/<state>.json`. Each state file
  cites the statute, the form revision date, and the witness / notary
  requirements. Updates are hand-tracked annually; the form-revision
  date is displayed at the top of every generated document.
- **Why this fits v5:** identical pattern to the existing HIPAA
  right-of-access and appeal-letter generators. Statutory forms are
  guideline-stable on the year timescale (closer to tetanus
  prophylaxis than to ACIP).
- **Why this matters:** most adults have no documented advance directive.
  The current barrier is intimidation and form-finding, not
  unwillingness. Removing the barrier removes the harm.

### 3.5 Prior-authorization appeal generator (expanded)

- **Category:** Patient Bill & Insurance Literacy (extends the existing
  appeal-letter generator).
- **Inputs:** denial reason category, payer type (commercial / Medicare
  / Medicaid / ERISA), state of residence, requested service, denial
  letter date, the user's clinical narrative (free text).
- **Output:** a properly formatted appeal letter for the relevant level
  (internal first-level, internal second-level, external review), with
  the correct statutory deadline displayed prominently, the correct
  external review pathway named (state insurance commissioner or DOL
  for ERISA), and the cite to the federal or state regulation the
  payer is bound by. A second printable "deadline summary" document
  lists every clock currently running and the date each one expires.
- **Source:** the existing appeal-letter generator's template engine,
  extended with `data/pa-appeals/` containing per-state external-review
  rules, ERISA federal pathway, and deadline tables. Cited statutes
  per row.
- **Why this fits v5:** generators are pattern-based; no live data, no
  payer-specific policy lookups. The generator produces *correctly
  formatted paperwork the user prints* — it does not query an insurer.
- **Why this matters:** prior auth is one of the most actively harmful
  pieces of the US healthcare system, and patient-facing tooling is
  effectively absent. Sophie already has the appeal-letter primitive;
  this extension turns it into something a patient can actually finish.

### 3.6 Explicitly out of scope for v6

- **ACIP vaccine gap finder** — v5 §3.1 removed adult/child/catch-up
  ACIP schedules as staleness-dangerous. v6 honors that decision.
  Revisiting requires a v5 amendment, not a v6 addition.
- **Symptom-to-specialist router** — crosses the not-medical-advice line.
  Failure mode (wrong direction) is exactly what Sophie's disclaimer
  forbids.
- **ClinicalTrials.gov finder** — would require either a live API
  (violates `connect-src 'self'`) or a bundled snapshot that goes stale
  in days. Eligibility parsing would require AI, which v5 forbids.
- **Preeclampsia longitudinal tracker** — stateful, out of scope per §1.
- **Prior-auth deadline tracker** — stateful, out of scope per §1.

## 4. Home-page UI evolution

### 4.1 The problem

Sophie currently displays 12 categories × 174 tiles on the home page,
with a search input in the top bar. This works for repeat clinical
users with muscle memory ("scroll to Clinical Math, click eGFR") but
poorly for the patient who arrives holding an artifact and types verbs:
*"my bill," "lab results," "medication list," "denial letter."* The
top-bar search is functional but visually subordinate to the tile grid;
patients do not see it as the entry point.

### 4.2 The change

Add a **task hero** above the tile grid and **audience filter chips**
above the categories. Both are additive; the existing tile grid stays.

#### 4.2.1 Task hero

A single prominent input below the page title, with the placeholder
cycling through patient-mental-model phrases:

> *What do you need to decode?*
>
> *Try: my medical bill · my lab results · my insurance card · my
> medication list · my denial letter · my EOB · my prescription cost*

The input is the existing topbar search promoted in size and position.
Same matching logic, same result list. The topbar search is kept for
in-app navigation after the user has selected a tile.

Behavior:

- Type a verb or noun → live-filtered list of matching tiles appears
  below the input.
- Enter on the top result → opens that tile.
- Empty input → tile grid below renders normally.

Implementation: pure DOM, no new framework, no new dependency. Match
logic is the existing fuzzy search already in `app.js`.

#### 4.2.2 Audience filter chips

A row of five chips between the hero and the tile grid:

> **All · Patient · Biller & Coder · Nurse & Clinician · EMS & Field · Educator**

Default selection is **All**, which preserves current behavior. Each
chip filters the grid to tiles tagged for that audience. Tags are added
to each tile's META entry as `audiences: ['patient', 'clinician', ...]`;
many tiles belong to multiple audiences (the universal unit converter
is for everyone; the GFE dispute tree is patient-first).

Behavior:

- Click a chip → grid renders only tiles tagged with that audience.
- Chip state persists in the URL hash (e.g., `#audience=patient`) so a
  patient-facing link can be shared. **No localStorage, no cookies.**
- Chips coexist with the hero search; search results respect the chip
  filter.

Implementation: pure DOM, additive to existing render, no new dependency.

### 4.3 Why not replace tiles with a single search bar (the Vaulytica model)

Considered and rejected. Vaulytica is a single workflow — one input,
one output — so a single dropzone is the entire UI. Sophie is 174
utilities serving five audiences with no shared workflow; the tile grid
is Sophie's discoverability. Removing it loses the *"I didn't know
this existed"* effect that drives most of the site's value, and forces
users to know vocabulary they often don't have. The hybrid above is
the maximum Vaulytica-style simplification Sophie can take without
losing what makes it Sophie.

### 4.4 Out of scope for v6

- Per-tile favoriting or "recently used" surfaces — both require state.
- Audience-specific landing pages at separate URLs — adds routing
  complexity for negligible gain over chip filtering.
- A "patient mode" that hides clinician tiles — Sophie's value includes
  letting a patient look up GCS or Wells if they want to.

## 5. Implementation plan

The five utilities and the UI evolution are independent and can ship in
any order. Suggested order, lowest-risk first:

1. **Audience chips** — pure tag-and-filter, no new data, smallest blast
   radius. Validates the tagging pass that the other utilities depend
   on.
2. **Lab result interpreter** — reuses existing reference ranges; only
   new code is the narrative table.
3. **Task hero** — promotion of existing search; no new data.
4. **Advance directive generator** — pattern match to existing
   generators; bulk of work is encoding state forms (start with five
   highest-population states).
5. **Prior-auth appeal generator (expanded)** — extends existing
   appeal-letter primitive.
6. **Preeclampsia FIGO** — most clinical care needed in implementation
   and citation review; ships last to give the example/test pass time.
7. **Medication interaction decoder** — largest data integration;
   ships last alongside or after preeclampsia. Snapshot-date display
   is a precondition for shipping.

Each utility ships behind the v5 pattern: `lib/<id>.js` pure functions,
`views/group-<category>.js` renderer, `META[id]` with citation and
example, unit tests, and a worked example reproducing a citation case.

## 6. Acceptance criteria

A v6 utility is shippable when all of the following are true:

- Pure functions in `lib/<id>.js` with unit tests including the cited
  worked example.
- `META[id]` has `citation`, `example`, `audiences`, and (for snapshotted
  datasets) `snapshotDate`.
- Renderer in `views/group-<category>.js` includes the disclaimer band
  and the audience tags.
- The home grid, sitemap, JSON-LD `featureList`, README, and CHANGELOG
  reflect the new tile.
- No new `connect-src` entry. No runtime fetch. No localStorage.
- For utilities with bundled snapshot data: the snapshot date renders
  prominently on every result, and a manual annual-update task is
  added to the maintenance checklist in `docs/operations.md`.

A v6 UI change is shippable when:

- Audience filter chips work with keyboard, mouse, and screen reader.
- URL-hash audience state round-trips correctly (deep link works).
- Empty-state, single-result, and many-results behaviors of the hero
  search are visually correct on mobile and desktop.
- No regression in tile-grid rendering with `#audience=all`.

## 7. What v6 does not promise

- Sophie is not a doctor, lawyer, pharmacist, or insurance adjuster.
- The preeclampsia tile estimates risk; it does not diagnose, treat, or
  manage pregnancy.
- The interaction decoder surfaces published pairwise findings; it does
  not capture every payload-specific or pharmacogenomic interaction.
- The lab interpreter explains values; it does not diagnose disease.
- The advance directive generator produces a document; the user must
  sign and witness it per their state's statute.
- The appeal generator produces correctly formatted paperwork; the user
  must submit it on time and through the right channel.

Every tile carries the standard Sophie disclaimer band: *reference
information, not medical / legal / financial advice; does not replace
clinician judgment, professional billing review, or legal counsel.*
