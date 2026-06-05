# spec-v52.md — Healthcare pre-authorization packet linter ("Sophie PA")

> Status: proposed (2026-05-27). v52 is a feature + UI + dataset
> spec. It adds a single new tile — a **deterministic
> prior-authorization (PA) packet linter** — to sophiewell.com,
> reusing the file-ingest / rule-engine / DOCX-report pattern
> pioneered by [Vaulytica](https://github.com/clay-good/vaulytica)
> but reframed for healthcare prior authorization. Documents stay
> on the user's device. No server, no upload, no AI, no telemetry.
>
> v52 also makes one homepage change: **the ten curated quick
> picks are removed and replaced by a single all-tools dropdown
> (`<select>`) that lists every tile in the catalog.** The hero
> search bar is unchanged.
>
> v52 adds **one tile** (`pa-lint`, the PA packet linter) and
> extends the scope test ([spec-v29](spec-v29.md) §3) to admit
> "document linter" as a valid second tile shape alongside the
> existing "numeric calculator" shape. Both shapes consume user
> input (numbers for one, files for the other) and compute a
> deterministic output (a numeric/categorical result for one, a
> findings report for the other). The catalog count moves from
> 254 → 255.
>
> Every prior spec (v4 through v51) remains in force. v52 does
> not touch existing tiles, does not change any URL, does not add
> any runtime network call, and does not introduce AI of any
> kind. Sophie's eight commitments ([spec-v50](spec-v50.md) §3)
> are preserved without modification or exception.

---

## 1. Why v52 exists

### 1.1 The problem

Prior authorization is the single largest mechanical paperwork
burden in U.S. clinical practice. The MGMA's annual surveys, the
AMA's PA physician-burden surveys, and CMS's own reporting on
Medicare Advantage PA volumes consistently put the average
practice's PA workload at tens of hours per clinician per week.
The dominant failure mode is **not** clinical disagreement
between provider and payer; it is **packet defects** —
missing fields, missing supporting evidence, expired labs,
mismatched diagnosis-procedure code pairs, absent attestations,
wrong place-of-service, missing modifier, missing step-therapy
documentation, missing prior-denial reference on a resubmission.

Each defect is **mechanically detectable**. A human reviewer at
the payer flags it in seconds; a denial is issued; the practice
spends 1–3 weeks resubmitting. The cost compounds across patient
delay, staff time, and downstream revenue cycle. None of it is
clinical judgement. All of it is checklist failure.

Today the people doing PA work — utilization-management nurses,
case managers, prior-auth coordinators, billers, and the
occasional moonlighting provider — have three options:

1. **Memorize each payer's checklist** (impossible at scale; a
   single mid-sized practice routinely touches 15+ payers).
2. **Pay for a PA-automation SaaS** (Cohere, Olive AI, Myndshft,
   etc. — six-figure annual contracts, vendor lock-in, and most
   of them are now layering probabilistic LLMs on top of the
   rule engine, which reintroduces the "wrong 1–5% of the time"
   failure mode at exactly the wrong stage).
3. **Submit blind and resubmit on denial** (the status quo).

Sophie's posture — free forever, runs in the browser, no
account, no telemetry, deterministic — is a natural fit for
option 4: **a checklist that runs locally against the packet
the user is about to fax / portal / e-submit, flags the
mechanical defects, and produces a citable findings report**
that the user can save, hand off, or use as the basis for a
clean resubmission.

### 1.2 Why this belongs on sophiewell.com and not its own domain

The maintainer's framing on 2026-05-27 was explicit: **one
domain per problem domain**. sophiewell.com is healthcare;
[Vaulytica](https://github.com/clay-good/vaulytica) is law;
[Roughlogic](https://roughlogic.com) is the trades;
[Encryptalotta](https://github.com/clay-good/encryptalotta) is
developer / privacy / security. Prior authorization is
unambiguously healthcare. It does not belong on Vaulytica
(which would dilute the legal-document positioning) and it does
not deserve a third domain (which would fragment the healthcare
brand and double the dataset-maintenance burden). It belongs
here.

The audience overlap is real. Sophie's existing audience strip
([spec-v10](spec-v10.md), [spec-v29](spec-v29.md)) already lists
**billers and coders** as served audiences. The PA tile extends
that surface; it does not invent it. The README already commits
to "served to doctors, pharmacists, RTs, billers, coders, and
EMS providers." A PA tile is the first tile that is _primarily_
for the biller / UM nurse audience rather than the bedside RN.

### 1.3 Why this is not a Vaulytica clone

The two products share an _interface pattern_ (drop a file, get
a deterministic report) and a _posture_ (no server, no AI, no
telemetry). They do not share a corpus, a ruleset, a citation
graph, a dataset-refresh cadence, or an audience.

| Axis              | Vaulytica                                | Sophie PA                            |
|-------------------|------------------------------------------|--------------------------------------|
| Domain            | Contracts / legal docs                   | Prior-authorization packets          |
| Audience          | Lawyers, contracts ops, procurement      | UM nurses, PA coordinators, billers  |
| Document corpus   | MSA, NDA, SaaS, DPA, BAA, lease, etc.    | Clinical note + PA form + evidence   |
| Rule sources      | Statutory law, regulator guidance        | CMS NCD/LCD, payer medical policies  |
| Refresh cadence   | Quarterly statute/regulator pulls        | Monthly payer-policy pulls           |
| Output            | DOCX findings + obligations ledger       | DOCX findings + evidence ledger      |
| Sub-tiles needed  | One ingest, many doc types               | One ingest, many payers              |

The shared shape — `ingest → classify → rule-engine → DOCX
report` — is exactly the abstraction that one day becomes the
shared `kernels-core` package ([brainstorm 2026-05-27](#)). v52
does not attempt that extraction; it copies the pattern by hand
and leaves the extraction for a future cross-repo wave.

### 1.4 The "AI can already do this" critique, answered in the spec

This spec lives on a healthcare site. The argument that "an LLM
can read the packet and tell you what's missing" must be
addressed in writing because users will ask. The answer:

1. **A 1–5% wrong rate at the PA stage produces wrongful
   denials, patient delays, and unbilled revenue.** Those costs
   are concrete. A deterministic checklist is wrong 0% of the
   time on the rules it covers and silent on the rules it does
   not — a posture that is both honest and defensible.
2. **A probabilistic answer is not citable in an appeal.** When
   a payer denies and the practice appeals, the appeal letter
   cites the medical policy paragraph, the patient's labs, and
   the date of service. "An LLM said the packet was complete"
   is not an appellate argument. "Sophie ruleset
   `pa-lint/v1.0.3` rule `R-PA-014` (`Aetna MP 0123` §3.2,
   accessed 2026-05-15, hash `sha256:…`) confirmed the packet
   met Aetna's documentation requirements" is.
3. **LLMs are genuinely bad at the operations PA review
   requires** — table parsing, date arithmetic, code-pair
   validation against a lookup table, applying payer-specific
   rule hierarchies in a known order. These are the things a
   rule engine is good at.
4. **The patient's chart is PHI.** Sending it to a third-party
   LLM endpoint creates a BAA obligation Sophie refuses to
   accept. The whole packet stays in the browser tab; closing
   the tab destroys all in-memory state. Open DevTools and
   watch the network panel if you want to confirm.

The right framing — repeated in the tile copy, the README, and
the /commitments page — is **AI as interface, deterministic
kernels as substrate**. Sophie PA is the substrate. Users who
want an AI front door can use one; Sophie's job is to be the
thing the AI calls.

---

## 2. Non-goals

- **Not a submission tool.** Sophie PA does not transmit the
  packet to a payer, does not integrate with any payer portal,
  does not call any clearinghouse, does not call any EHR API.
  It reads what the user drops on the page, runs the ruleset,
  and produces a DOCX report. Submission is the user's job.
- **Not a coding tool.** Sophie PA does not assign CPT, HCPCS,
  or ICD-10 codes. It checks the codes the user already chose
  for **mechanical validity** (codes exist, code pair is
  permissible, code is current for the date of service,
  required modifiers are present). Code assignment remains a
  human / EHR / encoder responsibility.
- **Not a medical-necessity adjudicator.** Sophie PA does not
  decide whether the documented clinical picture meets a
  payer's medical-necessity criteria. It checks that the
  **documentation required by the payer's policy is present and
  on the page**. The clinical adequacy of that documentation is
  the reviewer's call.
- **Not OCR (in v52).** Scanned PDFs without an embedded text
  layer return an explicit "this PDF appears to be a scan;
  please OCR before uploading" notice. A later wave (v52-3 or
  v53) MAY add a bundled in-browser OCR path (tesseract.js
  ≈ 11 MB gzipped), but only after the no-OCR experience is
  proven. v52 ships without OCR to keep the dependency budget
  honest ([spec-v10](spec-v10.md) §6).
- **Not telemetry.** No "which payer is most-used" counters, no
  "which rule fires most often" instrumentation, no error
  reporting. [spec-v50](spec-v50.md) §3.5 prohibits it without
  exception.
- **Not an account.** No login, no save-to-cloud, no shared
  workspace. The packet exists in the tab; if the user wants
  it persisted, they download the report and save it locally.
- **Not a "PA generator."** Sophie PA does not draft the medical
  necessity letter, does not write the appeal, does not produce
  template language. Those are AI-shaped tasks; Sophie is the
  checklist.
- **Not a billing engine.** No CMS-1500, no UB-04 generation,
  no claim scrubbing beyond what the PA-specific rules cover.
- **No new audience hub.** Billers and coders are already
  listed in the existing `/for/billers/` and `/for/coders/`
  audience hubs. The PA tile is added to those hubs; no new
  audience slug is introduced.

---

## 3. Scope-test extension: admitting "document linter" as a tile shape

[spec-v29](spec-v29.md) §3 defines a tile as something that
"consumes at least one user input and produces a computed
output; searchable lookup of static facts does not qualify."
v52 extends that definition to admit two valid tile shapes:

### 3.1 Shape A — numeric calculator (existing, 254 tiles)

- **Input:** one or more numeric / categorical form fields
  filled in by the user (e.g., MAP requires SBP and DBP; Wells
  PE requires seven yes/no boxes).
- **Compute:** deterministic JavaScript that runs on input
  change, in the main thread or a worker.
- **Output:** a single visible numeric / categorical result
  with a derivation block ([spec-v48](spec-v48.md)) and a
  citation.

### 3.2 Shape B — document linter (NEW with v52, 1 tile)

- **Input:** one or more files dropped on the tile or selected
  via a file picker. Accepted MIME types: `application/pdf`,
  `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  (DOCX), `text/plain` (TXT), `image/jpeg`, `image/png` (for
  reference; v52 does not OCR them, see §2).
- **Compute:** deterministic JavaScript that ingests, parses,
  classifies, and runs a versioned ruleset against the
  packet. Heavy parsing (PDF, DOCX) runs in a Web Worker so
  the main thread stays responsive.
- **Output:** a structured findings list rendered in the page,
  a downloadable DOCX report mirroring the Vaulytica report
  shape (findings + evidence ledger + extracted-data appendix
  + audit trail), and a JSON export for users who want to
  process the report programmatically.

Both shapes are equally _deterministic_ (identical inputs
produce identical outputs; the dataset version is pinned and
hashed). Both are equally _citable_ (every finding traces to a
named rule and a dated source). Both run entirely in the
browser. The only difference is the input modality.

### 3.3 Why this is not a "lookup tool"

[spec-v29](spec-v29.md) §3 disqualifies "searchable lookup of
static facts." The PA linter is not a lookup. It consumes
user-supplied documents, runs a rule engine over them, and
produces a derived result (the findings list) that did not
exist before the user uploaded the documents. The output is
**computed**, not retrieved. This is the same logical status as
Wells PE (the score is computed from the boxes), only the
input shape is different.

### 3.4 CI enforcement

`scripts/check-catalog-truth.mjs` is updated so that
`UTILITIES.length === 255` is the new catalog truth. The
`pa-lint` tile is registered in `UTILITIES` with a new field
`shape: "document-linter"` so future tooling can distinguish
the two shapes without string-matching the id. The default
value of `shape` for unspecified tiles is `"numeric"` so the
existing 254 tiles need no per-entry edit.

---

## 4. The PA linter tile (`pa-lint`)

### 4.1 Tile identity

| Field            | Value                                                                |
|------------------|----------------------------------------------------------------------|
| `data-tool` id   | `pa-lint`                                                            |
| Visible title    | Prior-Auth Packet Linter                                             |
| Short subtitle   | Drop a PA packet. Get a deterministic defect report. No AI, no fax.  |
| Route            | `/tools/pa-lint/`                                                    |
| Shape            | `document-linter`                                                    |
| Audiences        | `billers`, `coders`, `case-managers` (new audience, see §10.2)       |
| Catalog group    | New top-level group `Revenue cycle & utilization` (see §10.1)        |

### 4.2 The tile view (route `/tools/pa-lint/`)

The route uses the same per-tool page template the existing
254 tiles use. The body has five blocks, in order:

1. **Title + subtitle** — as above.
2. **Trust strip** — three short lines:
   - "Your packet stays in this tab. We never see your patients."
   - "No AI. Every finding cites a rule ID and a payer-policy URL."
   - "Free forever. MIT. Run offline after first load."
3. **Drop zone** — a `<div class="pa-dropzone">` with a visible
   border, an instructional line ("Drop PDF / DOCX files or a
   folder here, or click to select"), and a hidden
   `<input type="file" multiple webkitdirectory accept=".pdf,.docx,.txt,.jpg,.jpeg,.png">`
   wired to the same handler. Drag-and-drop uses the standard
   `dragover` / `drop` events with `preventDefault()` and reads
   `dataTransfer.items` so directory drops (Chrome / Edge) are
   walked via `webkitGetAsEntry()`. Firefox / Safari fall back
   to file-list drops without recursion (the user can re-drop
   the contents of subfolders).
4. **Payer selector** — a `<select>` listing the payers Sophie
   has overlays for, plus `Auto-detect (default)` and
   `Generic / no payer overlay`. Auto-detect inspects the
   packet for the payer letterhead, member-ID pattern, and
   plan-name string and picks an overlay; the user can
   override. v52 ships with overlays for **CMS Medicare FFS
   (NCD/LCD)**, **CMS Medicare Advantage (general)**, and
   **Medicaid (state-agnostic core only)**. Commercial payer
   overlays are added in later waves (§9).
5. **Results panel** — initially hidden. Renders after the
   first packet is processed. Contains: a header row
   (packet name, dataset version, total findings split by
   severity), a filterable findings list, an evidence ledger,
   and three download buttons (DOCX report, JSON export,
   redacted DOCX report with PHI masked).

A single page state machine governs the view:

```
IDLE → ACCEPTING (file picked / drop)
     → PARSING   (workers extract text)
     → ANALYZING (rule engine runs)
     → REPORTING (results rendered)
     ↺ IDLE      (user clicks "Start over")
```

`PARSING` and `ANALYZING` display a progress bar with the same
visual treatment as Vaulytica's `src/ui/progress.ts`. The bar
is purely cosmetic (no network call); it tracks worker
postMessage events.

### 4.3 The pipeline (deterministic, in-browser, end-to-end)

```
Files (PDF/DOCX/TXT/image)
   │
   ▼
[Ingest]                lib/pa/ingest.js
   │  - per-file: mime sniff, size cap (50 MB per file, 200 MB total)
   │  - PDF via pdf.js (vendored, see §5.2)
   │  - DOCX via mammoth (vendored)
   │  - TXT passes through
   │  - image: marked as "non-textual, OCR not performed"
   │  - SHA-256 each file (for audit trail)
   ▼
[Normalize]             lib/pa/normalize.js
   │  - strip control chars except \n \t
   │  - collapse runs of whitespace
   │  - extract page breaks (PDF) / paragraph breaks (DOCX)
   │  - preserve table structure as a JSON sidecar
   ▼
[Classify]              lib/pa/classify.js
   │  - per-document: which packet role is this?
   │      * clinical-note
   │      * pa-form (payer's PA request form)
   │      * medical-necessity-letter
   │      * lab-result | imaging-report | path-report
   │      * prior-auth-denial (for resubmissions)
   │      * other
   │  - classification is deterministic: keyword anchors +
   │    structural fingerprints (header text, section names,
   │    LOINC patterns, ICD-10 dense blocks). Not ML.
   ▼
[Extract]               lib/pa/extract.js
   │  - patient identifiers: redacted by default in extract;
   │    the raw values stay in memory but never enter the
   │    findings array unless the user opts in via the
   │    "include PHI in report" toggle (default OFF).
   │  - CPT / HCPCS / ICD-10 codes (regex + lookup tables)
   │  - dates: service, signature, lab collection, study read
   │  - NPI (10 digits + Luhn-mod-10 check digit)
   │  - TIN (9 digits)
   │  - place of service code (2 digits, valid POS list)
   │  - modifiers (1–2 alphanumerics)
   │  - quantities, units of measure
   │  - signatures (presence/absence; not handwriting analysis)
   ▼
[Detect payer]          lib/pa/payer.js
   │  - letterhead anchors, member-ID format, plan-name string
   │  - falls through to user's manual selection
   ▼
[Rule engine]           lib/pa/engine.js
   │  - load core ruleset (always runs)
   │  - load payer overlay (if any)
   │  - load specialty overlay (if classifier flagged one)
   │  - run each rule against the extracted bundle
   │  - each rule returns: pass | flag | block | n/a
   │  - findings carry: rule id, severity, evidence pointer,
   │    citation, dataset version, computed at
   ▼
[Report]                lib/pa/report.js
   │  - DOCX via docx.js (vendored)
   │  - JSON via JSON.stringify
   │  - redacted DOCX: PHI strings replaced with `[REDACTED]`
   ▼
Findings panel (in-page) + downloads
```

Every step runs client-side. The only network access during a
session is the **initial page load** plus the service-worker
shell warm-up. After first paint there are zero outbound
requests. This is verified by the existing
`test/integration/no-network.spec.js`
([spec-v50](spec-v50.md) §3.1), which v52 extends to fire the
PA pipeline against a fixture packet and assert zero network
calls.

### 4.4 Severity model

Each finding has one of four severities:

| Severity | Meaning                                                                | UI color  |
|----------|------------------------------------------------------------------------|-----------|
| `block`  | The packet will be rejected on intake. Fix before submission.          | red       |
| `flag`   | The packet will be queued for review with high denial likelihood.      | amber     |
| `info`   | A condition worth knowing about but not denial-causing.                | blue      |
| `pass`   | An expected condition was confirmed present.                           | green     |

Findings render in severity order (`block`, `flag`, `info`,
`pass`) and within each severity in rule-id order. The report
header shows totals per severity.

### 4.5 The deterministic ruleset (v1.0.0)

v52 ships with the following rule families. Each rule has a
stable id (`R-PA-NNN`), a one-line description, a severity, a
citation, and a deterministic implementation. The complete
text of each rule lives in `data/pa-lint/rules/v1/` as
versioned JSON; this section is the table of contents.

#### 4.5.1 Core (payer-agnostic) — 60 rules

| Id        | Rule                                                                 | Severity |
|-----------|----------------------------------------------------------------------|----------|
| `R-PA-001`| Patient name present and consistent across all documents             | block    |
| `R-PA-002`| Date of birth present and consistent across all documents            | block    |
| `R-PA-003`| Member ID present and matches payer format                           | block    |
| `R-PA-004`| Service date present                                                 | block    |
| `R-PA-005`| Service date is not in the past beyond payer's retro-auth window     | flag     |
| `R-PA-006`| Service date is not more than 365 days in the future                 | block    |
| `R-PA-007`| At least one CPT or HCPCS code present                               | block    |
| `R-PA-008`| Each CPT code is valid for the service date (HCPCS table current)    | block    |
| `R-PA-009`| Each HCPCS code is valid for the service date                        | block    |
| `R-PA-010`| At least one ICD-10-CM code present                                  | block    |
| `R-PA-011`| Each ICD-10 code is valid for the service date                       | block    |
| `R-PA-012`| At least one ICD-10 code is permissible with each CPT (CCI pair)     | flag     |
| `R-PA-013`| Place of service code present and valid                              | block    |
| `R-PA-014`| Modifier set is valid for each CPT                                   | flag     |
| `R-PA-015`| Quantity / units present and ≥ 1                                     | block    |
| `R-PA-016`| Ordering provider NPI present and Luhn-valid                         | block    |
| `R-PA-017`| Ordering provider signature present                                  | block    |
| `R-PA-018`| Ordering provider signature is dated                                 | block    |
| `R-PA-019`| Servicing provider / facility NPI present and Luhn-valid             | block    |
| `R-PA-020`| Servicing facility TIN present (9 digits)                            | flag     |
| `R-PA-021`| Clinical-note document present in packet                             | block    |
| `R-PA-022`| Clinical note is dated within payer's clinical-look-back window      | flag     |
| `R-PA-023`| Clinical note references the procedure being requested               | flag     |
| `R-PA-024`| Medical-necessity statement present (free-text or structured)        | flag     |
| `R-PA-025`| Supporting labs referenced in the request are attached               | flag     |
| `R-PA-026`| Supporting imaging referenced in the request is attached             | flag     |
| `R-PA-027`| Each attached lab is dated within payer's evidence-freshness window  | flag     |
| `R-PA-028`| Each attached imaging report is dated within freshness window        | flag     |
| `R-PA-029`| Step-therapy documentation present when payer requires it            | flag     |
| `R-PA-030`| Prior-treatment list present when step therapy applies               | flag     |
| `R-PA-031`| Allergies / intolerances list present                                | info     |
| `R-PA-032`| Active medication list present                                       | info     |
| `R-PA-033`| Height / weight / BSA present when dose is weight-based              | flag     |
| `R-PA-034`| Renal function (eGFR or SCr + age) present for renally-dosed agents  | flag     |
| `R-PA-035`| Hepatic function (LFTs) present for hepatically-dosed agents         | info     |
| `R-PA-036`| Frequency / interval present and within payer's allowed range        | flag     |
| `R-PA-037`| Duration / length of approval requested is present                   | flag     |
| `R-PA-038`| Submission is a resubmission iff prior denial document is attached   | flag     |
| `R-PA-039`| Resubmission references the original PA reference number             | flag     |
| `R-PA-040`| Resubmission addresses each reason cited in the prior denial         | info     |
| `R-PA-041`| At-risk PHI (SSN) is not present in the packet                       | flag     |
| `R-PA-042`| Each page of multi-page PDF is text-extractable (not a scan)         | flag     |
| `R-PA-043`| Each document is not password-protected                              | block    |
| `R-PA-044`| Each document opened without parse error                             | block    |
| `R-PA-045`| Total packet size ≤ payer's maximum (default 50 MB)                  | flag     |
| `R-PA-046`| No document has corrupted character encoding (mojibake)              | flag     |
| `R-PA-047`| Patient address present if payer requires for benefit verification   | info     |
| `R-PA-048`| Subscriber relationship to patient indicated                         | info     |
| `R-PA-049`| Other insurance / COB information indicated                          | info     |
| `R-PA-050`| Diagnosis-procedure linkage shown (which dx supports which CPT)      | flag     |
| `R-PA-051`| Procedure description matches the CPT short descriptor (within 70%)  | info     |
| `R-PA-052`| Date of injury present if procedure is injury-related (HCPCS 'V' dx) | flag     |
| `R-PA-053`| Authorization not requested for a code in payer's no-PA-needed list  | info     |
| `R-PA-054`| Each modifier '25' / '59' is accompanied by supporting documentation | flag     |
| `R-PA-055`| Bilateral procedure flag matches modifier '50' presence              | flag     |
| `R-PA-056`| Anesthesia time is documented when an anesthesia CPT is present      | flag     |
| `R-PA-057`| Assistant surgeon modifier matches second NPI on packet              | flag     |
| `R-PA-058`| Each CPT in unlisted-code range has a narrative justification        | flag     |
| `R-PA-059`| Date of consent (when consent doc present) is before date of service | flag     |
| `R-PA-060`| Packet completeness summary present (cover sheet / checklist)        | info     |

#### 4.5.2 CMS Medicare FFS overlay — 25 rules (`R-PA-CMS-NNN`)

Anchored to CMS Internet-Only Manual (IOM), NCDs, LCDs, and
the Local Coverage Article (LCA) library. Each rule cites a
specific NCD/LCD number and its CMS URL. Highlights:

- DME face-to-face encounter present within 6 months
  (`R-PA-CMS-001`, NCD-280.x).
- Detailed written order present and dated
  (`R-PA-CMS-002`, IOM Pub 100-08 ch.5).
- Standard Written Order elements complete
  (`R-PA-CMS-003`).
- Proof of delivery requirements (`R-PA-CMS-004`).
- Documentation of patient functional status for mobility
  devices (`R-PA-CMS-005`, LCD L33788).
- Sleep study results within 12 months for PAP devices
  (`R-PA-CMS-006`, LCD L33718).
- 90-day compliance documentation for PAP continuation
  (`R-PA-CMS-007`).
- And 18 more, enumerated in `data/pa-lint/rules/v1/cms-ffs.json`.

#### 4.5.3 CMS Medicare Advantage overlay — 15 rules

Covers the additional documentation MA plans request beyond
FFS (PCP referral when plan is HMO, network-status check
indicator, specialist NPI when plan is gatekeepered, etc.).
Enumerated in `data/pa-lint/rules/v1/cms-ma.json`.

#### 4.5.4 Medicaid state-agnostic core — 10 rules

The intersection of all 50 state Medicaid programs (member-ID
format, EPSDT documentation when patient is < 21, eligibility
date alignment with service date, etc.). State-specific
overlays are deferred to v52-4+. Enumerated in
`data/pa-lint/rules/v1/medicaid-core.json`.

#### 4.5.5 Specialty overlays — 25 rules

Triggered by the classifier when the requested procedure falls
in a high-PA specialty:

- **Imaging / advanced imaging** (`R-PA-RAD-NNN`) — ACR
  Appropriateness Criteria reference present, prior conservative
  management documented for non-emergent MRI, contrast allergy
  documented when contrast is requested.
- **Infusion / specialty drug** (`R-PA-INF-NNN`) — J-code
  matches drug NDC, dose matches FDA labeling for indication,
  weight-based dose calculation shown, infusion site of care
  appropriate.
- **Surgery** (`R-PA-SURG-NNN`) — conservative management
  trial documented, imaging supporting surgical indication
  attached, anesthesia clearance documented for ASA ≥ 3.
- **Behavioral health** (`R-PA-BH-NNN`) — DSM-5-TR diagnosis
  present, treatment plan with measurable goals, prior level
  of care documented if stepping up.
- **Genetic testing** (`R-PA-GEN-NNN`) — family history
  documented, genetic counseling documented, test specificity
  matches indication.

#### 4.5.6 Versioning, hashing, and stale-source disabling

Every rule JSON file carries:

```json
{
  "rulesetVersion": "1.0.0",
  "ruleSourceUrl": "https://www.cms.gov/medicare-coverage-database/...",
  "ruleSourceAccessedDate": "2026-05-15",
  "ruleSourceHash": "sha256:..."
}
```

A nightly `scripts/refresh-pa-rules.mjs` (run by the
maintainer, not in browser) re-fetches each source URL,
re-hashes it, and emits a diff. If the hash changes, the rule
is marked **`needs-review`** in the next ruleset patch
release. If the source URL 404s, the rule is set to
`disabled: true` and the engine skips it; the report's audit
trail explicitly says *"R-PA-CMS-007 disabled at dataset
v1.0.4 because LCD URL returned 404 on 2026-06-01; rule will
be re-enabled once a human re-points it."* This mirrors
Vaulytica's citation-pinned source-of-truth pattern
([Vaulytica README](https://github.com/clay-good/vaulytica)).

The browser never fetches these URLs at runtime. The refresh
script runs on the maintainer's laptop or in CI. The user's
session loads a single bundled `pa-rules.json` (one file per
ruleset, ~200–400 KB gzipped at v1) and runs entirely against
that bundle.

#### 4.5.7 Commercial payer overlays — opens with Aetna (wave 52-7)

The §9 wave plan's "first commercial payer overlays" land here.
Unlike the government overlays (§4.5.2–§4.5.4), a commercial
overlay is keyed to a **single named payer**, detected by
`lib/pa/payer.js` as its own bucket (`'aetna'`, placed before
the generic `'commercial'` fall-through; `aetna medicare
[advantage]` is still caught earlier by the MA bucket). Each
commercial rule self-gates on `bundle.payer === '<payer>'` and
returns a vacuous pass on every other packet, exactly like the
CMS-FFS overlay.

Scope discipline: commercial overlay rules check the
**procedural completeness** of a precertification packet against
the payer's *own published* submission requirements — not
clinical coverage criteria, which are the reviewer's judgement
and the payer's Clinical Policy Bulletin's job. Every rule is
anchored to a public payer URL tracked in the staleness ledger
(§8.3) and re-verified on the §4.5.6 cadence.

The first overlay is **Aetna** (`R-PA-AETNA-NNN`, ledger source
`aetna-precert`, anchored to Aetna's public precertification,
utilization-management, and Clinical Policy Bulletin pages). Waves
Waves 52-7a through 52-7d ship the full planned set of 20:

| Id              | Rule                                                                       | Severity |
|-----------------|----------------------------------------------------------------------------|----------|
| `R-PA-AETNA-001`| Medical-necessity criteria (Aetna CPB / CMS / MCG) referenced for the request | flag  |
| `R-PA-AETNA-002`| Supporting medical records / clinical documentation attached               | flag     |
| `R-PA-AETNA-003`| Submission channel (EDI / secure provider portal / phone on ID card) noted | info     |
| `R-PA-AETNA-004`| Requested service is on Aetna's participating-provider precert list (stub) | info     |
| `R-PA-AETNA-005`| Procedure-specific precertification questionnaire completed when required  | flag     |
| `R-PA-AETNA-006`| Inpatient request carries concurrent-review (progress + discharge) docs    | flag     |
| `R-PA-AETNA-007`| Hospital-outpatient MRI / CT addresses Aetna's site-of-care requirement    | flag     |
| `R-PA-AETNA-008`| Expedited / urgent request states the clinical urgency                     | flag     |
| `R-PA-AETNA-009`| Objective evidence (visual field / photos / measurements) when CPB requires it | flag |
| `R-PA-AETNA-010`| NDC documented for a physician-administered (J-code) drug request          | info     |
| `R-PA-AETNA-011`| Step-therapy prior-trial documentation for a drug request                  | flag     |
| `R-PA-AETNA-012`| Bariatric surgery (CPB 0157): BMI + supervised weight-management program   | flag     |
| `R-PA-AETNA-013`| Genetic testing (CPB 0140): pre-test counseling + family history           | flag     |
| `R-PA-AETNA-014`| Retrospective / retroactive request states a retro-review justification    | info     |
| `R-PA-AETNA-015`| Hospital-setting elective surgery documents the site-of-service rationale  | info     |
| `R-PA-AETNA-016`| DME / home-health request carries a signed, dated written order            | flag     |
| `R-PA-AETNA-017`| Transplant routed through the National Medical Excellence / IOE program    | flag     |
| `R-PA-AETNA-018`| Experimental / investigational service carries peer-reviewed evidence      | flag     |
| `R-PA-AETNA-019`| Appeal / reconsideration references the original determination             | info     |
| `R-PA-AETNA-020`| Out-of-network request documents a network-gap / continuity-of-care reason | info     |

`R-PA-AETNA-004` mirrors core `R-PA-053`: it ships without a
bundled precert list and vacuously passes with a pointer until a
later wave bundles the list and flips it to a real membership
test. Rules 006–008 key off the review *modes* Aetna runs
(concurrent / continued-stay, site-of-service, expedited); 009–013
off documentation Aetna's CPBs and precert forms call out
(objective evidence, NDC, step therapy, bariatric CPB 0157,
genetic CPB 0140); 014–015 off submission timing and the
Outpatient Surgical Procedures site-of-service policy; 016–020
(wave 52-7d) close the set on the service lines the earlier waves
did not reach — DME / home-health written orders, the National
Medical Excellence transplant program, the experimental /
investigational determination, the appeal / reconsideration
pathway, and out-of-network / network-gap requests. Each
self-gates on the `aetna` bucket and vacuously passes on every
other packet. With the Aetna set complete, the next commercial
overlay (UnitedHealthcare, §4.5.8) opened in wave 52-8; Anthem
follows.

#### 4.5.8 Commercial payer overlays — UnitedHealthcare (wave 52-8)

The second named commercial-payer overlay. Like Aetna (§4.5.7),
UnitedHealthcare is keyed to its own payer bucket (`'uhc'`,
detected by `lib/pa/payer.js` and placed before the generic
`'commercial'` fall-through; `uhc / unitedhealthcare medicare
[advantage]` is still caught earlier by the MA bucket). The
`uhc` bucket also admits UHC's TPA and subsidiary brands (UMR,
Oxford) because they adjudicate under UHC's prior-authorization
protocols. Each commercial rule self-gates on `bundle.payer ===
'uhc'` and returns a vacuous pass on every other packet.

Scope discipline is identical to §4.5.7: the rules check the
**procedural completeness** of a UnitedHealthcare prior-
authorization / advance-notification packet against UHC's *own
published* submission requirements — not clinical coverage
criteria, which are the reviewer's judgement and the applicable
Coverage Determination Guideline / Medical Policy's job. Every
rule is anchored to a public UHC provider URL tracked in the
staleness ledger (§8.3, source `uhc-precert`) and re-verified on
the §4.5.6 cadence.

The set deliberately mirrors the Aetna families so the two
commercial overlays stay structurally parallel and auditable
side by side. Wave 52-8 ships the full planned set of 20
(`R-PA-UHC-NNN`):

| Id            | Rule                                                                           | Severity |
|---------------|--------------------------------------------------------------------------------|----------|
| `R-PA-UHC-001`| Coverage criteria (Coverage Determination Guideline / Medical Policy / MCG) referenced | flag |
| `R-PA-UHC-002`| Supporting medical records / clinical documentation attached                   | flag     |
| `R-PA-UHC-003`| Submission channel (UnitedHealthcare Provider Portal / EDI 278 / phone) noted  | info     |
| `R-PA-UHC-004`| Requested service is on UHC's prior-auth / advance-notification list (stub)     | info     |
| `R-PA-UHC-005`| Advance notification documented for a notification-required service            | flag     |
| `R-PA-UHC-006`| Inpatient request carries admission notification + concurrent-review docs      | flag     |
| `R-PA-UHC-007`| Outpatient MRI / CT / PET carries the clinical indication for the imaging program | flag  |
| `R-PA-UHC-008`| Expedited / urgent request states the clinical urgency                         | flag     |
| `R-PA-UHC-009`| Outpatient surgery addresses the hospital-outpatient vs. ASC site-of-service   | flag     |
| `R-PA-UHC-010`| NDC documented for a physician-administered (J-code) drug request              | info     |
| `R-PA-UHC-011`| Step-therapy prior-trial documentation for a drug request (OptumRx)            | flag     |
| `R-PA-UHC-012`| Genetic / molecular testing carries the specific test + indication             | flag     |
| `R-PA-UHC-013`| Specialty / injectable drug carries the supporting diagnosis for the Drug Policy | flag   |
| `R-PA-UHC-014`| Retrospective / retroactive request states a retro-review justification        | info     |
| `R-PA-UHC-015`| DME / home-health request carries a signed, dated written order / plan of care | flag     |
| `R-PA-UHC-016`| Behavioral health (Optum / UBH) request carries level-of-care criteria         | flag     |
| `R-PA-UHC-017`| Transplant routed through the UHC transplant / Centers of Excellence network   | flag     |
| `R-PA-UHC-018`| Experimental / investigational / unproven service carries peer-reviewed evidence | flag   |
| `R-PA-UHC-019`| Appeal / reconsideration references the original determination                 | info     |
| `R-PA-UHC-020`| Out-of-network request documents a network-gap / continuity-of-care reason     | info     |

`R-PA-UHC-004` mirrors core `R-PA-053` and `R-PA-AETNA-004`: it
ships without a bundled prior-authorization list and vacuously
passes with a pointer until a later wave bundles the list and
flips it to a real membership test. Rules 005–009 key off the
review *modes* UHC runs (advance notification, concurrent /
continued-stay, the advanced-imaging notification program,
expedited handling, Site of Service); 010–013 off documentation
UHC's policies call out (NDC, step therapy, the Genetic and
Molecular Testing program, the Medical Benefit Drug Policy
diagnosis); 014–020 close the set on the service lines Aetna's
set also reached — retrospective justification, DME / home-health
written orders, behavioral-health level-of-care criteria (Optum /
UBH), the transplant Centers of Excellence routing, the
experimental / investigational / unproven determination, the
appeal / reconsideration pathway, and out-of-network /
network-gap requests. With the UnitedHealthcare set complete,
Anthem opened in wave 52-9 (§4.5.9).

#### 4.5.9 Commercial payer overlays — Anthem (wave 52-9)

The third named commercial-payer overlay. Like Aetna (§4.5.7) and
UnitedHealthcare (§4.5.8), Anthem Blue Cross Blue Shield (Elevance
Health) is keyed to its own payer bucket (`'anthem'`, detected by
`lib/pa/payer.js` and placed before the generic `'commercial'`
fall-through). The bucket matches **only** the definitively-Anthem
anchors `anthem` and `elevance`; generic `blue cross` / `blue
shield` stays in the `'commercial'` fall-through, because most Blue
Cross Blue Shield plans are independent licensees rather than
Anthem/Elevance and the overlay asserts Anthem's *specific*
submission requirements. An explicit "Medicare Advantage" string
still wins the MA bucket earlier. Each commercial rule self-gates
on `bundle.payer === 'anthem'` and returns a vacuous pass on every
other packet.

Scope discipline is identical to §4.5.7–§4.5.8: the rules check
the **procedural completeness** of an Anthem prior-authorization
packet against Anthem's *own published* submission requirements —
not clinical coverage criteria, which are the reviewer's judgement
and the applicable Clinical UM Guideline / Medical Policy's job.
Every rule is anchored to a public Anthem provider URL tracked in
the staleness ledger (§8.3, source `anthem-precert`) and
re-verified on the §4.5.6 cadence.

The set mirrors the Aetna / UHC families so the three commercial
overlays stay structurally parallel and auditable side by side;
Anthem-specific routing names appear where Anthem actually uses
them — the Availity Essentials portal's **Interactive Care
Reviewer (ICR)** for submission, **Carelon Medical Benefits
Management** (formerly AIM Specialty Health) for advanced imaging
and genetic testing, **CarelonRx** for pharmacy, and **Blue
Distinction Centers** for transplant. Wave 52-9 ships the full
planned set of 20 (`R-PA-ANTHEM-NNN`):

| Id              | Rule                                                                          | Severity |
|-----------------|-------------------------------------------------------------------------------|----------|
| `R-PA-ANTHEM-001`| Medical-necessity criteria (Clinical UM Guideline / Medical Policy / MCG) referenced | flag |
| `R-PA-ANTHEM-002`| Supporting medical records / clinical documentation attached                 | flag     |
| `R-PA-ANTHEM-003`| Submission channel (Availity / Interactive Care Reviewer / phone) noted       | info     |
| `R-PA-ANTHEM-004`| Requested service is on Anthem's prior-authorization list (stub)              | info     |
| `R-PA-ANTHEM-005`| Authorization referenced for a service that requires it before the service date | flag   |
| `R-PA-ANTHEM-006`| Inpatient request carries admission notification + concurrent-review docs     | flag     |
| `R-PA-ANTHEM-007`| Outpatient MRI / CT / PET carries the clinical indication for the Carelon (AIM) program | flag |
| `R-PA-ANTHEM-008`| Expedited / urgent request states the clinical urgency                        | flag     |
| `R-PA-ANTHEM-009`| Outpatient surgery / imaging addresses the hospital-outpatient site-of-care   | flag     |
| `R-PA-ANTHEM-010`| NDC documented for a physician-administered (J-code) drug request             | info     |
| `R-PA-ANTHEM-011`| Step-therapy prior-trial documentation for a drug request (CarelonRx)         | flag     |
| `R-PA-ANTHEM-012`| Genetic / molecular testing carries the specific test + indication (Carelon)  | flag     |
| `R-PA-ANTHEM-013`| Specialty / oncology drug carries the supporting diagnosis for Clinical Criteria | flag   |
| `R-PA-ANTHEM-014`| Retrospective / retroactive request states a retro-review justification       | info     |
| `R-PA-ANTHEM-015`| DME / home-health request carries a signed, dated written order / plan of care | flag    |
| `R-PA-ANTHEM-016`| Behavioral health request carries level-of-care criteria (MCG / ASAM)         | flag     |
| `R-PA-ANTHEM-017`| Transplant routed through the Anthem network / Blue Distinction Centers       | flag     |
| `R-PA-ANTHEM-018`| Experimental / investigational service carries peer-reviewed evidence         | flag     |
| `R-PA-ANTHEM-019`| Appeal / reconsideration references the original determination                | info     |
| `R-PA-ANTHEM-020`| Out-of-network request documents a network-gap / continuity-of-care reason    | info     |

`R-PA-ANTHEM-004` mirrors core `R-PA-053` and the Aetna / UHC -004
rules: it ships without a bundled prior-authorization list and
vacuously passes with a pointer until a later wave bundles the
list. With three commercial overlays shipped (Aetna,
UnitedHealthcare, Anthem — the three largest commercial plans by
national PA volume), the §9 wave plan's "first commercial payer
overlays" item is complete; Cigna opened in wave 52-10 (§4.5.10),
with Humana the next candidate as user-volume data warrants (§9
wave 52-5+).

#### 4.5.10 Commercial payer overlays — Cigna (wave 52-10)

The fourth named commercial-payer overlay. Like Aetna (§4.5.7),
UnitedHealthcare (§4.5.8), and Anthem (§4.5.9), Cigna is keyed to
its own payer bucket (`'cigna'`, detected by `lib/pa/payer.js` and
placed before the generic `'commercial'` fall-through, after
`'anthem'`). The bucket matches the anchors `cigna` and
`elevance`'s Cigna counterpart `evernorth` — Cigna's
health-services brand, under which it runs pharmacy (Express
Scripts / Accredo) and behavioral health. As with the Anthem
bucket, there is no `cigna medicare` anchor in the MA bucket, so a
plain Cigna Medicare Advantage packet without an explicit
"Medicare Advantage" string routes here; that is acceptable
because the overlay rules self-gate on requested services, not on
the line of business. Each commercial rule self-gates on
`bundle.payer === 'cigna'` and returns a vacuous pass on every
other packet.

Scope discipline is identical to §4.5.7–§4.5.9: the rules check
the **procedural completeness** of a Cigna prior-authorization /
precertification packet against Cigna's *own published*
submission requirements — not clinical coverage criteria, which
are the reviewer's judgement and the applicable Cigna Medical
Coverage Policy's job. Every rule is anchored to a public Cigna
provider URL tracked in the staleness ledger (§8.3, source
`cigna-precert`) and re-verified on the §4.5.6 cadence.

The set mirrors the Aetna / UHC / Anthem families so the four
commercial overlays stay structurally parallel and auditable side
by side; Cigna-specific routing names appear where Cigna actually
uses them — the **CignaforHCP** provider portal (and Availity)
for submission, **eviCore by Evernorth** for advanced imaging and
genetic / molecular testing, **Express Scripts / Accredo** for
pharmacy and specialty drugs, **Evernorth Behavioral Health** for
behavioral health, and the **Cigna LifeSOURCE Transplant
Network** / Centers of Excellence for transplant. Wave 52-10
ships the full planned set of 20 (`R-PA-CIGNA-NNN`):

| Id              | Rule                                                                          | Severity |
|-----------------|-------------------------------------------------------------------------------|----------|
| `R-PA-CIGNA-001`| Coverage criteria (Cigna Medical Coverage Policy / MCG) referenced            | flag     |
| `R-PA-CIGNA-002`| Supporting medical records / clinical documentation attached                 | flag     |
| `R-PA-CIGNA-003`| Submission channel (CignaforHCP provider portal / Availity / phone) noted     | info     |
| `R-PA-CIGNA-004`| Requested service is on Cigna's precertification list (stub)                  | info     |
| `R-PA-CIGNA-005`| Authorization referenced for a service that requires it before the service date | flag  |
| `R-PA-CIGNA-006`| Inpatient request carries admission notification + concurrent-review docs     | flag     |
| `R-PA-CIGNA-007`| Outpatient MRI / CT / PET carries the clinical indication for the eviCore program | flag |
| `R-PA-CIGNA-008`| Expedited / urgent request states the clinical urgency                        | flag     |
| `R-PA-CIGNA-009`| Outpatient surgery / imaging addresses the hospital-outpatient site-of-care   | flag     |
| `R-PA-CIGNA-010`| NDC documented for a physician-administered (J-code) drug request             | info     |
| `R-PA-CIGNA-011`| Step-therapy prior-trial documentation for a drug request (Express Scripts)   | flag     |
| `R-PA-CIGNA-012`| Genetic / molecular testing carries the specific test + indication (eviCore)  | flag     |
| `R-PA-CIGNA-013`| Specialty / injectable drug carries the supporting diagnosis for the Coverage Policy | flag |
| `R-PA-CIGNA-014`| Retrospective / retroactive request states a retro-review justification       | info     |
| `R-PA-CIGNA-015`| DME / home-health request carries a signed, dated written order / plan of care | flag    |
| `R-PA-CIGNA-016`| Behavioral health request carries level-of-care criteria (Evernorth / ASAM)   | flag     |
| `R-PA-CIGNA-017`| Transplant routed through the Cigna LifeSOURCE Transplant Network / COE        | flag     |
| `R-PA-CIGNA-018`| Experimental / investigational / unproven service carries peer-reviewed evidence | flag   |
| `R-PA-CIGNA-019`| Appeal / reconsideration references the original determination                | info     |
| `R-PA-CIGNA-020`| Out-of-network request documents a network-gap / continuity-of-care reason    | info     |

`R-PA-CIGNA-004` mirrors core `R-PA-053` and the Aetna / UHC /
Anthem -004 rules: it ships without a bundled precertification
list and vacuously passes with a pointer until a later wave
bundles the list. With four commercial overlays shipped (Aetna,
UnitedHealthcare, Anthem, Cigna — the four largest commercial
plans by national PA volume), Humana opened in wave 52-11
(§4.5.11) as the fifth.

#### 4.5.11 Commercial payer overlays — Humana (wave 52-11)

The fifth named commercial-payer overlay. Like the four before
it, Humana is keyed to its own payer bucket (`'humana'`, detected
by `lib/pa/payer.js` and placed before the generic `'commercial'`
fall-through, after `'cigna'`). The bucket matches the anchors
`humana` and `centerwell` (Humana's pharmacy and care-delivery
brand). Humana is predominantly a Medicare Advantage insurer, so
`humana gold plus` and any explicit "Medicare Advantage" string
are caught earlier by the MA bucket; a plain Humana commercial
packet routes here. As with the Anthem and Cigna buckets, a plain
Humana MA packet without an explicit "Medicare Advantage" string
also routes here, which is acceptable because the overlay rules
self-gate on requested services, not on the line of business.
Each commercial rule self-gates on `bundle.payer === 'humana'`
and returns a vacuous pass on every other packet.

Scope discipline is identical to §4.5.7–§4.5.10: the rules check
the **procedural completeness** of a Humana prior-authorization /
preauthorization packet against Humana's *own published*
submission requirements — not clinical coverage criteria, which
are the reviewer's judgement and the applicable Humana Medical
Coverage Policy's job. Every rule is anchored to a public Humana
provider URL tracked in the staleness ledger (§8.3, source
`humana-precert`) and re-verified on the §4.5.6 cadence.

The set mirrors the earlier commercial families so the five
overlays stay structurally parallel and auditable side by side;
Humana-specific routing names appear where Humana actually uses
them — the **Availity Essentials** portal for submission, Humana's
**advanced-imaging utilization-management program** for advanced
imaging / MSK / cardiology and genetic / molecular testing,
**Evolent / New Century Health** for oncology, **CenterWell
Pharmacy** / Humana Pharmacy Solutions for pharmacy, **Humana
Behavioral Health** for behavioral health, and the **Humana
National Transplant Network** for transplant. (The imaging /
lab-management program is described generically in the ruleset
rather than by its current vendor name, which collides with an
AI-vendor substring barred from source by spec-v50 §3.6.) Wave
52-11 ships the full planned set of 20 (`R-PA-HUMANA-NNN`):

| Id               | Rule                                                                          | Severity |
|------------------|-------------------------------------------------------------------------------|----------|
| `R-PA-HUMANA-001`| Coverage criteria (Humana Medical Coverage Policy / MCG) referenced           | flag     |
| `R-PA-HUMANA-002`| Supporting medical records / clinical documentation attached                 | flag     |
| `R-PA-HUMANA-003`| Submission channel (Availity Essentials / phone) noted                        | info     |
| `R-PA-HUMANA-004`| Requested service is on Humana's preauthorization / notification list (stub)  | info     |
| `R-PA-HUMANA-005`| Authorization referenced for a service that requires it before the service date | flag  |
| `R-PA-HUMANA-006`| Inpatient request carries admission notification + concurrent-review docs     | flag     |
| `R-PA-HUMANA-007`| Outpatient MRI / CT / PET carries the clinical indication for the imaging program | flag |
| `R-PA-HUMANA-008`| Expedited / urgent request states the clinical urgency                        | flag     |
| `R-PA-HUMANA-009`| Outpatient surgery / imaging addresses the hospital-outpatient site-of-care   | flag     |
| `R-PA-HUMANA-010`| NDC documented for a physician-administered (J-code) drug request             | info     |
| `R-PA-HUMANA-011`| Step-therapy prior-trial documentation for a drug request (CenterWell)        | flag     |
| `R-PA-HUMANA-012`| Genetic / molecular testing carries the specific test + indication            | flag     |
| `R-PA-HUMANA-013`| Specialty / oncology drug carries the supporting diagnosis (Evolent oncology) | flag     |
| `R-PA-HUMANA-014`| Retrospective / retroactive request states a retro-review justification       | info     |
| `R-PA-HUMANA-015`| DME / home-health request carries a signed, dated written order / plan of care | flag    |
| `R-PA-HUMANA-016`| Behavioral health request carries level-of-care criteria (Humana BH / ASAM)   | flag     |
| `R-PA-HUMANA-017`| Transplant routed through the Humana National Transplant Network / COE         | flag     |
| `R-PA-HUMANA-018`| Experimental / investigational / unproven service carries peer-reviewed evidence | flag   |
| `R-PA-HUMANA-019`| Appeal / reconsideration references the original determination                | info     |
| `R-PA-HUMANA-020`| Out-of-network request documents a network-gap / continuity-of-care reason    | info     |

`R-PA-HUMANA-004` mirrors core `R-PA-053` and the Aetna / UHC /
Anthem / Cigna -004 rules: it ships without a bundled
preauthorization list and vacuously passes with a pointer until a
later wave bundles the list. With five commercial overlays
shipped (Aetna, UnitedHealthcare, Anthem, Cigna, Humana — the
five largest commercial / MA plans by national PA volume), the
remaining §9 wave 52-5+ candidates are the Blues plans by state
and per-state Medicaid overlays as user-volume data warrants.

#### 4.5.12 Commercial payer overlays — HCSC / Blue Cross Blue Shield (wave 52-12)

The sixth named commercial-payer overlay, and the first to
address the §9 "Blues plans by state" candidate directly. **Health
Care Service Corporation (HCSC)** is the largest Blue Cross Blue
Shield licensee not already routed to the Anthem/Elevance bucket:
it operates the Blues plans of **Illinois, Texas, Montana, New
Mexico, and Oklahoma** and is the largest customer-owned health
insurer in the country. Like the five before it, HCSC is keyed to
its own payer bucket (`'hcsc'`, detected by `lib/pa/payer.js` and
placed before the generic `'commercial'` fall-through, after
`'humana'`). The bucket matches only definitively-HCSC anchors —
the corporate name `health care service corporation`, the `hcsc`
acronym, and the five state plan names (`blue cross [and] blue
shield of illinois / texas / montana / new mexico / oklahoma`).
Generic `blue cross` / `blue shield` and other Blues licensees
(Florida Blue, Blue Shield of California) stay in the commercial
fall-through, exactly as the Anthem bucket leaves them. HCSC's
Medicare Advantage line ("Blue Cross Medicare Advantage") carries
an explicit "Medicare Advantage" string, so it is caught earlier
by the MA bucket; a plain HCSC commercial packet routes here. Each
commercial rule self-gates on `bundle.payer === 'hcsc'` and
returns a vacuous pass on every other packet.

Scope discipline is identical to §4.5.7–§4.5.11: the rules check
the **procedural completeness** of an HCSC prior-authorization
packet against HCSC's *own published* submission requirements —
not clinical coverage criteria, which are the reviewer's judgement
and the applicable HCSC Medical Policy's job. Every rule is
anchored to a public HCSC (BCBSIL) provider URL tracked in the
staleness ledger (§8.3, source `hcsc-precert`) and re-verified on
the §4.5.6 cadence.

The set mirrors the earlier commercial families so the six
overlays stay structurally parallel and auditable side by side;
HCSC-specific routing names appear where HCSC actually uses them —
the **Availity Essentials** portal for submission, HCSC's
**advanced-imaging utilization-management program** for advanced
imaging and genetic / molecular testing, **Prime Therapeutics**
(which HCSC co-owns) for pharmacy / step therapy, **HCSC
Behavioral Health** for behavioral health, and the **Blue
Distinction Centers for Transplant** for transplant. (As with
Humana §4.5.11, the imaging / lab-management program is described
generically in the ruleset rather than by its current vendor name,
which collides with an AI-vendor substring barred from source by
spec-v50 §3.6.) Wave 52-12 ships the full planned set of 20
(`R-PA-HCSC-NNN`):

| Id              | Rule                                                                          | Severity |
|-----------------|-------------------------------------------------------------------------------|----------|
| `R-PA-HCSC-001` | Coverage criteria (HCSC Medical Policy / MCG) referenced                       | flag     |
| `R-PA-HCSC-002` | Supporting medical records / clinical documentation attached                  | flag     |
| `R-PA-HCSC-003` | Submission channel (Availity Essentials / phone) noted                        | info     |
| `R-PA-HCSC-004` | Requested service is on HCSC's prior-authorization / notification list (stub) | info     |
| `R-PA-HCSC-005` | Authorization referenced for a service that requires it before the service date | flag   |
| `R-PA-HCSC-006` | Inpatient request carries admission notification + concurrent-review docs     | flag     |
| `R-PA-HCSC-007` | Outpatient MRI / CT / PET carries the clinical indication for the imaging program | flag |
| `R-PA-HCSC-008` | Expedited / urgent request states the clinical urgency                        | flag     |
| `R-PA-HCSC-009` | Outpatient surgery / imaging addresses the hospital-outpatient site-of-care   | flag     |
| `R-PA-HCSC-010` | NDC documented for a physician-administered (J-code) drug request             | info     |
| `R-PA-HCSC-011` | Step-therapy prior-trial documentation for a drug request (Prime Therapeutics) | flag    |
| `R-PA-HCSC-012` | Genetic / molecular testing carries the specific test + indication            | flag     |
| `R-PA-HCSC-013` | Specialty / oncology drug carries the supporting diagnosis (Medical Policy)   | flag     |
| `R-PA-HCSC-014` | Retrospective / retroactive request states a retro-review justification       | info     |
| `R-PA-HCSC-015` | DME / home-health request carries a signed, dated written order / plan of care | flag    |
| `R-PA-HCSC-016` | Behavioral health request carries level-of-care criteria (HCSC BH / ASAM)     | flag     |
| `R-PA-HCSC-017` | Transplant routed through the Blue Distinction Centers for Transplant         | flag     |
| `R-PA-HCSC-018` | Experimental / investigational / unproven service carries peer-reviewed evidence | flag   |
| `R-PA-HCSC-019` | Appeal / reconsideration references the original determination                | info     |
| `R-PA-HCSC-020` | Out-of-network request documents a network-gap / continuity-of-care reason    | info     |

`R-PA-HCSC-004` mirrors core `R-PA-053` and the Aetna / UHC /
Anthem / Cigna / Humana -004 rules: it ships without a bundled
prior-authorization list and vacuously passes with a pointer until
a later wave bundles the list. With six commercial overlays
shipped — the five largest commercial / MA plans (Aetna,
UnitedHealthcare, Anthem, Cigna, Humana) plus the largest
independent Blues licensee (HCSC) — the remaining §9 wave 52-5+
candidates are the other Blues plans by state and per-state
Medicaid overlays as user-volume data warrants.

#### 4.5.13 Commercial payer overlays — Highmark / Blue Cross Blue Shield (wave 52-13)

The seventh named commercial-payer overlay, and the second
"Blues plans by state" overlay after HCSC. **Highmark** is the
second-largest independent Blue Cross Blue Shield licensee (after
HCSC): it operates the Blues plans of **Pennsylvania, West
Virginia, Delaware, and western / northeastern New York**. Like
the six before it, Highmark is keyed to its own payer bucket
(`'highmark'`, detected by `lib/pa/payer.js` and placed before the
generic `'commercial'` fall-through, after `'hcsc'`). The bucket
matches the single unambiguous brand anchor `highmark` — a
distinct trade name, not a generic Blues phrase — so generic
`blue cross` / `blue shield` and other Blues licensees stay in the
commercial fall-through, exactly as the HCSC bucket leaves them.
Highmark's Medicare Advantage line ("Freedom Blue") routes to the
MA bucket only when it carries an explicit "Medicare Advantage"
string; a plain Highmark commercial packet routes here. Each
commercial rule self-gates on `bundle.payer === 'highmark'` and
returns a vacuous pass on every other packet.

Scope discipline is identical to §4.5.7–§4.5.12: the rules check
the **procedural completeness** of a Highmark prior-authorization
packet against Highmark's *own published* submission requirements —
not clinical coverage criteria, which are the reviewer's judgement
and the applicable Highmark Medical Policy's job. Every rule is
anchored to a public Highmark Provider Resource Center URL tracked
in the staleness ledger (§8.3, source `highmark-precert`) and
re-verified on the §4.5.6 cadence.

The set mirrors the earlier commercial families so the seven
overlays stay structurally parallel and auditable side by side;
Highmark-specific routing names appear where Highmark actually
uses them — the **Availity Essentials** portal and the **Provider
Resource Center** for submission, Highmark's **advanced-imaging
utilization-management program** for advanced imaging and genetic /
molecular testing, **Highmark pharmacy management** for pharmacy /
step therapy, **Highmark behavioral health** for behavioral health,
and the **Blue Distinction Centers for Transplant** for transplant.
Wave 52-13 ships the full planned set of 20 (`R-PA-HIGHMARK-NNN`):

| Id                  | Rule                                                                          | Severity |
|---------------------|-------------------------------------------------------------------------------|----------|
| `R-PA-HIGHMARK-001` | Coverage criteria (Highmark Medical Policy / MCG) referenced                   | flag     |
| `R-PA-HIGHMARK-002` | Supporting medical records / clinical documentation attached                  | flag     |
| `R-PA-HIGHMARK-003` | Submission channel (Availity Essentials / Provider Resource Center) noted      | info     |
| `R-PA-HIGHMARK-004` | Requested service is on Highmark's prior-authorization / notification list (stub) | info  |
| `R-PA-HIGHMARK-005` | Authorization referenced for a service that requires it before the service date | flag   |
| `R-PA-HIGHMARK-006` | Inpatient request carries admission notification + concurrent-review docs     | flag     |
| `R-PA-HIGHMARK-007` | Outpatient MRI / CT / PET carries the clinical indication for the imaging program | flag |
| `R-PA-HIGHMARK-008` | Expedited / urgent request states the clinical urgency                        | flag     |
| `R-PA-HIGHMARK-009` | Outpatient surgery / imaging addresses the hospital-outpatient site-of-care   | flag     |
| `R-PA-HIGHMARK-010` | NDC documented for a physician-administered (J-code) drug request             | info     |
| `R-PA-HIGHMARK-011` | Step-therapy prior-trial documentation for a drug request (Highmark pharmacy) | flag     |
| `R-PA-HIGHMARK-012` | Genetic / molecular testing carries the specific test + indication            | flag     |
| `R-PA-HIGHMARK-013` | Specialty / oncology drug carries the supporting diagnosis (Medical Policy)   | flag     |
| `R-PA-HIGHMARK-014` | Retrospective / retroactive request states a retro-review justification       | info     |
| `R-PA-HIGHMARK-015` | DME / home-health request carries a signed, dated written order / plan of care | flag    |
| `R-PA-HIGHMARK-016` | Behavioral health request carries level-of-care criteria (Highmark BH / ASAM) | flag     |
| `R-PA-HIGHMARK-017` | Transplant routed through the Blue Distinction Centers for Transplant         | flag     |
| `R-PA-HIGHMARK-018` | Experimental / investigational / unproven service carries peer-reviewed evidence | flag   |
| `R-PA-HIGHMARK-019` | Appeal / reconsideration references the original determination                | info     |
| `R-PA-HIGHMARK-020` | Out-of-network request documents a network-gap / continuity-of-care reason    | info     |

`R-PA-HIGHMARK-004` mirrors core `R-PA-053` and the Aetna / UHC /
Anthem / Cigna / Humana / HCSC -004 rules: it ships without a
bundled prior-authorization list and vacuously passes with a
pointer until a later wave bundles the list. With seven commercial
overlays shipped — the five largest commercial / MA plans plus the
two largest independent Blues licensees (HCSC, Highmark) — the
remaining §9 wave 52-5+ candidates are the other Blues plans by
state and per-state Medicaid overlays as user-volume data warrants.

#### 4.5.14 Commercial payer overlays — Florida Blue / GuideWell (wave 52-14)

The eighth named commercial-payer overlay, and the third "Blues
plans by state" overlay after HCSC and Highmark. **Florida Blue**
(Blue Cross and Blue Shield of Florida, a **GuideWell** company) is
the dominant Blue Cross Blue Shield licensee in **Florida** and one
of the largest independent licensees not already routed to the
Anthem/Elevance, HCSC, or Highmark buckets. Like the seven before
it, Florida Blue is keyed to its own payer bucket
(`'florida-blue'`, detected by `lib/pa/payer.js` and placed before
the generic `'commercial'` fall-through, after `'highmark'`). The
bucket matches only definitively-Florida-Blue anchors — the
`florida blue` / `guidewell` trade names and the `blue cross [and]
blue shield of florida` plan name — so generic `blue cross` /
`blue shield` and other Blues licensees stay in the commercial
fall-through, exactly as the HCSC and Highmark buckets leave them.
Florida Blue's Medicare Advantage line ("Florida Blue Medicare")
routes to the MA bucket only when it carries an explicit "Medicare
Advantage" string; a plain Florida Blue commercial packet routes
here. Each commercial rule self-gates on
`bundle.payer === 'florida-blue'` and returns a vacuous pass on
every other packet.

Scope discipline is identical to §4.5.7–§4.5.13: the rules check
the **procedural completeness** of a Florida Blue prior-authorization
packet against Florida Blue's *own published* submission
requirements — not clinical coverage criteria, which are the
reviewer's judgement and the applicable Florida Blue Medical
Policy's job. Every rule is anchored to a public Florida Blue
provider authorizations URL tracked in the staleness ledger (§8.3,
source `floridablue-precert`) and re-verified on the §4.5.6 cadence.

The set mirrors the earlier commercial families so the eight
overlays stay structurally parallel and auditable side by side;
Florida Blue-specific routing names appear where Florida Blue
actually uses them — the **Availity Essentials** portal for
submission, Florida Blue's **advanced-imaging utilization-management
program** for advanced imaging and genetic / molecular testing,
**Florida Blue pharmacy management** for pharmacy / step therapy,
**Florida Blue behavioral health** for behavioral health, and the
**Blue Distinction Centers for Transplant** for transplant. Wave
52-14 ships the full planned set of 20 (`R-PA-FLBLUE-NNN`):

| Id                | Rule                                                                          | Severity |
|-------------------|-------------------------------------------------------------------------------|----------|
| `R-PA-FLBLUE-001` | Coverage criteria (Florida Blue Medical Policy / MCG) referenced              | flag     |
| `R-PA-FLBLUE-002` | Supporting medical records / clinical documentation attached                  | flag     |
| `R-PA-FLBLUE-003` | Submission channel (Availity Essentials / provider portal) noted              | info     |
| `R-PA-FLBLUE-004` | Requested service is on Florida Blue's prior-authorization / notification list (stub) | info |
| `R-PA-FLBLUE-005` | Authorization referenced for a service that requires it before the service date | flag   |
| `R-PA-FLBLUE-006` | Inpatient request carries admission notification + concurrent-review docs     | flag     |
| `R-PA-FLBLUE-007` | Outpatient MRI / CT / PET carries the clinical indication for the imaging program | flag |
| `R-PA-FLBLUE-008` | Expedited / urgent request states the clinical urgency                        | flag     |
| `R-PA-FLBLUE-009` | Outpatient surgery / imaging addresses the hospital-outpatient site-of-care   | flag     |
| `R-PA-FLBLUE-010` | NDC documented for a physician-administered (J-code) drug request             | info     |
| `R-PA-FLBLUE-011` | Step-therapy prior-trial documentation for a drug request (Florida Blue pharmacy) | flag |
| `R-PA-FLBLUE-012` | Genetic / molecular testing carries the specific test + indication            | flag     |
| `R-PA-FLBLUE-013` | Specialty / oncology drug carries the supporting diagnosis (Medical Policy)   | flag     |
| `R-PA-FLBLUE-014` | Retrospective / retroactive request states a retro-review justification       | info     |
| `R-PA-FLBLUE-015` | DME / home-health request carries a signed, dated written order / plan of care | flag    |
| `R-PA-FLBLUE-016` | Behavioral health request carries level-of-care criteria (BH / ASAM)          | flag     |
| `R-PA-FLBLUE-017` | Transplant routed through the Blue Distinction Centers for Transplant         | flag     |
| `R-PA-FLBLUE-018` | Experimental / investigational / unproven service carries peer-reviewed evidence | flag   |
| `R-PA-FLBLUE-019` | Appeal / reconsideration references the original determination                | info     |
| `R-PA-FLBLUE-020` | Out-of-network request documents a network-gap / continuity-of-care reason    | info     |

`R-PA-FLBLUE-004` mirrors core `R-PA-053` and the Aetna / UHC /
Anthem / Cigna / Humana / HCSC / Highmark -004 rules: it ships
without a bundled prior-authorization list and vacuously passes
with a pointer until a later wave bundles the list. With eight
commercial overlays shipped — the five largest commercial / MA
plans plus the three largest independent Blues licensees (HCSC,
Highmark, Florida Blue) — the remaining §9 wave 52-5+ candidates
are the other Blues plans by state and per-state Medicaid overlays
as user-volume data warrants.

#### 4.5.15 Commercial payer overlays — BCBSM / Blue Cross Blue Shield of Michigan (wave 52-15)

The ninth named commercial-payer overlay, and the fourth "Blues
plans by state" overlay after HCSC, Highmark, and Florida Blue.
**Blue Cross Blue Shield of Michigan** (BCBSM, with its HMO
subsidiary **Blue Care Network**) is the dominant Blue Cross Blue
Shield licensee in **Michigan** and one of the largest independent
licensees not already routed to the Anthem/Elevance, HCSC,
Highmark, or Florida Blue buckets. Like the eight before it, BCBSM
is keyed to its own payer bucket (`'bcbsm'`, detected by
`lib/pa/payer.js` and placed before the generic `'commercial'`
fall-through, after `'florida-blue'`). The bucket matches only
definitively-BCBSM anchors — the `blue cross [and] blue shield of
michigan` plan name, the `bcbsm` acronym, and the `blue care
network` HMO brand — so generic `blue cross` / `blue shield` and
other Blues licensees stay in the commercial fall-through. BCBSM's
Medicare Advantage line ("Medicare Plus Blue") routes to the MA
bucket only when it carries an explicit "Medicare Advantage"
string; a plain BCBSM commercial packet routes here. Each
commercial rule self-gates on `bundle.payer === 'bcbsm'` and
returns a vacuous pass on every other packet.

Scope discipline is identical to §4.5.7–§4.5.14: the rules check
the **procedural completeness** of a BCBSM prior-authorization
packet against BCBSM's *own published* submission requirements —
not clinical coverage criteria, which are the reviewer's judgement
and the applicable BCBSM Medical Policy's job. Every rule is
anchored to a public BCBSM provider authorization-requirements URL
tracked in the staleness ledger (§8.3, source `bcbsm-precert`) and
re-verified on the §4.5.6 cadence.

The set mirrors the earlier commercial families so the nine
overlays stay structurally parallel and auditable side by side;
BCBSM-specific routing names appear where BCBSM actually uses
them — the **Availity Essentials** portal for submission, BCBSM's
**advanced-imaging utilization-management program** for advanced
imaging and genetic / molecular testing, **BCBSM pharmacy
management** for pharmacy / step therapy, **BCBSM behavioral
health** for behavioral health, and the **Blue Distinction Centers
for Transplant** for transplant. Wave 52-15 ships the full planned
set of 20 (`R-PA-BCBSM-NNN`):

| Id              | Rule                                                                          | Severity |
|-----------------|-------------------------------------------------------------------------------|----------|
| `R-PA-BCBSM-001` | Coverage criteria (BCBSM Medical Policy / MCG) referenced                     | flag     |
| `R-PA-BCBSM-002` | Supporting medical records / clinical documentation attached                  | flag     |
| `R-PA-BCBSM-003` | Submission channel (Availity Essentials / provider portal) noted              | info     |
| `R-PA-BCBSM-004` | Requested service is on BCBSM's prior-authorization / notification list (stub) | info    |
| `R-PA-BCBSM-005` | Authorization referenced for a service that requires it before the service date | flag   |
| `R-PA-BCBSM-006` | Inpatient request carries admission notification + concurrent-review docs     | flag     |
| `R-PA-BCBSM-007` | Outpatient MRI / CT / PET carries the clinical indication for the imaging program | flag |
| `R-PA-BCBSM-008` | Expedited / urgent request states the clinical urgency                        | flag     |
| `R-PA-BCBSM-009` | Outpatient surgery / imaging addresses the hospital-outpatient site-of-care   | flag     |
| `R-PA-BCBSM-010` | NDC documented for a physician-administered (J-code) drug request             | info     |
| `R-PA-BCBSM-011` | Step-therapy prior-trial documentation for a drug request (BCBSM pharmacy)    | flag     |
| `R-PA-BCBSM-012` | Genetic / molecular testing carries the specific test + indication            | flag     |
| `R-PA-BCBSM-013` | Specialty / oncology drug carries the supporting diagnosis (Medical Policy)   | flag     |
| `R-PA-BCBSM-014` | Retrospective / retroactive request states a retro-review justification       | info     |
| `R-PA-BCBSM-015` | DME / home-health request carries a signed, dated written order / plan of care | flag    |
| `R-PA-BCBSM-016` | Behavioral health request carries level-of-care criteria (BH / ASAM)          | flag     |
| `R-PA-BCBSM-017` | Transplant routed through the Blue Distinction Centers for Transplant         | flag     |
| `R-PA-BCBSM-018` | Experimental / investigational / unproven service carries peer-reviewed evidence | flag   |
| `R-PA-BCBSM-019` | Appeal / reconsideration references the original determination                | info     |
| `R-PA-BCBSM-020` | Out-of-network request documents a network-gap / continuity-of-care reason    | info     |

`R-PA-BCBSM-004` mirrors core `R-PA-053` and the Aetna / UHC /
Anthem / Cigna / Humana / HCSC / Highmark / Florida Blue -004
rules: it ships without a bundled prior-authorization list and
vacuously passes with a pointer until a later wave bundles the
list. With nine commercial overlays shipped — the five largest
commercial / MA plans plus the four largest independent Blues
licensees (HCSC, Highmark, Florida Blue, BCBSM) — the remaining §9
wave 52-5+ candidates are the other Blues plans by state and
per-state Medicaid overlays as user-volume data warrants.

#### 4.5.16 Commercial payer overlays — Blue Shield of California (wave 52-16)

The tenth named commercial-payer overlay, and the fifth "Blues
plans by state" overlay after HCSC, Highmark, Florida Blue, and
BCBSM. **Blue Shield of California** is the second-largest health
plan in **California** and one of the largest independent Blue
Cross Blue Shield licensees not already routed to the
Anthem/Elevance, HCSC, Highmark, Florida Blue, or BCBSM buckets. It
is a **distinct licensee from Anthem Blue Cross of California**
(Elevance), which the `'anthem'` bucket catches earlier. Like the
nine before it, Blue Shield of California is keyed to its own payer
bucket (`'blue-shield-ca'`, detected by `lib/pa/payer.js` and placed
before the generic `'commercial'` fall-through, after `'bcbsm'`).
The bucket matches the unambiguous plan-name anchor `blue shield of
california` (and `blue shield of ca`), so generic `blue cross` /
`blue shield` and other Blues licensees stay in the commercial
fall-through. Its Medicare Advantage line routes to the MA bucket
only when it carries an explicit "Medicare Advantage" string; a
plain commercial packet routes here. Each commercial rule
self-gates on `bundle.payer === 'blue-shield-ca'` and returns a
vacuous pass on every other packet.

Scope discipline is identical to §4.5.7–§4.5.15: the rules check
the **procedural completeness** of a Blue Shield of California
prior-authorization packet against the plan's *own published*
submission requirements — not clinical coverage criteria, which are
the reviewer's judgement and the applicable Medical Policy's job.
Every rule is anchored to a public Blue Shield of California
provider authorizations URL tracked in the staleness ledger (§8.3,
source `blueshieldca-precert`) and re-verified on the §4.5.6
cadence.

The set mirrors the earlier commercial families so the ten overlays
stay structurally parallel and auditable side by side; Blue Shield
of California-specific routing names appear where the plan actually
uses them — the **Availity / provider connection** portal for
submission, the **advanced-imaging utilization-management program**
for advanced imaging and genetic / molecular testing, the plan's
**pharmacy management** for pharmacy / step therapy, **behavioral
health** for behavioral health, and the **Blue Distinction Centers
for Transplant** for transplant. Wave 52-16 ships the full planned
set of 20 (`R-PA-BSCA-NNN`):

| Id              | Rule                                                                          | Severity |
|-----------------|-------------------------------------------------------------------------------|----------|
| `R-PA-BSCA-001` | Coverage criteria (Medical Policy / MCG) referenced                           | flag     |
| `R-PA-BSCA-002` | Supporting medical records / clinical documentation attached                  | flag     |
| `R-PA-BSCA-003` | Submission channel (Availity / provider portal) noted                         | info     |
| `R-PA-BSCA-004` | Requested service is on the prior-authorization / notification list (stub)    | info     |
| `R-PA-BSCA-005` | Authorization referenced for a service that requires it before the service date | flag   |
| `R-PA-BSCA-006` | Inpatient request carries admission notification + concurrent-review docs     | flag     |
| `R-PA-BSCA-007` | Outpatient MRI / CT / PET carries the clinical indication for the imaging program | flag |
| `R-PA-BSCA-008` | Expedited / urgent request states the clinical urgency                        | flag     |
| `R-PA-BSCA-009` | Outpatient surgery / imaging addresses the hospital-outpatient site-of-care   | flag     |
| `R-PA-BSCA-010` | NDC documented for a physician-administered (J-code) drug request             | info     |
| `R-PA-BSCA-011` | Step-therapy prior-trial documentation for a drug request (pharmacy)          | flag     |
| `R-PA-BSCA-012` | Genetic / molecular testing carries the specific test + indication            | flag     |
| `R-PA-BSCA-013` | Specialty / oncology drug carries the supporting diagnosis (Medical Policy)   | flag     |
| `R-PA-BSCA-014` | Retrospective / retroactive request states a retro-review justification       | info     |
| `R-PA-BSCA-015` | DME / home-health request carries a signed, dated written order / plan of care | flag    |
| `R-PA-BSCA-016` | Behavioral health request carries level-of-care criteria (BH / ASAM)          | flag     |
| `R-PA-BSCA-017` | Transplant routed through the Blue Distinction Centers for Transplant         | flag     |
| `R-PA-BSCA-018` | Experimental / investigational / unproven service carries peer-reviewed evidence | flag   |
| `R-PA-BSCA-019` | Appeal / reconsideration references the original determination                | info     |
| `R-PA-BSCA-020` | Out-of-network request documents a network-gap / continuity-of-care reason    | info     |

`R-PA-BSCA-004` mirrors core `R-PA-053` and the Aetna / UHC /
Anthem / Cigna / Humana / HCSC / Highmark / Florida Blue / BCBSM
-004 rules: it ships without a bundled prior-authorization list and
vacuously passes with a pointer until a later wave bundles the
list. With ten commercial overlays shipped — the five largest
commercial / MA plans plus the five largest independent Blues
licensees (HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California) — the remaining §9 wave 52-5+ candidates are the other
Blues plans by state and per-state Medicaid overlays as user-volume
data warrants.

#### 4.5.17 Commercial payer overlays — Independence Blue Cross (wave 52-17)

The eleventh named commercial-payer overlay, and the sixth "Blues
plans by state" overlay after HCSC, Highmark, Florida Blue, BCBSM,
and Blue Shield of California. **Independence Blue Cross** (IBX) is
the dominant Blue Cross Blue Shield licensee in **southeastern
Pennsylvania** (the five-county Philadelphia region) and one of the
largest independent licensees not already routed to the
Anthem/Elevance, HCSC, Highmark, Florida Blue, BCBSM, or Blue Shield
of California buckets. It is a **distinct licensee from Highmark**,
which operates western / central Pennsylvania — the `'highmark'`
bucket catches that brand earlier, and IBX is matched only by its
own `independence blue cross` / `ibx` anchors. Like the ten before
it, IBX is keyed to its own payer bucket (`'ibx'`, detected by
`lib/pa/payer.js` and placed before the generic `'commercial'`
fall-through, after `'blue-shield-ca'`). Generic `blue cross` /
`blue shield` and other Blues licensees stay in the commercial
fall-through; an explicit "Medicare Advantage" string still wins the
MA bucket earlier. Each commercial rule self-gates on
`bundle.payer === 'ibx'` and returns a vacuous pass on every other
packet.

Scope discipline is identical to §4.5.7–§4.5.16: the rules check the
**procedural completeness** of an IBX prior-authorization packet
against the plan's *own published* submission requirements — not
clinical coverage criteria, which are the reviewer's judgement and
the applicable Medical Policy's job. Every rule is anchored to a
public Independence Blue Cross provider authorizations URL tracked
in the staleness ledger (§8.3, source `ibx-precert`) and re-verified
on the §4.5.6 cadence.

The set mirrors the earlier commercial families so the eleven
overlays stay structurally parallel and auditable side by side;
IBX-specific routing names appear where the plan actually uses them
— the **Availity / PEAR provider portal** for submission, the
**advanced-imaging utilization-management program** for advanced
imaging and genetic / molecular testing, the plan's **pharmacy
management** for pharmacy / step therapy, **behavioral health** for
behavioral health, and the **Blue Distinction Centers for
Transplant** for transplant. Wave 52-17 ships the full planned set
of 20 (`R-PA-IBX-NNN`):

| Id            | Rule                                                                          | Severity |
|---------------|-------------------------------------------------------------------------------|----------|
| `R-PA-IBX-001` | Coverage criteria (Medical Policy / MCG) referenced                          | flag     |
| `R-PA-IBX-002` | Supporting medical records / clinical documentation attached                 | flag     |
| `R-PA-IBX-003` | Submission channel (Availity / PEAR provider portal) noted                   | info     |
| `R-PA-IBX-004` | Requested service is on the prior-authorization / notification list (stub)   | info     |
| `R-PA-IBX-005` | Authorization referenced for a service that requires it before the service date | flag  |
| `R-PA-IBX-006` | Inpatient request carries admission notification + concurrent-review docs    | flag     |
| `R-PA-IBX-007` | Outpatient MRI / CT / PET carries the clinical indication for the imaging program | flag |
| `R-PA-IBX-008` | Expedited / urgent request states the clinical urgency                       | flag     |
| `R-PA-IBX-009` | Outpatient surgery / imaging addresses the hospital-outpatient site-of-care  | flag     |
| `R-PA-IBX-010` | NDC documented for a physician-administered (J-code) drug request            | info     |
| `R-PA-IBX-011` | Step-therapy prior-trial documentation for a drug request (pharmacy)         | flag     |
| `R-PA-IBX-012` | Genetic / molecular testing carries the specific test + indication           | flag     |
| `R-PA-IBX-013` | Specialty / oncology drug carries the supporting diagnosis (Medical Policy)  | flag     |
| `R-PA-IBX-014` | Retrospective / retroactive request states a retro-review justification      | info     |
| `R-PA-IBX-015` | DME / home-health request carries a signed, dated written order / plan of care | flag   |
| `R-PA-IBX-016` | Behavioral health request carries level-of-care criteria (BH / ASAM)         | flag     |
| `R-PA-IBX-017` | Transplant routed through the Blue Distinction Centers for Transplant        | flag     |
| `R-PA-IBX-018` | Experimental / investigational / unproven service carries peer-reviewed evidence | flag  |
| `R-PA-IBX-019` | Appeal / reconsideration references the original determination               | info     |
| `R-PA-IBX-020` | Out-of-network request documents a network-gap / continuity-of-care reason   | info     |

`R-PA-IBX-004` mirrors core `R-PA-053` and the Aetna / UHC / Anthem /
Cigna / Humana / HCSC / Highmark / Florida Blue / BCBSM / Blue Shield
of California -004 rules: it ships without a bundled
prior-authorization list and vacuously passes with a pointer until a
later wave bundles the list. With eleven commercial overlays shipped
— the five largest commercial / MA plans plus the six largest
independent Blues licensees (HCSC, Highmark, Florida Blue, BCBSM,
Blue Shield of California, Independence Blue Cross) — CareFirst
BlueCross BlueShield opened in wave 52-18 (§4.5.18) as the twelfth.

#### 4.5.18 Commercial payer overlays — CareFirst BlueCross BlueShield (wave 52-18)

The twelfth named commercial-payer overlay, and the seventh "Blues
plans by state" overlay after HCSC, Highmark, Florida Blue, BCBSM,
Blue Shield of California, and Independence Blue Cross. **CareFirst
BlueCross BlueShield** is the dominant Blue Cross Blue Shield licensee
in the **mid-Atlantic** — Maryland, the District of Columbia, and
Northern Virginia — and one of the largest independent licensees not
already routed to the Anthem/Elevance, HCSC, Highmark, Florida Blue,
BCBSM, Blue Shield of California, or IBX buckets. Like the eleven
before it, CareFirst is keyed to its own payer bucket (`'carefirst'`,
detected by `lib/pa/payer.js` and placed before the generic
`'commercial'` fall-through, after `'ibx'`). The bucket matches the
unambiguous `carefirst` trade-name anchor; generic `blue cross` /
`blue shield` and other Blues licensees stay in the commercial
fall-through, and an explicit "Medicare Advantage" string still wins
the MA bucket earlier. Each commercial rule self-gates on
`bundle.payer === 'carefirst'` and returns a vacuous pass on every
other packet.

Scope discipline is identical to §4.5.7–§4.5.17: the rules check the
**procedural completeness** of a CareFirst prior-authorization packet
against the plan's *own published* submission requirements — not
clinical coverage criteria, which are the reviewer's judgement and the
applicable Medical Policy's job. Every rule is anchored to a public
CareFirst provider preauthorization URL tracked in the staleness
ledger (§8.3, source `carefirst-precert`) and re-verified on the
§4.5.6 cadence.

The set mirrors the earlier commercial families so the twelve overlays
stay structurally parallel and auditable side by side; CareFirst-specific
routing names appear where the plan actually uses them — **CareFirst
Direct / iEXchange** for submission, the **advanced-imaging
utilization-management program** for advanced imaging and genetic /
molecular testing, the plan's **pharmacy management** for pharmacy /
step therapy, **behavioral health** for behavioral health, and the
**Blue Distinction Centers for Transplant** for transplant. Wave 52-18
ships the full planned set of 20 (`R-PA-CAREFIRST-NNN`), structurally
parallel to the IBX set (§4.5.17): coverage-criteria / clinical-records
/ submission-channel / prior-auth-list (001–004), authorization-before-
service / inpatient concurrent review / advanced imaging / expedited /
site-of-care (005–009), NDC / step therapy / genetic testing /
specialty-drug diagnosis (010–013), and retro / DME / behavioral health
/ transplant / experimental / appeal / out-of-network (014–020).

`R-PA-CAREFIRST-004` mirrors core `R-PA-053` and the Aetna / UHC /
Anthem / Cigna / Humana / HCSC / Highmark / Florida Blue / BCBSM / Blue
Shield of California / Independence Blue Cross -004 rules: it ships
without a bundled prior-authorization list and vacuously passes with a
pointer until a later wave bundles the list. With twelve commercial
overlays shipped — the five largest commercial / MA plans plus the
seven largest independent Blues licensees (HCSC, Highmark, Florida
Blue, BCBSM, Blue Shield of California, Independence Blue Cross,
CareFirst) — Blue Cross Blue Shield of North Carolina opened in wave
52-19 (§4.5.19) as the thirteenth.

#### 4.5.19 Commercial payer overlays — Blue Cross Blue Shield of North Carolina (wave 52-19)

The thirteenth named commercial-payer overlay, and the eighth "Blues
plans by state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue
Shield of California, Independence Blue Cross, and CareFirst. **Blue
Cross Blue Shield of North Carolina** (Blue Cross NC) is the dominant
Blue Cross Blue Shield licensee in **North Carolina** and one of the
largest independent licensees not already routed to the Anthem/Elevance,
HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of California, IBX, or
CareFirst buckets. Like the twelve before it, Blue Cross NC is keyed to
its own payer bucket (`'bcbsnc'`, detected by `lib/pa/payer.js` and
placed before the generic `'commercial'` fall-through, after
`'carefirst'`). The bucket matches only definitively-North-Carolina
anchors — the plan name, the `blue cross nc` short form, and the
`bcbsnc` acronym — so generic `blue cross` / `blue shield` and other
Blues licensees stay in the commercial fall-through, and an explicit
"Medicare Advantage" string still wins the MA bucket earlier. Each
commercial rule self-gates on `bundle.payer === 'bcbsnc'` and returns a
vacuous pass on every other packet.

Scope discipline is identical to §4.5.7–§4.5.18: the rules check the
**procedural completeness** of a Blue Cross NC prior-authorization
packet against the plan's *own published* submission requirements — not
clinical coverage criteria, which are the reviewer's judgement and the
applicable Medical Policy's job. Every rule is anchored to a public Blue
Cross NC provider prior-authorization URL tracked in the staleness
ledger (§8.3, source `bcbsnc-precert`) and re-verified on the §4.5.6
cadence.

The set mirrors the earlier commercial families so the thirteen overlays
stay structurally parallel and auditable side by side; Blue-Cross-NC-specific
routing names appear where the plan actually uses them — the **Blue e
provider portal / Availity** for submission, the **advanced-imaging
utilization-management program** for advanced imaging and genetic /
molecular testing, the plan's **pharmacy management** for pharmacy /
step therapy, **behavioral health** for behavioral health, and the
**Blue Distinction Centers for Transplant** for transplant. Wave 52-19
ships the full planned set of 20 (`R-PA-BCBSNC-NNN`), structurally
parallel to the CareFirst set (§4.5.18).

`R-PA-BCBSNC-004` mirrors core `R-PA-053` and the Aetna / UHC / Anthem /
Cigna / Humana / HCSC / Highmark / Florida Blue / BCBSM / Blue Shield of
California / Independence Blue Cross / CareFirst -004 rules: it ships
without a bundled prior-authorization list and vacuously passes with a
pointer until a later wave bundles the list. With thirteen commercial
overlays shipped — the five largest commercial / MA plans plus the eight
largest independent Blues licensees (HCSC, Highmark, Florida Blue,
BCBSM, Blue Shield of California, Independence Blue Cross, CareFirst,
Blue Cross NC) — Horizon Blue Cross Blue Shield of New Jersey opened in
wave 52-20 (§4.5.20) as the fourteenth.

#### 4.5.20 Commercial payer overlays — Horizon Blue Cross Blue Shield of New Jersey (wave 52-20)

The fourteenth named commercial-payer overlay, and the ninth "Blues
plans by state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue
Shield of California, Independence Blue Cross, CareFirst, and Blue Cross
NC. **Horizon Blue Cross Blue Shield of New Jersey** is the dominant
Blue Cross Blue Shield licensee in **New Jersey** and one of the largest
independent licensees not already routed to the Anthem/Elevance, HCSC,
Highmark, Florida Blue, BCBSM, Blue Shield of California, IBX, CareFirst,
or Blue Cross NC buckets. Like the thirteen before it, Horizon is keyed
to its own payer bucket (`'horizon'`, detected by `lib/pa/payer.js` and
placed before the generic `'commercial'` fall-through, after `'bcbsnc'`).
The bucket matches only definitively-Horizon anchors — `horizon blue
cross`, `horizon bcbs`, and `horizon healthcare services` — never the
bare common word `horizon`, so generic `blue cross` / `blue shield` and
other Blues licensees stay in the commercial fall-through, and an
explicit "Medicare Advantage" string still wins the MA bucket earlier.
Each commercial rule self-gates on `bundle.payer === 'horizon'` and
returns a vacuous pass on every other packet.

Scope discipline is identical to §4.5.7–§4.5.19: the rules check the
**procedural completeness** of a Horizon prior-authorization packet
against the plan's *own published* submission requirements — not
clinical coverage criteria, which are the reviewer's judgement and the
applicable Medical Policy's job. Every rule is anchored to a public
Horizon provider prior-authorization URL tracked in the staleness ledger
(§8.3, source `horizon-precert`) and re-verified on the §4.5.6 cadence.

The set mirrors the earlier commercial families so the fourteen overlays
stay structurally parallel and auditable side by side; Horizon-specific
routing names appear where the plan actually uses them — the **NaviNet
provider portal / Availity** for submission, the **advanced-imaging
utilization-management program** for advanced imaging and genetic /
molecular testing, the plan's **pharmacy management** for pharmacy /
step therapy, **behavioral health** for behavioral health, and the
**Blue Distinction Centers for Transplant** for transplant. Wave 52-20
ships the full planned set of 20 (`R-PA-HORIZON-NNN`), structurally
parallel to the Blue Cross NC set (§4.5.19).

`R-PA-HORIZON-004` mirrors core `R-PA-053` and the Aetna / UHC / Anthem /
Cigna / Humana / HCSC / Highmark / Florida Blue / BCBSM / Blue Shield of
California / Independence Blue Cross / CareFirst / Blue Cross NC -004
rules: it ships without a bundled prior-authorization list and vacuously
passes with a pointer until a later wave bundles the list. With fourteen
commercial overlays shipped — the five largest commercial / MA plans
plus the nine largest independent Blues licensees (HCSC, Highmark,
Florida Blue, BCBSM, Blue Shield of California, Independence Blue Cross,
CareFirst, Blue Cross NC, Horizon) — the remaining §9 wave 52-5+
candidates are the other Blues plans by state and per-state Medicaid
overlays as user-volume data warrants.

### 4.6 The DOCX report

Structure (mirrors Vaulytica v3 with healthcare-specific
sections):

1. **Cover page** — packet name, packet hash, generated date,
   dataset version, Sophie ruleset id, the disclaimer ("Sophie
   PA is a deterministic checklist. It is not medical or legal
   advice. It does not see your data. It does not submit
   anything.").
2. **Executive summary** — counts per severity, list of
   `block` findings.
3. **Findings** — one section per finding with: rule id,
   severity, plain-English text, the evidence excerpt (with
   document name and page/paragraph pointer), the citation
   (rule's source URL, accessed date, hash), and the
   suggested remediation in plain English.
4. **Evidence ledger** — every value the extract step pulled
   from the packet: codes, dates, NPIs, signatures, with a
   "found in" pointer.
5. **Extracted-data appendix** — the full structured JSON the
   extractor produced, for users who want to feed it
   downstream (e.g., into a coding QA workflow).
6. **Audit trail** — the complete list of rules that ran
   (passed / failed / n/a / disabled-for-staleness), the
   dataset version, the file hashes, and the deterministic
   computation timestamp.

The report is generated entirely client-side with `docx.js`
(vendored, ~600 KB minified, MIT). No server. The user clicks
**Download report (.docx)** and the browser writes the file
via `URL.createObjectURL()`.

### 4.7 PHI handling

- All extraction is client-side. PHI never leaves the tab.
- The default report has PHI **masked** (`[REDACTED]`) in
  every visible field. A "Show PHI in report" checkbox enables
  unredacted output for the user's own workflow.
- The page sets `Cache-Control: no-store` via the existing
  `_headers` file on the response, so the parsed packet is not
  cached on disk by the browser.
- The page has no Service-Worker side cache of user data; the
  SW caches the application shell only.
- The page sets `Clear-Site-Data` is **not** used (it would
  break the offline shell). Instead, "Start over" resets the
  in-memory state explicitly and instructs the user to close
  the tab if they want guaranteed memory release.

### 4.8 Accessibility

- The dropzone is keyboard-accessible: `tabindex="0"`, accepts
  `Enter` / `Space` to trigger the file picker.
- The dropzone has `role="button"` and an `aria-label`
  describing the action.
- All findings are rendered as a real `<ul>` with one
  `<li role="article">` per finding, severity carried in
  `data-severity` and in a leading visually-hidden text label
  for screen readers ("Block: …", "Flag: …").
- The download buttons are real `<button>` elements with
  descriptive labels.
- Color is not the only severity signal (the leading text
  label and an icon SVG both carry the severity).
- The page has a complete heading outline (`h1` page title,
  `h2` per section, `h3` per finding).

### 4.9 Performance budget

- First-time PA-tile-page load: ≤ 250 KB JS gzipped over the
  current Sophie baseline (the PA tile's own code + the
  vendored pdf.js / mammoth / docx.js loaded lazily on first
  drop).
- Heavy parsers (pdf.js, mammoth, docx.js) are **lazy-loaded**
  on first drop, not on page load. The page idle weight is
  the existing Sophie idle weight + ≤ 25 KB for the dropzone
  shell.
- Worst-case packet (200 MB total, 12 documents, all text-PDF):
  ingest + analyze + report in ≤ 15 seconds on a mid-tier
  laptop (Intel i5 8th-gen baseline). The progress bar
  reflects the worker pipeline; the main thread stays
  responsive.

### 4.10 Determinism guarantees

- Same input bytes → same output bytes (byte-for-byte for the
  JSON export; structurally identical for the DOCX, modulo
  the embedded generation timestamp which is intentionally
  zeroed in a future "reproducible build" toggle).
- Same ruleset version → same rule firing decisions.
- Same dataset version → same citations and same source-URL
  hashes.
- No randomness, no `Date.now()` in compute paths (timestamp
  appears in the audit trail only and is captured once at the
  start of analysis).
- No floating-point comparisons against thresholds without an
  explicit epsilon; all date math goes through a single
  `lib/pa/date.js` module that uses UTC-midnight arithmetic.
- Existing [spec-v11](spec-v11.md) audit harness and
  [spec-v12](spec-v12.md) integrity-manifest discipline are
  extended to the PA bundle: `scripts/audit-pa.mjs` runs the
  PA pipeline against `data/pa-lint/fixtures/*.json` and
  compares the produced JSON report to the committed expected
  output. CI fails on any drift.

---

## 5. Implementation surfaces

### 5.1 New files

```
data/pa-lint/
  rules/
    v1/
      core.json
      cms-ffs.json
      cms-ma.json
      medicaid-core.json
      specialty-rad.json
      specialty-inf.json
      specialty-surg.json
      specialty-bh.json
      specialty-gen.json
      _ruleset-manifest.json    # ids, versions, hashes
  references/
    cpt-hcpcs-current.json      # codes valid for current year
    icd10-cm-current.json
    pos-codes.json              # CMS POS code list
    modifiers.json              # modifier descriptors
    cci-pairs.json              # NCCI edit pairs (subset, see §5.3)
    npi-luhn.js                 # checksum helper, not data
  fixtures/
    happy-path.json             # synthetic packet, all rules pass
    missing-npi.json            # synthetic packet, R-PA-016 fires
    expired-labs.json
    bad-pos.json
    resubmission.json
    edge-case-large.json
  expected/
    happy-path.report.json
    missing-npi.report.json
    ... (one per fixture)

lib/pa/
  ingest.js
  ingest.worker.js              # PDF/DOCX parsing in a worker
  normalize.js
  classify.js
  extract.js
  payer.js
  engine.js
  rules.js                      # rule registration + dispatch
  date.js
  redact.js
  report.js
  report.worker.js              # DOCX generation in a worker
  index.js                      # public entry imported by the tile

views/
  pa-lint.js                    # the tile's view module

vendored/
  pdfjs/                        # pdf.js dist subset, MIT
  mammoth/                      # mammoth.js, MIT
  docxjs/                       # docx.js, MIT

scripts/
  refresh-pa-rules.mjs          # maintainer-only, re-fetches sources
  audit-pa.mjs                  # CI: fixtures → expected outputs
  build-pa-bundle.mjs           # concatenates rules into the shipped JSON

tools/pa-lint/
  index.html                    # the /tools/pa-lint/ route page

test/
  unit/pa-ingest.test.js
  unit/pa-classify.test.js
  unit/pa-extract.test.js
  unit/pa-engine.test.js
  unit/pa-date.test.js
  unit/pa-redact.test.js
  unit/pa-report.test.js
  integration/pa-end-to-end.spec.js
  integration/pa-no-network.spec.js
  integration/pa-a11y.spec.js
  integration/pa-perf.spec.js
```

### 5.2 Vendored dependencies (additive, all MIT)

| Package          | Purpose                | Size (gzipped) | License | Source URL pinned in `lib/pa/_vendored.md` |
|------------------|------------------------|----------------|---------|--------------------------------------------|
| `pdf.js` (subset)| PDF text extraction    | ~310 KB        | Apache  | mozilla/pdf.js                             |
| `mammoth.js`     | DOCX → text            | ~75 KB         | BSD-2   | mwilliamson/mammoth.js                     |
| `docx.js`        | DOCX generation        | ~140 KB        | MIT     | dolanmiu/docx                              |

All three are vendored under `vendored/` with a pinned
upstream commit hash and a `_vendored.md` file recording the
provenance, license text, and upgrade procedure. **No npm
install at build time, no runtime fetch.** This mirrors
Sophie's existing dependency-budget posture
([spec-v10](spec-v10.md) §6).

Note: `pdf.js` is Apache-2.0, not MIT. The site is MIT
overall; Apache-2.0 vendored components are compatible.
`vendored/pdfjs/LICENSE` and `vendored/pdfjs/NOTICE` are
checked in alongside the code. The /commitments page is
updated to read "MIT, with Apache-2.0 and BSD-2 vendored
components for PDF and DOCX parsing — see
[/vendored/](https://sophiewell.com/vendored/) for the full
provenance ledger."

### 5.3 Code reference tables — what ships in v52 vs. later

- **CPT / HCPCS:** v52 ships the **current calendar year's**
  AMA-published code list as a bundled JSON. AMA's CPT
  descriptive long codes are copyrighted; Sophie ships only
  the **code → short-descriptor** mapping required for
  mechanical validity (the CPT existence + the descriptor
  match rule `R-PA-051`). Long descriptors are NOT shipped.
  The rule cites the AMA publication and the user's local CPT
  license. If AMA enforcement makes even short-descriptor
  shipping infeasible, the descriptor-match rule degrades to
  `info: descriptor check skipped (CPT license required)`.
- **ICD-10-CM:** public domain. Full code set ships, sourced
  from CMS / CDC ICD-10-CM annual files.
- **POS codes:** public, from CMS POS list. Shipped in full.
- **Modifiers:** the standard modifier list is public; the
  descriptors are AMA-copyrighted for CPT modifiers. Same
  posture as CPT: codes ship, descriptors are summarized in
  Sophie's own plain-English language.
- **NCCI edit pairs:** CMS publishes quarterly. v52 ships a
  subset focused on the highest-volume pairs (~5,000 of the
  full ~1.5M PTP edits) to keep the bundle under 2 MB
  gzipped. Out-of-bundle pairs return an `info: NCCI pair
  not in Sophie's loaded subset` finding rather than a
  silent pass. v52-2+ expands the bundle if user feedback
  warrants the size increase.
- **NPI registry:** Sophie does **not** ship the full NPPES
  registry (~10 GB). NPI validation is **Luhn-mod-10 check
  digit only**, not registry membership. A finding
  `R-PA-016` says "NPI passes checksum; registry membership
  not verified (Sophie does not load the NPPES dump)."

### 5.4 Web Worker boundary

`ingest.worker.js` does:
- File reading via `FileReader.readAsArrayBuffer`
- PDF parse via pdf.js
- DOCX parse via mammoth
- Returns a typed `{path, mime, sha256, text, pages, tables}`
  bundle to the main thread.

`report.worker.js` does:
- DOCX assembly via docx.js
- Returns a Blob to the main thread for download.

The main thread runs the rule engine itself (it's CPU-light;
the heavy work is parsing). This keeps the worker contract
small and the rule engine debuggable in DevTools without
worker postMessage indirection.

### 5.5 Existing modules touched

- `app.js` — register the new tile, register the new shape
  branch, route `/tools/pa-lint/`.
- `lib/search.js` — add the PA tile to the search index with
  appropriate synonyms ("PA", "prior auth", "prior
  authorization", "preauth", "preauthorization", "packet
  check", "PA checklist").
- `lib/data.js` — register the new catalog group
  `Revenue cycle & utilization` and the new audience
  `case-managers`.
- `data/synonyms.json` — add the PA synonyms above.
- `data/tool-copy/pa-lint.json` — the per-tile copy (title,
  subtitle, body, citation, disclaimer, About the rules
  block).
- `scripts/build-ld.mjs` — include `pa-lint` in the
  `WebApplication.featureList` (count moves to 255).
- `scripts/build-sitemap.mjs` — add `/tools/pa-lint/` to the
  sitemap (priority 0.7, monthly).
- `scripts/check-catalog-truth.mjs` — bump expected count
  254 → 255; add a new shape-aware assertion that exactly one
  tile has `shape: "document-linter"` at v52 close.
- `index.html` — homepage change in §6.
- `styles.css` — minimal new rules for the dropzone, payer
  selector, findings list, and severity badges. Reuses
  existing color tokens and spacing scale.

---

## 6. Homepage change: dropdown replaces quick picks

### 6.1 What changes

The ten `<button class="quick-pick">` tiles introduced in
[spec-v51](spec-v51.md) §4 are **removed**. They are replaced
by a single labeled `<select>` element that lists **every
tile in the catalog** in alphabetical order by visible title.
Selecting an option routes immediately to that tile (no
"Go" button; the `change` event fires the navigation, same
pattern the hero search uses on Enter).

The hero search bar (`#hero-search`) and its synonym-hint
breadcrumb (`#hero-synonym-hint`) are **unchanged**.

### 6.2 New homepage markup (inside `#home-view`)

```html
<div class="task-hero" role="search">
  <label for="hero-search" class="hero-label">Search 255 tools</label>
  <input
    id="hero-search"
    type="search"
    autocomplete="off"
    spellcheck="false"
    placeholder="wells PE, CHA2DS2-VASc, ICD-10, prior auth packet…"
    aria-describedby="hero-synonym-hint"
  />
</div>

<p id="hero-synonym-hint" class="hero-synonym-hint" hidden></p>

<section class="tool-picker" aria-labelledby="tool-picker-heading">
  <h2 id="tool-picker-heading" class="visually-hidden">Browse all tools</h2>
  <label for="tool-picker-select" class="tool-picker-label">
    Or pick from the full list:
  </label>
  <select id="tool-picker-select" class="tool-picker-select">
    <option value="" selected disabled>Choose a tool…</option>
    <!-- Populated at build time by scripts/build-tool-picker.mjs
         from UTILITIES, in alphabetical title order. One <option>
         per tile, value=data-tool id, label=visible title. -->
  </select>
</section>
```

### 6.3 Why a native `<select>` and not a custom combobox

- **Zero JS to render** — the `<option>` list is server-built
  at deploy time; no client-side template.
- **Free accessibility** — native `<select>` works with every
  screen reader, every assistive tech, every operating
  system, every keyboard shortcut convention. A custom
  combobox is a multi-week ARIA tar pit.
- **Mobile-friendly by default** — iOS and Android render
  `<select>` as a native picker wheel / list, which is the
  right interaction on a phone at the bedside.
- **No autocomplete duplication** — the search bar already
  has autocomplete via the synonym table. The dropdown is for
  users who want to **browse**, not search.
- **Consistent with Sophie's anti-dependency posture** — the
  alternative (a combobox lib) would add 10–40 KB for no
  user-visible benefit.

### 6.4 What is NOT added

- No autocomplete on the `<select>` (it's the browser's
  default behavior; typing the first few characters of an
  option title jumps to it — that's the OS providing it for
  free).
- No grouping by audience / category in the dropdown. The
  list is flat alphabetical because the alternative
  (`<optgroup>` per audience) creates duplication (tiles
  belong to multiple audiences) and noise. The audience
  hubs at `/for/<slug>/` already provide the grouped view.
- No "recently used" memory. Sophie has no client storage of
  use history ([spec-v50](spec-v50.md) §3.4 — no cookies, no
  persistent state).
- No analytics on selection. Same posture.

### 6.5 Removed surfaces

- `<section class="quick-picks">` and all ten
  `<button class="quick-pick">` children.
- `<h2 id="quick-picks-heading">`.
- The corresponding CSS rules (`.quick-picks`,
  `.quick-picks-grid`, `.quick-pick`, `.qp-title`,
  `.qp-desc`) are deleted in wave 52-2 (a dead-CSS sweep
  analogous to [spec-v51](spec-v51.md) §9).
- `app.js` click handler for `.quick-pick` is removed.

### 6.6 Updated homepage contract

[spec-v51](spec-v51.md) §3 enumerated the permitted homepage
blocks. v52 supersedes that list. The new permitted blocks,
in order, are:

1. `<h1 class="home-h1">`
2. `<p class="home-lede">`
3. `<section id="home-view">` containing:
   a. `<h2 id="tools-heading" class="visually-hidden">`
   b. `<div class="task-hero">` (search input + label)
   c. `<p id="hero-synonym-hint" hidden>`
   d. `<section class="tool-picker">` (label + select)

The prohibitions from [spec-v51](spec-v51.md) §3 carry
forward unchanged. The `.quick-picks` selector is added to
the prohibition list.

### 6.7 SEO impact

- The `<select>` is server-rendered HTML with every tile
  title as visible text inside an `<option>`. Crawlers see
  all 255 titles on the homepage — **more** SEO surface than
  v51's ten quick-pick titles. The `WebApplication`
  `featureList` JSON-LD remains the canonical structured
  signal.
- The `home-lede` count moves from `254` to `255`.
- The hero label moves from `Search 254 tools` to
  `Search 255 tools`.
- `check-catalog-truth.mjs` is updated to verify all four
  surfaces (lede, hero label, JSON-LD, sitemap) agree on
  255.

### 6.8 Alternative considered: put the dropzone on the homepage

The maintainer's framing was "if we add the same drag and
drop or select file/folder button/interface as vaulytica,
that would suit sophiewell.com wouldn't it?" — a question,
not an assertion that the dropzone goes on the homepage.
This spec puts the dropzone on the **PA tile's own page**
(`/tools/pa-lint/`) for three reasons:

1. **One tile per page** is the existing pattern for all 254
   tiles. Putting the PA dropzone on `/` would break that
   pattern for one feature and make every future
   document-shape tile (if any) need its own place-on-home
   decision.
2. **The homepage is meant to be near-empty** ([spec-v51](spec-v51.md)
   §1). Adding a multi-MB lazy-loaded dropzone subsystem to
   `/` contradicts that posture.
3. **Discoverability is fine** — the PA tile is reachable
   from the hero search ("prior auth", "PA", "preauth", etc.
   all match it via `data/synonyms.json`), from the new
   dropdown, and from `/for/billers/` and `/for/coders/`
   audience hubs.

If user feedback shows the PA tile is being missed, a single
homepage card linking to `/tools/pa-lint/` MAY be added in
v53. The default is the tile-on-its-own-page pattern.

---

## 7. Posture invariants (all eight commitments preserved)

[spec-v50](spec-v50.md) §3 enumerates Sophie's eight machine-
enforced commitments. v52 satisfies each:

| #   | Commitment                          | v52 status                                                                                                              |
|-----|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| 3.1 | No outbound network calls           | The PA pipeline issues zero `fetch` / `XHR` / `WebSocket`. `pa-no-network.spec.js` asserts this against a real packet.  |
| 3.2 | No login / no account               | The PA tile has no auth, no session, no identifier. Same as every other tile.                                           |
| 3.3 | No third-party fetch                | All parsers vendored under `/vendored/`. CSP `script-src 'self'` unchanged. `connect-src 'self'` unchanged.             |
| 3.4 | No cookies / no client storage      | The PA tile writes nothing to cookies, localStorage, sessionStorage, IndexedDB, or the Cache API beyond the SW shell.   |
| 3.5 | No telemetry                        | No counters, no error reporting, no usage pings. Findings live only in the tab.                                         |
| 3.6 | No AI of any kind                   | The classifier and extractor are deterministic (regex + lookup + structural). No model weights, no remote inference.   |
| 3.7 | No paid tier                        | The full ruleset ships in the public bundle. There is no "Pro" overlay, no payer pack behind a paywall.                 |
| 3.8 | MIT-licensed forever                | New code is MIT. Vendored parsers carry their own licenses (Apache-2.0, BSD-2, MIT) under `/vendored/` per §5.2.        |

The /commitments page is regenerated by
`scripts/build-commitments-page.mjs` with the vendored-license
addendum from §5.2.

---

## 8. Tests, checks, and CI

### 8.1 New tests

- `test/unit/pa-date.test.js` — UTC-midnight arithmetic, no
  TZ drift, leap-year handling.
- `test/unit/pa-redact.test.js` — PHI redaction is exhaustive
  (names, DOB, MRN, SSN, address, phone, email).
- `test/unit/pa-classify.test.js` — fixture packets classify
  to the expected document roles.
- `test/unit/pa-extract.test.js` — extracted bundle matches
  expected JSON for each fixture.
- `test/unit/pa-engine.test.js` — each rule fires (and only
  fires) on the fixture designed to trip it.
- `test/unit/pa-report.test.js` — report JSON matches
  expected; DOCX assembles without throwing.
- `test/unit/pa-ingest.test.js` — pdf.js / mammoth parsers
  produce the expected text for the fixture PDFs and DOCXs.
- `test/integration/pa-end-to-end.spec.js` — Playwright:
  navigate to `/tools/pa-lint/`, drop the happy-path fixture
  via `setInputFiles`, assert the findings panel renders with
  the expected counts, click each download button and verify
  the file is produced.
- `test/integration/pa-no-network.spec.js` — extends the
  existing no-network harness to fire the PA pipeline
  against a fixture and assert zero non-origin requests.
- `test/integration/pa-a11y.spec.js` — axe-core run against
  `/tools/pa-lint/` in IDLE, ACCEPTING, ANALYZING, and
  REPORTING states; zero serious / critical issues.
- `test/integration/pa-perf.spec.js` — large-packet fixture
  completes within the §4.9 budget.

### 8.2 Updated checks

- `scripts/check-catalog-truth.mjs` — expected catalog count
  254 → 255. New invariant: exactly one tile has
  `shape: "document-linter"` at v52 close. The hero-label
  surface, the home-lede surface, the JSON-LD featureList
  count, and the sitemap URL count all agree on 255.
- `scripts/build-ld.mjs` — featureList includes `pa-lint`.
- `scripts/build-sitemap.mjs` — `/tools/pa-lint/` added.
- `scripts/build-commitments-page.mjs` — adds the vendored-
  license addendum.
- `scripts/audit-pa.mjs` — new; runs the pipeline against
  every fixture and diffs the output against the committed
  expected file. CI fails on any drift.
- `scripts/refresh-pa-rules.mjs` — new; not in CI's required
  path (it requires outbound network access to source URLs);
  documented in `docs/pa-maintenance.md` and run by the
  maintainer monthly.

### 8.3 Dataset-staleness CI

`dkb-staleness-ack.yml` (the existing staleness ledger from
Vaulytica-style discipline; if not yet present in Sophie,
v52 introduces it analogous to Vaulytica's file) lists each
PA-rule source URL and the date last verified. CI fails (or
warns, depending on the configured grace window) when a
source has gone > 90 days unverified. This forces the
maintainer to either re-verify or explicitly acknowledge
staleness; users see the staleness state in the report's
audit trail.

### 8.4 Property tests

A small property-test suite (no new framework — uses the
existing test runner with hand-rolled generators) verifies:

- Reordering the input file list does not change the report
  JSON.
- Adding an irrelevant extra file (e.g., a coupon PDF) does
  not change which rules fire on the relevant documents.
- The same packet processed twice produces byte-identical
  JSON.
- The redact path is idempotent: redacting an already-
  redacted bundle changes nothing.

---

## 9. Wave plan

v52 is large enough to ship in waves. Each wave is a
self-contained PR; the catalog count rises only at wave 52-1.

### Wave 52-1 — Tile shell, homepage change, core ruleset (2026-06)

- The homepage change (§6) — dropdown replaces quick picks.
- The `pa-lint` tile registered with `shape: "document-linter"`.
- The `/tools/pa-lint/` route with the dropzone UI, the
  ingest worker, the classifier, the extractor, and the
  core 60-rule ruleset (§4.5.1).
- The DOCX report (§4.6) with the cover page, executive
  summary, findings, evidence ledger, extracted-data
  appendix, and audit trail.
- Vendored pdf.js / mammoth / docx.js.
- All §8 tests passing.
- /commitments page updated for the vendored licenses.

### Wave 52-2 — CMS FFS + CMS MA + Medicaid core overlays (2026-07)

- The 25 CMS FFS rules (§4.5.2).
- The 15 CMS MA rules (§4.5.3).
- The 10 Medicaid state-agnostic rules (§4.5.4).
- Payer detection for "Medicare", "Medicare Advantage", and
  Medicaid plans by letterhead and member-ID pattern.
- Dead-CSS sweep for the removed `.quick-picks` rules.

### Wave 52-3 — Specialty overlays (2026-08)

- The 25 specialty rules (§4.5.5) split across
  imaging / infusion / surgery / behavioral / genetic.
- Classifier extension to flag specialty triggers from
  CPT ranges and ICD-10 chapters.

### Wave 52-4 — First commercial payer overlays (2026-09)

- Aetna, United Healthcare, Anthem (lead with the three
  largest commercial plans by national PA volume).
- Each overlay sourced from the payer's public medical
  policy bulletin library. Source URLs pinned and hashed.
- ~20–40 rules per payer.
- **Status: Aetna opened ahead of schedule in wave 52-7a
  (2026-05-30) and completed its planned 20-rule set in wave
  52-7d (2026-06-01), the `R-PA-AETNA-NNN` family (§4.5.7).
  UnitedHealthcare followed in wave 52-8 (2026-06-01) with its
  own 20-rule set, the `R-PA-UHC-NNN` family (§4.5.8). Anthem
  followed in wave 52-9 (2026-06-02) with its own 20-rule set,
  the `R-PA-ANTHEM-NNN` family (§4.5.9). All three planned
  commercial overlays are now complete. Cigna followed in wave
  52-10 (2026-06-02) with its own 20-rule set, the
  `R-PA-CIGNA-NNN` family (§4.5.10), extending the set to the four
  largest commercial plans by national PA volume. Humana followed
  in wave 52-11 (2026-06-02) with its own 20-rule set, the
  `R-PA-HUMANA-NNN` family (§4.5.11), bringing the named
  commercial / MA overlays to five.**

### Wave 52-8 — UnitedHealthcare commercial overlay (2026-06)

- The 20 UnitedHealthcare rules (§4.5.8), the `R-PA-UHC-NNN`
  family, anchored to UHC's public prior-authorization /
  advance-notification hub, Medical & Drug Policies, and
  Coverage Determination Guidelines (ledger source
  `uhc-precert`).
- A `'uhc'` payer bucket in `lib/pa/payer.js`, placed before the
  generic `'commercial'` fall-through and after `'aetna'`; the
  MA bucket still wins for `uhc medicare advantage`.
- Catalog count unchanged (255 tiles; UHC adds rules, not a
  tile). Ruleset rises 155 → 175.

### Wave 52-9 — Anthem commercial overlay (2026-06)

- The 20 Anthem rules (§4.5.9), the `R-PA-ANTHEM-NNN` family,
  anchored to Anthem's public prior-authorization hub, Clinical
  UM Guidelines, and Medical Policies (ledger source
  `anthem-precert`).
- An `'anthem'` payer bucket in `lib/pa/payer.js`, placed before
  the generic `'commercial'` fall-through and after `'uhc'`. It
  matches only `anthem` / `elevance`; generic `blue cross` /
  `blue shield` stays in the commercial fall-through (most Blues
  plans are independent licensees, not Anthem/Elevance).
- Catalog count unchanged (255 tiles; Anthem adds rules, not a
  tile). Ruleset rises 175 → 195. Completes the three planned
  commercial overlays (Aetna + UnitedHealthcare + Anthem).

### Wave 52-10 — Cigna commercial overlay (2026-06)

- The 20 Cigna rules (§4.5.10), the `R-PA-CIGNA-NNN` family,
  anchored to Cigna's public prior-authorization / precertification
  hub, Medical Coverage Policies, and the eviCore / Evernorth
  program requirements (ledger source `cigna-precert`).
- A `'cigna'` payer bucket in `lib/pa/payer.js`, placed before the
  generic `'commercial'` fall-through and after `'anthem'`. It
  matches `cigna` / `evernorth` (Cigna's health-services brand for
  pharmacy and behavioral health); a plain Cigna MA packet without
  an explicit "Medicare Advantage" string routes here, which is
  acceptable (the overlay rules self-gate on requested services).
- Catalog count unchanged (255 tiles; Cigna adds rules, not a
  tile). Ruleset rises 195 → 215. Extends the commercial overlays
  to the four largest commercial plans (Aetna + UnitedHealthcare +
  Anthem + Cigna).

### Wave 52-11 — Humana commercial overlay (2026-06)

- The 20 Humana rules (§4.5.11), the `R-PA-HUMANA-NNN` family,
  anchored to Humana's public prior-authorization / preauthorization
  hub, Medical Coverage Policies, and utilization-management /
  CenterWell program requirements (ledger source `humana-precert`).
- A `'humana'` payer bucket in `lib/pa/payer.js`, placed before the
  generic `'commercial'` fall-through and after `'cigna'`. It
  matches `humana` / `centerwell`; `humana gold plus` and explicit
  "Medicare Advantage" strings still win the MA bucket earlier, and
  a plain Humana MA packet without that string routes here (the
  overlay rules self-gate on requested services).
- Catalog count unchanged (255 tiles; Humana adds rules, not a
  tile). Ruleset rises 215 → 235. Brings the named commercial / MA
  overlays to five (Aetna + UnitedHealthcare + Anthem + Cigna +
  Humana).

### Wave 52-12 — HCSC / Blue Cross Blue Shield commercial overlay (2026-06)

- The 20 HCSC rules (§4.5.12), the `R-PA-HCSC-NNN` family,
  anchored to HCSC's public BCBSIL provider prior-authorization
  hub, Medical Policies, and utilization-management / Prime
  Therapeutics program requirements (ledger source `hcsc-precert`).
- An `'hcsc'` payer bucket in `lib/pa/payer.js`, placed before the
  generic `'commercial'` fall-through and after `'humana'`. It
  matches the HCSC corporate name, the `hcsc` acronym, and the
  five state plan names (Blue Cross [and] Blue Shield of Illinois /
  Texas / Montana / New Mexico / Oklahoma); generic Blues and other
  licensees stay in the commercial fall-through, and "Blue Cross
  Medicare Advantage" still wins the MA bucket earlier.
- Catalog count unchanged (255 tiles; HCSC adds rules, not a
  tile). Ruleset rises 235 → 255. Brings the named commercial / MA
  overlays to six (Aetna + UnitedHealthcare + Anthem + Cigna +
  Humana + HCSC), the first directly addressing the §9 "Blues
  plans by state" candidate.

### Wave 52-13 — Highmark / Blue Cross Blue Shield commercial overlay (2026-06)

- The 20 Highmark rules (§4.5.13), the `R-PA-HIGHMARK-NNN` family,
  anchored to Highmark's public Provider Resource Center, Medical
  Policies, and utilization-management / pharmacy program
  requirements (ledger source `highmark-precert`).
- A `'highmark'` payer bucket in `lib/pa/payer.js`, placed before
  the generic `'commercial'` fall-through and after `'hcsc'`. It
  matches the single unambiguous brand anchor `highmark`; generic
  Blues and other licensees stay in the commercial fall-through,
  and "Highmark Medicare Advantage" still wins the MA bucket
  earlier.
- Catalog count unchanged (255 tiles; Highmark adds rules, not a
  tile). Ruleset rises 255 → 275. Brings the named commercial / MA
  overlays to seven (Aetna + UnitedHealthcare + Anthem + Cigna +
  Humana + HCSC + Highmark), the two largest independent Blues
  licensees now both covered.

### Wave 52-14 — Florida Blue / GuideWell commercial overlay (2026-06)

- The 20 Florida Blue rules (§4.5.14), the `R-PA-FLBLUE-NNN` family,
  anchored to Florida Blue's public provider authorizations pages,
  Medical Policies, and utilization-management / pharmacy program
  requirements (ledger source `floridablue-precert`).
- A `'florida-blue'` payer bucket in `lib/pa/payer.js`, placed
  before the generic `'commercial'` fall-through and after
  `'highmark'`. It matches only definitively-Florida-Blue anchors
  (`florida blue` / `guidewell` and the `blue cross [and] blue
  shield of florida` plan name); generic Blues and other licensees
  stay in the commercial fall-through, and "Florida Blue Medicare
  Advantage" still wins the MA bucket earlier.
- Catalog count unchanged (255 tiles; Florida Blue adds rules, not a
  tile). Ruleset rises 275 → 295. Brings the named commercial / MA
  overlays to eight (Aetna + UnitedHealthcare + Anthem + Cigna +
  Humana + HCSC + Highmark + Florida Blue), the three largest
  independent Blues licensees now all covered.

### Wave 52-15 — BCBSM / Blue Cross Blue Shield of Michigan commercial overlay (2026-06)

- The 20 BCBSM rules (§4.5.15), the `R-PA-BCBSM-NNN` family,
  anchored to BCBSM's public provider authorization-requirements
  pages, Medical Policies, and utilization-management / pharmacy
  program requirements (ledger source `bcbsm-precert`).
- A `'bcbsm'` payer bucket in `lib/pa/payer.js`, placed before the
  generic `'commercial'` fall-through and after `'florida-blue'`. It
  matches only definitively-BCBSM anchors (the `blue cross [and]
  blue shield of michigan` plan name, the `bcbsm` acronym, and the
  `blue care network` HMO brand); generic Blues and other licensees
  stay in the commercial fall-through, and "BCBSM Medicare Plus
  Blue" still wins the MA bucket earlier when it carries an explicit
  "Medicare Advantage" string.
- Catalog count unchanged (255 tiles; BCBSM adds rules, not a tile).
  Ruleset rises 295 → 315. Brings the named commercial / MA overlays
  to nine (Aetna + UnitedHealthcare + Anthem + Cigna + Humana + HCSC
  + Highmark + Florida Blue + BCBSM), the four largest independent
  Blues licensees now all covered.

### Wave 52-16 — Blue Shield of California commercial overlay (2026-06)

- The 20 Blue Shield of California rules (§4.5.16), the
  `R-PA-BSCA-NNN` family, anchored to the plan's public provider
  authorizations pages, Medical Policies, and utilization-management
  / pharmacy program requirements (ledger source
  `blueshieldca-precert`).
- A `'blue-shield-ca'` payer bucket in `lib/pa/payer.js`, placed
  before the generic `'commercial'` fall-through and after
  `'bcbsm'`. It matches the unambiguous plan-name anchor `blue
  shield of california` (and `blue shield of ca`); generic Blues and
  other licensees stay in the commercial fall-through, Anthem Blue
  Cross of California still wins the `'anthem'` bucket earlier, and
  an explicit "Medicare Advantage" string still wins the MA bucket
  earlier.
- Catalog count unchanged (255 tiles; Blue Shield of California adds
  rules, not a tile). Ruleset rises 315 → 335. Brings the named
  commercial / MA overlays to ten (Aetna + UnitedHealthcare + Anthem
  + Cigna + Humana + HCSC + Highmark + Florida Blue + BCBSM + Blue
  Shield of California), the five largest independent Blues licensees
  now all covered.

### Wave 52-17 — Independence Blue Cross commercial overlay (2026-06)

- The 20 Independence Blue Cross rules (§4.5.17), the `R-PA-IBX-NNN`
  family, anchored to the plan's public provider authorizations
  pages, Medical Policies, and utilization-management / pharmacy
  program requirements (ledger source `ibx-precert`).
- An `'ibx'` payer bucket in `lib/pa/payer.js`, placed before the
  generic `'commercial'` fall-through and after `'blue-shield-ca'`.
  It matches the `independence blue cross` / `independence
  administrators` / `ibx` anchors; IBX (southeastern PA) is a
  distinct licensee from Highmark (western / central PA), which the
  `'highmark'` bucket catches earlier. Generic Blues and other
  licensees stay in the commercial fall-through, and an explicit
  "Medicare Advantage" string still wins the MA bucket earlier.
- Catalog count unchanged (255 tiles; IBX adds rules, not a tile).
  Ruleset rises 335 → 355. Brings the named commercial / MA overlays
  to eleven (Aetna + UnitedHealthcare + Anthem + Cigna + Humana +
  HCSC + Highmark + Florida Blue + BCBSM + Blue Shield of California
  + Independence Blue Cross), the six largest independent Blues
  licensees now all covered.

### Wave 52-18 — CareFirst BlueCross BlueShield commercial overlay (2026-06)

- The 20 CareFirst rules (§4.5.18), the `R-PA-CAREFIRST-NNN` family,
  anchored to the plan's public provider preauthorization pages,
  Medical Policies, and utilization-management / pharmacy program
  requirements (ledger source `carefirst-precert`).
- A `'carefirst'` payer bucket in `lib/pa/payer.js`, placed before the
  generic `'commercial'` fall-through and after `'ibx'`. It matches the
  unambiguous `carefirst` trade-name anchor; generic Blues and other
  licensees stay in the commercial fall-through, and an explicit
  "Medicare Advantage" string still wins the MA bucket earlier.
- Catalog count unchanged (255 tiles; CareFirst adds rules, not a
  tile). Ruleset rises 355 → 375. Brings the named commercial / MA
  overlays to twelve (Aetna + UnitedHealthcare + Anthem + Cigna +
  Humana + HCSC + Highmark + Florida Blue + BCBSM + Blue Shield of
  California + Independence Blue Cross + CareFirst), the seven largest
  independent Blues licensees now all covered.

### Wave 52-19 — Blue Cross Blue Shield of North Carolina commercial overlay (2026-06)

- The 20 Blue Cross NC rules (§4.5.19), the `R-PA-BCBSNC-NNN` family,
  anchored to the plan's public provider prior-authorization pages,
  Medical Policies, and utilization-management / pharmacy program
  requirements (ledger source `bcbsnc-precert`).
- A `'bcbsnc'` payer bucket in `lib/pa/payer.js`, placed before the
  generic `'commercial'` fall-through and after `'carefirst'`. It
  matches only definitively-North-Carolina anchors (the plan name, the
  `blue cross nc` short form, and the `bcbsnc` acronym); generic Blues
  and other licensees stay in the commercial fall-through, and an
  explicit "Medicare Advantage" string still wins the MA bucket earlier.
- Catalog count unchanged (255 tiles; Blue Cross NC adds rules, not a
  tile). Ruleset rises 375 → 395. Brings the named commercial / MA
  overlays to thirteen (Aetna + UnitedHealthcare + Anthem + Cigna +
  Humana + HCSC + Highmark + Florida Blue + BCBSM + Blue Shield of
  California + Independence Blue Cross + CareFirst + Blue Cross NC), the
  eight largest independent Blues licensees now all covered.

### Wave 52-20 — Horizon Blue Cross Blue Shield of New Jersey commercial overlay (2026-06)

- The 20 Horizon rules (§4.5.20), the `R-PA-HORIZON-NNN` family,
  anchored to the plan's public provider prior-authorization pages,
  Medical Policies, and utilization-management / pharmacy program
  requirements (ledger source `horizon-precert`).
- A `'horizon'` payer bucket in `lib/pa/payer.js`, placed before the
  generic `'commercial'` fall-through and after `'bcbsnc'`. It matches
  only definitively-Horizon anchors (`horizon blue cross`, `horizon
  bcbs`, `horizon healthcare services`), never the bare common word
  `horizon`; generic Blues and other licensees stay in the commercial
  fall-through, and an explicit "Medicare Advantage" string still wins
  the MA bucket earlier.
- Catalog count unchanged (255 tiles; Horizon adds rules, not a tile).
  Ruleset rises 395 → 415. Brings the named commercial / MA overlays to
  fourteen (Aetna + UnitedHealthcare + Anthem + Cigna + Humana + HCSC +
  Highmark + Florida Blue + BCBSM + Blue Shield of California +
  Independence Blue Cross + CareFirst + Blue Cross NC + Horizon), the
  nine largest independent Blues licensees now all covered.

### Wave 52-5+ — State Medicaid overlays, additional commercial payers, OCR

- Per-state Medicaid overlays as user-volume data warrants.
- Other Blues plans by state (HCSC shipped in wave 52-12, Highmark
  in wave 52-13, Florida Blue in wave 52-14, BCBSM in wave 52-15,
  Blue Shield of California in wave 52-16, Independence Blue Cross in
  wave 52-17, CareFirst BlueCross BlueShield in wave 52-18, Blue Cross
  Blue Shield of North Carolina in wave 52-19, Horizon Blue Cross Blue
  Shield of New Jersey in wave 52-20; the remaining independent Blues
  licensees follow as volume warrants).
- Optional in-browser OCR via tesseract.js (lazy-loaded,
  user-toggled, ≈ 11 MB gzipped). Only if §2's no-OCR
  experience proves insufficient.

Each wave updates this spec's changelog (below) with the
ship date, the rule-count delta, and the dataset version.

---

## 10. Catalog and audience changes

### 10.1 New catalog group

A new top-level group `Revenue cycle & utilization` is added
to `lib/data.js`. v52 ships exactly one tile in this group
(`pa-lint`). The group's audience hub link is to
`/for/billers/`; if a dedicated `/for/revenue-cycle/` hub is
desired in a later wave, it is a one-line addition.

### 10.2 New audience: case-managers

`case-managers` is added as a new audience slug with its hub
at `/for/case-managers/`. The hub is built by the existing
`scripts/build-audience-hubs.mjs` and lists every tile
whose `audiences` array includes `case-managers`. At v52
close, exactly one tile (`pa-lint`) is in this hub. The
existing `billers` and `coders` hubs also gain the `pa-lint`
tile.

### 10.3 Synonym additions

`data/synonyms.json` adds:

```json
{
  "prior auth": "pa-lint",
  "prior authorization": "pa-lint",
  "preauth": "pa-lint",
  "preauthorization": "pa-lint",
  "PA packet": "pa-lint",
  "PA linter": "pa-lint",
  "PA checker": "pa-lint",
  "packet check": "pa-lint",
  "PA checklist": "pa-lint",
  "utilization management": "pa-lint",
  "UM packet": "pa-lint",
  "denial prevention": "pa-lint"
}
```

The full list is reviewed for collisions with existing
synonyms before merge.

---

## 11. Disclaimer copy (shipped on the tile and in the report)

The exact wording, locked by this spec and re-readable as a
single block in `data/tool-copy/pa-lint.json`:

> **Sophie Prior-Auth Packet Linter is a deterministic
> checklist. It is not medical advice. It is not legal
> advice. It is not coding advice. It does not transmit
> anything to any payer. Your packet stays in this browser
> tab; we never see your data. Findings reflect what
> Sophie's ruleset checks; they are not a guarantee of
> payer approval. A passing report does not mean the packet
> will be approved; a failing report does not mean the
> packet will be denied. The clinical adequacy of every
> document is the reviewer's responsibility. Sophie's
> ruleset is versioned and cites every source; verify
> citations against current payer policy before relying on
> any finding for a clinical or revenue decision.**

This disclaimer appears on the tile page (collapsed under
"About the rules") and at the top of the DOCX report (under
the cover-page title).

---

## 12. Migration & rollback

### 12.1 Forward

Wave 52-1 ships in a single PR that:

1. Updates `index.html` per §6 (removes the quick-picks
   block, adds the tool-picker block, updates the lede +
   hero label to "255").
2. Adds the `pa-lint` tile registration in `lib/data.js`,
   the synonyms in `data/synonyms.json`, the tile copy in
   `data/tool-copy/pa-lint.json`.
3. Adds all files listed in §5.1.
4. Updates the four scripts in §5.5.
5. Adds the tests in §8.1.
6. Updates the checks in §8.2.

The PR's commit message references this spec by id. The
CHANGELOG.md gets a new section for v52.

### 12.2 Rollback

Revert the v52 PR. No data migration required. No URL
changes that other sites or pages depend on (the
`/tools/pa-lint/` route is new; revert simply 404s it). The
homepage reverts to the v51 quick-picks layout. The catalog
count reverts to 254. No `localStorage` keys are added or
removed (the PA tile writes none).

### 12.3 Partial rollback

If a specific overlay (e.g., a payer pack added in v52-4)
needs to be retracted without rolling back the whole tile,
the overlay's JSON file is renamed to `.disabled` and the
manifest is rebuilt. The engine skips disabled overlays
silently; the audit trail records the disablement.

---

## 13. Open questions deferred to future waves

- **Should the PA tile expose a "compare to last submission"
  diff mode?** Useful for resubmissions but adds UX
  complexity. Defer to v53 pending user feedback.
- **Should specialty overlays be auto-enabled by classifier
  or always-on with a noisier report?** v52 auto-enables.
  Revisit if the noise complaint volume warrants.
- **Should Sophie ship a fixture generator (synthetic PHI
  packets for testing)?** Useful for users building
  test pipelines around Sophie. Defer; ship the maintainer's
  fixtures publicly under `data/pa-lint/fixtures/` and let
  users contribute their own.
- **MCP-server export.** The `lib/pa/` modules are written
  to be pure functions over typed inputs. A future
  cross-repo wave (`kernels-core`) MAY wrap them as an MCP
  server so that AI agents can call Sophie PA as a tool.
  This is out of scope for v52 and remains a maintainer-
  level architectural decision.

---

## 14. Cross-references

- [spec-v10](spec-v10.md) — audiences and dependency budget.
- [spec-v11](spec-v11.md) — citation audit harness.
- [spec-v12](spec-v12.md) — integrity manifests.
- [spec-v29](spec-v29.md) — nurse-first pivot and scope test
  (extended in §3 above).
- [spec-v46](spec-v46.md) — catalog-truth invariants
  (extended in §8.2 above).
- [spec-v48](spec-v48.md) — derivation-block pattern (the
  PA report's per-finding "why" block follows the same
  shape).
- [spec-v50](spec-v50.md) — eight commitments (verified
  intact in §7 above).
- [spec-v51](spec-v51.md) — minimal homepage (superseded
  for the quick-picks block by §6 above; all other
  provisions intact).
- [Vaulytica](https://github.com/clay-good/vaulytica) — the
  reference implementation for the file-ingest /
  rule-engine / DOCX-report pattern adopted here.

---

## 15. Changelog

- 2026-05-27 — v52 proposed. Five waves outlined (52-1 through
  52-5+). Catalog count target at v52-1 close: 255.
- 2026-06-04 — wave 52-20 (§4.5.20 Horizon Blue Cross Blue Shield of New Jersey
  commercial overlay, the full 20-rule `R-PA-HORIZON-NNN` family — the fourteenth
  named commercial overlay after Aetna, UnitedHealthcare, Anthem, Cigna, Humana,
  HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of California, Independence
  Blue Cross, CareFirst, and Blue Cross NC, and the ninth "Blues plans by state"
  overlay). Opens a `'horizon'` payer bucket in `lib/pa/payer.js` (placed after
  `'bcbsnc'` and before the generic `'commercial'` fall-through). Horizon is the
  dominant Blues licensee in New Jersey; the bucket matches only
  definitively-Horizon anchors (`horizon blue cross`, `horizon bcbs`, `horizon
  healthcare services`), never the bare common word `horizon`, so generic `blue
  cross` / `blue shield` and other licensees stay in the commercial fall-through,
  and an explicit "Medicare Advantage" string still wins the MA bucket earlier.
  The 20 rules mirror the prior thirteen commercial families so the fourteen
  overlays stay structurally parallel, with Horizon-specific routing names where
  the plan uses them (the NaviNet provider portal / Availity submission channel,
  the advanced-imaging utilization-management program, pharmacy management for
  step therapy, behavioral health, and the Blue Distinction Centers for
  Transplant). Each self-gates on `bundle.payer === 'horizon'` and vacuously
  passes on every other packet. New ledger source `horizon-precert` anchored to
  the plan's public provider prior-authorization page (all twenty rules map to it
  by prefix). Coverage is now 415 rules shipped (was 395), 367 source-anchored
  (was 347), 29 sources (was 28), 0 orphans, 0 gaps. The golden fixtures re-seed
  deterministically (a new `horizon-precert` fixture exercises the on-bucket
  path — 009 flag, 003 info; the other twenty gain +20 vacuous-pass findings
  each). Tests: +9 engine assertions (count 415, the off-bucket loop, and
  fire/pass checks) and +1 classify assertion (Horizon → `horizon`; generic Blues
  → `commercial`; Horizon Medicare Advantage → the MA bucket). Catalog count
  unchanged (255). View wave banner advanced to 52-20.
- 2026-06-04 — wave 52-19 (§4.5.19 Blue Cross Blue Shield of North Carolina
  commercial overlay, the full 20-rule `R-PA-BCBSNC-NNN` family — the thirteenth
  named commercial overlay after Aetna, UnitedHealthcare, Anthem, Cigna, Humana,
  HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of California, Independence
  Blue Cross, and CareFirst, and the eighth "Blues plans by state" overlay).
  Opens a `'bcbsnc'` payer bucket in `lib/pa/payer.js` (placed after `'carefirst'`
  and before the generic `'commercial'` fall-through). Blue Cross NC is the
  dominant Blues licensee in North Carolina; the bucket matches only
  definitively-North-Carolina anchors (the plan name, the `blue cross nc` short
  form, and the `bcbsnc` acronym), so generic `blue cross` / `blue shield` and
  other licensees stay in the commercial fall-through, and an explicit "Medicare
  Advantage" string still wins the MA bucket earlier. The 20 rules mirror the
  prior twelve commercial families so the thirteen overlays stay structurally
  parallel, with Blue-Cross-NC-specific routing names where the plan uses them
  (the Blue e provider portal / Availity submission channel, the advanced-imaging
  utilization-management program, pharmacy management for step therapy,
  behavioral health, and the Blue Distinction Centers for Transplant). Each
  self-gates on `bundle.payer === 'bcbsnc'` and vacuously passes on every other
  packet. New ledger source `bcbsnc-precert` anchored to the plan's public
  provider prior-authorization page (all twenty rules map to it by prefix).
  Coverage is now 395 rules shipped (was 375), 347 source-anchored (was 327), 28
  sources (was 27), 0 orphans, 0 gaps. The golden fixtures re-seed
  deterministically (a new `bcbsnc-precert` fixture exercises the on-bucket path —
  009 flag, 003 info; the other nineteen gain +20 vacuous-pass findings each).
  Tests: +9 engine assertions (count 395, the off-bucket loop, and fire/pass
  checks) and +1 classify assertion (Blue Cross NC → `bcbsnc`; generic Blues →
  `commercial`; Blue Cross NC Medicare Advantage → the MA bucket). Catalog count
  unchanged (255). View wave banner advanced to 52-19.
- 2026-06-04 — wave 52-18 (§4.5.18 CareFirst BlueCross BlueShield commercial
  overlay, the full 20-rule `R-PA-CAREFIRST-NNN` family — the twelfth named
  commercial overlay after Aetna, UnitedHealthcare, Anthem, Cigna, Humana, HCSC,
  Highmark, Florida Blue, BCBSM, Blue Shield of California, and Independence Blue
  Cross, and the seventh "Blues plans by state" overlay). Opens a `'carefirst'`
  payer bucket in `lib/pa/payer.js` (placed after `'ibx'` and before the generic
  `'commercial'` fall-through). CareFirst is the dominant Blues licensee in the
  mid-Atlantic (Maryland, the District of Columbia, and Northern Virginia); the
  bucket matches the unambiguous `carefirst` trade-name anchor, so generic `blue
  cross` / `blue shield` and other licensees stay in the commercial fall-through,
  and an explicit "Medicare Advantage" string still wins the MA bucket earlier.
  The 20 rules mirror the Aetna / UHC / Anthem / Cigna / Humana / HCSC / Highmark
  / Florida Blue / BCBSM / Blue Shield of California / Independence Blue Cross
  families so the twelve commercial overlays stay structurally parallel, with
  CareFirst-specific routing names where the plan uses them (CareFirst Direct /
  iEXchange submission, the advanced-imaging utilization-management program,
  pharmacy management for step therapy, behavioral health, and the Blue
  Distinction Centers for Transplant). Each self-gates on `bundle.payer ===
  'carefirst'` and vacuously passes on every other packet. New ledger source
  `carefirst-precert` anchored to the plan's public provider preauthorization
  page (all twenty rules map to it by prefix). Coverage is now 375 rules shipped
  (was 355), 327 source-anchored (was 307), 27 sources (was 26), 0 orphans, 0
  gaps. The golden fixtures re-seed deterministically (a new `carefirst-precert`
  fixture exercises the on-bucket path — 009 flag, 003 info; the other eighteen
  gain +20 vacuous-pass findings each). Tests: +9 engine assertions (count 375,
  the off-bucket loop, and fire/pass checks) and +1 classify assertion (CareFirst
  → `carefirst`; generic Blues → `commercial`; CareFirst Medicare Advantage → the
  MA bucket). Catalog count unchanged (255). View wave banner advanced to 52-18.
- 2026-06-04 — wave 52-17 (§4.5.17 Independence Blue Cross commercial overlay,
  the full 20-rule `R-PA-IBX-NNN` family — the eleventh named commercial overlay
  after Aetna, UnitedHealthcare, Anthem, Cigna, Humana, HCSC, Highmark, Florida
  Blue, BCBSM, and Blue Shield of California, and the sixth "Blues plans by
  state" overlay). Opens an `'ibx'` payer bucket in `lib/pa/payer.js` (placed
  after `'blue-shield-ca'` and before the generic `'commercial'` fall-through).
  Independence Blue Cross is the dominant Blues licensee in southeastern
  Pennsylvania (the Philadelphia region) and a distinct licensee from Highmark
  (western / central PA), which the `'highmark'` bucket catches earlier. The
  bucket matches the `independence blue cross` / `independence administrators` /
  `ibx` anchors, so generic `blue cross` / `blue shield` and other licensees stay
  in the commercial fall-through, and an explicit "Medicare Advantage" string
  still wins the MA bucket earlier. The 20 rules mirror the Aetna / UHC / Anthem /
  Cigna / Humana / HCSC / Highmark / Florida Blue / BCBSM / Blue Shield of
  California families so the eleven commercial overlays stay structurally
  parallel, with IBX-specific routing names where the plan uses them (Availity /
  PEAR provider portal submission, the advanced-imaging utilization-management
  program, pharmacy management for step therapy, behavioral health, and the Blue
  Distinction Centers for Transplant). Each self-gates on `bundle.payer === 'ibx'`
  and vacuously passes on every other packet. New ledger source `ibx-precert`
  anchored to the plan's public provider authorizations page (all twenty rules
  map to it by prefix). Coverage is now 355 rules shipped (was 335), 307
  source-anchored (was 287), 26 sources (was 25), 0 orphans, 0 gaps. The golden
  fixtures re-seed deterministically (a new `ibx-precert` fixture exercises the
  on-bucket path — 009 flag, 003 info; the other seventeen gain +20 vacuous-pass
  findings each). Tests: +10 engine assertions (count 355, the off-bucket loop,
  and fire/pass checks) and +1 classify assertion (Independence Blue Cross →
  `ibx`; Highmark → `highmark`; generic Blues → `commercial`; IBX Medicare
  Advantage → the MA bucket). Catalog count unchanged (255). View wave banner
  advanced to 52-17.
- 2026-06-04 — wave 52-16 (§4.5.16 Blue Shield of California commercial overlay,
  the full 20-rule `R-PA-BSCA-NNN` family — the tenth named commercial overlay
  after Aetna, UnitedHealthcare, Anthem, Cigna, Humana, HCSC, Highmark, Florida
  Blue, and BCBSM, and the fifth "Blues plans by state" overlay). Opens a
  `'blue-shield-ca'` payer bucket in `lib/pa/payer.js` (placed after `'bcbsm'`
  and before the generic `'commercial'` fall-through). Blue Shield of California
  is the second-largest health plan in California and a distinct independent
  licensee from Anthem Blue Cross of California (Elevance), which the `'anthem'`
  bucket catches earlier. The bucket matches the unambiguous plan-name anchor
  `blue shield of california` (and `blue shield of ca`), so generic `blue cross`
  / `blue shield` and other licensees stay in the commercial fall-through, and an
  explicit "Medicare Advantage" string still wins the MA bucket earlier. The 20
  rules mirror the Aetna / UHC / Anthem / Cigna / Humana / HCSC / Highmark /
  Florida Blue / BCBSM families so the ten commercial overlays stay structurally
  parallel, with Blue Shield of California-specific routing names where the plan
  uses them (Availity / provider connection submission, the advanced-imaging
  utilization-management program, pharmacy management for step therapy,
  behavioral health, and the Blue Distinction Centers for Transplant). Each
  self-gates on `bundle.payer === 'blue-shield-ca'` and vacuously passes on every
  other packet. New ledger source `blueshieldca-precert` anchored to the plan's
  public provider authorizations page (all twenty rules map to it by prefix).
  Coverage is now 335 rules shipped (was 315), 287 source-anchored (was 267), 25
  sources (was 24), 0 orphans, 0 gaps. The golden fixtures re-seed
  deterministically (a new `blue-shield-ca-precert` fixture exercises the
  on-bucket path — 009 flag, 003 info; the other sixteen gain +20 vacuous-pass
  findings each). Tests: +10 engine assertions (count 335, the off-bucket loop,
  and fire/pass checks) and +1 classify assertion (Blue Shield of California →
  `blue-shield-ca`; Anthem Blue Cross of California → `anthem`; generic Blues →
  `commercial`; Blue Shield of California Medicare Advantage → the MA bucket).
  Catalog count unchanged (255). View wave banner advanced to 52-16.
- 2026-06-04 — wave 52-15 (§4.5.15 BCBSM / Blue Cross Blue Shield of Michigan
  commercial overlay, the full 20-rule `R-PA-BCBSM-NNN` family — the ninth named
  commercial overlay after Aetna, UnitedHealthcare, Anthem, Cigna, Humana, HCSC,
  Highmark, and Florida Blue, and the fourth "Blues plans by state" overlay).
  Opens a `'bcbsm'` payer bucket in `lib/pa/payer.js` (placed after
  `'florida-blue'` and before the generic `'commercial'` fall-through). Blue
  Cross Blue Shield of Michigan (with its HMO subsidiary Blue Care Network) is
  the dominant Blues licensee in Michigan and one of the largest independent
  licensees not routed to the Anthem/Elevance, HCSC, Highmark, or Florida Blue
  buckets. The bucket matches only definitively-BCBSM anchors — the `blue cross
  [and] blue shield of michigan` plan name, the `bcbsm` acronym, and the `blue
  care network` HMO brand — so generic `blue cross` / `blue shield` and other
  licensees stay in the commercial fall-through, and "BCBSM Medicare Plus Blue"
  still wins the MA bucket earlier when it carries an explicit "Medicare
  Advantage" string. The 20 rules mirror the Aetna / UHC / Anthem / Cigna /
  Humana / HCSC / Highmark / Florida Blue families so the nine commercial
  overlays stay structurally parallel, with BCBSM-specific routing names where
  BCBSM uses them (Availity Essentials submission, the advanced-imaging
  utilization-management program, BCBSM pharmacy management for step therapy,
  BCBSM behavioral health, and the Blue Distinction Centers for Transplant).
  Each self-gates on `bundle.payer === 'bcbsm'` and vacuously passes on every
  other packet. New ledger source `bcbsm-precert` anchored to BCBSM's public
  provider authorization-requirements page (all twenty rules map to it by
  prefix). Coverage is now 315 rules shipped (was 295), 267 source-anchored (was
  247), 24 sources (was 23), 0 orphans, 0 gaps. The golden fixtures re-seed
  deterministically (a new `bcbsm-precert` fixture exercises the on-bucket
  path — 009 flag, 003 info; the other fifteen gain +20 vacuous-pass findings
  each). Tests: +10 engine assertions (count 315, the off-bucket loop, and
  fire/pass checks) and +1 classify assertion (BCBSM / Blue Care Network →
  `bcbsm`; generic Blues → `commercial`; BCBSM Medicare Plus Blue → the MA
  bucket). Catalog count unchanged (255). View wave banner advanced to 52-15.
- 2026-06-03 — wave 52-14 (§4.5.14 Florida Blue / GuideWell commercial overlay,
  the full 20-rule `R-PA-FLBLUE-NNN` family — the eighth named commercial
  overlay after Aetna, UnitedHealthcare, Anthem, Cigna, Humana, HCSC, and
  Highmark, and the third "Blues plans by state" overlay). Opens a
  `'florida-blue'` payer bucket in `lib/pa/payer.js` (placed after `'highmark'`
  and before the generic `'commercial'` fall-through). Florida Blue (Blue Cross
  and Blue Shield of Florida, a GuideWell company) is the dominant Blues
  licensee in Florida and one of the largest independent licensees not routed
  to the Anthem/Elevance, HCSC, or Highmark buckets. The bucket matches only
  definitively-Florida-Blue anchors — the `florida blue` / `guidewell` trade
  names and the `blue cross [and] blue shield of florida` plan name — so generic
  `blue cross` / `blue shield` and other licensees stay in the commercial
  fall-through, and "Florida Blue Medicare Advantage" still wins the MA bucket
  earlier when it carries an explicit "Medicare Advantage" string. The 20 rules
  mirror the Aetna / UHC / Anthem / Cigna / Humana / HCSC / Highmark families so
  the eight commercial overlays stay structurally parallel, with Florida
  Blue-specific routing names where Florida Blue uses them (Availity Essentials
  submission, the advanced-imaging utilization-management program, Florida Blue
  pharmacy management for step therapy, Florida Blue behavioral health, and the
  Blue Distinction Centers for Transplant). Each self-gates on
  `bundle.payer === 'florida-blue'` and vacuously passes on every other packet.
  New ledger source `floridablue-precert` anchored to Florida Blue's public
  provider authorizations page (all twenty rules map to it by prefix). Coverage
  is now 295 rules shipped (was 275), 247 source-anchored (was 227), 23 sources
  (was 22), 0 orphans, 0 gaps. The golden fixtures re-seed deterministically (a
  new `florida-blue-precert` fixture exercises the on-bucket path — 009 flag,
  003 info; the other fourteen gain +20 vacuous-pass findings each). Tests: +10
  engine assertions (count 295, the off-bucket loop, and fire/pass checks) and
  +1 classify assertion (Florida Blue / GuideWell → `florida-blue`; generic
  Blues → `commercial`; Florida Blue Medicare Advantage → the MA bucket).
  Catalog count unchanged (255). View wave banner advanced to 52-14.
- 2026-06-03 — wave 52-13 (§4.5.13 Highmark / Blue Cross Blue Shield commercial
  overlay, the full 20-rule `R-PA-HIGHMARK-NNN` family — the seventh named
  commercial overlay after Aetna, UnitedHealthcare, Anthem, Cigna, Humana, and
  HCSC, and the second "Blues plans by state" overlay). Opens a `'highmark'`
  payer bucket in `lib/pa/payer.js` (placed after `'hcsc'` and before the
  generic `'commercial'` fall-through). Highmark is the second-largest
  independent Blue Cross Blue Shield licensee (after HCSC); it operates the
  Blues plans of Pennsylvania, West Virginia, Delaware, and western /
  northeastern New York. The bucket matches the single unambiguous brand anchor
  `highmark` — a distinct trade name, not a generic Blues phrase — so generic
  `blue cross` / `blue shield` and other licensees stay in the commercial
  fall-through, and "Highmark Medicare Advantage" (Freedom Blue) still wins the
  MA bucket earlier when it carries an explicit "Medicare Advantage" string. The
  20 rules mirror the Aetna / UHC / Anthem / Cigna / Humana / HCSC families so
  the seven commercial overlays stay structurally parallel, with
  Highmark-specific routing names where Highmark uses them: coverage-criteria
  reference (001, flag), supporting clinical records (002, flag), the Availity
  Essentials / Provider Resource Center submission channel (003, info), the
  prior-authorization-list stub (004, info, mirrors R-PA-053),
  authorization-before-service (005, flag), inpatient admission notification +
  concurrent review (006, flag), the advanced-imaging utilization-management
  program (007, flag), expedited urgency (008, flag), site-of-care for
  outpatient surgery (009, flag), NDC on a J-code drug (010, info), step therapy
  / Highmark pharmacy management (011, flag), the genetic / molecular
  lab-management program (012, flag), the Medical Policy specialty /
  oncology-drug diagnosis (013, flag), retrospective justification (014, info),
  DME / home-health written order (015, flag), behavioral-health level-of-care
  via Highmark behavioral health (016, flag), the Blue Distinction Centers for
  Transplant routing (017, flag), the experimental / investigational
  determination (018, flag), the appeal original-determination reference (019,
  info), and the out-of-network network-gap justification (020, info). Each
  self-gates on `bundle.payer === 'highmark'` and vacuously passes on every
  other packet. New ledger source `highmark-precert` anchored to Highmark's
  public Provider Resource Center (all twenty rules map to it by prefix).
  Coverage is now 275 rules shipped (was 255), 227 source-anchored (was 207),
  22 sources (was 21), 0 orphans, 0 gaps. The golden fixtures re-seed
  deterministically (a new `highmark-precert` fixture exercises the on-bucket
  path — 009 flag, 003 info; the other thirteen gain +20 vacuous-pass findings
  each). Tests: +10 engine assertions (count 275, the off-bucket loop, and
  fire/pass checks) and +1 classify assertion (Highmark → `highmark`; generic
  Blues → `commercial`; Highmark Medicare Advantage → the MA bucket). Catalog
  count unchanged (255). View wave banner advanced to 52-13.
- 2026-06-02 — wave 52-12 (§4.5.12 HCSC / Blue Cross Blue Shield commercial
  overlay, the full 20-rule `R-PA-HCSC-NNN` family — the sixth named
  commercial overlay after Aetna, UnitedHealthcare, Anthem, Cigna, and Humana,
  and the first to address the §9 "Blues plans by state" candidate). Opens an
  `'hcsc'` payer bucket in `lib/pa/payer.js` (placed after `'humana'` and
  before the generic `'commercial'` fall-through). Health Care Service
  Corporation is the largest Blue Cross Blue Shield licensee not routed to the
  Anthem/Elevance bucket; it operates the Blues plans of Illinois, Texas,
  Montana, New Mexico, and Oklahoma. The bucket matches only definitively-HCSC
  anchors — the corporate name, the `hcsc` acronym, and the five state plan
  names — so generic `blue cross` / `blue shield` and other licensees (Florida
  Blue, Blue Shield of California) stay in the commercial fall-through, and
  "Blue Cross Medicare Advantage" still wins the MA bucket earlier. The 20
  rules mirror the Aetna / UHC / Anthem / Cigna / Humana families so the six
  commercial overlays stay structurally parallel, with HCSC-specific routing
  names where HCSC uses them: coverage-criteria reference (001, flag),
  supporting clinical records (002, flag), the Availity Essentials submission
  channel (003, info), the prior-authorization-list stub (004, info, mirrors
  R-PA-053), authorization-before-service (005, flag), inpatient admission
  notification + concurrent review (006, flag), the advanced-imaging
  utilization-management program (007, flag), expedited urgency (008, flag),
  site-of-care for outpatient surgery (009, flag), NDC on a J-code drug (010,
  info), step therapy / Prime Therapeutics (011, flag), the genetic /
  molecular lab-management program (012, flag), the Medical Policy specialty /
  oncology-drug diagnosis (013, flag), retrospective justification (014,
  info), DME / home-health written order (015, flag), behavioral-health
  level-of-care via HCSC Behavioral Health (016, flag), the Blue Distinction
  Centers for Transplant routing (017, flag), the experimental /
  investigational determination (018, flag), the appeal original-determination
  reference (019, info), and the out-of-network network-gap justification (020,
  info). Each self-gates on `bundle.payer === 'hcsc'` and vacuously passes on
  every other packet. The imaging / lab-management program is described
  generically rather than by its current vendor name, which collides with an
  AI-vendor substring barred from source by spec-v50 §3.6 (check-commitments
  enforces this). New ledger source `hcsc-precert` anchored to HCSC's public
  BCBSIL provider prior-authorization hub (all twenty rules map to it by
  prefix). Coverage is now 255 rules shipped (was 235), 207 source-anchored
  (was 187), 21 sources (was 20), 0 orphans, 0 gaps. The golden fixtures
  re-seed deterministically (a new `hcsc-precert` fixture exercises the
  on-bucket path — 009 flag, 003 info; the other twelve gain +20 vacuous-pass
  findings each). Tests: +10 engine assertions (count 255, the off-bucket
  loop, and fire/pass checks) and +1 classify assertion (HCSC / the five
  state plans → `hcsc`; generic Blues → `commercial`; Blue Cross Medicare
  Advantage → the MA bucket). Catalog count unchanged (255). View wave banner
  advanced to 52-12.
- 2026-06-02 — wave 52-11 (§4.5.11 Humana commercial overlay, the full 20-rule
  `R-PA-HUMANA-NNN` family — the fifth named commercial overlay after Aetna,
  UnitedHealthcare, Anthem, and Cigna). Opens a `'humana'` payer bucket in
  `lib/pa/payer.js` (placed after `'cigna'` and before the generic
  `'commercial'` fall-through). The bucket matches `humana` / `centerwell`;
  `humana gold plus` and explicit "Medicare Advantage" strings still win the
  MA bucket earlier, and a plain Humana MA packet without that string routes
  here (the rules self-gate on requested services, not the line of business).
  The 20 rules mirror the Aetna / UHC / Anthem / Cigna families so the five
  commercial overlays stay structurally parallel, with Humana-specific routing
  names where Humana uses them: coverage-criteria reference (001, flag),
  supporting clinical records (002, flag), the Availity Essentials submission
  channel (003, info), the preauthorization-list stub (004, info, mirrors
  R-PA-053), authorization-before-service (005, flag), inpatient admission
  notification + concurrent review (006, flag), the advanced-imaging
  utilization-management program (007, flag), expedited urgency (008, flag),
  site-of-care for outpatient surgery (009, flag), NDC on a J-code drug (010,
  info), step therapy / CenterWell Pharmacy (011, flag), the genetic /
  molecular lab-management program (012, flag), the Coverage Policy
  specialty / oncology-drug diagnosis (013, flag, Evolent / New Century
  Health oncology), retrospective justification (014, info), DME / home-health
  written order (015, flag), behavioral-health level-of-care via Humana
  Behavioral Health (016, flag), the National Transplant Network routing (017,
  flag), the experimental / investigational determination (018, flag), the
  appeal original-determination reference (019, info), and the out-of-network
  network-gap justification (020, info). Each self-gates on `bundle.payer ===
  'humana'` and vacuously passes on every other packet. The imaging /
  lab-management program is described generically rather than by its current
  vendor name, which collides with an AI-vendor substring barred from source
  by spec-v50 §3.6 (grep-check enforces this). New ledger source
  `humana-precert` anchored to Humana's public prior-authorization hub (all
  twenty rules map to it by prefix). Coverage is now 235 rules shipped (was
  215), 187 source-anchored (was 167), 20 sources (was 19), 0 orphans, 0 gaps.
  The golden fixtures re-seed deterministically (a new `humana-precert`
  fixture exercises the on-bucket path — 009 flag, 003 info; the other eleven
  gain +20 vacuous-pass findings each). Tests: +13 engine assertions (count
  235, the off-bucket loop, and fire/pass checks) and +1 classify assertion
  (Humana / CenterWell → `humana`; Humana Gold Plus / Humana MA → the MA
  bucket). Catalog count unchanged (255). View wave banner advanced to 52-11.
- 2026-06-02 — wave 52-10 (§4.5.10 Cigna commercial overlay, the full 20-rule
  `R-PA-CIGNA-NNN` family — the fourth named commercial overlay after Aetna,
  UnitedHealthcare, and Anthem). Extends the commercial overlays to the four
  largest commercial plans by national PA volume. Opens a `'cigna'` payer
  bucket in `lib/pa/payer.js` (placed after `'anthem'` and before the generic
  `'commercial'` fall-through). The bucket matches `cigna` / `evernorth`
  (Cigna's health-services brand, under which it runs Express Scripts /
  Accredo pharmacy and Evernorth Behavioral Health); a plain Cigna MA packet
  without an explicit "Medicare Advantage" string routes here, which is
  acceptable (the rules self-gate on requested services, not the line of
  business). The 20 rules mirror the Aetna / UHC / Anthem families so the four
  commercial overlays stay structurally parallel, with Cigna-specific routing
  names where Cigna uses them: coverage-criteria reference (001, flag),
  supporting clinical records (002, flag), the CignaforHCP / Availity
  submission channel (003, info), the precertification-list stub (004, info,
  mirrors R-PA-053), authorization-before-service (005, flag), inpatient
  admission notification + concurrent review (006, flag), the eviCore
  advanced-imaging program (007, flag), expedited urgency (008, flag),
  site-of-care for outpatient surgery (009, flag), NDC on a J-code drug (010,
  info), step therapy / Express Scripts (011, flag), the eviCore genetic /
  molecular testing program (012, flag), the Coverage Policy specialty-drug
  diagnosis (013, flag), retrospective justification (014, info), DME /
  home-health written order (015, flag), behavioral-health level-of-care via
  Evernorth (016, flag), the LifeSOURCE Transplant Network routing (017,
  flag), the experimental / investigational determination (018, flag), the
  appeal original-determination reference (019, info), and the out-of-network
  network-gap justification (020, info). Each self-gates on `bundle.payer ===
  'cigna'` and vacuously passes on every other packet. New ledger source
  `cigna-precert` anchored to Cigna's public prior-authorization /
  precertification hub (all twenty rules map to it by prefix). Coverage is now
  215 rules shipped (was 195), 167 source-anchored (was 147), 19 sources (was
  18), 0 orphans, 0 gaps. The golden fixtures re-seed deterministically (a new
  `cigna-precert` fixture exercises the on-bucket path — 009 flag, 003 info;
  the other ten gain +20 vacuous-pass findings each). Tests: +13 engine
  assertions (count 215, the off-bucket loop, and fire/pass checks) and +1
  classify assertion (Cigna / Evernorth → `cigna`; Cigna MA → the MA bucket).
  Catalog count unchanged (255). View wave banner advanced to 52-10.
- 2026-06-02 — wave 52-9 (§4.5.9 Anthem commercial overlay, the full 20-rule
  `R-PA-ANTHEM-NNN` family — the third named commercial overlay after Aetna
  and UnitedHealthcare). Completes the three planned commercial overlays.
  Opens an `'anthem'` payer bucket in `lib/pa/payer.js` (placed after
  `'uhc'` and before the generic `'commercial'` fall-through). The bucket
  matches only the definitively-Anthem anchors `anthem` / `elevance`;
  generic `blue cross` / `blue shield` stays in the commercial fall-through,
  because most Blue Cross Blue Shield plans are independent licensees rather
  than Anthem/Elevance. The 20 rules mirror the Aetna / UHC families so the
  three commercial overlays stay structurally parallel, with Anthem-specific
  routing names where Anthem uses them: medical-necessity criteria reference
  (001, flag), supporting clinical records (002, flag), the Availity /
  Interactive Care Reviewer submission channel (003, info), the prior-auth-
  list stub (004, info, mirrors R-PA-053), authorization-before-service
  (005, flag), inpatient admission notification + concurrent review (006,
  flag), the Carelon (AIM) advanced-imaging program (007, flag), expedited
  urgency (008, flag), site-of-care for outpatient surgery (009, flag), NDC
  on a J-code drug (010, info), step therapy / CarelonRx (011, flag), the
  Carelon genetic / molecular testing program (012, flag), the Clinical
  Criteria specialty-drug diagnosis (013, flag), retrospective justification
  (014, info), DME / home-health written order (015, flag), behavioral-
  health level-of-care (016, flag), the Blue Distinction Centers transplant
  routing (017, flag), the experimental / investigational determination
  (018, flag), the appeal original-determination reference (019, info), and
  the out-of-network network-gap justification (020, info). Each self-gates
  on `bundle.payer === 'anthem'` and vacuously passes on every other packet.
  New ledger source `anthem-precert` anchored to Anthem's public
  prior-authorization hub (all twenty rules map to it by prefix). Coverage
  is now 195 rules shipped (was 175), 147 source-anchored (was 127), 18
  sources (was 17), 0 orphans, 0 gaps. The golden fixtures re-seed
  deterministically (a new `anthem-precert` fixture exercises the on-bucket
  path — 009 flag, 003 info; the other nine gain +20 vacuous-pass findings
  each). Tests: +13 engine assertions (count 195, the off-bucket loop, and
  fire/pass checks) and +1 classify assertion (Anthem / Elevance → `anthem`;
  generic Blues → `commercial`; Anthem MA → the MA bucket). Catalog count
  unchanged (255). View wave banner advanced to 52-9.
- 2026-06-01 — wave 52-8 (§4.5.8 UnitedHealthcare commercial overlay, the
  full 20-rule `R-PA-UHC-NNN` family — the second named commercial overlay
  after Aetna). Opens a `'uhc'` payer bucket in `lib/pa/payer.js` (placed
  after `'aetna'` and before the generic `'commercial'` fall-through; the MA
  bucket still wins for `uhc medicare advantage`; UMR / Oxford route to
  `uhc`). The 20 rules mirror the Aetna families so the two commercial
  overlays stay structurally parallel: coverage-criteria reference (001,
  flag), supporting clinical records (002, flag), submission channel (003,
  info), the prior-auth-list stub (004, info, mirrors R-PA-053), advance
  notification (005, flag), inpatient admission notification + concurrent
  review (006, flag), the advanced-imaging notification program (007, flag),
  expedited urgency (008, flag), Site of Service for outpatient surgery (009,
  flag), NDC on a J-code drug (010, info), step therapy / OptumRx (011,
  flag), the Genetic and Molecular Testing program (012, flag), the Medical
  Benefit Drug Policy diagnosis (013, flag), retrospective justification
  (014, info), DME / home-health written order (015, flag), behavioral-health
  level-of-care via Optum / UBH (016, flag), the transplant Centers of
  Excellence routing (017, flag), the experimental / investigational /
  unproven determination (018, flag), the appeal original-determination
  reference (019, info), and the out-of-network network-gap justification
  (020, info). Each self-gates on `bundle.payer === 'uhc'` and vacuously
  passes on every other packet. New ledger source `uhc-precert` anchored to
  UHC's public prior-authorization / advance-notification hub (all twenty
  rules map to it by prefix). Coverage is now 175 rules shipped (was 155),
  127 source-anchored (was 107), 17 sources (was 16), 0 orphans, 0 gaps. The
  eight golden fixtures re-seed deterministically (totalRulesEvaluated 155 →
  175, +20 vacuous-pass findings each). Tests: +13 engine assertions (count
  155 → 175, the off-bucket loop, and fire/pass checks for 001/002/005/006/
  007/008/011/016/020) and +1 classify assertion (UHC commercial → `uhc`;
  UHC MA still → the MA bucket). Catalog count unchanged (255). View wave
  banner advanced to 52-8.
- 2026-06-01 — wave 52-7d (§4.5.7 Aetna commercial overlay, 16 → 20 of 20 —
  the Aetna set is complete). Adds the final five self-gating `R-PA-AETNA-NNN`
  rules, each anchored to Aetna's public precertification hub: a signed, dated
  written order for a DME / home-health request (R-PA-AETNA-016, flag), the
  National Medical Excellence / Institutes of Excellence transplant routing
  (017, flag), peer-reviewed evidence / CPB exception for an experimental or
  investigational service (018, flag), the original-determination reference on
  an appeal / reconsideration (019, info), and a network-gap / continuity-of-
  care justification on an out-of-network request (020, info). All five
  vacuously pass off the `aetna` bucket and on all eight pa-lint fixtures.

  No ledger/bucket change (all twenty Aetna rules map to the `aetna-precert`
  source by prefix). Coverage is now 155 rules shipped (was 150), 107
  source-anchored (was 102), 0 orphans, 0 gaps. The eight golden fixtures
  re-seed deterministically (totalRulesEvaluated 150 → 155, +5 vacuous-pass
  findings each). Tests: +9 engine sanity assertions (count 150 → 155, the
  off-bucket loop 15 → 20, and fire/pass checks for 016–020). View wave
  banner advanced to 52-7d.
- 2026-05-30 — wave 52-7c (§4.5.7 Aetna commercial overlay, 11 → 15 of ~20).
  Adds five more self-gating `R-PA-AETNA-NNN` rules anchored to named Aetna
  Clinical Policy Bulletins and the Outpatient Surgical Procedures policy:
  step-therapy prior-trial documentation for a drug request (R-PA-AETNA-011,
  flag), the bariatric CPB 0157 BMI + supervised-weight-management requirement
  (012, flag), the genetic CPB 0140 pre-test counseling + family-history
  requirement (013, flag), a retrospective-request justification (014, info),
  and the Outpatient Surgical Procedures site-of-service rationale for a
  hospital-setting elective surgery (015, info). All five vacuously pass off
  the `aetna` bucket.

  No ledger/bucket change (all fifteen Aetna rules map to the `aetna-precert`
  source by prefix). Coverage is now 150 rules shipped (was 145), 102
  source-anchored (was 97), 0 orphans, 0 gaps. A third golden fixture
  `aetna-drug` (specialty J-code request) demonstrates 011 + 010 firing; the
  `aetna-precert` fixture now also surfaces 015. All eight goldens re-seeded;
  e2e finding count 145 → 150. Tests: +9 engine sanity assertions (count
  145→150 plus per-rule checks). View wave banner advanced to 52-7c.
- 2026-05-30 — wave 52-7b (§4.5.7 Aetna commercial overlay, 6 → 10 of ~20).
  Adds five more self-gating `R-PA-AETNA-NNN` rules keyed to Aetna's public
  utilization-management surface: concurrent-review documentation for an
  inpatient request (R-PA-AETNA-006, flag), the site-of-care requirement for a
  hospital-outpatient MRI/CT (007, flag), a clinical-urgency justification on
  an expedited request (008, flag), objective evidence (visual field / photos /
  measurements) for procedures whose CPB requires it (009, flag), and the NDC
  on a physician-administered J-code drug request (010, info). All five
  vacuously pass off the `aetna` bucket, exactly like 001–005.

  No ledger change (the `aetna-precert` source's representative `rules`
  anchors already cover the family; all ten map to it by prefix). Coverage is
  now 145 rules shipped (was 140), 97 source-anchored (was 92), 0 orphans,
  0 gaps. A second golden fixture `aetna-imaging` (hospital-outpatient
  expedited MRI) demonstrates 007 + 008 firing; the `aetna-precert` fixture
  now also surfaces 006 (its POS-21 inpatient request carries no discharge
  plan). All seven goldens re-seeded; e2e finding count 140 → 145. Tests:
  +8 engine sanity assertions (count 140→145 plus per-rule checks). View wave
  banner advanced to 52-7b.
- 2026-05-30 — wave 52-7a (§4.5.7 commercial payer overlays open — Aetna,
  first 5 of ~20). Picks up the §9 wave plan's "first commercial payer
  overlays" now that the core (§4.5.1), CMS FFS / MA / Medicaid
  (§4.5.2–§4.5.4), specialty (§4.5.5), report (§4.6), and maintenance
  (§4.5.6) surfaces are all complete.

  `lib/pa/payer.js` gains a named `'aetna'` bucket, placed before the generic
  `'commercial'` fall-through (and after the MA bucket, so `aetna medicare
  advantage` still routes to MA). `lib/pa/rules.js` adds five self-gating
  `R-PA-AETNA-NNN` rules (§4.5.7): medical-necessity-criteria reference
  (CPB / CMS / MCG, flag), supporting clinical documentation attached (flag),
  submission channel noted (info), service-on-precert-list (info, an
  R-PA-053-style stub until the list is bundled), and a procedure-specific
  precertification questionnaire when one is required (flag, triggered by
  spinal-fusion / bariatric / spinal-cord-stimulator anchors). Each rule
  returns a vacuous pass on any non-Aetna packet, exactly like the CMS-FFS
  overlay. Every citation is anchored to Aetna's public precertification hub.

  `lib/pa/rule-sources.js` maps the `R-PA-AETNA-` prefix to a new ledger
  source `aetna-precert` (verified 2026-05-30); the ledger and the bundled
  `lib/pa/staleness-ledger.js` were regenerated. Coverage is now 16 sources,
  140 rules shipped (was 135), 92 source-anchored (was 87), 0 orphans,
  0 gaps.

  Determinism / goldens: every existing fixture gains five vacuously-passing
  Aetna findings, so the four prior goldens were re-seeded; a new
  `aetna-precert` fixture (an Aetna lumbar-fusion packet) demonstrates
  R-PA-AETNA-001/002 passing, 003 firing info, 004 vacuous, and 005 flagging
  a fusion request with no questionnaire response. Tests: +1 payer-detection
  test, +1 rule-sources assertion, and +6 engine assertions (count 135→140
  plus the overlay sanity checks); the unit suite stays green. View wave
  banner advanced to 52-7a.
- 2026-05-29 — wave 52-6j (§4.5.6 stale-source disabling — the engine half).
  Closes the last "Not yet built" item in `docs/pa-maintenance.md`: §4.5.6's
  "if the source URL 404s, the rule is set to `disabled` and the engine skips
  it; the audit trail explicitly says why." Wave 52-6i's refresh helper only
  *recommended* the disable; this wave wires the engine to act on it.

  A ledger source may now carry a `disabled` field (`true` or
  `{ since, reason }`). `disabledSourceMap(ledger)` (new, `lib/pa/staleness.js`,
  pure) normalizes those into a `Map sourceId -> { since, reason }`.
  `runEngine(bundle, rules, opts)` gains `opts.disabledSources`: before running
  a rule it checks the rule's per-rule `sources` (wave 52-6h) against that map
  and, on a hit, pushes a `status: "disabled"` finding (evidence null, note =
  source + since + reason + "will run again once the source is re-pointed")
  instead of calling `check`. `summarizeFindings` gains a `disabled` count;
  `report.js` adds a `disabledRules` array (ruleId + reason) to the audit
  trail; `docx.js` renders the disabled count in the executive summary and a
  "Disabled rules" subsection. `views/pa-lint.js` derives the disabled set from
  the bundled `PA_STALENESS_LEDGER` and passes it — a no-op today (the shipped
  ledger disables nothing) that wires the mechanism for a real 404.

  Determinism / no golden surprise: with no disabled sources the only output
  delta is `counts.disabled: 0` and `auditTrail.disabledRules: []`, so the four
  existing goldens were re-seeded to add exactly those two fields. A fifth
  fixture, `disabled-source` (a `disabledSources` field on the fixture lets
  `audit-pa` exercise the path without touching the shipped ledger), disables
  `cms-ncd-lcd` and its golden shows the 21 NCD/LCD CMS rules disabled while the
  4 IOM-anchored FFS rules and all core / overlay rules still run.

  Tests: +3 assertions in `test/unit/pa-engine.test.js` (anchored rule disabled
  and its check skipped; other-source and structural rules untouched; disabled
  count + empty-map no-op) and +2 in `test/unit/pa-staleness.test.js`
  (`disabledSourceMap` normalizes both forms; the shipped ledger disables
  nothing). Unit suite 2028 -> 2033; `audit-pa` now covers 5 fixtures.
  `docs/pa-maintenance.md` documents the disable workflow and its "Not yet
  built" list is now empty — spec-v52's §4.5.6 surface is complete. Lint
  (incl. `audit-pa`), the unit suite, a11y, the static build, and the PA +
  smoke Playwright specs are green. View wave banner advanced to 52-6j.
- 2026-05-29 — wave 52-6i (§4.5.6 / §8.2 `scripts/refresh-pa-rules.mjs`).
  Closes the last "Not yet built" item in `docs/pa-maintenance.md`: the
  maintainer refresh helper, unblocked by wave 52-6h's per-rule source
  metadata. It fetches every ledger `sources[].url`, reports the HTTP outcome
  and a content SHA-256, computes each source's staleness age, counts how many
  shipped rules depend on the source (via the `sources` field, so the report
  speaks in "this source backs 21 rules" rather than just the representative
  anchors), and prints a per-source recommendation (resolved → bump
  lastVerified; moved → re-point url; gone (404/410) → re-point or
  acknowledge/disable per §4.5.6; error → retry, never touch the ledger on a
  transient failure). It exits 0 when every source resolves, 1 when any is
  gone or errored.

  The script makes outbound network requests, so — consistent with §8.2
  ("not in CI's required path; it requires outbound network access") — it is
  NOT wired into `npm run lint` / `npm run test` and never runs in CI's
  offline build or the browser (spec-v50 §3.1 governs Sophie's runtime; this
  is a maintainer laptop tool, exposed as `npm run refresh:pa-rules`). Its
  report-building core (`classifyFetchOutcome`, `dependentRuleCounts`,
  `buildRefreshReport`, `formatReportText`, `sha256`) is pure and network-free;
  `main()` is gated behind direct invocation so importing the helpers makes no
  request.

  Tests: new `test/unit/pa-refresh.test.js` (10 assertions: hash stability,
  each outcome class incl. the never-silent missing-outcome case, dependent-
  rule tallying, report summary/age/dependents, all-resolve ok=true, and a
  guard that the shipped ledger maps cleanly through the report) using injected
  outcomes — no network. The unit suite is 2028 (was 2018). The §4.5.6
  *second* half (engine reading a per-rule `disabled` flag and skipping
  gone-source rules with an audit-trail note) is now the sole deferred item,
  documented in `docs/pa-maintenance.md`; the helper today *recommends* the
  disable and the maintainer acts. Lint (incl. `audit-pa`), the unit suite,
  a11y, and the static build are green. View wave banner advanced to 52-6i.
- 2026-05-29 — wave 52-6h (§4.5.6 structured per-rule source metadata +
  reverse coverage checks). Closes the data-side half of the one remaining
  "Not yet built" item in `docs/pa-maintenance.md`: the deferred
  `scripts/refresh-pa-rules.mjs` needs, per rule, the source URL(s) it must
  re-fetch, but "the rules currently carry free-text citations" — there was
  no machine-iterable rule → source map. Waves 52-6c/6d/6e each named this
  gap as deferred.

  New pure module `lib/pa/rule-sources.js` exports `ruleSourceIds(id)`: a
  total function from a rule id to the ledger source id(s) it is anchored to,
  or `[]` for a *structural* rule (a payer-agnostic completeness / heuristic
  check that consumes no external reference dataset). `rules.js` attaches the
  result as each rule's `sources` field at load. The assignments are
  deliberately low-judgement and honesty-preserving: the 12 core code-set
  rules are the exact inverse of the ledger's core-source `rules` arrays; the
  75 overlay rules map by id prefix to the single source backing their family;
  the CMS-FFS family's two sources are split by the citation each rule already
  carries (IOM Pub 100-08 program-integrity — SWO, proof-of-delivery, supplier
  PTAN — vs. NCD/LCD coverage). 87 of 135 rules are source-anchored; the other
  48 are structural. The field is build/maintenance plumbing: `engine.js`
  copies rule fields into findings explicitly (id, severity, description,
  citation, status, evidence, note), so `sources` never enters a finding, the
  report, or the golden fixtures — `audit-pa` is unchanged.

  `lib/pa/staleness.js` gains two pure helpers, both wired into
  `scripts/check-pa-staleness.mjs` (already in `npm run lint`):
  `findRuleSourceOrphans` (every source a rule claims must be a real ledger
  source) and `findLedgerCoverageGaps` (every ledger `source → rule` anchor
  must be reflected in that rule's own `sources`, so the two directions cannot
  drift). The clean line now also reports
  `87 source-anchored, 0 source orphans, 0 coverage gaps`.

  Tests: new `test/unit/pa-rule-sources.test.js` (7 assertions: core code-set
  mapping, structural rules, the CMS IOM/NCD-LCD split, overlay-by-prefix,
  totality + fresh-array, every shipped rule matches the map, and the
  CORE map is a superset of the ledger core anchors) + 5 new assertions in
  `test/unit/pa-staleness.test.js` for the two helpers and a shipped-ruleset
  both-directions guard; the unit suite is 2018 (was 2006). `refresh-pa-rules.mjs`
  itself stays deferred — it needs outbound network, which neither the browser
  nor CI's offline build performs. `docs/pa-maintenance.md` documents the
  metadata + checks and narrows its "Not yet built" entry accordingly. Lint
  (incl. `audit-pa`), the unit suite, a11y, and the static build are green.
  View wave banner advanced to 52-6h.
- 2026-05-29 — wave 52-6g (§4.3 / §8.1 PA runtime no-network spec).
  Ships the runtime proof of §4.3 ("the only network access during a
  session is the initial page load; after first paint there are zero
  outbound requests") and of Sophie's first commitment ([spec-v50](spec-v50.md)
  §3.1) that the packet never leaves the tab. The static side already
  existed (`check-commitments.mjs`, `grep-check.mjs`) and the generic
  runtime harness (`test/integration/no-network.spec.js`) covered a sample
  of numeric tiles, but the PA pipeline — the one surface that ingests PHI
  — had no runtime network assertion.

  `test/integration/pa-no-network.spec.js` mirrors that harness's
  tripwires (off-origin `request` listener, `navigator.sendBeacon` /
  `Image.src` patches, cookie check, storage-allowlist check) but drives
  the PA pipeline end-to-end: it drops a happy-path TXT packet plus a
  one-page PDF — the PDF forces the lazy `pdf.js` import (`/vendored/pdfjs/`),
  the single most likely place for an accidental off-origin fetch (a CDN
  worker, cmaps, standard fonts) — then serializes all three report
  flavors (DOCX, full JSON, redacted JSON) by clicking each download
  button. It asserts zero off-origin requests, zero beacon / image-pixel
  fires, an empty `document.cookie`, and only allowlisted storage keys
  (the PA tile writes none, §4.7). Chromium-only, consistent with the
  other `pa-lint-*` specs; the §8.1 unit suite covers the pure SHA-256
  path on every browser. No source change — the test confirms the posture
  the pipeline already had. View wave banner advanced to 52-6g.
- 2026-05-29 — wave 52-6f (§4.10 / §8.2 PA pipeline golden-fixture audit
  + §8.4 property tests). Builds the two determinism-enforcement surfaces
  §8 named but the report waves had not yet shipped.

  `scripts/audit-pa.mjs` (§8.2, wired into `npm run lint`, therefore the
  CI Lint step) runs the full deterministic pipeline (`buildBundle` →
  `runEngine` → `buildJsonReport`, no `generatedAt` so the output is
  byte-stable, §4.10) against every fixture under `test/fixtures/pa-lint/`
  and diffs the produced JSON report against the committed golden in
  `test/fixtures/pa-lint/expected/<name>.report.json`. Any rule, extractor,
  classifier, or staleness-ledger change that alters a report is caught;
  the maintainer re-seeds the goldens deliberately with
  `node scripts/audit-pa.mjs --update` (also exposed as `npm run audit:pa`).
  Four fixtures ship: `happy-path` (clean office-visit packet),
  `missing-npi` (R-PA-016 block fires), `bad-pos` (R-PA-013 block fires on
  POS 88, off the bundled CMS list), and `cms-dme` (Medicare-Part-B
  letterhead routes to `cms-medicare-ffs` so the §4.5.2 FFS overlay engages
  instead of vacuously passing).

  `test/unit/pa-property.test.js` (§8.4) verifies the four invariants as
  properties rather than snapshots: reorder-invariance, irrelevant-file
  invariance, double-run byte-identity, and redact idempotence (both the
  plain and findings-aware redact paths).

  §4.10 / §8.4 fix surfaced while writing property 1: the report was *not*
  invariant under input file order — `evidenceLedger` / `extractedData`
  echoed drop order, and rules that cite "the first matching document" in
  their evidence picked by drop order too, so reordering changed the report
  bytes. `buildBundle` now canonicalizes document order by content hash
  (sha256, then name as a stable tiebreak) right after building the doc
  records, so findings, the evidence ledger, and the extracted-data
  appendix are all order-invariant and identical files always sort
  identically regardless of how they were dropped. The in-tab document list
  now renders in that canonical order. No existing unit test depended on
  drop order (the order-indexing tests all use single-document or
  hand-built bundles).

  Tests: 5 new property assertions + the 4 golden fixtures; the unit suite
  is 2006 (was 2001). Lint (now including `audit-pa`), the unit suite,
  a11y, the static build, and the PA + smoke Playwright specs are green.
  View wave banner advanced to 52-6f.
- 2026-05-29 — wave 52-6e (§4.5.6 / §8.3 follow-up: ledger → ruleset
  coverage check). Closes a silent-drift gap in the dataset-staleness
  ledger: its per-source `rules` arrays named rule ids with nothing
  verifying those ids still ship. A renamed or retired rule (cf. the
  wave 52-2b id correction) would leave the ledger — and the deferred
  `scripts/refresh-pa-rules.mjs`, which will iterate exactly these ids —
  pointing at a dead reference.

  New pure helper `findLedgerRuleOrphans(ledger, shippedRuleIds)` in
  `lib/pa/staleness.js` returns every ledger-referenced rule id absent
  from the shipped set, in deterministic (source, then listed) order.
  `scripts/check-pa-staleness.mjs` (already in `npm run lint`) imports
  `STARTER_RULES` from `lib/pa/rules.js`, builds the shipped-id set, and
  exits 1 on the first orphan; the clean line now also reports
  `135 rules shipped, 0 ledger orphans`. The `rules` arrays remain the
  representative anchor rules per source (not an exhaustive map), so no
  reverse "every rule must have a source" check is added — that needs the
  per-rule structured source metadata §4.5.6 still defers with the refresh
  script.

  Tests: 4 new assertions in `test/unit/pa-staleness.test.js` (empty when
  all ship + Set accepted; each dead reference reported with its source in
  order; tolerates a source with no `rules`; and a guard that the shipped
  ledger has zero orphans against `STARTER_RULES`). `docs/pa-maintenance.md`
  documents the coverage check and corrects its "Not yet built" list — the
  in-tab report-audit-trail staleness item it still listed actually shipped
  in 52-6d. Lint, the unit suite, a11y, the static build, and the PA +
  smoke Playwright specs are green. View wave banner advanced to 52-6e.
- 2026-05-29 — wave 52-6d (§8.3 follow-up: per-source staleness in the
  in-tab report audit trail). Closes the first of the two §8.3 follow-ups
  that wave 52-6c explicitly deferred ("surfacing per-source staleness in
  the in-tab report audit trail (needs the ledger bundled into the shipped
  JS to honor no-network)").

  The canonical ledger stays `pa-staleness-ledger.json` (maintainer-edited).
  A new generator `scripts/build-pa-staleness-ledger.mjs` emits the
  importable, browser-bundleable module `lib/pa/staleness-ledger.js`
  (`export const PA_STALENESS_LEDGER`); `scripts/check-pa-staleness.mjs`
  (already in `npm run lint`) now also regenerates-and-diffs the module so
  CI fails if a maintainer edits the JSON without rebuilding. No runtime
  fetch and no new dependency — the module is plain JS, copied into `dist/`
  by the existing `lib/` copy step.

  `lib/pa/report.js` `auditTrail` gains a `datasetStaleness` block:
  per-source `{id, label, url, ruleFamily, lastVerified}` plus, only when
  the caller supplies `opts.generatedAt`, time-relative `{ageDays, state}`
  per source and an `evaluated` summary (`evaluatedAt / summary / worst /
  ok`) from `evaluateStaleness`. With no timestamp the block is the static
  ledger facts only, so the report stays byte-stable for golden tests and
  no `new Date()` enters the compute path (§4.10). `lib/pa/docx.js` renders
  the block as a "Dataset source staleness" subsection of the audit trail.
  `views/pa-lint.js` captures one `new Date().toISOString()` at
  report-download time (in the view, on a user click — out of the
  deterministic compute path) and threads it as `generatedAt`, which also
  fills the previously-empty cover-page / audit-trail "generated at" field.

  Tests: 3 new assertions in `test/unit/pa-report.test.js` (sources
  populated + static facts; no state without a timestamp / byte-stable;
  far-future timestamp -> every source `fail` + `ok: false`). Lint, the
  1997-test unit suite, a11y, the static build, and the PA + smoke
  Playwright specs are all green. View wave banner advanced to 52-6d.

  The second §8.3 follow-up (`scripts/refresh-pa-rules.mjs`, which needs
  outbound network + the §4.5.6 structured per-rule source metadata the JS
  rules do not yet carry) remains deferred and noted in
  `docs/pa-maintenance.md`.

  Homepage (out-of-wave, maintainer request 2026-05-29): the home `<h1>` +
  lede were rewritten to a count-free SEO elevator pitch ("Private
  healthcare calculators, built for the bedside ...") per the spec-v29
  nurse-first pivot. The catalog count is no longer carried in the visible
  tagline; `check-catalog-truth.mjs` drops the retired "home lede" surface
  and still enforces 255 across the remaining 13 surfaces (title, meta / OG
  / Twitter description + image-alt, hero search label, JSON-LD, README,
  package.json, parity ledger). A "pinned tools" homepage section was
  considered and declined: it would require persistent client storage,
  which spec-v50 §3.4 forbids and the spec-v8 §3.2/§5.2 smoke test actively
  guards (no Pin button, no `#pinned-section`). Browser bookmarks of the
  per-tool `/tools/<id>/` pages already provide the same affordance with
  zero storage.
- 2026-05-28 — wave 52-6c (§8.3 dataset-staleness CI). Adds the
  staleness ledger + the CI check that §8.3 calls for, closing the
  spec-v52 §8 CI surface for the report waves.

  Deliberate refinement of the spec's letter (same posture as 52-6b):
  §8.3 named the ledger `dkb-staleness-ack.yml`. Sophie ships zero
  runtime dependencies (spec-v10 §6); introducing a YAML parser for
  one config file is the wrong trade, so the ledger is JSON
  (`pa-staleness-ledger.json`, repo root). It enumerates the 15
  external source families the rules are anchored to (AMA CPT, CMS
  HCPCS / ICD-10-CM / POS / NCCI, NPPES, CMS NCD-LCD / IOM, CMS MA,
  Medicaid core, ACR AC, FDA labeling, ASA, DSM-5-TR, NCCN / ACMG),
  each with its rule ids, canonical URL, and `lastVerified` date.

  New modules: `lib/pa/staleness.js` (pure evaluator:
  `evaluateStaleness(ledger, now)` over the deterministic
  `lib/pa/date.js` UTC math; states fresh / warn / fail /
  acknowledged / invalid; an acknowledgment downgrades a stale source
  while the ack itself is current, and a stale ack stops masking),
  `scripts/check-pa-staleness.mjs` (CLI wired into `npm run lint`,
  therefore the CI Lint step). Policy window: warn at 90 days
  (printed, exit 0), fail at 365 days / unparseable date / abandoned
  ack (exit 1) -- this is §8.3's "fails (or warns, depending on the
  configured grace window)". `--strict` turns warnings into failures;
  `SOPHIEWELL_NOW=YYYY-MM-DD` pins the evaluation date for tests.

  The maintainer keeps CI green by re-verifying each source monthly
  (spec-v52 §1.3) and bumping `lastVerified`, or by acknowledging a
  known-stale source. Documented in the new `docs/pa-maintenance.md`
  (referenced by §8.2).

  Tests: new `test/unit/pa-staleness.test.js` (9 assertions: fresh /
  warn / fail boundaries, acknowledgment downgrade, stale-ack
  re-surfacing, invalid date, mixed-ledger summary, and a guard that
  the shipped ledger is green at ship time).

  Two §8.3 follow-ups are explicitly deferred and noted in
  `docs/pa-maintenance.md`: `scripts/refresh-pa-rules.mjs` (needs
  outbound network + the §4.5.6 structured per-rule source metadata,
  which the JS rules do not yet carry) and surfacing per-source
  staleness in the in-tab report audit trail (needs the ledger
  bundled into the shipped JS to honor no-network).
- 2026-05-28 — wave 52-6b (§4.6 DOCX report COMPLETE + §4.7
  redaction hardening). Ships the human-facing `.docx` flavor of
  the §4.6 report and the third download button, closing the §4.6
  report contract (JSON + DOCX, full + PHI-redacted).

  Deliberate refinement of the spec's letter: §4.6 / §5.2 named a
  vendored docx.js (~140 KB) packed in a worker. This wave instead
  ships a first-party, dependency-free OOXML writer
  (`lib/pa/docx.js`) for three reasons that better serve the spec's
  intent. (1) §8.1 requires `test/unit/pa-report.test.js` to assert
  "DOCX assembles without throwing" under `node --test`; the
  vendored mammoth.js / pdf.js bundles are browser-only and are
  never imported by the node runner, so a vendored browser docx.js
  could not be exercised the same way, whereas a module that runs
  identically in node and the browser can. (2) §4.10 demands
  byte-for-byte determinism; docx.js packs via jszip, which stamps
  each entry with the wall-clock time and is not reproducible, while
  this writer zeroes every DOS date/time (fixed 1980-01-01) so the
  same report yields byte-identical `.docx` bytes. (3) spec-v10 §6
  (dependency budget) and §4.9 (perf): the ~140 KB dependency and
  its lazy-load path are avoided entirely; the writer is a few
  hundred bytes of first-party code with zero runtime cost until the
  user clicks Download. The output is a minimal valid OOXML package
  (`[Content_Types].xml` + `_rels/.rels` + `word/document.xml`)
  stored uncompressed; system `unzip -t` confirms CRC integrity and
  Word / LibreOffice / Google Docs open it. The §5.1 `report.worker.js`
  and `vendored/docxjs/` surfaces are therefore not needed and not
  added.

  New module: `lib/pa/docx.js` (CRC-32 + store-method zip writer +
  OOXML paragraph rendering; `renderReportDocx(report)` returns a
  `Uint8Array`; `_internals` exposes `crc32` / `zipStore` for unit
  tests). `lib/pa/report.js` gains `buildDocxReport` and
  `buildRedactedDocxReport`, both rendering the already-deterministic
  JSON report object through the writer.

  §4.7 hardening (fixes a PHI leak surfaced by the new redacted-DOCX
  test): wave 52-6a's `redactBundle({redactFindings:true})` masked
  finding evidence / note strings by pattern only, so a rule that
  quoted a raw extracted value back without a label (e.g.
  `Found "Jane Q Doe" in doc.txt`) leaked the name into both the
  redacted JSON and redacted DOCX reports. `redactBundle` now also
  scrubs the literal PHI values the extractor pulled
  (`patientName` / `dob` / `memberId` / `ssns` / `tins`,
  longest-first) out of evidence / note before pattern redaction.
  This fix lands in the shared `lib/pa/redact.js`, so both report
  flavors are covered.

  View wiring: the `.pa-downloads` group leads with a third button,
  "Download report (.docx)", ahead of the two existing JSON buttons;
  it builds the DOCX from the in-memory bundle and writes a Blob via
  `URL.createObjectURL`. No network call. A shared `triggerDownload`
  helper now backs all three buttons.

  Tests: new `test/unit/pa-docx.test.js` (7 assertions: CRC-32
  check value, zip signatures, docx magic, byte-determinism, text
  embedding, XML escaping, empty-report safety); 3 new DOCX
  assertions in `test/unit/pa-report.test.js`; 1 new literal-scrub
  regression in `test/unit/pa-redact.test.js`. The Playwright
  happy-path is unchanged (still 135 rules). View wave banner
  advanced to 52-6b.

  Wave 52-6c will add the §8.3 dataset-staleness CI.
- 2026-05-28 — wave 52-6a (§4.6 JSON report + §4.7 PHI redaction
  opens). Ships the JSON half of the §4.6 contract plus the §4.7
  PHI redaction module. The DOCX flavor lands in wave 52-6b
  alongside the vendored docx.js.

  New modules: `lib/pa/redact.js` (deterministic PHI masking --
  Patient / Name / DOB / Member ID / Subscriber ID / MRN / Chart
  Number / Address / SSN / phone / email; labeled patterns keep
  the label and replace the value, free-text patterns redact in
  full; idempotent), `lib/pa/report.js` (the six §4.6 sections:
  coverPage / executiveSummary / findings / evidenceLedger /
  extractedData / auditTrail; per-rule remediation hints by
  rule-id prefix; deterministic -- no `Date.now()`, no random,
  no fetch; same `bundle` + `findings` -> byte-identical JSON).

  `redactBundle` accepts an optional `{redactFindings: true}` to
  redact PHI patterns in evidence + note strings; it hard-redacts
  extract-block PHI fields (`patientName`, `dob`, `memberId`,
  `ssns`, `tins`, `serviceDates`, `dates`) via a per-field
  allowlist so raw values without labels still get masked, while
  structural fields (CPT / ICD-10 / POS / NPI / cpts / icd10 /
  pos / npis) pass through unchanged since they are not PHI.

  View wiring: the findings panel now appends a `.pa-downloads`
  group with two `<button>` elements -- "Download report (.json)"
  and "Download PHI-redacted report (.json)". Each click
  serializes the in-memory bundle + findings, builds the JSON
  report (full or redacted), wraps it in a Blob via
  `URL.createObjectURL`, and triggers a same-origin download.
  No network call.

  Determinism guarantees (§4.10) preserved: the report builder
  accepts an optional caller-supplied `generatedAt` ISO string;
  when omitted the field is `null` so byte-for-byte equality
  holds across runs (golden-test friendly).

  19 new unit assertions across `test/unit/pa-redact.test.js`
  (9) and `test/unit/pa-report.test.js` (10). Total PA unit suite:
  197 assertions. The Playwright happy-path is unchanged (still
  135 rules). View wave banner advanced to 52-6a.

  Wave 52-6b will land the DOCX report (vendored docx.js, ~140 KB
  gzipped, MIT) and a third download button; wave 52-6c will add
  the §8.3 dataset-staleness CI.
- 2026-05-28 — wave 52-5e (§4.5.5 genetic-testing overlay COMPLETE:
  closes §4.5.5 + §4.5). Final 5 specialty rules triggered by AMA
  molecular-pathology CPT (81105-81512, simplified to 81xxx):
  R-PA-GEN-001 (family-history / pedigree / familial anchor per
  NCCN BRCA / hereditary-cancer criteria, flag), R-PA-GEN-002
  (pre-test / post-test genetic-counseling anchor per ACMG / NSGC
  guidelines, flag), R-PA-GEN-003 (panel-scope rationale -- why
  single-gene vs focused vs comprehensive vs WES vs WGS is
  appropriate -- documented, flag), R-PA-GEN-004 (personal clinical
  indication: either an extracted ICD-10 dx in the packet OR a
  clinical-indication anchor, flag), R-PA-GEN-005 (genetic-specific
  informed consent covering GINA / incidental findings / family
  implications, info).

  New helper `collectGeneticTestingCpts(bundle)` in `lib/pa/rules.js`
  uses the compact `/^81\d{3}$/` filter for AMA Molecular Pathology
  Tier 1 + Tier 2 + Genomic Sequencing Procedures. PLA proprietary
  lab codes (0001U-0999U) are intentionally NOT consumed here --
  the wave-52-1e CPT extractor doesn't match the 4-digit-plus-U
  form, so genetic-test trigger relies on the 81xxx CPTs the
  extractor already produces.

  R-PA-GEN-004's dual-acceptance logic (either an ICD-10 dx OR a
  clinical-indication anchor satisfies the rule) follows the
  R-PA-RAD-004 pattern (either a clinical-note doc role OR a
  clinical-evaluation anchor satisfies). The evidence string
  records which branch fired so the audit trail distinguishes
  structural-signal pass from anchor pass.

  6 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
  unit suite: 178 assertions. The Playwright happy-path now asserts
  135 rules render. View wave banner advanced to 52-5e and now
  reads "complete §4.5.5 specialty overlays (25 rules: radiology +
  infusion + surgery + behavioral health + genetic testing)".

  This closes spec-v52 §4.5.5 AND the complete §4.5 ruleset: 60
  §4.5.1 core + 25 §4.5.2 CMS FFS + 15 §4.5.3 CMS MA + 10 §4.5.4
  Medicaid state-agnostic + 25 §4.5.5 specialty = 135 rules. Wave
  52-6 picks up with the §4.6 DOCX report (cover page + executive
  summary + findings + evidence ledger + extracted-data appendix +
  audit trail), the §4.7 PHI redaction, and §8.3 dataset-staleness
  CI.
- 2026-05-28 — wave 52-5d (§4.5.5 behavioral-health specialty overlay,
  5 of 25). Adds five behavioral-health rules triggered by an AMA
  psychiatric CPT (90785-90899 psychotherapy, 96130-96139 psych
  testing) OR an ICD-10 F-code (F00-F99 mental and behavioral
  disorders): R-PA-BH-001 (BH packet carries an ICD-10 F-code AND
  a DSM-5-TR / diagnostic-criteria reference, flag), R-PA-BH-002
  (treatment plan with measurable / time-bound goals, flag),
  R-PA-BH-003 (step-up of care -- outpatient -> IOP -> PHP ->
  residential -> inpatient -- requires a prior-level-of-care
  anchor per ASAM / LOCUS, flag), R-PA-BH-004 (risk assessment
  covering suicidal / homicidal ideation / self-harm per Joint
  Commission NPSG, flag), R-PA-BH-005 (SUD packets requesting
  medication-assisted treatment reference DEA X-waiver / OTP /
  induction-maintenance phase, info).

  New helper `collectBehavioralHealthSignals(bundle)` in
  `lib/pa/rules.js` returns the BH CPTs, the ICD-10 F-codes, and
  a `triggered` boolean -- ALL five BH rules consume the same
  signal so the trigger logic stays in one place. Specialty rules
  apply across every payer once the trigger fires (no
  `bundle.payer` self-gate).

  R-PA-BH-005's two-stage trigger -- SUD ICD-10 (F10-F19) OR MAT
  keyword -- is the first specialty rule to combine structural
  code-range filtering AND a keyword fallback in the gate; the
  rule fires when either signal is present, but vacuously passes
  on a non-SUD / non-MAT packet.

  6 new unit assertions in `test/unit/pa-engine.test.js` (one
  aggregate vacuous-pass guard plus a fires-when-it-should test
  per new rule). Total PA unit suite: 172 assertions. The
  Playwright happy-path now asserts 130 rules render. View wave
  banner advanced to 52-5d.

  Wave 52-5e will close §4.5.5 with the genetic-testing overlay
  (R-PA-GEN-NNN, 5 rules) -- family history, genetic counseling,
  test specificity matches indication. That will close the
  complete spec-v52 §4.5 ruleset at 135 rules.
- 2026-05-28 — wave 52-5c (§4.5.5 surgery specialty overlay, 5 of 25).
  Adds five surgery rules triggered by an AMA Surgery-category CPT
  (10004-69990): R-PA-SURG-001 (conservative-management / non-
  operative trial documented; emergent-surgery anchor bypasses with
  a "does not apply" branch, flag), R-PA-SURG-002 (imaging
  supporting surgical indication -- attached imaging-report doc OR
  imaging-findings anchor, flag), R-PA-SURG-003 (ASA Physical
  Status >= 3 requires pre-op medical / anesthesia clearance,
  flag), R-PA-SURG-004 (ASA classification 1-5 documented on the
  request, flag), R-PA-SURG-005 (informed-consent anchor present;
  R-PA-059 covers date-vs-service-date ordering across the packet,
  flag).

  New helper `collectSurgeryCpts(bundle)` in `lib/pa/rules.js`
  collects surgery-category CPTs via `/^[1-6]\d{4}$/`, mirroring
  the radiology / J-code collectors. E/M codes like 99213 (9xxxx)
  and radiology codes like 70551 (7xxxx) fall outside the trigger
  range so the HAPPY_PACKET fixture continues to all-pass.

  R-PA-SURG-001 reuses the wave-52-5a R-PA-RAD-002 emergent-
  exception pattern: the rule self-bypasses with "Emergent /
  urgent surgical anchor present; rule does not apply" rather
  than vacuously passing, so the audit trail distinguishes the
  two branches. R-PA-SURG-003 is the fifth dual-context rule
  (ASA >= 3 trigger AND clearance anchor); R-PA-SURG-005
  intentionally narrows R-PA-059 (core consent date check) to
  the surgery specialty section so consent issues surface in the
  specialty audit cluster.

  6 new unit assertions in `test/unit/pa-engine.test.js` (one
  aggregate vacuous-pass guard plus a fires-when-it-should test
  per new rule). R-PA-SURG-001's test explicitly strips
  HAPPY_TEXT's pre-existing "Step therapy: trial of lisinopril"
  line so the "trial of" anchor doesn't pre-satisfy the
  conservative-management check. Total PA unit suite: 166
  assertions. The Playwright happy-path now asserts 125 rules
  render. View wave banner advanced to 52-5c.

  Wave 52-5d will continue §4.5.5 with the behavioral-health
  overlay (R-PA-BH-NNN, 5 rules) -- DSM-5-TR diagnosis,
  treatment plan with measurable goals, prior level of care.
- 2026-05-28 — wave 52-5b (§4.5.5 infusion / specialty-drug overlay,
  5 of 25). Adds five infusion / specialty-drug rules triggered by
  J-code (HCPCS Level II J####) presence: R-PA-INF-001 (J-code +
  NDC documented; generalizes the wave-52-4b R-PA-MCD-006 Medicaid
  rule to all payers, flag), R-PA-INF-002 (weight-based dose
  calculation shown when dosing is per kg -- weight + dose-calc
  anchor both required, flag), R-PA-INF-003 (site-of-care indicator:
  home / clinic / office / infusion center / hospital outpatient,
  flag), R-PA-INF-004 (FDA-approved indication / NCCN-compendia
  citation for the diagnosis, flag), R-PA-INF-005 (premedication /
  monitoring plan when the drug carries infusion-reaction risk --
  rituximab / infliximab / IV iron / taxanes / cetuximab /
  trastuzumab, info).

  New helper `collectJCodes(bundle)` in `lib/pa/rules.js` extracts
  J-codes via `/^J\d{4}$/`, mirroring the radiology / MRI
  collectors from wave 52-5a. Like the radiology overlay, these
  rules apply across every payer once the J-code trigger fires.
  R-PA-INF-002 is the fourth dual-anchor rule (weight AND dose
  calculation) and reuses the wave-52-1h `extract.weight`
  extractor; R-PA-INF-005's risk-trigger anchor set names the
  drugs most commonly flagged for infusion-reaction premedication.

  When no J-code is in the requested-procedures list each rule
  vacuously passes, so the HAPPY_PACKET fixture continues to
  all-pass without modification.

  6 new unit assertions in `test/unit/pa-engine.test.js` (one
  aggregate vacuous-pass guard plus a fires-when-it-should test
  per new rule). Total PA unit suite: 160 assertions. The Playwright
  happy-path now asserts 120 rules render. View wave banner
  advanced to 52-5b.

  Wave 52-5c will continue §4.5.5 with the surgery overlay
  (R-PA-SURG-NNN, 5 rules) -- conservative-management trial,
  imaging support, anesthesia clearance for ASA >= 3.
- 2026-05-28 — wave 52-5a (§4.5.5 specialty overlays open: radiology,
  5 of 25). Opens spec-v52 §4.5.5 with five radiology / advanced-
  imaging rules: R-PA-RAD-001 (ACR Appropriateness Criteria
  reference present, info), R-PA-RAD-002 (non-emergent MRI requires
  a conservative-management trial anchor; emergent / red-flag
  exception bypasses, flag), R-PA-RAD-003 (contrast study requires
  contrast-allergy review AND renal-function (eGFR / SCr / CrCl)
  anchors, flag), R-PA-RAD-004 (radiology procedure requires an
  attached clinical-note document or clinical-evaluation anchor,
  flag), R-PA-RAD-005 (pediatric imaging requires an ALARA /
  dose-reduction anchor, info).

  Specialty rules differ from payer overlays: they do NOT self-gate
  on `bundle.payer` -- they apply across every payer once the
  procedure trigger is met. Two new helpers in `lib/pa/rules.js`
  -- `collectRadiologyCpts(bundle)` (CPT regex `/^7\d{4}$/` for
  the AMA Radiology category 70010-79999) and `collectMriCpts(bundle)`
  (compact prefix-match for the common MRI subranges 70551-70559 /
  71550-71552 / 72141-72158 / 72195-72197 / 73218-73223 / 73718-
  73723 / 74181-74183) -- supply the structural triggers. When no
  imaging CPT is in the requested-procedures list each rule
  vacuously passes, so the HAPPY_PACKET fixture (which requests
  only 99213) continues to all-pass without modification despite
  the fixture's imaging-report attachment.

  R-PA-RAD-002's emergent-exception branch is the first specialty
  rule to declare itself "does not apply" rather than vacuously
  satisfied -- the evidence string reads "Emergent / red-flag
  anchor present; rule does not apply" so the audit trail
  distinguishes payer-bypass from trigger-absent. R-PA-RAD-003 is
  the third dual-anchor rule (allergy AND renal-function).

  6 new unit assertions in `test/unit/pa-engine.test.js` (one
  aggregate vacuous-pass guard, plus a fires-when-it-should test
  for RAD-001 / RAD-002 / RAD-003 / RAD-005). Total PA unit suite:
  154 assertions. The Playwright happy-path now asserts 115 rules
  render. View wave banner advanced to 52-5a.

  Wave 52-5b will continue §4.5.5 with the infusion / specialty-
  drug overlay (R-PA-INF-NNN, 5 rules).
- 2026-05-28 — wave 52-4b (Medicaid state-agnostic core COMPLETE:
  5 -> 10 of 10; closes §4.5.4). Final 5 §4.5.4 rules: R-PA-MCD-006
  (J-code physician-administered drug requires NDC per Section
  1927(a)(7) of the Social Security Act, flag), R-PA-MCD-007
  (dental service requires adult-vs-pediatric / EPSDT-vs-state-
  optional coverage indicator, flag), R-PA-MCD-008 (non-emergency
  medical transportation requires trip-purpose + appointment-date
  anchor per 42 CFR §431.53, flag), R-PA-MCD-009 (behavioral-health
  service requires carve-out / integrated-BH indicator since many
  states carve BH to PIHP / BHO, info), R-PA-MCD-010 (outpatient
  prescription drug requires MDRP / labeler-agreement / participating-
  manufacturer indicator per Section 1927, info).

  R-PA-MCD-006 is the third overlay rule to consume HCPCS Level II
  codes via regex (`/^J\d{4}$/`), alongside R-PA-CMS-017's L-codes
  and R-PA-CMS-026's cataract-surgery range. It also accepts NDC
  patterns in 5-4-2 / 5-3-2 / 4-4-2 hyphenated form or 11-digit run.

  Each rule self-gates on `bundle.payer === 'medicaid'` and again
  on its context anchor (J-code / dental / NEMT / BH / Rx). The
  HAPPY_PACKET fixture continues to all-pass without modification.

  5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
  unit suite: 148 assertions. The Playwright happy-path now asserts
  110 rules render. View wave banner advanced to 52-4b and now
  reads "complete §4.5.4 Medicaid state-agnostic core (10 rules)".

  This closes spec-v52 §4.5.4 (the Medicaid state-agnostic core)
  AND closes the planned wave 52-2 of the spec (§4.5.2 + §4.5.3 +
  §4.5.4 overlays). The complete payer-overlay surface is now
  shipped: 60 §4.5.1 core + 25 §4.5.2 CMS FFS + 15 §4.5.3 CMS MA
  + 10 §4.5.4 Medicaid = 110 rules. Wave 52-3 of the spec (the
  §4.5.5 specialty overlays -- 25 rules across imaging /
  infusion / surgery / behavioral / genetic) picks up next.
- 2026-05-28 — wave 52-4a (Medicaid state-agnostic core opens:
  first 5 of 10). Opens spec-v52 §4.5.4 with the cross-state
  intersection rules: R-PA-MCD-001 (state Medicaid member-ID /
  CIN / recipient-ID line present, block), R-PA-MCD-002 (pediatric
  Medicaid patient under 21 requires an EPSDT / well-child /
  periodic-screening anchor when seeking non-routine services,
  flag), R-PA-MCD-003 (Medicaid eligibility-window / verification
  anchor present for the service date, flag), R-PA-MCD-004
  (state-Medicaid medical-necessity / state-plan reference, flag),
  R-PA-MCD-005 (Managed Care Organization vs FFS Medicaid routing
  indicator, flag).

  Each Medicaid rule self-gates on `bundle.payer === 'medicaid'`
  and, where applicable, on a context anchor (pediatric for
  EPSDT). The HAPPY_PACKET fixture continues to all-pass without
  modification.

  R-PA-MCD-001 reuses the wave-52-1f `extract.memberId` extractor
  so the Medicaid overlay introduces zero new extractors. The
  rule is distinct from the core R-PA-003 (member-ID presence
  anywhere) -- MCD-001 ties the existence of a member-ID to the
  Medicaid-payer-bucket detection, so a Medicaid packet without
  a recipient ID surfaces as a Medicaid-specific block
  alongside the core block.

  6 new unit assertions in `test/unit/pa-engine.test.js` (one
  aggregate guard that all five new rules vacuously pass on a
  non-Medicaid packet, plus a fires-when-it-should test per new
  rule). Total PA unit suite: 143 assertions. The Playwright
  happy-path now asserts 105 rules render. View wave banner
  advanced to 52-4a.

  Wave 52-4b will close §4.5.4 with the final 5 Medicaid rules
  (NDC for J-codes, dental policy under Medicaid, transportation
  benefits, behavioral-health carve-out, drug rebate program).
- 2026-05-28 — wave 52-3c (CMS Medicare Advantage overlay COMPLETE:
  10 -> 15 of 15; closes §4.5.3). Final five §4.5.3 rules:
  R-PA-MA-011 (organization-determination type indicator -- pre-
  service / concurrent / payment -- so MA timeliness rules apply
  correctly, info), R-PA-MA-012 (expedited review requires a
  treating-clinician clinical-urgency / serious-jeopardy
  attestation per CMS expedited-determination rules, flag),
  R-PA-MA-013 (transition supply for new enrollees requires a
  continuity-of-care anchor, flag), R-PA-MA-014 (hospice-related
  service on an MA packet requires a hospice-election indicator
  -- elected / not elected / revoked -- since hospice services
  revert to Original Medicare, flag), R-PA-MA-015 (C-SNP / I-SNP
  packets require a qualifying chronic-condition diagnosis or
  institutional-residence anchor, flag).

  Each rule self-gates on `bundle.payer === 'cms-medicare-advantage'`
  and again on a context anchor (expedited / transition / hospice /
  SNP-specific). R-PA-MA-015's qualifier-anchor set covers both the
  C-SNP chronic conditions (diabetes / CHF / ESRD / dementia /
  HIV/AIDS / COPD) and the I-SNP institutional-residence anchors
  (SNF resident / long-term care facility), so one rule serves both
  SNP variants.

  The R-PA-MA-015 unit test strips HAPPY_TEXT's pre-existing
  "Dx: I10 essential hypertension" and "Step therapy: trial of
  lisinopril..." lines so neither "diabetes" nor any other
  qualifier anchor pre-satisfies the rule.

  5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
  unit suite: 137 assertions. The Playwright happy-path now asserts
  100 rules render. View wave banner advanced to 52-3c and now
  reads "complete §4.5.3 CMS Medicare Advantage overlay (15 rules)".

  This closes spec-v52 §4.5.3 (the CMS Medicare Advantage overlay).
  Wave 52-4 picks up with the §4.5.4 Medicaid state-agnostic core
  (10 rules).
- 2026-05-28 — wave 52-3b (CMS Medicare Advantage overlay: 5 -> 10
  of 15). Adds five more §4.5.3 rules covering drug-coverage path,
  D-SNP coordination, supplemental benefits, Part B step therapy,
  and inpatient two-midnight: R-PA-MA-006 (MA drug request must
  indicate Part B vs Part D coverage path, flag), R-PA-MA-007
  (D-SNP packets must carry state-Medicaid plan / member-ID info,
  flag), R-PA-MA-008 (supplemental benefit -- dental / vision /
  hearing -- under Evidence of Coverage, info), R-PA-MA-009
  (Part B drug under step therapy requires prior-trial / failure
  documentation per 2019 CMS final rule, flag), R-PA-MA-010
  (inpatient admission requires two-midnight expectation or short-
  stay criteria per 2024 CMS extension to MA plans, flag).

  Each MA overlay rule self-gates on `bundle.payer ===
  'cms-medicare-advantage'` and again on a context anchor
  (drug-request / D-SNP / dental-vision-hearing / Part B + step
  therapy / inpatient admission). The HAPPY_PACKET fixture
  continues to all-pass without modification; the test for
  R-PA-MA-009 explicitly strips HAPPY_TEXT's pre-existing
  "Step therapy: trial of lisinopril..." line so the compliance
  anchor isn't pre-satisfied.

  No new extractors. R-PA-MA-009 reuses the same step-therapy /
  trial-of anchor set the R-PA-029 / R-PA-030 core rules use; the
  MA Part B distinction is the only piece that's MA-specific.

  5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
  unit suite: 132 assertions. The Playwright happy-path now asserts
  95 rules render. View wave banner advanced to 52-3b.

  Wave 52-3c will close §4.5.3 with the final 5 MA rules
  (organization determination / expedited review / continuity-of-care
  in transition / hospice-revocation indicator / SNP eligibility),
  then open §4.5.4 Medicaid state-agnostic core.
- 2026-05-28 — wave 52-3a (CMS Medicare Advantage overlay opens:
  first 5 of 15). Opens spec-v52 §4.5.3 with five rules covering
  the additional documentation MA plans request beyond FFS:
  R-PA-MA-001 (HMO PCP referral for specialist services, block),
  R-PA-MA-002 (in-network confirmation OR OON-exception anchor,
  flag), R-PA-MA-003 (gatekeepered plan requires 2 distinct
  Luhn-valid NPIs so ordering PCP and servicing specialist are
  separable, flag), R-PA-MA-004 (plan name + member-ID format
  both present so the payer can route the PA to the correct plan
  unit, flag), R-PA-MA-005 (service-location / service-area
  anchor, info; v52-3b+ will tie this to bundled CMS plan-service-
  area files when those land).

  Each MA overlay rule self-gates on `bundle.payer ===
  'cms-medicare-advantage'` and, where applicable, on a plan-type
  anchor (HMO / gatekeepered) so non-HMO MA packets bypass the
  HMO-specific rules. The HAPPY_PACKET fixture continues to
  all-pass without modification.

  R-PA-MA-003 reuses the wave-52-1e `extract.npis` array and the
  wave-52-2a self-gating pattern; R-PA-MA-004 reuses the
  wave-52-1f `extract.memberId` extractor so the MA overlay
  introduces zero new extractors.

  6 new unit assertions in `test/unit/pa-engine.test.js` (one
  aggregate guard that all five new rules vacuously pass on a
  non-MA packet, plus a fires-when-it-should test per new rule).
  Total PA unit suite: 127 assertions. The Playwright happy-path
  now asserts 90 rules render. View wave banner advanced to 52-3a.

  Wave 52-3b will continue with five more §4.5.3 MA rules
  (Part B prescription drug indicator, dual-eligible / D-SNP
  Medicaid coordination, supplemental benefit gating, etc.).
- 2026-05-28 — wave 52-2e (CMS Medicare FFS overlay COMPLETE:
  20 -> 25 of 25; closes §4.5.2). Adds the final five DME / supply
  rules: R-PA-CMS-022 (external infusion pump covered indication +
  drug, flag, LCD L33794), R-PA-CMS-023 (ostomy supplies ostomy
  type + quantity, flag, LCD L33828), R-PA-CMS-024 (urinary catheter
  permanent-incontinence / retention diagnosis, flag, LCD L33803),
  R-PA-CMS-025 (surgical dressings wound surface area + dressing-
  change frequency, flag, LCD L33831), R-PA-CMS-026 (post-cataract
  refractive lenses surgery anchor + cataract CPT 66830-66999,
  flag, NCD 80.4).

  R-PA-CMS-026 is the second overlay rule to consume structural CPT
  codes via a regex filter (cataract-surgery range 66830-66999),
  alongside R-PA-CMS-017's L-code orthotic check. R-PA-CMS-023
  ties into the wave-52-1f `extract.quantity` extractor so the LCD
  L33828 monthly-utilization gate has a structural quantity to
  reference.

  Each rule self-gates on `bundle.payer === 'cms-medicare-ffs'` and
  again on its device-category anchor. The HAPPY_PACKET fixture
  continues to all-pass without modification.

  5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
  unit suite: 121 assertions. The Playwright happy-path now asserts
  85 rules render. View wave banner advanced to 52-2e and now
  reads "complete §4.5.2 CMS Medicare FFS overlay (25 rules)".

  This closes spec-v52 §4.5.2 (the CMS Medicare Fee-for-Service
  overlay). Wave 52-3 picks up with the §4.5.3 CMS Medicare
  Advantage overlay (15 rules) and the §4.5.4 Medicaid
  state-agnostic core (10 rules).
- 2026-05-28 — wave 52-2d (CMS Medicare FFS overlay: 15 -> 20 of 25)
  shipped. Adds five more §4.5.2 DME-category rules: R-PA-CMS-017
  (orthotics: covered condition + L-code present, flag, LCD L33686),
  R-PA-CMS-018 (continuous glucose monitor: insulin therapy AND
  frequent self-monitoring, flag, LCD L33822), R-PA-CMS-019
  (post-transplant immunosuppressives: Medicare-covered transplant
  organ documented, flag), R-PA-CMS-020 (parenteral nutrition:
  GI-tract failure AND caloric requirements, flag, LCD L33799),
  R-PA-CMS-021 (lymphedema pneumatic compression pump: lymphedema /
  CVI dx AND failed conservative therapy, flag, LCD L33829).

  R-PA-CMS-017 is the first overlay rule to consume HCPCS Level II
  L-codes from the existing `extract.cpts` array via a regex filter
  (`/^L\d{4}$/`), so the orthotic-device family ties to a structural
  signal rather than free-text anchors. R-PA-CMS-018 / R-PA-CMS-020
  / R-PA-CMS-021 are dual-anchor rules following the wave-52-2c
  pattern.

  Each rule self-gates on `bundle.payer === 'cms-medicare-ffs'` and
  again on its device-category anchor. The HAPPY_PACKET fixture
  continues to all-pass without modification.

  5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
  unit suite: 116 assertions. The Playwright happy-path now asserts
  80 rules render. View wave banner advanced to 52-2d.

  Wave 52-2e will close out §4.5.2 with the final 5 rules
  (intermittent / external infusion pumps, ostomy supplies, urinary
  catheters, surgical dressings, refractive lenses post-cataract)
  and then open §4.5.3 CMS Medicare Advantage.
- 2026-05-28 — wave 52-2c (CMS Medicare FFS overlay: 10 -> 15 of 25)
  shipped. Adds five DME-category rules per §4.5.2: R-PA-CMS-012
  (enteral nutrition inability-to-ingest / projected duration, flag,
  LCD L33783), R-PA-CMS-013 (nebulizer covered obstructive-pulmonary
  diagnosis, flag, LCD L33370), R-PA-CMS-014 (TENS chronic intractable
  pain > 3 months plus failed conventional therapy, block, NCD 160.13
  / LCD L33802), R-PA-CMS-015 (NPWT wound type/size + failed standard
  wound care, flag, LCD L33821), R-PA-CMS-016 (lower-limb prosthesis
  K-level / functional rehab potential, flag, LCD L33787).

  Each rule self-gates on `bundle.payer === 'cms-medicare-ffs'` and
  again on its device-category anchor (enteral / nebulizer / TENS /
  NPWT / lower-limb prosthesis). The HAPPY_PACKET fixture still
  all-passes without modification.

  R-PA-CMS-014 is the first overlay rule to require TWO independent
  anchors (chronic-pain AND failed-conventional-therapy) -- both
  must be present for the rule to pass; either alone trips a block
  with a specific note pointing at the missing half of the NCD 160.13
  requirement. R-PA-CMS-015 follows the same dual-anchor pattern
  (covered wound type AND failed standard wound care).

  5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
  unit suite: 111 assertions. The Playwright happy-path now asserts
  75 rules render. View wave banner advanced to 52-2c.

  Wave 52-2d will finish the §4.5.2 overlay's remaining 10 rules
  (orthotics / glucose monitors / immunosuppressives / parenteral
  nutrition / lymphedema-pump etc.) or open §4.5.3 CMS Medicare
  Advantage.
- 2026-05-28 — wave 52-2b (CMS Medicare FFS overlay: 5 -> 10 of 25,
  plus a spec-alignment renumber) shipped. Adds five more §4.5.2
  rules: R-PA-CMS-003 (Standard Written Order required elements
  present — beneficiary, item, date, quantity, prescriber NPI,
  dated signature; block, IOM Pub 100-08 ch. 5), R-PA-CMS-005
  (power-mobility functional-status documentation, flag, LCD L33788),
  R-PA-CMS-007 (PAP continuation 90-day adherence / compliance,
  flag, LCD L33718), R-PA-CMS-008 (home-oxygen qualifying ABG or
  SpO2, block, NCD 240.2 / LCD L33797), R-PA-CMS-011 (hospital-bed
  positioning / medical-necessity, flag, LCD L33820).

  Wave 52-2a inadvertently shipped the proof-of-delivery rule as
  R-PA-CMS-003 while spec-v52 §4.5.2 reserves that id for the
  SWO-elements-complete rule. Wave 52-2b corrects the id:
  R-PA-CMS-003 (POD) is renumbered to R-PA-CMS-004 (POD, the
  spec-aligned id; logic and citation kept identical) and a proper
  R-PA-CMS-003 (SWO elements) ships above. The rename is a pure id
  / citation-prefix change; the engine treats rule ids as opaque
  sort keys so the audit trail remains stable across the rename.

  Each new overlay rule self-gates on `bundle.payer ===
  'cms-medicare-ffs'` and again on a device-context anchor
  (DME / power-mobility / PAP-continuation / home-oxygen /
  hospital-bed). The HAPPY_PACKET fixture continues to all-pass
  without modification.

  6 new unit assertions in `test/unit/pa-engine.test.js` (one
  fires-when-it-should per new rule plus an explicit guard that
  R-PA-CMS-004 still exists with the POD description). Total PA
  unit suite: 106 assertions. The Playwright happy-path now
  asserts 70 rules render. View wave banner advanced to 52-2b.

  Wave 52-2c will round out the §4.5.2 overlay (the remaining
  15 rules: nebulizer / NPWT / TENS / lower-limb prosthetics /
  enteral nutrition, etc.) or open §4.5.3 CMS MA, depending on
  user priority.
- 2026-05-28 — wave 52-2a (CMS Medicare FFS overlay: first 5 of 25)
  shipped. Opens spec-v52 §4.5.2 with five Durable Medical Equipment
  / Positive Airway Pressure starter rules that self-gate on the
  detected payer bucket from `lib/pa/payer.js`: R-PA-CMS-001 (DME
  face-to-face encounter, block, NCD-280.x), R-PA-CMS-002 (Standard
  / Detailed Written Order present and signature-dated, block, CMS
  IOM Pub 100-08 ch. 5), R-PA-CMS-003 (proof of delivery, flag, IOM
  Pub 100-08 ch. 4 §4.26), R-PA-CMS-006 (PAP-device sleep-study
  results, flag, LCD L33718), R-PA-CMS-009 (DME supplier PTAN,
  flag).

  Each overlay rule's `check()` short-circuits with a vacuous pass
  when `bundle.payer !== 'cms-medicare-ffs'`, and again when the
  packet lacks the rule's context anchor (DME, PAP, etc.). The
  HAPPY_PACKET fixture therefore sees them all pass without
  modification. The wave-52-1g payer detector becomes load-bearing
  for the engine, not just informational. No new extractors and no
  changes to `buildBundle`; the overlay arrives as five additional
  entries in `STARTER_RULES` so the engine's rule-set stays
  monolithic and the audit trail records each rule's evaluation
  decision explicitly.

  6 new unit assertions: one vacuous-pass guard on a non-Medicare
  packet, one vacuous-pass guard on a Medicare-FFS packet without
  DME context, and a fires-when-it-should test per new rule.
  Total PA unit suite: 100 assertions. The Playwright happy-path
  now asserts 65 rules render. The view's wave-banner now reflects
  the §4.5.2 overlay opening.

  Wave 52-2b picks up with five more CMS FFS rules (mobility-device
  functional status, oxygen-therapy criteria, hospital-bed medical
  necessity, etc.) and begins the §4.5.3 CMS MA overlay.
- 2026-05-28 — wave 52-1k (core ruleset complete: 55 -> 60, full §4.5.1)
  shipped. The final 5 of the 60 §4.5.1 core rules land in
  `lib/pa/rules.js`: R-PA-008 / R-PA-009 / R-PA-011 (each CPT / HCPCS /
  ICD-10 code is well-formed and not on the bundled deleted-codes list
  — block severity; v52-1k ships empty `DELETED_CPT_HCPCS_BUNDLED` and
  `DELETED_ICD10_BUNDLED` sets in `lib/pa/extract.js` so the rules
  behave as format-strict pass-or-fire and become substantive as the
  maintainer refresh script populates the tables per §5.3), R-PA-012
  (no bundled NCCI procedure-to-procedure edit-pair conflict — flag;
  `NCCI_PAIRS_BUNDLED` empty at v52-1k per §5.3, expands to ~5,000
  high-volume pairs in a later wave), and R-PA-043 (no document is
  password-protected or encrypted — block; consumes a new optional
  `parseError` string on bundle documents).

  `lib/pa/engine.js#buildBundle` is extended to thread an optional
  `parseError` field through from the view's ingest catch block to
  the engine. `views/pa-lint.js` now pushes a stub document with
  `parseError` set when pdf.js or mammoth throws (encrypted PDF,
  password-protected DOCX, corrupted bytes) — previously the failed
  file was rendered in the audit trail but dropped from the engine
  bundle, so R-PA-043 / R-PA-044 could not fire. The audit-trail
  render is unchanged; only the engine's view of the packet is
  extended.

  6 new unit assertions in `test/unit/pa-engine.test.js` (one
  vacuous-pass guard per new placeholder rule plus two distinct
  R-PA-043 trips — parseError-driven and text-anchor-driven). Total
  PA unit suite: 94 assertions. The Playwright happy-path now
  asserts 60 rules render in the findings panel.

  This closes spec-v52 §4.5.1 (the core, payer-agnostic ruleset).
  Wave 52-2 picks up with the §4.5.2 CMS Medicare FFS overlay
  (25 rules), the §4.5.3 CMS Medicare Advantage overlay (15 rules),
  and the §4.5.4 Medicaid state-agnostic core (10 rules), plus
  payer detection for Medicare / MA / Medicaid letterheads.
- 2026-05-28 — wave 52-1j (core ruleset backfill 45 -> 55) shipped.
  Adds 10 more of the 60 §4.5.1 core rules: R-PA-014 (CPT modifier
  format check), R-PA-042 (each PDF has non-zero extractable text;
  scans flagged), R-PA-044 (every document opened with non-zero
  content — catches password-protected, corrupted, or empty files at
  block severity), R-PA-047 / R-PA-048 / R-PA-049 (patient address /
  subscriber relationship / COB — info-level, payer-overlay-gated;
  vacuously satisfied until v52-2+), R-PA-050 (diagnosis-procedure
  linkage shown — at least one document carries both an ICD-10 code
  and a CPT/HCPCS code), R-PA-051 (CPT short-descriptor match —
  info-level placeholder per spec-v52 §5.3 since AMA short
  descriptors are not shipped yet), R-PA-056 (anesthesia time
  documented when an anesthesia CPT in 00100-01999 is present),
  R-PA-057 (assistant-surgeon modifier accompanied by a second
  Luhn-valid NPI).

  All ten rules continue the wave 52-1i posture: vacuously satisfied
  when the trigger anchor is absent, so the HAPPY_PACKET fixture
  still returns all-pass without modification. R-PA-042 / R-PA-044
  consume `extract.textLength` (already populated by the wave 52-1e
  extractor) so no new extractors are required.

  10 new unit assertions in `test/unit/pa-engine.test.js` (one
  fires-when-it-should per new rule plus one extra vacuous-pass
  guard for R-PA-014). Total PA unit suite: 88 assertions. The
  Playwright happy-path now asserts 55 rules render in the findings
  panel. Engine output and ordering remain deterministic; the
  property test still holds.
- 2026-05-28 — wave 52-1i (core ruleset backfill 35 -> 45) shipped.
  Adds 10 more of the 60 §4.5.1 core rules: R-PA-030 (prior-treatment
  list when step therapy applies), R-PA-035 (LFTs when a hepatically-
  dosed agent is referenced, info-level), R-PA-038 / R-PA-039 / R-PA-040
  (resubmission iff prior-denial document attached; resubmission cites
  the prior PA reference number; resubmission addresses each denial
  reason), R-PA-052 (date-of-injury anchor when an ICD-10 external-
  cause code V/W/X/Y is in the packet), R-PA-054 (modifier 25 / 59
  accompanied by "separately identifiable" supporting language),
  R-PA-055 (bilateral mention matches modifier 50 presence), R-PA-058
  (unlisted-procedure CPT has a narrative justification), R-PA-059
  (consent date is on or before the latest service date).

  All ten new rules are designed to be vacuously satisfied when their
  trigger condition is absent — no false positives on the wave 52-1h
  HAPPY_PACKET fixture. The classifier's `prior-auth-denial` role
  becomes load-bearing for R-PA-038 / R-PA-040, and `extract.icd10`
  with a V/W/X/Y leading-letter filter becomes load-bearing for
  R-PA-052. No new extractors were required; R-PA-059 reuses
  `extract.serviceDates` (wave 52-1g) and `extract.dates`.

  10 new unit assertions in `test/unit/pa-engine.test.js` (one fires-
  when-it-should per new rule). Total PA unit suite: 78 assertions.
  The e2e happy-path now asserts 45 rules render in the findings
  panel. Engine output and ordering remain deterministic; the
  property test still holds.
- 2026-05-27 — wave 52-1h (core ruleset backfill 25 -> 35) shipped.
  Adds 10 more of the 60 §4.5.1 core rules: R-PA-019 (servicing NPI
  presence — flags when only one Luhn-valid NPI is in the packet),
  R-PA-022 (clinical-note has a date), R-PA-023 (note references at
  least one requested CPT), R-PA-025 / R-PA-026 (lab / imaging
  documents attached when referenced), R-PA-027 / R-PA-028
  (lab / imaging freshness, default 12 months), R-PA-033 (height /
  weight when packet references mg/kg dosing), R-PA-034 (renal
  function when renally-dosed agent referenced), R-PA-036 (frequency
  keyword present).
  
  New extractors land in `lib/pa/extract.js`: `extractWeight`,
  `extractHeight`, `extractFrequency` (canonical-token scan against
  the daily / BID / TID / q4-q24h / PRN / weekly / monthly set).
  
  Several rules consume the wave-52-1g classifier roles (R-PA-022,
  R-PA-023, R-PA-027, R-PA-028 scope to clinical-note / lab-result /
  imaging-report documents) so the classifier work is now load-
  bearing for the rule engine, not just informational.
  
  The 35-rule happy-path fixture is now a 4-document packet
  (pa-form, clinical-note, lab-result, imaging-report) so cross-
  document rules have something to validate against. 6 new unit
  assertions for the wave 52-1h rules + 3 for the new extractors.
  Total PA unit suite: 68 assertions. The e2e happy-path was
  expanded with a second NPI line; the missing-NPI test now uses a
  rule-id-chip selector to avoid colliding with R-PA-019's note
  text that mentions R-PA-016 by name.
- 2026-05-27 — wave 52-1g (classifier + payer-detect + per-document
  role/payer) shipped. Adds `lib/pa/classify.js` (8 roles: clinical-
  note, pa-form, medical-necessity-letter, lab-result, imaging-report,
  path-report, prior-auth-denial, other) and `lib/pa/payer.js` (5
  buckets: cms-medicare-ffs, cms-medicare-advantage, medicaid,
  commercial, unknown). Both are deterministic, keyword-anchor-based,
  and explainable (no ML, no probabilities). `buildBundle` now tags
  each document with `role` + `payer`, plus a bundle-level `payer`
  via simple majority across documents (unknowns excluded).
  
  R-PA-005 / R-PA-006 are refactored to use a new `extract.serviceDates`
  field (labeled "Date of service" / "DOS" / "Service date" only) so
  the retro-auth-window and future-date ceiling no longer catch DOB
  strings or signature dates that share a document. The 5-year-look-
  back heuristic introduced in wave 52-1f is removed.
  
  The pa-lint findings panel now surfaces the detected packet payer
  and a per-document role/payer line so the user can audit the
  classifier's picks before subsequent waves start firing payer-
  overlay rules.
  
  Coverage: 14 new unit assertions across classifier, payer-detect,
  and the R-PA-005 refactor (+1 for `extractServiceDates`). Total PA
  unit suite is now 62 assertions. Engine output and ordering remain
  deterministic; the property test still holds.
- 2026-05-27 — wave 52-1f (core ruleset backfill 7 -> 25) shipped.
  Adds 18 more of the 60 §4.5.1 core rules: R-PA-002 (DOB), R-PA-003
  (member ID), R-PA-005 (retro-auth window, default 90 days),
  R-PA-006 (future ceiling 365 days), R-PA-015 (quantity >= 1),
  R-PA-017 / R-PA-018 (signature presence + datedness), R-PA-020
  (TIN), R-PA-021 (clinical-note anchor), R-PA-024 (medical-necessity
  statement), R-PA-029 (step-therapy documentation), R-PA-031 / R-PA-
  032 (allergies / medication list), R-PA-037 (duration), R-PA-045
  (packet byte ceiling, default 50 MB), R-PA-046 (mojibake / U+FFFD),
  R-PA-053 (no-PA-needed list — empty at v52-1f close, placeholder for
  payer overlays), R-PA-060 (cover sheet / checklist).
  
  New extractors land in `lib/pa/extract.js`: `extractDob`,
  `extractMemberId`, `extractTin`, `extractQuantity`,
  `extractSignature` (presence + datedness), `keywordPresent`
  helper for the info-level "did the packet mention X?" rules, and
  `countReplacementChars` for the mojibake check. `buildBundle` gains
  an optional `opts.totalBytes` so R-PA-045 can compare against the
  packet's on-disk byte total (passed in from the view's
  `files.reduce((s, f) => s + f.size, 0)` sum).
  
  R-PA-005's date filter excludes anything beyond 5 years in the past
  so the rule does not catch DOB strings as "service dates" -- a clean
  fix until the wave-52-1g classifier tags dates by role.
  
  Coverage: +9 new unit assertions (one fires-when-it-should per new
  rule that needs a non-trivial extractor), +7 new extractor tests.
  Total PA suite is now ~50 unit assertions plus the engine-level
  property tests. The e2e happy-path spec now asserts 25 rules render
  in the findings panel.
- 2026-05-27 — wave 52-1e (rule engine + 7 starter rules) shipped.
  Adds `lib/pa/{date,extract,rules,engine}.js`. The engine consumes a
  document bundle (`{name, sha256, kind, text}[]`) and runs a list of
  declarative rules over the aggregated extracted text, returning a
  findings array sorted by spec-v52 §4.4 severity then rule id. Wave
  52-1e ships 7 of the 60 §4.5.1 core rules: R-PA-001 (patient name),
  R-PA-004 (service date), R-PA-007 (CPT/HCPCS present), R-PA-010
  (ICD-10 present), R-PA-013 (POS code present + on bundled CMS list),
  R-PA-016 (NPI Luhn-mod-10 with CMS 80840 prefix), R-PA-041 (SSN-
  absent / PHI minimization). The remaining 53 core rules + payer
  overlays + specialty overlays follow in subsequent waves. Each rule
  is a plain object with id, description, severity, citation, and a
  `check(bundle)` predicate; adding a rule is a one-entry append with
  no engine change. The pa-lint view now (a) extracts text from PDF /
  DOCX / TXT (TXT path added this wave), (b) renders the per-file
  audit trail, (c) builds a bundle, (d) runs the engine, and (e)
  renders a findings panel with severity-coded left borders and
  per-finding rule id / status / description / evidence / citation.
  31 new unit tests (`test/unit/pa-{date,extract,engine}.test.js`)
  cover the date math (incl. leap-year and timezone-invariance), the
  extractors (incl. CMS NPI Luhn example 1234567893), and the engine
  end-to-end against synthetic bundles. A new Playwright spec
  `test/integration/pa-lint-engine.spec.js` drops a happy-path TXT
  and a missing-NPI TXT and asserts the findings panel renders the
  expected statuses end-to-end. The engine is timestamp-free,
  fetch-free, and randomness-free per spec-v52 §4.10. Property
  test (order-independence across input documents) is included in
  the engine unit suite.
- 2026-05-27 — wave 52-1d (vendored mammoth.js + DOCX text extraction)
  shipped. `mwilliamson/mammoth.js` 1.2.5 (BSD-2-Clause) is vendored at
  `vendored/mammoth/mammoth.browser.min.js` per spec-v52 §5.2. Upstream
  ships as a UMD bundle (not ESM), so the pa-lint view injects a
  same-origin classic `<script>` on first DOCX drop and resolves on
  `script.onload` to `window.mammoth`; the existing strict CSP
  (`script-src 'self'`) covers this without modification. The per-file
  finding now uses a unified `extract.kind` field (`'PDF'` or `'DOCX'`)
  and renders "<kind> parsed · [page count] · N characters of
  extractable text". The `/commitments/` page picks up mammoth in the
  Vendored components section. `vendored/README.md` is updated. A new
  Playwright spec `test/integration/pa-lint-docx.spec.js` drops a
  hand-built 1,494-byte one-paragraph DOCX (base64'd into the spec
  file) and asserts mammoth extracts text end-to-end. The PDF spec
  was updated to match the new rendering wording. Open questions:
  password-protected DOCX is intentionally surfaced as a non-fatal
  parse-failed line under the hash rather than dropped from the
  audit trail.
- 2026-05-27 — wave 52-1c (vendored pdf.js + PDF text extraction) shipped.
  Mozilla pdf.js v5.7.284 is vendored under `vendored/pdfjs/` (Apache-2.0,
  per spec-v52 §5.2). Only `build/pdf.mjs` (loader) and
  `build/pdf.worker.mjs` (worker) ship; `pdf.sandbox.mjs`, the viewer
  chrome under `web/`, the `cmaps/` non-Latin character tables, and the
  `iccs/` color profiles are omitted (see `vendored/pdfjs/_vendored.md`).
  The pa-lint view (`views/pa-lint.js`) lazy-loads pdf.js on first PDF
  drop via dynamic `import()` and points `GlobalWorkerOptions.workerSrc`
  at the same-origin worker URL; `isEvalSupported: false` is set so
  pdf.js does not try to compile font programs with the `Function`
  constructor (which the existing eslint `no-new-func` rule and CSP
  `script-src 'self'` both forbid for first-party code). On success
  the per-file finding renders the page count and the character count
  of extractable text alongside the existing SHA-256. Failures are
  caught and rendered as a `.pa-finding-err` line under the hash so
  one bad PDF does not lose the audit trail for the rest of the
  packet. `scripts/build.mjs` now copies the `vendored/` tree into
  `dist/`. `scripts/build-commitments-page.mjs` grows a new
  "Vendored third-party components" section per spec-v52 §5.2 that
  lists each vendored library's upstream, pinned version, license,
  and purpose. `eslint.config.js` adds `vendored/**` to the ignore
  list. A new Playwright spec `test/integration/pa-lint-pdf.spec.js`
  drops a one-page PDF and asserts pdf.js reports `1 page` end-to-
  end under the strict CSP. The CSP, the commitment to no third-
  party fetch, and the storage-allowlist are all unchanged.
- 2026-05-27 — wave 52-1b (tile shell + audit-trail stub) shipped.
  The `pa-lint` tile is registered in `UTILITIES` as the first
  `shape: 'document-linter'` tile (§3.2, §3.4). The new top-level
  `Revenue cycle & utilization` catalog group (group key `P`,
  §10.1) lands in `app.js`, `scripts/build-hub-pages.mjs`, and
  `scripts/audit-coverage.mjs`. A new `case-managers` audience
  hub (§10.2) is generated at `/for/case-managers/`. The
  `/tools/pa-lint/` route mounts a dropzone that computes the
  per-file SHA-256, size, and MIME — the deterministic audit-
  trail spine of every future finding (§4.3 ingest step, §4.10
  determinism guarantees) and the minimum that satisfies the
  spec-v29 §3 scope test. The 60-rule core ruleset (§4.5.1),
  the vendored PDF/DOCX parsers (§5.2), the payer overlays
  (§4.5.2–§4.5.4), the specialty overlays (§4.5.5), the DOCX
  report (§4.6), the staleness CI (§8.3), and the property
  tests (§8.4) are deferred to wave 52-1c+. The catalog count
  surfaces (lede, hero label, `<title>`, OG/Twitter, JSON-LD
  featureList, sitemap, README, package.json, parity ledger)
  all advance 254 → 255 in the same commit;
  `scripts/check-catalog-truth.mjs` is extended with the
  shape-aware invariant from §3.4 (exactly one
  `shape: 'document-linter'` tile at v52-1b close). Synonyms
  per §10.3 land in `data/synonyms.json`. Spec-v52 §6
  (homepage dropdown) was closed earlier today as wave 52-1a.
- 2026-05-27 — wave 52-1a (homepage-only slice) shipped. §6 is
  closed: the ten `.quick-pick` buttons are removed and replaced
  by a native `<select id="tool-picker-select">` whose `<option>`
  list is server-rendered by the new
  `scripts/build-tool-picker.mjs` from `UTILITIES` in `app.js`
  (alphabetical by visible title). The change `event` routes via
  `location.hash`, matching the existing hero-search and tile-
  card hash-routing pattern. The `.quick-picks*` CSS rules are
  deleted in the same commit (no v51 dead-CSS sweep needed). The
  catalog count remains **254** because the `pa-lint` tile is
  not yet registered; the hero label, lede, JSON-LD, and OG/
  Twitter copy are unchanged. The remainder of wave 52-1
  (the PA tile shell, the dropzone, the rule engine, the
  vendored pdf.js / mammoth / docx.js, the 60-rule core
  ruleset, the DOCX report, the dataset-staleness CI) is
  deferred to a follow-up commit and will bump the catalog
  count from 254 to 255 in the same change.
