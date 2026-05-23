# scope: MDCalc-equivalent catalog parity, on Sophie's terms

> Status: committed (2026-05-17). Long-horizon scope statement.
> Companion to [docs/spec-v10.md](spec-v10.md) (positioning) and
> [docs/spec-v11.md](spec-v11.md) (correctness floor).
>
> This is not a roadmap with dates. It is the **direction of
> travel**: Sophie intends to eventually carry every clinically
> actionable calculator a healthcare worker would otherwise reach
> for MDCalc to find, plus the billing / coding / regulatory
> surface MDCalc does not cover. The commitment is to the
> *direction*; the speed is bounded by the [spec-v11](spec-v11.md)
> quality floor and the solo-developer cadence the project runs at.

## 1. The commitment

Over time — measured in years, not quarters — sophiewell.com will
host every calculator that meets all of:

1. **Actionable.** The calculator produces a result a clinician
   acts on (score → risk band, formula → dose / rate / fluid,
   threshold → admit / discharge / order). "Look at this reference
   table" tiles are deferred to the reference-tile contract
   already in [spec-v8 §3.1](spec-v8.md); they are valid but they
   are not the priority.
2. **Cited.** The calculator has a primary published source —
   peer-reviewed paper, society guideline, regulatory publication,
   or an agency dataset. No "common practice" tiles whose source
   is folk knowledge.
3. **Deterministic.** Pure function of inputs. No model in the
   loop, no external call at render time.
4. **In Sophie's audience** ([spec-v10 §2.1](spec-v10.md)): used
   by bedside clinicians, billers / coders, EMS / field-medicine
   workers, healthcare educators, or by patients via the existing
   simple-decoder surface.

The target is **not** "match MDCalc's count." MDCalc ships some
tiles Sophie will deliberately skip (single-center validations,
sponsored disease-awareness calculators, tools whose primary use
is marketing a drug class). The target is **the actionable subset
of MDCalc, plus everything MDCalc does not cover** (billing
codes, claims-adjustment reasons, NSA eligibility, ABN, COBRA
timeline, ACA SEP, CMS-1500, UB-04, HIPAA RoA, the patient-
literacy decoders, the field-medicine and EMS workflow tiles).

> **Amended by [spec-v29](spec-v29.md):** The "everything MDCalc
> does not cover" clause is **narrowed**. The surviving billing /
> coding / regulatory surface is now only the *calculator-shaped*
> rows (time-based E/M selector, NDC 10/11 converter, HIPAA
> 60-day breach clock, and the patient-facing workflow
> *generators* in Group H). Code-reference indexes, patient-
> administrative infographics, reference tables of normal values,
> hazmat / occupational reference cards, and single-class clinical
> reference cards are now permanently out of scope per
> [spec-v29 §3](spec-v29.md). The one-line test is now: **a tile
> that does not consume at least one user input and produce a
> computed output is not in scope for Sophie.** v29 deletes 47
> reference-only tiles and adds 20 nurse-bedside calculators;
> the catalog shrinks for the first time in the project's
> history. (The spec-v29 ledger projected 603 -> 576 from an
> over-counted base; actual at v29 close is 230 tiles; v30
> close — [spec-v30](spec-v30.md), which re-admits two
> thermal-emergency staging tiles as decision tools — is 232;
> v31 close — [spec-v31](spec-v31.md), which adds the Beers
> deprescribing checker — is 233; v32 close —
> [spec-v32](spec-v32.md), which adds three non-verbal pain
> scales (FLACC, PAINAD, NIPS) — is 236; v33 close —
> [spec-v33](spec-v33.md), which adds N-PASS, CRIES, and POSS —
> is 239; v34 close — [spec-v34](spec-v34.md), which adds
> COMFORT-B, WAT-1, and SBS — is 242; v35 close —
> [spec-v35](spec-v35.md), which adds SOS as the WAT-1 companion
> — is 243; v36 close — [spec-v36](spec-v36.md), which adds
> MEOWS as the maternal track-and-trigger — is 244; v37 close —
> [spec-v37](spec-v37.md), which adds CPSS and LAMS as the
> prehospital / ED stroke triage scales — is 246; v38 close —
> [spec-v38](spec-v38.md), which adds RACE as the prehospital
> LVO predictor companion to LAMS — is 247; v39 close —
> [spec-v39](spec-v39.md), which adds ROSIER as the ED
> stroke-recognition scale with mimic discrimination — is 248;
> v40 close — [spec-v40](spec-v40.md), which adds GUSS as the
> post-stroke bedside dysphagia screen — is 249; v41 close —
> [spec-v41](spec-v41.md), which adds FOUR Score as the ICU
> coma scale for intubated patients — is 250; v42 close —
> [spec-v42](spec-v42.md), which adds Katz ADL as the geriatric
> / discharge-planning functional-status index — is 251; v43
> close — [spec-v43](spec-v43.md), which adds Lawton IADL as the
> instrumental-ADL companion to Katz — is 252; v44 close —
> [spec-v44](spec-v44.md), which adds the Barthel Index as the
> rehab-nursing weighted ADL — is 253; v45 close —
> [spec-v45](spec-v45.md), which adds the C-SSRS Screener as the
> bedside suicide-risk screening tile — is 254.)

A reasonable steady-state estimate is **400–600 tiles over 3–5
years**, depending on how aggressive the audit pace is and how
much time the maintainer chooses to spend. The exact number is
secondary to the quality bar.

## 2. Why this commitment is in writing

Because direction drifts. Without a written commitment, Sophie's
default failure mode is to plateau at "the tiles I happened to
care about" and never become the reference tool the audience
needs. Without a written commitment, the *next* time a clever
adjacent-product idea shows up (patient artifact decoders, AI
chat, a SaaS tier), there is nothing on paper to anchor against.

This document is that anchor. The thesis is one sentence:

> Sophie's job is to make every actionable clinical calculator a
> healthcare worker needs available in one free, deterministic,
> citable, login-less place.

If a proposal does not advance that thesis, it is out of scope.

## 3. The cadence rationale

Sophie ships **slowly on purpose**. Three forces set the cadence:

1. **The [spec-v11](spec-v11.md) audit floor.** Every new tile
   ships with the same artifacts an audited tile has: primary
   citation re-verified, ≥3 boundary worked examples, a cross-
   implementation differential within 0.5% (or one category for
   ordinal scores), edge-input handling reviewed, a11y reviewed.
   That is hours per tile, not minutes. Speed-running tile
   additions is the failure mode v11 exists to prevent.
2. **Solo-developer reality.** The maintainer is one person with
   a day job. Sustainable cadence is ~5–20 audited tiles per
   month, depending on complexity. Faster is unsustainable; slow
   is fine because the existing 244 tiles already cover the
   highest-frequency clinical workflows.
3. **Source stability.** Clinical formulas are mostly stable on
   decade timescales (Wells PE from 2000 is still the same Wells
   PE). New tiles ship slowly because new clinical formulas
   *appear* slowly; the work is mostly catching up to a body of
   knowledge that does not move.

The commitment is therefore: **eventually complete, never
rushed.** A clinician who finds a missing calculator and
reports it does not get a same-week ship; they get a "queued,
will be audited and added with the same rigor as everything
else."

## 4. What the parity target excludes

Even when Sophie reaches steady state, the following are
permanently out:

- **AI-generated calculators / "smart" diagnostic helpers.**
  Restated from [spec-v10 §2.3](spec-v10.md).
- **Single-center, single-paper validations without an
  independent replication.** A clinician who needs an
  experimental score uses MDCalc or the original paper. Sophie
  waits for the validated form.
- **Sponsored or pharma-affiliated calculators** designed to
  funnel into a specific drug class. The bar is "the calculator
  exists to answer a clinical question," not "the calculator
  exists to market a product."
- **Calculators whose stated output is a treatment
  recommendation in Sophie's voice.** Per [spec-v11 §5.3](spec-v11.md),
  Sophie quotes the source's per-band interpretation when one
  exists; Sophie does not author treatment recommendations.
- **Calculators that require continuous data feeds** (live
  formularies that change weekly, payer-specific coverage rules
  that change per-employer). The
  [spec-v5 maintenance contract](spec-v5.md) excludes live data.
- **Calculators whose primary input is a free-text document the
  user pastes in expecting NLP extraction.** Restated from
  [spec-v10 §3](spec-v10.md): no patient-artifact decoding past
  the simple existing decoders.

## 5. Backlog signal

The maintainer keeps a private list of candidate calculators.
Public-facing signal that a calculator is missing is welcome via:

- A GitHub issue on [github.com/clay-good/sophiewell.com](https://github.com/clay-good/sophiewell.com)
  titled `tile request: <name>` with the primary citation.
- A `mailto:` link from the tile detail (deferred per
  [spec-v10 §7](spec-v10.md) but consistent with this scope).

There is no public roadmap board. The order in which missing
calculators land is set by the maintainer's read of clinical
frequency × source stability × audit feasibility. Patient-
literacy and billing-tile requests follow the same path.

## 6. Quality versus speed, settled

Anywhere this document and a speed argument disagree, this
document wins. Anywhere this document and [spec-v11](spec-v11.md)
disagree on the quality bar, spec-v11 wins. Anywhere this
document and [spec-v10](spec-v10.md) disagree on positioning or
scope, spec-v10 wins.

The hierarchy is: **v10 (what Sophie is) → v11 (how good Sophie
must be) → this document (where Sophie is going).** Everything
else fits underneath.

## 7. The reciprocal commitment

If a clinician — nurse, biller, EMS provider, educator — pulls
up sophiewell.com at 2 a.m. and finds the calculator they need,
they should be able to:

- See the result in one screen, with no login, no banner, no
  modal.
- Read the citation without clicking.
- See the example value and verify the math against their
  source if they want to.
- Save the page for offline use if their Wi-Fi is bad.
- Trust that the result they got Monday is the result they will
  get Friday.

That is the commitment this document codifies. Catalog parity
with MDCalc is the *mechanism*; the **commitment is the
experience**.
