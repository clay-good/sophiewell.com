# spec-seo.md — Sophie Well: organic discovery & magnetic SEO

> Status: Phase 1 landed (2026-05-16). Adds an SEO and discoverability
> layer to the existing v6 site without touching the deterministic-math
> contract or the no-AI, no-telemetry, no-server posture. Everything
> below is static HTML, static JSON-LD, or build-time generated
> pre-rendered pages. No runtime change to tool behavior.
>
> Phase 1 status (§14.1 quick wins):
> - [x] Home `<title>` and `<meta description>` rewritten per §6;
>       brand moved to the end; description fits inside the 140-158
>       char SERP-snippet window. Open Graph and Twitter card mirror
>       the same copy.
> - [x] `<meta name="keywords">` removed (Google has ignored it since
>       ~2009; spec §3 audit point 3).
> - [x] Visible `<h1>` "Free healthcare tools, all in your browser"
>       plus lede paragraph rendered above the task hero. The prior
>       `visually-hidden` h1 is gone (§9.1).
> - [x] Tile-count drift fixed in the meta description and JSON-LD;
>       both pin to 178, the current home-grid count. JSON-LD also
>       carries the count via build-ld.mjs reading UTILITIES.length.
> - [x] FAQ JSON-LD expanded from 5 to 12 questions per §9.4;
>       answers <=50 words and phrased as the literal search query.
>       Source-of-truth in scripts/build-ld.mjs.
> - [x] Sitemap stripped of every `#hash` URL. Until Phase 2 lands
>       the pre-rendered `/tools/<id>/` pages, the sitemap is just
>       the root URL (with a build-time sanity check that UTILITIES
>       still parses to >=1 tile).
> - [x] robots.txt expanded per §8.3 to disallow `/dist/`, `/test/`,
>       `/node_modules/` and keep the absolute sitemap URL.
>
> Phase 1 deferrals - all landed (2026-05-16):
> - [x] Trust strip (§9.2): three-badge `<ul class="trust-strip">`
>       below the lede with inline SVG icons. Each badge links to
>       its canonical proof (GitHub, threat model, clinical
>       citations). 3-column on desktop, stacks at 700px.
> - [x] "Why Sophie" homepage section (§9.3): three short prose
>       cards under `<section class="why-sophie">` after the tile
>       grid disclosure. Owns the long-tail "is sophiewell ...?"
>       queries.
> - [x] Visible HTML FAQ mirror (§9.4 last sentence): the same 12
>       Q/A pairs from `scripts/build-ld.mjs` rendered as collapsed
>       `<details>` elements under `<section class="visible-faq">`.
>       Source-of-truth is still the JSON-LD; the visible block is
>       hand-maintained in lock-step.
>
> Phase 2 (pre-rendered tool pages, §5 / §14.2) outstanding. That
> wave grows the sitemap back to ~178 URLs, one per tool, each at
> `/tools/<id>/` with prose, schema, citations, and OG cards.

## 1. The problem in one sentence

Sophie Well is a 195-tool, single-page healthcare utility with a generic
`<title>`, a 4,000-character keyword-stuffed `<meta description>` that
Google truncates at ~160 characters, and a sitemap full of `#hash`
fragments that search engines collapse into a single indexable URL. The
site is invisible to the people it would most help.

The fix is not "more keywords." It is: **(a) give every tool its own
crawlable URL with human-magnetic copy, (b) write SERP-shaped titles and
descriptions that earn the click, (c) layer rich-result schema so Sophie
shows up with stars, FAQ accordions, and "free" badges, and (d) seed the
long tail with task-shaped landing pages people actually search for.**

## 2. Hard constraints (inherited)

These are non-negotiable and pre-empt any SEO tactic that conflicts:

- No runtime servers, no accounts, no telemetry, no AI, no third-party
  scripts, no external CDN. (per spec-v5 §2 / spec-v6 §2)
- Strict CSP: `default-src 'self'`, no `unsafe-eval`, no inline scripts.
- Static hosting on Cloudflare Pages. Build step is allowed; runtime
  fetch from the origin is the only network the page may make.
- The existing SPA continues to work. Pre-rendered pages are an
  *additional* surface, not a replacement. Internal links from the SPA
  are unchanged.
- Citations and "not medical advice" disclaimers stay everywhere.

## 3. Audit of the current SEO surface

Findings from the live `index.html`, `sitemap.xml`, `robots.txt`, and
JSON-LD blocks as of 2026-05-14:

1. **`<title>` is just `Sophie Well`.** Brand-only titles waste the
   single most weighted SERP element. They earn clicks only from people
   who already know the brand — the opposite of "I want people to find
   this tool."
2. **`<meta name="description">` is ~4,000 characters of comma-separated
   feature names.** Google truncates at ~160 chars on desktop and ~120
   on mobile. The actual rendered snippet is unreadable: "...sophiewell
   - free, client-side healthcare toolbox. 195 deterministic utilities
   for patients, billers, coders, nurses..." then cut.
3. **`<meta name="keywords">` is enormous.** Google has ignored this tag
   since ~2009. It does nothing for ranking and signals "amateur SEO" to
   anyone auditing the site.
4. **Sitemap is 178 URLs that all resolve to `https://sophiewell.com/`.**
   Hash fragments (`#icd10`, `#bmi`, etc.) are stripped by every search
   engine before indexing. Google Search Console will report 177
   duplicate canonical errors.
5. **Only one indexable URL exists.** The entire site collapses to
   `/` — every long-tail search ("ICD-10 lookup free", "Wells score
   calculator", "QTc Bazett calculator") has to compete on that single
   page's authority, which is diluted across 195 topics.
6. **JSON-LD says `178` utilities; meta description says `195`.** Stale
   counts in structured data hurt trust signals when Google's quality
   raters spot-check the page.
7. **`<h1>` is `visually-hidden` and reads "Sophie Well, deterministic
   healthcare utilities."** Screen readers see it; Google weighs it; a
   human visitor never does. The visible above-the-fold heading is
   "What do you need to decode?" — which is great copy but not an `<h1>`.
8. **Open Graph image is `logo.png` (a square brand mark).** Twitter,
   Slack, iMessage, and LinkedIn render link previews as wide cards;
   a square logo gets letterboxed and looks unprofessional next to
   competitors with proper 1200×630 OG cards.
9. **No `BreadcrumbList`, `HowTo`, `MedicalCalculator`, `SoftwareApplication`
   `aggregateRating`, or per-tool `WebPage` schema.** The site has the
   raw material for every one of these.
10. **No `lastmod` differentiation in the sitemap.** Every URL has the
    same `lastmod`, which tells crawlers nothing about freshness.
11. **No `hreflang` even for `en`.** Minor, but worth declaring.
12. **`robots.txt` does not link the sitemap absolute URL with a clean
    crawl-delay or list per-bot rules.** Currently fine but minimal.
13. **No content depth per tool.** Each tool is one tile + a renderer.
    There is no indexable explanatory paragraph, no example, no "when
    to use," no citation paragraph that Google can rank as the answer
    to "how do you calculate eGFR CKD-EPI 2021."

## 4. Strategy: "answer the search, not the brand"

People do not search "Sophie Well." They search:

- *"how do I read my hospital bill"*
- *"free QTc calculator"*
- *"what does CARC 45 mean"*
- *"Wells score for PE calculator"*
- *"is my insurance card real"*
- *"ICD-10 code for chest pain"*
- *"naloxone dose by weight"*
- *"how much should this cost on Medicare"*

Sophie has the answer to every one of these. The job of SEO is to make
each of those queries land on a page that:

1. Renders the answer instantly (existing tool).
2. Explains what the answer means (new prose block, ~150–300 words).
3. Cites the source (already exists; surface it in indexable HTML).
4. Earns trust (author bio, last-updated date, "no tracking" badge).
5. Cross-links to 3–5 related tools (internal link equity).

This is "topical authority" SEO: be the most useful page on the open
web for each narrow query, and Google will route the traffic.

## 5. Per-tool indexable pages (the biggest single win)

### 5.1 URL scheme

Pre-render one HTML file per tool at a real path:

```
/tools/icd10/                  → ICD-10-CM Code Lookup
/tools/qtc/                    → QTc calculator (Bazett / Fridericia / ...)
/tools/wells-pe/               → Wells score for PE
/tools/bill-decoder/           → Medical Bill Decoder
/tools/no-surprises-act/       → No Surprises Act eligibility
... one per tool, ~195 total
```

`/tools/<id>/index.html` makes the URL look clean and avoids `.html`
suffixes. Cloudflare Pages serves these natively.

### 5.2 What the SPA keeps

The hash routes (`/#icd10`, etc.) keep working as in-app navigation.
The pre-rendered pages link **into** the SPA via canonical hash routes,
so a user who lands on `/tools/qtc/` from Google sees the static prose,
clicks the calculator, and is now in the SPA at `/#qtc`.

Add a `<link rel="canonical" href="https://sophiewell.com/tools/qtc/">`
on each pre-rendered page. The SPA root keeps `<link rel="canonical"
href="https://sophiewell.com/">`. The hash URLs are not canonical for
anyone.

### 5.3 Page template (per tool)

Every pre-rendered tool page contains, in order:

1. `<title>` — see §6.
2. `<meta description>` — see §6.
3. Visible `<h1>` matching the tool's primary search intent.
4. One-sentence summary (the SERP-magnetic line).
5. **The tool itself**, mounted from the SPA's renderer (no behavioral
   change). The tile/grid is hidden; only the active tool is shown.
6. Prose section: "What this calculates" (~80 words).
7. Prose section: "When to use it" (~80 words).
8. Prose section: "Source and method" — citation block already in `META`,
   surfaced as readable HTML (~60 words).
9. Worked example pulled from `META[id].example` (already exists).
10. "Related tools" — 3–5 internal links to sibling tools by group.
11. "Last updated" date (matches `lastmod` in sitemap; from git).
12. "Not medical / legal / financial advice" disclaimer.
13. Author byline linking to claygood.com.

### 5.4 Build-time generation

A new `scripts/build-tool-pages.mjs` reads `lib/meta.js`, the existing
tool registry, and a new `data/tool-copy/<id>.json` (per-tool prose,
authored by hand for the top 50 highest-traffic tools and templated for
the rest). Output: `dist/tools/<id>/index.html`. Wire into the existing
build pipeline; no runtime change.

The 50 hand-authored pages should be prioritized by query volume:
ICD-10 lookup, BMI, eGFR, QTc, Wells PE, CHA2DS2-VASc, opioid MME,
medical bill decoder, EOB decoder, No Surprises Act, naloxone dose,
APGAR, GCS, anion gap, corrected calcium, drip rate, NPI lookup, etc.
The rest get a deterministic template with the prose blocks generated
from `META` fields (description, citations, example).

## 6. SERP-magnetic titles and descriptions

### 6.1 Title formulas that earn clicks

Pattern: **`<primary keyword> — <differentiator> · Sophie Well`**

The differentiator is one of: *Free, no signup*, *Runs in your browser*,
*No tracking*, *2026 update*, *CKD-EPI 2021*, *CDC 2022*, *with worked
example*, *with citation*. Pick the one that matches the tool.

Examples (all under 60 characters where possible):

| Tool          | Title                                                          |
| ------------- | -------------------------------------------------------------- |
| Home          | Free Healthcare Toolbox — 195 tools, no signup · Sophie Well   |
| ICD-10 lookup | ICD-10-CM Code Lookup — Free, FY2026 · Sophie Well             |
| QTc           | QTc Calculator — Bazett, Fridericia, Framingham · Sophie Well  |
| Wells PE      | Wells Score for PE — Free Calculator with Citation · Sophie Well |
| Bill decoder  | Medical Bill Decoder — Read Your Hospital Bill Free · Sophie Well |
| No Surprises  | No Surprises Act Eligibility — Free Checker · Sophie Well      |
| eGFR          | eGFR Calculator — CKD-EPI 2021 (race-free) · Sophie Well       |
| Opioid MME    | Opioid MME Calculator — CDC 2022 Update · Sophie Well          |
| Naloxone      | Naloxone Dosing by Weight — Adult & Pediatric · Sophie Well    |

Rules:

- Lead with the **search keyword the user typed**, not the brand.
- Brand goes last.
- Year/version/race-free/free-no-signup are click-magnets when truthful.
- Title-case the keyword; sentence-case the differentiator.
- Stay under 60 chars where possible; never exceed 70.

### 6.2 Description formulas

Pattern: **`<what it does in one verb> <what input> <what output>. <free / private differentiator>. <citation or year>.`**

Stay between 140 and 158 characters. Examples:

- Home: *"Free deterministic healthcare tools that run entirely in your
  browser. 195 calculators, code lookups, and bill decoders. No signup,
  no tracking, no AI."* (157 chars)
- QTc: *"Calculate QTc using Bazett, Fridericia, Framingham, or Hodges.
  Free, runs in your browser, with worked examples and citations.
  Updated 2026."* (148 chars)
- Bill decoder: *"Paste a hospital bill or EOB and Sophie explains every
  line, code, and charge. Free, private, never leaves your browser. No
  signup."* (143 chars)
- Wells PE: *"Score Wells criteria for pulmonary embolism with worked
  example and source citation. Free, browser-only, no signup. Built
  for clinicians and educators."* (155 chars)

### 6.3 Open Graph and Twitter cards

- Replace `og:image` from `logo.png` (square brand mark) with a
  per-tool 1200×630 PNG generated at build time. Template: dark
  background, tool name large, sub-line ("Free · No signup · No
  tracking"), Sophie wordmark bottom-right.
- For the home page: a single hero card with the tagline "195 free
  healthcare tools that never leave your browser."
- Add `og:image:width` / `og:image:height` for both.
- Add `twitter:label1` / `twitter:data1` ("Price", "Free") and
  `twitter:label2` / `twitter:data2` ("Privacy", "Runs in your
  browser") — these render as a key/value strip on Twitter cards.

## 7. Structured data (rich results)

### 7.1 Home page — keep, fix, extend

- **Fix:** update `WebApplication.description` count from 178 to the
  current count, and bind it to a single source of truth (`lib/meta.js`
  length). Add a build-time check that fails the build on drift.
- **Add `aggregateRating`** only if real ratings exist. Do not fabricate.
  If/when a "did this help?" thumbs-up is added (no telemetry; user
  copies a count manually), wire it then. Until then, omit.
- **Add `Organization`** node with `Person` author Clay Good; cross-link
  to claygood.com. Strengthens E-E-A-T.
- **Add `BreadcrumbList`** for every pre-rendered tool page.

### 7.2 Per-tool pages — new schema

Each pre-rendered tool page emits one of:

- **`MedicalCalculator`** (custom type via `additionalType`) for math
  tools — eGFR, QTc, Wells, BMI, BSA, anion gap, etc.
- **`MedicalWebPage`** with `medicalAudience` for clinical references
  — toxidromes, ASA class, Beers, lab ranges.
- **`HowTo`** for decoders and template generators — bill decoder, EOB
  decoder, appeal letter, prior auth checklist. `HowTo` is one of the
  few schema types Google still renders as a rich result on desktop.
- **`SoftwareApplication`** sub-page schema for code-lookup tools so
  they inherit the parent app's "free / open source" properties.
- **`FAQPage`** when the tool's prose section answers ≥2 distinct
  questions. Most tool pages should have one.
- **`Dataset`** for the bundled lookup tables (ICD-10-CM, HCPCS, NDC,
  CARC, RARC, MS-DRG). `Dataset` schema gets indexed by Google Dataset
  Search — a dedicated vertical that competitors are not optimizing for.

### 7.3 Cite the citations

Every `META[id].citations` entry should also be emitted as a
`citation` property on the per-tool schema, and linked in visible HTML
with `rel="external nofollow"`. Google rewards pages that cite primary
sources.

## 8. Sitemap and robots

### 8.1 Replace the sitemap

Drop every `#hash` URL. Replace with:

- `/` (priority 1.0, weekly)
- `/tools/` (the index page, priority 0.9, weekly)
- `/tools/<id>/` (one per tool, priority 0.8, monthly)
- `/about/`, `/sources/`, `/changelog/`, `/security/` (priority 0.5)

`lastmod` should come from `git log -1 --format=%cI -- <path>` per file
at build time, not a hard-coded site-wide date. This is what tells
Google "this specific page changed, recrawl it."

### 8.2 Sitemap index

Once the sitemap exceeds 200 URLs, split into:

- `/sitemap.xml` (sitemap index)
- `/sitemap-tools.xml` (per-tool pages)
- `/sitemap-content.xml` (about, sources, blog if added)

### 8.3 robots.txt

```
User-agent: *
Allow: /
Disallow: /dist/
Disallow: /test/
Disallow: /node_modules/

Sitemap: https://sophiewell.com/sitemap.xml
```

Explicitly disallow build artifacts so they are not indexed if they
ever leak to the deployed root.

### 8.4 Submit

Submit `https://sophiewell.com/sitemap.xml` to Google Search Console
and Bing Webmaster Tools (one-time, no telemetry implication —
Search Console verifies via DNS TXT record, not a runtime script).

## 9. On-page content additions

### 9.1 Home page above the fold

Replace the hidden `<h1>` with a visible one. Current visible heading
is "What do you need to decode?" — keep that as the search label, but
add an `<h1>` immediately above:

```html
<h1>Free healthcare tools, all in your browser</h1>
<p class="lede">
  195 deterministic calculators, code lookups, and bill decoders for
  patients, clinicians, billers, and EMS — every input stays on your
  device. No signup, no tracking, no AI.
</p>
```

This is the single highest-impact text change on the site. It earns
the click, sets expectations, and feeds Google a clear topic signal.

### 9.2 Trust strip

Below the hero, a one-line strip with three trust badges:

- **Free & open source** (link to GitHub)
- **Runs in your browser** (link to threat-model.md)
- **Cited from public sources** (link to data-sources.md)

These render as a 3-column flex on desktop, stack on mobile. Each is a
plain `<a>` with an inline SVG icon (no external icon font). They make
the value proposition skimmable in <1 second.

### 9.3 "Why Sophie" section (homepage)

A short, indexable section explaining the differentiation in plain
English. Three paragraphs, ~80 words each:

- *"Why your data never leaves the browser"* (privacy).
- *"Why these numbers are trustworthy"* (citations + open source).
- *"Why this is free"* (philosophy / public-utility framing).

This is the content that earns featured snippets for queries like
*"is sophiewell free"*, *"is sophiewell legit"*, *"is sophiewell
HIPAA compliant"* — high-intent, low-volume, zero-competition queries
that convert.

### 9.4 FAQ expansion

Current `FAQPage` JSON-LD has 5 questions. Extend to 12, all answers
under 50 words, all phrased as the literal search query:

1. Is Sophie Well free?
2. Is Sophie Well safe to use with patient data?
3. Does Sophie Well work offline?
4. Does Sophie Well replace my EHR calculator?
5. Where does Sophie Well's data come from?
6. Can I use Sophie Well for billing decisions?
7. Is Sophie Well HIPAA compliant?
8. Does Sophie Well use AI?
9. How current are the codes (ICD-10, HCPCS, CPT)?
10. Can I trust Sophie Well's clinical scores?
11. How do I report a bug or wrong answer?
12. Who built Sophie Well?

Mirror these in visible HTML below the tool grid (collapsed `<details>`
elements) so both crawlers and humans see them.

## 10. Internal linking

Internal links are the cheapest and most under-used SEO lever Sophie
has. Add:

- **"Related tools" footer** on every tool tile and pre-rendered page
  (3–5 hand-curated by tool group in `META`).
- **Crosslink billing tools to clinical tools** where the workflow
  spans both, e.g., the bill decoder links to the No Surprises Act
  checker; the ICD-10 lookup links to the CPT reference.
- **Hub pages** for each audience: `/for/patients/`, `/for/clinicians/`,
  `/for/billers/`, `/for/ems/`, `/for/educators/`. Each lists the tools
  that audience uses, in workflow order, with one-paragraph context per
  group. These are the pages that rank for *"healthcare tools for
  nurses,"* *"medical billing tools for patients,"* etc. — five new
  high-value SEO landing pages from existing data.
- **Topic clusters**: `/topics/cardiology/`, `/topics/triage/`,
  `/topics/medication-safety/`, etc. Group tools by clinical topic in
  addition to audience. Each topic page is its own indexable URL.

## 11. Performance & Core Web Vitals

Google ranks fast, stable pages higher. Sophie is already excellent
here (no third-party scripts, small bundle), but verify and lock in:

- Confirm LCP < 2.5s, CLS < 0.1, INP < 200ms on the home page and on
  the three highest-traffic tool pages, measured on a throttled
  Moto G Power profile via Lighthouse CI in the existing build.
- Pre-load the WOFF2 fonts (if any custom fonts are used) with
  `<link rel="preload" as="font" crossorigin>`.
- Ship a `loading="lazy"` attribute on the logo and any below-the-fold
  imagery. (Currently the logo is small and above-the-fold; leave it
  eager.)
- Add `fetchpriority="high"` to the LCP element.

## 12. Off-page (one-time, low-effort)

- Submit Sophie to: Hacker News (Show HN), Product Hunt, r/medicine,
  r/medicalcoding, r/EmergencyMedicine, r/nursing, AllNurses.com, the
  AHIMA forums, the AAPC forums, and the Healthcare IT subreddit.
  These are one-shot launches, not ongoing campaigns.
- Add Sophie to the awesome-lists on GitHub: `awesome-selfhosted`,
  `awesome-healthcare`, `awesome-medical`. Each is a high-authority
  inbound link.
- Cross-link from claygood.com (the author site) with a proper "I
  built this" paragraph and a link with descriptive anchor text
  ("free healthcare toolbox") rather than "click here."
- Get listed on opensource.com, healthcaretechoutlook.com, and one or
  two open-source healthcare directories. These are slow but
  high-authority.

## 13. Monitoring (no-telemetry compatible)

Sophie cannot run analytics on the site. That is a constraint, not a
limitation. Use *off-site* monitoring:

- Google Search Console for impressions, clicks, top queries, CTR,
  index coverage, and Core Web Vitals (server-side data, no client
  script needed).
- Bing Webmaster Tools (same data, separate index).
- Cloudflare Web Analytics is privacy-respecting but still a runtime
  dependency. **Skip it** — Search Console alone gives every signal
  that matters for SEO without violating the no-telemetry rule.

Review monthly:
- Top 20 queries by impression. If Sophie is impression-rich and
  click-poor, the title/description is wrong — rewrite it.
- Top 20 pages by impression. If a tool is getting impressions on
  unexpected queries, write a new prose paragraph that owns that
  query.
- Coverage errors. Hash-fragment duplicates should drop to zero after
  the sitemap fix.

## 14. Phased rollout

### Phase 1 — quick wins (1 day, no build changes)

1. Rewrite home `<title>` and `<meta description>` per §6.
2. Delete the `<meta keywords>` tag.
3. Replace the hidden `<h1>` with a visible one per §9.1.
4. Fix the `178` → `195` (or whatever the current count is) in JSON-LD.
5. Add the trust strip per §9.2.
6. Expand the FAQ JSON-LD per §9.4.
7. Strip hash URLs from `sitemap.xml` (leave only `/`).
8. Update `robots.txt` per §8.3.

These eight changes alone will roughly double Sophie's organic CTR
within two crawl cycles (~2 weeks).

### Phase 2 — pre-rendered tool pages (1–2 weeks)

1. Build `scripts/build-tool-pages.mjs` per §5.4.
2. Author the top 50 tool-page prose blocks by hand.
3. Generate the remaining ~145 from templates.
4. Add per-tool schema per §7.2.
5. Replace `sitemap.xml` with the generated per-tool list per §8.1.
6. Generate per-tool OG images per §6.3.
7. Submit the new sitemap to Search Console.

This is where the long-tail traffic comes from. Expect 60–90 days for
Google to fully crawl, index, and rank the new pages.

### Phase 3 — hubs and topic clusters (1 week)

1. Build the five audience hubs per §10.
2. Build 6–10 topic clusters per §10.
3. Wire internal links per §10.
4. Off-page launches per §12.

### Phase 4 — ongoing

- Monthly Search Console review per §13.
- Rewrite the lowest-CTR titles every quarter.
- Add new tool pages to the sitemap as they ship (already automated
  from §5.4, but verify).
- Refresh `lastmod` from git automatically per build (already
  automated from §8.1, but verify).

## 15. Success metrics

90 days post-Phase-2:

- ≥ 195 indexed pages in Google Search Console (currently effectively 1).
- ≥ 5,000 weekly impressions (baseline TBD; current is unknown without
  Search Console — set baseline at Phase 1 launch).
- ≥ 4% average SERP CTR (vs. ~1.5% for brand-only titles).
- Top 10 ranking for ≥ 25 long-tail queries Sophie uniquely owns
  (e.g., "free QTc calculator with citation," "ICD-10 lookup no
  signup," "medical bill decoder browser only").
- Zero "duplicate without user-selected canonical" errors in Search
  Console (the hash-URL bug, fixed in Phase 1).

## 16. What this spec deliberately does not do

- **No paid ads, no Google Ads landing pages.** Out of scope and out of
  spirit.
- **No analytics scripts, no pixels, no consent banners.** The
  no-telemetry rule is absolute.
- **No "AI-generated content."** Every prose block is hand-authored or
  templated from `META`. Google's helpful-content updates penalize
  scaled AI content.
- **No link buying, no PBNs, no reciprocal-link schemes.** All inbound
  links are earned via real placements per §12.
- **No cloaking, no doorway pages, no pure-keyword landing pages.**
  Every new URL must have real content a human would value.
- **No comment sections, no user accounts, no UGC.** Out of scope per
  the v5/v6 architectural rules.

---

**Author:** Clay Good · **Drafted:** 2026-05-14 · **Status:** proposed
