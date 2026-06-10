# spec-v65.md — Three bedside-physiology calculators a nurse still does on paper: `o2-cylinder-duration`, `minute-ventilation`, `cerebral-perfusion-pressure`

> Status: **IMPLEMENTED (2026-06-10). Catalog 334 → 337.**
> Three deterministic, citable bedside tiles closing verified gaps that
> survived the v4–v64 build-out: the **oxygen-cylinder time-to-empty** that
> gates every patient transport, the **minute-ventilation / target-PaCO₂ rate**
> that drives every ventilator CO₂ adjustment, and the **cerebral perfusion
> pressure** (CPP = MAP − ICP) that every neuro-ICU nurse computes each hour.
> Compute in [`lib/clinical-v8.js`](../lib/clinical-v8.js) (already in the
> [spec-v59](spec-v59.md) fuzz harness), renderers in the matching `views/group-*`
> modules, META entries with inline citations, spec-v11 audit logs, and ≥3
> boundary unit tests each. Every prior spec (v4 through v64) remains in force;
> v65 adds no runtime network call and no AI, and inherits the
> [spec-v59](spec-v59.md) input/output-safety and
> [spec-v60](spec-v60.md) citation contracts.

## 1. Thesis

The 334-tile catalog is, by design, exhaustively built across the named
bedside domains — early-warning scores, infusion math, electrolyte and
acid-base, vent mechanics, neuro severity, OB/neonatal. A render-tree and
near-neighbor audit against the live catalog finds **three** calculations
that an ICU/ED/floor nurse performs on a routine shift, that are
deterministic and source-anchored, and that **no current tile computes**:

1. **"Will this oxygen tank make it to CT and back?"** Every intra-hospital
   transport of an oxygen-dependent patient begins with a cylinder-duration
   calculation: usable volume = (gauge pressure − safe residual) × the
   cylinder's conversion factor; minutes remaining = usable volume ÷ flow.
   This is the respiratory-safety analog of `infusion-time-remaining`
   (which is explicitly **IV-bag/syringe** arithmetic — "time to empty =
   volume / rate"), and it is the single most common reason a transport is
   delayed or, worse, a patient desaturates in a hallway. The catalog
   computes the IV-bag clock but not the O₂-tank clock.

2. **"What rate corrects this CO₂?"** `driving-pressure` already computes
   plateau − PEEP and static compliance; `pbw-ardsnet` sets the
   lung-protective tidal volume; `rsbi` gives the RR/Vt weaning ratio;
   `vent-sbt-peep` gives the PEEP/FiO₂ table. **None computes minute
   ventilation (V̇E = RR × Vt) or the target-PaCO₂ rate adjustment** —
   the gas-exchange calculation (PaCO₂ ∝ 1 / alveolar ventilation) that
   tells the bedside what new respiratory rate reaches a target PaCO₂.
   The mechanics are covered; the gas exchange is not.

3. **"What is the CPP right now?"** The `map` tile computes MAP from blood
   pressure; nothing subtracts ICP. **Cerebral perfusion pressure
   (CPP = MAP − ICP)** is the governed number on every severe-TBI,
   subarachnoid-hemorrhage, and post-craniotomy neuro-ICU flowsheet — the
   value the bedside nurse keeps inside the Brain Trauma Foundation
   60–70 mmHg target band by titrating pressors and CSF drainage. It is one
   subtraction away from a tile that already exists, and it is not in the
   catalog.

All three are deterministic, weight-or-pressure-driven, anchored to a
standard physiology reference or published guideline, and pass the
[spec-v29](spec-v29.md) §3 one-line test (input → computed output). None is
a "googleable static table"; each is a calculation done at the bedside today
on scratch paper. This is precisely the nurse-first deepening the maintainer
direction calls for: open-this-on-shift necessities, not reference guides.

## 2. The tiles

### 2.1 `o2-cylinder-duration` — Oxygen cylinder time-to-empty & flow-limited duration

- **Citation:** Compressed Gas Association cylinder specifications and
  standard respiratory-care cylinder factors (Kacmarek RM, Stoller JK,
  Heuer AJ. *Egan's Fundamentals of Respiratory Care*, 12th ed., 2020):
  usable minutes = (gauge psi − safe residual psi) × cylinder factor
  (L/psi) ÷ flow (L/min). Cylinder factors: D 0.16, E 0.28, M 1.56,
  G 2.41, H/K 3.14 L/psi (utility-class arithmetic tile, like `drip-rate`
  and `infusion-time-remaining`; the factors are physical constants from
  the cylinder geometry, not a derived clinical constant).
- **Group:** Medication & Infusion (`F`) — sibling of `infusion-time-remaining`.
  **Audiences:** `clinicians`, `field`. **Specialties:** `nursing-icu`,
  `nursing-floor`, `nursing-transport`, `respiratory-therapy`,
  `emergency-medicine`.
- **Inputs:** cylinder size (D / E / M / G / H-K, selecting the factor),
  current gauge pressure (psi), flow rate (L/min), and a safe-residual
  pressure (psi, default **200** — the gauge becomes unreliable and the
  regulator may not maintain set flow below it).
- **Output:** the **usable oxygen volume (L)**, the **time until the
  cylinder reaches the safe residual (hh:mm)**, and the inverse — the
  **maximum flow that lasts a target transport time** (e.g., the flow an
  E-cylinder sustains for a 45-minute round trip). Renders the
  "verify against your gauge and institutional transport policy; swap or
  carry a spare below the residual threshold" note. **Near-neighbor:**
  `infusion-time-remaining` (IV bag/syringe time-to-empty — liquid, not
  gas; no overlap) — cross-linked.

### 2.2 `minute-ventilation` — Minute ventilation & target-PaCO₂ rate adjustment

- **Citation:** Respiratory physiology — Marino PL. *The ICU Book*, 4th ed.,
  2014 (V̇E = respiratory rate × tidal volume; alveolar ventilation
  V̇A = RR × (Vt − dead space); PaCO₂ ∝ V̇CO₂ / V̇A, so at constant CO₂
  production the rate to reach a target PaCO₂ scales with the current
  PaCO₂/target ratio). Anatomic dead space ≈ 2.2 mL/kg ideal body weight
  (West JB. *Respiratory Physiology*). Physiology/utility-class, like
  `cao2-do2`.
- **Group:** Labs & Physiology (`E`) — alongside `cao2-do2`,
  `driving-pressure`, `oxygenation-index`. **Audiences:** `clinicians`,
  `educators`. **Specialties:** `nursing-icu`, `critical-care`,
  `respiratory-therapy`, `anesthesiology`.
- **Inputs:** respiratory rate (/min), tidal volume (mL), optional ideal
  body weight (kg, for the dead-space/alveolar term), and an optional
  current-PaCO₂ + target-PaCO₂ pair (mmHg) for the rate adjustment.
- **Output:** the **total minute ventilation (L/min)** and, when IBW is
  given, the **alveolar minute ventilation** (subtracting anatomic dead
  space). When the PaCO₂ pair is entered, the **respiratory rate required
  to reach the target PaCO₂** at the current tidal volume — flagged when
  the computed rate exceeds a plausible ceiling (~35/min) with the
  source-anchored note to raise tidal volume within the lung-protective
  6 mL/kg limit instead, and to watch for breath-stacking / auto-PEEP.
  **Near-neighbors:** `driving-pressure` (mechanics: plateau/PEEP/compliance,
  not gas exchange), `pbw-ardsnet` (sets the Vt this tile consumes), `rsbi`
  (RR/Vt weaning ratio) — all distinct, cross-linked.

### 2.3 `cerebral-perfusion-pressure` — CPP = MAP − ICP (Brain Trauma Foundation target band)

- **Citation:** Carney N, et al. Guidelines for the Management of Severe
  Traumatic Brain Injury, 4th Edition. *Neurosurgery*. 2017;80(1):6-15
  (CPP = MAP − ICP; recommended target **60–70 mmHg** for survival and
  favorable outcomes; aggressive maintenance >70 mmHg with fluids/pressors
  is discouraged for respiratory-failure risk).
- **citationUrl:** https://doi.org/10.1227/NEU.0000000000001432
- **Group:** Labs & Physiology (`E`) — sibling of `map`. **Audiences:**
  `clinicians`, `educators`. **Specialties:** `nursing-icu`,
  `nursing-neuro`, `neurocritical-care`, `neurosurgery`, `critical-care`.
- **Inputs:** MAP (mmHg) **or** SBP + DBP (computing MAP via the `map`
  formula when MAP is not measured directly), and ICP (mmHg).
- **Output:** the **cerebral perfusion pressure (mmHg)** with the
  BTF-2017 interpretation band: **< 60 mmHg** (ischemia risk — raise MAP
  or lower ICP), **60–70 mmHg** (recommended target), **> 70 mmHg**
  (above target — caution maintaining with aggressive fluids/pressors).
  Renders the note that the optimal CPP may be individualized by cerebral
  autoregulation (PRx/optimal-CPP) at centers that monitor it, which this
  tile does not compute. **Near-neighbors:** `map` (MAP from BP, no ICP —
  the input this tile extends), `ich-score` / `hunt-hess-wfns` (hemorrhage
  *severity*, not perfusion) — distinct, cross-linked.

## 3. Per-tile robustness

- Every compute is pure and `lib/num.js`-backed. Any zero or non-finite
  denominator — flow 0 (`o2-cylinder-duration`), respiratory rate 0 or
  target PaCO₂ 0 (`minute-ventilation`) — returns `null` → the renderer's
  `fmt()`/`safe()` fallback, never `NaN`/`Infinity`. A gauge pressure at or
  below the safe residual yields a visible "at/below residual — swap now"
  note, not a negative duration. A computed CPP that is negative (ICP > MAP)
  renders with an explicit critical-low flag rather than being hidden.
- `o2-cylinder-duration` and `minute-ventilation` are **utility/physiology
  class** (their constants are cylinder geometry and gas-law physiology, not
  a guideline-issuer constant), so they cite inline but do **not** trip the
  [spec-v60](spec-v60.md) `ISSUER_PATTERN` citation-staleness gate.
  `cerebral-perfusion-pressure` cites the Brain Trauma Foundation 4th-edition
  target band; BTF is not in the current `ISSUER_PATTERN`, so no ledger row
  is mandatory, but the tile carries an `accessed` date voluntarily and is a
  candidate for the [spec-v60](spec-v60.md) §4 REFRESH list since the BTF
  guideline is periodically revised.
- Every interpolated number routes through `fmt()`/`fmtInt()`/`fmtNum()`
  ([spec-v53](spec-v53.md) §3 / [spec-v59](spec-v59.md) §2.6). The compute
  module (`lib/clinical-v8.js`) is already enrolled in the spec-v59
  object-aware fuzz harness, so the three new exports are covered on import;
  zero non-finite leaks is a merge gate.
- All three render the explicit "planning estimate — verify against the
  device gauge / ventilator / monitor and local protocol" notice, consistent
  with the existing bedside-utility tiles ([spec-v62](spec-v62.md) posture).
  None generates an order, titrates automatically, or replaces device
  measurement.

## 4. Files touched

```
docs/spec-v65.md                          (this file)
app.js                                     (+3 UTILITIES rows: o2-cylinder-duration [F], minute-ventilation [E], cerebral-perfusion-pressure [E])
lib/clinical-v8.js                         (new exports: o2CylinderDuration, minuteVentilation, cerebralPerfusionPressure; + O2_CYLINDER_FACTORS constant)
views/group-f.js                           (o2-cylinder-duration renderer; A4 flow/pressure fields)
views/group-e.js                           (minute-ventilation + cerebral-perfusion-pressure renderers)
lib/meta.js                               (+3 META entries w/ inline citation + citationUrl/accessed where applicable; + related cross-links to infusion-time-remaining, map, driving-pressure, pbw-ardsnet)
docs/audits/v11/o2-cylinder-duration.md          (spec-v11 audit log)
docs/audits/v11/minute-ventilation.md            (spec-v11 audit log)
docs/audits/v11/cerebral-perfusion-pressure.md   (spec-v11 audit log)
test/unit/o2-cylinder-duration.test.js           (>=3 boundary worked examples incl. flow-0 null + at-residual note)
test/unit/minute-ventilation.test.js             (>=3 boundary worked examples incl. RR-0 null + target-PaCO2 inverse round-trip)
test/unit/cerebral-perfusion-pressure.test.js    (>=3 boundary worked examples incl. MAP-from-BP path + negative-CPP flag)
index.html, package.json, README.md, docs/scope-mdcalc-parity.md   (catalog 334 -> 337 across all catalog-truth surfaces)
CHANGELOG.md                              (Unreleased: v65 entry, +3)
```

## 5. Acceptance criteria

- All three tiles are present: each has a `META[id]` entry with an inline
  cited output (a `citationUrl` where a DOI exists), ≥3 boundary worked
  examples in its unit test (incl. the zero-denominator null path and the
  edge note/flag), a [spec-v11](spec-v11.md) audit log, and passes the
  [spec-v29](spec-v29.md) §3 one-line test (input → computed output).
- `o2-cylinder-duration` reproduces the standard worked example
  (E-cylinder, 2000 psi gauge, 200 psi residual, 2 L/min → usable
  (2000 − 200) × 0.28 = **504 L**, **252 min ≈ 4:12**) within rounding.
- `minute-ventilation` reproduces V̇E = 16 × 450 mL = **7.2 L/min**, and
  the target-PaCO₂ inverse round-trips (current PaCO₂ 60 → target 40 at
  RR 16 ⇒ required RR **24/min**).
- `cerebral-perfusion-pressure` reproduces CPP = MAP 90 − ICP 20 =
  **70 mmHg** (top of the BTF target band) and computes MAP from
  SBP 120 / DBP 60 = 80 when MAP is not entered.
- `UTILITIES.length` is **337** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree (`check-catalog-truth` + `grep-check`
  clean).
- The three computes are covered by the [spec-v59](spec-v59.md) fuzz harness
  with zero non-finite leaks.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all
  pass; the CHANGELOG records v65 with the +3 delta.

## 6. Out of scope for v65

- **No ventilator-mode logic or auto-titration.** `minute-ventilation`
  computes V̇E and the CO₂-targeted rate; it does not model pressure-control
  vs volume-control mechanics, set the ventilator, or recommend a mode. The
  order stays with the clinician and respiratory therapist.
- **No dead-space (Vd/Vt, Bohr-Enghoff) or compliance/resistance tile.**
  Static compliance is already on `driving-pressure`; a volumetric-capnography
  dead-space calculator needs end-tidal CO₂ and is a separate, RT-specific
  piece of work, deferred.
- **No individualized "optimal CPP" / autoregulation index.** PRx /
  optimal-CPP computation requires continuous high-frequency MAP/ICP
  waveform data the catalog does not ingest; `cerebral-perfusion-pressure`
  computes the standard CPP and the BTF target band only, and says so.
- **No multi-gas or liquid-oxygen support.** `o2-cylinder-duration` covers
  the standard compressed-gas D/E/M/G/H cylinders; liquid-O₂ reservoirs,
  concentrators, and non-oxygen gases are out of scope.
- **No change to `map`, `infusion-time-remaining`, `driving-pressure`,
  `pbw-ardsnet`, or any existing tile's output** — v65 adds three siblings
  and cross-links them; it modifies no existing result.
- **No extension of the multi-audience scope.** v65 is a nurse/clinician-first
  bedside-physiology addition; the billing/coding/regulatory operations
  surface ([spec-v10](spec-v10.md), [scope-mdcalc-parity](scope-mdcalc-parity.md))
  is unchanged.
```
