# spec-v292.md — Restrictive transfusion threshold decision aid (AABB 2023) (+1 tile)

> Status: **BUILT (2026-07-10).** `transfusion-threshold` is live (catalog 1144 → 1145).
> Builds the docs-only proposal in `openspec/changes/transfusion-threshold/` (commit
> 874b298), which the spec-v285–v291 search-quality program surfaced as a catalog gap it
> could not rank around. **Every threshold was re-fetched and cross-verified against the
> primary publication and ≥ 2 independent summaries per [spec-v97](spec-v97.md).**
> **Correction applied at implementation:** the proposal's `design.md` table listed cardiac
> surgery at **8 g/dL**; the verified AABB 2023 value is **7.5 g/dL** (orthopedic surgery and
> preexisting cardiovascular disease are 8 g/dL). The proposal's "verify AABB scope" flag on
> the pediatric row is resolved: AABB 2023 **does** cover stable critically ill children at
> 7 g/dL (strong recommendation), so no separate pediatric citation is needed.
>
> The id was verified absent by a fixed-string scan of `app.js` and `mcp/adapters/` (0 hits).
> The tile obeys [spec-v100](spec-v100.md) §2, passes the [spec-v29](spec-v29.md) §3 one-line
> test (a per-patient decision, not a static table), ships its citation inline
> ([spec-v54](spec-v54.md)), and honors [spec-v11](spec-v11.md) §5.3: it reports a
> guideline-stated threshold comparison, **never a transfusion order**.

## 1. Thesis

Every transfusion tile in the catalog is a massive-transfusion score (`abc-mtp`, `tash-score`,
`rabt-score`, `mtp-tracker`) or a pediatric volume calculator (`peds-transfusion-volume`).
None answers the far more common bedside question a nurse or hospitalist actually asks:
*is this hemoglobin below the threshold for this patient?* The AABB 2023 guideline (Carson et
al., JAMA) publishes population-specific restrictive thresholds — exactly the reproducible,
citable, band-shaped content the catalog is built from. `transfusion-threshold` computes the
decision from a hemoglobin value and a patient population, and — critically — emits a
first-class "no numeric recommendation" output for acute coronary syndrome rather than a
fabricated number.

## 2. What v292 adds (1 tile)

### 2.1 `transfusion-threshold` — AABB 2023 restrictive transfusion threshold

- **Citation:** Carson JL, Stanworth SJ, Guyatt G, et al. Red Blood Cell Transfusion: 2023
  AABB International Guidelines. *JAMA.* 2023;330(19):1892-1902.
- **citationUrl:** https://doi.org/10.1001/jama.2023.12914
- **Group:** G. **Specialties:** `hematology`, `transfusion-medicine`, `critical-care`,
  `nursing-icu`, `emergency-medicine`.
- **Inputs:** hemoglobin (`unitField`, g/dL canonical with a g/L toggle via the new
  `HEMOGLOBIN_UNITS`), a patient-population `select`, and a symptomatic-anemia checkbox.
- **Verified thresholds (re-fetched, [spec-v97](spec-v97.md)):**

  | Population | Restrictive Hgb threshold |
  |---|---|
  | Stable hospitalized adult (incl. critically ill) | 7 g/dL (strong) |
  | Stable critically ill child | 7 g/dL (strong) |
  | Cardiac surgery | **7.5 g/dL** (corrected from the design's 8) |
  | Orthopedic surgery | 8 g/dL |
  | Preexisting cardiovascular disease | 8 g/dL |
  | Acute coronary syndrome | **no numeric recommendation** (null) |

- **Output:** the population's threshold, whether the entered Hgb sits below it (transfusion
  reasonable) or at/above it (restrictive strategy — do not transfuse on the number alone),
  and the ACS carve-out. The symptomatic checkbox annotates that active symptoms can justify
  transfusion above the numeric threshold; it never *lowers* the reported threshold. Class A.
  Cross-links `abc-mtp`, `peds-transfusion-volume`, `max-allowable-blood-loss`.

## 3. Per-tile robustness

- **Design D2 — ACS is a first-class output, never a fabricated number.** Pinned by a unit
  test asserting `threshold === null`, the carve-out text, and that the ACS band contains no
  `g/dL` number.
- **Finite-guarded:** a blank hemoglobin renders a "complete the fields" prompt; an impossible
  hemoglobin (≤ 0 or > 30 g/dL) throws `RangeError`, caught by the view's `safe()` wrapper and
  surfaced as a muted message. Fuzz-harness clean ([spec-v59](spec-v59.md)).
- **Reports the threshold comparison, not an order** ([spec-v11](spec-v11.md) §5.3), with the
  [spec-v50](spec-v50.md) §3 posture note.

## 4. CI/CD & maintenance

- **Maintenance class:** Class A — a fixed, guideline-published threshold table. The AABB
  issuer does **not** trip `ISSUER_PATTERN` ([spec-v54](spec-v54.md) rule 4), so no
  `docs/citation-staleness.md` row is required; `citationAccessed` is carried anyway.
- **Build & gates:** compute in a new `lib/transfusion-v292.js` (added to
  `fuzz-tools.test.js` `MODULES`); renderer in a new `views/group-v292.js` (`RV292` spread
  into `app.js` `RENDERERS`); `+1 UTILITIES` row; count moved on every catalog-truth surface
  using live `UTILITIES.length + 1`. `HEMOGLOBIN_UNITS` (g/dL↔g/L, factor 10) added to
  `lib/field-units.js` with a `hemoglobin` factor in `lib/unit-convert.js`.
- **Search:** a `data/synonyms.json` row routes "when to transfuse", "transfusion threshold",
  and "when should i transfuse for anemia" to the tile.
- **MCP exposure (follow-up wave):** a Class A deterministic compute — a follow-up MCP wave
  exposes it (numeric-threshold example) and promotes the golden-set probe.

## 5. Files touched

```
docs/spec-v292.md                          (this file)
app.js                                     (+1 UTILITIES row; import group-v292 RV292 into RENDERERS)
lib/transfusion-v292.js                    (new: transfusionThreshold + verified AABB threshold table)
lib/meta.js                               (+1 META entry: inline citation + citationUrl + accessed; interpretation bands)
lib/field-units.js                        (new HEMOGLOBIN_UNITS array)
lib/unit-convert.js                       (new hemoglobin g/dL<->g/L factor)
views/group-v292.js                       (new renderer module: 1 renderer)
data/synonyms.json                        (+1 row -> transfusion-threshold)
test/unit/transfusion-threshold.test.js   (9 worked examples incl. the ACS null branch and RangeError guard)
test/unit/fuzz-tools.test.js              (add lib/transfusion-v292.js to MODULES)
CHANGELOG.md, README.md, package.json     (catalog count live -> live+1)
docs/architecture.md, docs/scope-*.md     (catalog count live -> live+1)
```

## 6. Out of scope for v292

- **No transfusion order** — the tile reports a guideline threshold comparison; the decision
  to transfuse stays with the clinician ([spec-v11](spec-v11.md) §5.3).
- **Hematologic/oncologic patients** — AABB 2023 gives them the same 7 g/dL restrictive
  threshold, but the proposal scoped this population out; not added here.
- **MCP adapter + golden-probe promotion** — a follow-up wave (the probe requires the tile in
  the MCP-exposed registry).
