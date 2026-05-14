# spec-v7.md — sophiewell.com: artifact-first front door (dropzone + synonym-routed prompt)

> Status: proposed; sections 3.2 (synonym-routed prompt) and 3.4
> (collapsible tile-grid disclosure) shipped 2026-05-14. The disclosure
> currently defaults to open to preserve existing clinician flows and
> the e2e selectors that click directly into a tile; the spec's
> default-collapsed posture is deferred until the section 4 dropzone
> front door lands. The remaining sections (3.3 artifact-detect
> classifier and section 4.1-4.6 decoder pages) are unimplemented.
> Extends spec-v5 and spec-v6 without amending their hard rules.
> Reshapes Sophie's front door around the patient who arrives holding
> an artifact they cannot read, while preserving the tile catalog
> clinicians depend on. Every addition obeys the v5 maintenance
> contract: deterministic, no AI, no live data, no servers, no
> accounts, no telemetry, bundled public sources only.

## 1. Purpose

spec-v6 §4 added a task hero and audience filter chips on top of the
existing tile grid. v7 takes the next step in the same direction: it
makes the home page **artifact-first** for the patient audience while
keeping the tile catalog one click away for clinicians.

The single design insight: patients do not know Sophie's vocabulary
("EOB," "CARC," "PA appeal"), but they are *holding the artifact* —
a bill, a lab printout, a denial letter, a pill bottle list, a
discharge packet. If Sophie's front door accepts the artifact directly,
the vocabulary problem goes away.

The Vaulytica pattern — *drop a document you cannot read, get back a
document you can act on* — fits Sophie's patient-decoder utilities
perfectly. v7 wires that pattern into the front door without giving up
the discoverability the tile grid provides for clinical users.

v7 explicitly rejects the "local small language model as NLP router"
direction (see §6). The synonym table does the work an SLM router would
do, deterministically, at zero bytes.

## 2. What v7 inherits from v5 and v6 (non-negotiable)

Every v5 and v6 hard rule binds v7 without exception. Restated for
clarity:

1. No live-data dependencies. No external API calls at runtime.
2. No ETL pipelines. Datasets are small, static, hand-maintained.
3. No AI of any kind. No models, embeddings, inference, or API keys.
   This explicitly includes **local in-browser models** (WebGPU, WASM,
   ONNX Runtime Web, transformers.js, MLC-LLM, llama.cpp WASM, etc.).
4. Deterministic from input alone. Identical inputs, identical outputs,
   across devices and across page loads.
5. Pure-function math and routing in `lib/*.js`, separated from DOM
   renderers.
6. Citations on every formula in the `META` entry.
7. Test-with-example on every calculator, wired through `META[id].example`.
8. Offline-first single static page. No new CSP `connect-src` entries.
9. No localStorage, no sessionStorage, no cookies, no IndexedDB.
10. The tile grid is not removed. Clinician discoverability survives.

If a v7 addition cannot meet all ten rules in its bundled form, it does
not ship.

## 3. Home-page UI evolution (the front door)

### 3.1 The shape

One screen, two affordances, equally weighted on desktop, stacked on
mobile (prompt above dropzone):

```
+-----------------------------------------------------------+
| sophiewell.com                          [browse all 178 ▾]|
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------+  +--------------------+  |
|  | What do you need to decode? |  |  Drop your bill,    | |
|  | _________________________   |  |  EOB, lab result,   | |
|  | Try: "my lab results"       |  |  denial letter,     | |
|  |      "I got a bill"         |  |  pharmacy list, or  | |
|  |      "denial letter"        |  |  discharge packet   | |
|  +-----------------------------+  |  here.              | |
|                                   |  PDF or DOCX. Never | |
|                                   |  leaves this tab.   | |
|                                   +--------------------+  |
|                                                           |
|  [ all · patient · biller · clinician · EMS · educator ]  |
|                                                           |
|  ── browse all 178 tools ▾  (collapsed by default) ──     |
|                                                           |
+-----------------------------------------------------------+
```

- **Prompt bar** (left/top): the v6 task hero, retained and expanded.
  Matches typed phrases against a hand-curated synonym dictionary
  (§3.2) plus the existing fuzzy search.
- **Dropzone** (right/bottom): accepts PDF or DOCX files. Detects
  artifact type by deterministic heuristic (§3.3) and routes to the
  matching decoder page with the file pre-loaded.
- **Audience chips** (below): the v6 filter chips, unchanged in
  behavior, repositioned below the two affordances.
- **Tile grid**: collapsed behind a `browse all 178 tools ▾` disclosure
  by default. Clinicians click to expand; the expanded grid is the v6
  grid, audience-filtered. The collapsed state is also reachable via a
  small `browse all 178 ▾` link in the top bar for keyboard users.
- **Disclosure state persists in the URL hash** (`#browse=open` /
  `#browse=closed`). No localStorage. Default on first visit is closed.

### 3.2 Synonym-routed prompt bar

A new hand-maintained file `data/synonyms.json` maps patient-phrasings
to tile IDs. Format:

```json
{
  "version": "v7-2026-05-14",
  "entries": [
    { "phrases": ["my bill", "i got a bill", "hospital bill", "doctor bill"],
      "tile": "bill-decoder", "audience": "patient" },
    { "phrases": ["my labs are weird", "lab results", "blood work",
                  "my labs came back", "what does my lab mean"],
      "tile": "lab-interpreter", "audience": "patient" },
    { "phrases": ["denied", "denial letter", "they denied it",
                  "insurance said no", "appeal"],
      "tile": "appeal-generator", "audience": "patient" }
  ]
}
```

Behavior:

- Live filter as the user types. Phrase match (case-insensitive,
  whitespace-normalized, punctuation-stripped) takes priority over
  fuzzy match.
- A phrase match shows the matched tile pinned at the top with a small
  *"matched: 'my labs are weird'"* breadcrumb so the user can see why.
- Enter on the top result opens that tile.
- Empty input: dropzone and disclosure are the only affordances; no
  results pane.
- Synonym entries respect the audience chip filter. With `Patient`
  selected, clinician-only synonyms are deprioritized.

Engineering profile: identical to the v6 task hero. Same renderer,
same DOM helper, plus a synonym-table lookup pass run before the
existing fuzzy search. No new framework, no new dependency, fully
unit-testable.

Maintenance: synonyms are an ongoing curation task, not a one-time
spec. The initial table targets ~300 entries covering the patient-
holding-an-artifact verbs and the ten or so most common audience
phrasings per artifact type. Adding a synonym is a one-line PR.

### 3.3 Artifact-detecting dropzone

The dropzone accepts a single PDF or DOCX file. On drop:

1. The file is parsed in a Web Worker. Existing parser plumbing for
   PDF (pdf.js, already bundled for the bill decoder) and DOCX
   (mammoth, already bundled if shipping the v6 generators)
   extracts plain text.
2. A deterministic heuristic classifier in `lib/artifact-detect.js`
   matches the extracted text against a small table of artifact
   fingerprints (regex + keyword density). The classifier returns one
   of: `bill`, `eob`, `msn`, `lab-result`, `denial-letter`,
   `pharmacy-list`, `discharge-summary`, `insurance-card`, or
   `unknown`.
3. The router opens the matching decoder page with the parsed text
   pre-loaded. `unknown` opens a chooser pane: *"We could not
   auto-detect. Is this a bill, lab result, denial letter, …?"*
4. The file itself never leaves the tab. CSP `connect-src 'self'` is
   preserved. No upload, no fetch.

Heuristic examples (illustrative; full table lives in
`lib/artifact-detect.js`):

- `bill`: contains at least two of `{"amount due","balance","CPT","DRG","statement date"}` and at least one currency token.
- `eob`: contains `{"this is not a bill"}` OR (`{"allowed amount"}` AND `{"patient responsibility"}`).
- `lab-result`: contains `{"reference range"}` OR (≥3 of the bundled analyte names) AND no currency token.
- `denial-letter`: contains `{"adverse benefit determination"}` OR (`{"appeal"}` AND `{"denied"}` AND a date pattern).
- `pharmacy-list`: ≥3 RxNorm-matched tokens AND `{"refill","mg","tablet","capsule"}`.
- `discharge-summary`: contains `{"discharge instructions","follow-up","return precautions"}`.

Every fingerprint is testable against fixture files. The classifier is
pure-function, deterministic, and has its own test-with-example pass.

### 3.4 Collapsed tile grid

The 178-tile grid moves below the disclosure. v6 audience chips
continue to filter it. The category headers, search behavior, and
keyboard nav are unchanged when expanded. Collapsed default removes
the *"scroll past 174 tiles I don't recognize"* friction for patients
while costing clinicians exactly one click and one keystroke
(`b` to toggle, optional).

Accessibility:

- The disclosure is a real `<details>` / `<summary>` element so
  screen readers and keyboard users get the standard semantics.
- Tab order: prompt bar → dropzone → audience chips → disclosure →
  (when open) tile grid.
- The collapsed state has a visible count: *"browse all 178 tools ▾"*.

## 4. Artifact-decoder pages (the six Vaulytica-shaped flows)

Each is a single page whose entire UI is *drop artifact, get document.*
All six reuse engines Sophie already ships or that v6 specifies. v7
adds the dropzone framing, the artifact-detect routing, and the DOCX
export wrapper.

### 4.1 Bill / EOB / MSN → annotated DOCX report

- **Input:** PDF or DOCX of a medical bill, EOB, or MSN.
- **Pipeline:** existing bill / EOB / MSN decoders run line-by-line.
  CARC and RARC codes are translated via the bundled tables. NSA
  eligibility is checked via the existing decision tree. Balance-
  billing red flags are surfaced. If any finding is appeal-eligible,
  the existing appeal-letter generator pre-fills a draft.
- **Output:** a single DOCX with: line-item table, code translations,
  NSA eligibility verdict + reasoning, red-flag summary, optional
  pre-filled appeal letter, and a citation appendix naming every
  table used and its dataset version.
- **Engines reused:** bill / EOB / MSN decoders, CARC / RARC tables,
  NSA tree, appeal-letter generator. No new clinical logic.

### 4.2 Lab result PDF → calm plain-language DOCX

- **Input:** PDF or DOCX of an outpatient lab panel.
- **Pipeline:** spec-v6 §3.3 lab interpreter, fed by parsed analyte
  values from the dropped PDF.
- **Output:** a printable DOCX with: per-analyte calm plain-language
  explanation, reference range used (cited), flag band, and a
  *"questions worth bringing to your clinician"* page.
- **Engines reused:** v6 lab interpreter, bundled lab reference
  ranges, universal unit converter.

### 4.3 Denial letter → appeal packet DOCX

- **Input:** PDF or DOCX of an insurance denial letter.
- **Pipeline:** spec-v6 §3.5 prior-auth appeal generator, with denial
  reason category and payer type extracted by deterministic field
  matching from the parsed letter (user can correct any field before
  generating).
- **Output:** the formatted appeal letter + deadline summary +
  external-review pathway, ready to print and sign.
- **Engines reused:** v6 appeal generator, state external-review
  tables, ERISA pathway data.

### 4.4 Pharmacy printout / med list → interaction report DOCX

- **Input:** PDF or DOCX of a pharmacy printout or a typed/pasted med
  list.
- **Pipeline:** RxNorm normalization, then spec-v6 §3.2 medication
  interaction decoder.
- **Output:** DOCX with per-pair interaction findings, per-drug food
  / alcohol / grapefruit flags, and a "questions for the pharmacist"
  summary. Snapshot date prominent.
- **Engines reused:** RxNorm bundle, v6 interaction decoder, DDInter
  2.0 snapshot.

### 4.5 Discharge paperwork → plain-language summary DOCX

- **Input:** PDF or DOCX of a hospital discharge packet.
- **Pipeline:** deterministic field extraction for med list, follow-
  up appointments, and red-flag return-precaution language. The lab
  interpreter and interaction decoder run on extracted med lists when
  present. No diagnosis interpretation; the page summarizes what is
  in the packet, not what it means clinically.
- **Output:** DOCX with: extracted medication schedule (with
  interaction flags), follow-up appointment list (dates extracted),
  red-flag symptom list verbatim from the packet, and a "questions
  worth asking before you leave" section.
- **Engines reused:** RxNorm, v6 interaction decoder, v6 lab
  interpreter (when discharge labs are present).
- **Notes:** the most parsing-heavy of the six; ships last. Until
  the parser is robust, the page presents a fallback view where the
  user pastes sections individually.

### 4.6 Insurance card photo / PDF → printable benefits cheat sheet

- **Input:** PDF, DOCX, or image (PNG/JPG) of an insurance card.
- **Pipeline:** the existing insurance card decoder. For images, an
  in-browser deterministic OCR pass (Tesseract.js WASM, bundled, no
  network) extracts the printed text fields. OCR confidence below a
  threshold falls back to a typed-field form. **OCR is deterministic
  pattern recognition over bundled language data; it is not an LLM
  and does not violate rule 3.**
- **Output:** a printable one-page benefits cheat sheet listing the
  decoded fields, plus a wallet-card-format version.
- **Engines reused:** existing insurance card decoder.
- **Caveat:** image input is the only artifact path in v7 that
  accepts non-document files. If Tesseract.js bundle size is judged
  prohibitive after measurement, v7.6 ships PDF/DOCX-only and image
  input is deferred.

## 5. What v7 explicitly rejects

### 5.1 Local small language models as NLP routers

Considered and rejected, on five grounds:

1. **Mobile first-load bytes.** The smallest credible router models
   (Qwen2.5-0.5B, Llama-3.2-1B, Phi-3-mini, all 4-bit quantized) are
   300 MB – 1 GB. Sophie's median user is on cellular. First-load
   abandonment at that payload is near total.
2. **WebGPU coverage.** As of 2026 Q2, WebGPU is partial on iOS
   Safari and missing on a meaningful fraction of mid-range Android.
   Without WebGPU, inference falls to 1–3 tokens/second, which feels
   broken on mobile.
3. **Determinism.** An SLM router routes probabilistically. Same
   query, different routing across devices, temperatures, or model
   versions. The first time a nurse is sent to the wrong calculator,
   Sophie's trust premise (v5 stability commitments §1) collapses.
4. **The v5 contract.** Rule 3 forbids AI of any kind. Local AI is
   still AI for this purpose: the trust posture that distinguishes
   Sophie from every other healthcare tool depends on the absence
   of a model in the loop. v7 keeps that posture intact.
5. **The synonym table does the job.** The UX problem is patients
   not knowing the word *EOB*. A 0.5B model is not reliably better
   than a hand-curated 300-entry synonym table at fixing that, and
   the table costs zero bytes, zero non-determinism, and zero
   maintenance complexity beyond ongoing curation.

If a future sibling project explores SLM-driven workflows, it will
be a separate, clearly labeled product. Sophie itself never ships
a model.

### 5.2 Chatbot framing as the primary UI

Considered and rejected. Multiple lines of evidence point against it:

- Clinical-tool literature consistently shows clinicians prefer
  named, verifiable tools over chat for any task that touches a
  patient. Chat framing *lowers* trust for dosing, scoring, and
  coding tasks.
- A dropzone is the lowest-typing input possible on mobile, which
  is Sophie's dominant device. Chat is high-typing.
- Chat implies stateful conversation. Sophie is a pure-function
  site (v6 §1) and intends to stay one.

The prompt bar in v7 is a *search input,* not a chat box. Its result
is always a tile, never a generated reply.

### 5.3 Removing the tile grid

Considered and rejected. Clinicians arrive having decided which
calculator they want; the tile grid is their entry point. The
disclosure pattern (§3.4) hides the grid from patients without
removing it from clinicians.

### 5.4 Out of scope for v7

- Stateful "recently dropped" or "my artifacts" surfaces — both
  require storage Sophie does not allow.
- Combined-artifact flows ("drop your bill AND your EOB and
  reconcile them") — possible follow-on for v8 once the six single-
  artifact flows ship.
- Server-side OCR or parsing — violates `connect-src 'self'`.
- Image input on any artifact other than the insurance card —
  scope-control decision; PDFs of bills, labs, and denials are
  dominant in the wild, and patient-uploaded photos of paper bills
  are deferred to v8.

## 6. Implementation plan

All six dropzone pages and the home-page changes are independent and
can ship in any order. Suggested order, lowest-risk first:

1. **Synonym table + synonym-routed prompt.** Pure data + a 30-line
   lookup function. Validates the curation workflow.
2. **Collapsed tile grid disclosure.** Trivial DOM change; biggest
   visible win for the patient audience.
3. **Artifact-detect classifier.** Pure-function, fully testable
   against fixtures. Ship before the first decoder page so routing
   works end-to-end.
4. **Bill / EOB / MSN dropzone page.** Highest demand, most engines
   already in place.
5. **Lab result dropzone page.** Ships after v6 §3.3.
6. **Denial letter dropzone page.** Ships after v6 §3.5.
7. **Pharmacy list dropzone page.** Ships after v6 §3.2.
8. **Insurance card dropzone page** (PDF/DOCX first; image input
   gated on Tesseract.js bundle measurement).
9. **Discharge paperwork dropzone page.** Parsing-heaviest; ships
   last.

Each page ships behind the v5 pattern: pure functions in `lib/`,
renderer in `views/`, `META[id]` with citation and example, unit
tests, fixture-based integration tests for the dropzone parser, and
a worked example reproducing a citation case.

## 7. Acceptance criteria

A v7 dropzone page is shippable when:

- The page accepts the documented input types and parses them in a
  Web Worker.
- The artifact-detect classifier routes correctly on the full fixture
  set with zero false positives across artifact types.
- The output DOCX validates against a fixture comparison and
  reproduces deterministically across runs (byte-for-byte where the
  underlying DOCX library allows; otherwise content-hash stable).
- Citations and dataset snapshot dates appear on every output.
- No new `connect-src` entry. No runtime fetch. No localStorage.
- The page's CSP and SBOM entries are updated.
- Disclaimer band present, consistent with the rest of Sophie.

A v7 home-page change is shippable when:

- The prompt bar, dropzone, audience chips, and disclosure all work
  with keyboard, mouse, and screen reader.
- URL-hash state for audience and disclosure round-trips correctly.
- Synonym matches show the matched phrase as a breadcrumb.
- Mobile layout (prompt above dropzone, both full-width) renders
  correctly at 320 px and above.
- The tile grid renders identically to v6 when the disclosure is
  expanded.

## 8. What v7 does not promise

- Sophie is not a doctor, lawyer, pharmacist, or insurance adjuster.
- The dropzone parses what is in the document; it does not infer
  what is missing from the document.
- The artifact classifier routes to the best-matching decoder; the
  decoder's caveats and disclaimers continue to apply.
- DOCX outputs are reference documents the user prints, signs, or
  hands to a professional. They are not legally binding submissions
  by themselves.
- Synonym matches reflect the curation pass at the time of release.
  Adding a missing synonym is a one-line PR; the table is not and
  will not be exhaustive.

Every page carries the standard Sophie disclaimer band: *reference
information, not medical / legal / financial advice; does not replace
clinician judgment, professional billing review, or legal counsel.*
