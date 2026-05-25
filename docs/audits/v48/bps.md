# v48 derivation provenance — BPS (`bps`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-2c
- Citation re-verified against: Payen JF, Bru O, Bosson JL, Lagrasta A, Novel E, Deschaux I, Lavagne P, Jacquot C. *Assessing pain in critically ill sedated patients by using a behavioral pain scale.* Crit Care Med. 2001;29(12):2258-2263.

## Components — verbatim source mapping

Three nurse-observed behaviors, each scored 1-4 from Payen 2001 Table 1.

| Component | Source levels |
|---|---|
| Facial expression | 1 relaxed / 2 partially tightened (brow lowering) / 3 fully tightened (eyelid closing) / 4 grimacing |
| Upper limb movements | 1 no movement / 2 partially bent / 3 fully bent with finger flexion / 4 permanently retracted |
| Compliance with mechanical ventilation | 1 tolerating / 2 coughing but tolerating most of the time / 3 fighting ventilator / 4 unable to control ventilation |

Each `points` callback is `(v) => Math.max(1, Math.min(4, Math.round(Number(v) || 1)))` — value IS the component's contribution, clamped to [1, 4]. **Important:** because every component starts at 1 (not 0), the minimum aggregate is 3 — a "zero pain" reading in the source sense is a BPS of 3.

## Bands — source mapping

| Range | Source label | Sophie band label |
|---|---|---|
| 3-5 | acceptable pain | acceptable pain (cutoff <=5) |
| ≥ 6 | unacceptable pain | unacceptable pain (cutoff >5); review analgesia |

## Population

Payen 2001 derivation: 30 deeply sedated mechanically ventilated ICU patients at a French university hospital. Subsequent validation in larger cohorts including the SCCM PADIS literature.

## Validity

Mechanically ventilated, sedated adult ICU patients. BPS was the first widely-adopted behavioral pain scale for sedated mechanically ventilated patients. Endorsed by SCCM PADIS 2018 (Devlin 2018) alongside CPOT. NOT validated in extubated patients (use CPOT or self-report); NOT validated in pediatric ICU.

## Source quote

"We developed a behavioral pain scale (BPS) for the assessment of pain in critically ill sedated patients receiving mechanical ventilation. ... The BPS was a reliable and valid tool for the assessment of pain in critically ill sedated adult patients." — Payen 2001 §Abstract.

## Renderer assertions

Verified locally:
- `META.bps.derivation` has every required field per `lib/derivation.js validate()` and exactly 3 components.
- Components sum equals `bps().score` at three boundary points (minimum 3, above-cutoff 6, max 12).
- The cutoff is *above* 5 (i.e., ≥6) — verified by the cutoff test asserting `unacceptablePain === true` at sum = 6.

## Defects opened
None.
