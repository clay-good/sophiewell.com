# v48 derivation provenance — CPOT (`cpot`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-2c
- Citation re-verified against: Gelinas C, Fillion L, Puntillo KA, Viens C, Fortier M. *Validation of the Critical-Care Pain Observation Tool in adult patients.* Am J Crit Care. 2006;15(4):420-427.

## Components — verbatim source mapping

Four nurse-observed behaviors, each scored 0-2 from Gelinas 2006 Table 1.

| Component | Source levels |
|---|---|
| Facial expression | 0 relaxed neutral / 1 tense (frowning, brow lowering) / 2 grimacing |
| Body movements | 0 absence of movements / 1 protection (slow, cautious; touching pain site) / 2 restlessness or agitation |
| Muscle tension (assess by passive flexion-extension) | 0 relaxed / 1 tense, rigid / 2 very tense or rigid |
| Compliance with ventilator (intubated) OR vocalization (extubated) | 0 tolerating / talking in normal tone; 1 coughing but tolerating; sighing, moaning; 2 fighting ventilator / crying out |

Each `points` callback is `(v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0)))` — value IS the component's contribution, clamped to [0, 2].

## Bands — source mapping

| Range | Source label (Gelinas 2006) | Sophie band label |
|---|---|---|
| 0-2 | acceptable pain | acceptable pain (cutoff <3) |
| ≥ 3 | unacceptable pain | unacceptable pain; review analgesia |

## Population

Gelinas 2006: validation in 105 adult cardiac-surgery ICU patients (intubated and extubated) at a Canadian tertiary center. Reference standards: patient self-report (extubated) and Behavioral Pain Scale (intubated).

## Validity

Adult ICU patients (intubated AND extubated). CPOT is a behavioral pain assessment for patients who cannot self-report; if the patient can self-report reliably, the numeric rating scale (NRS) is the preferred tool. Endorsed by SCCM PADIS 2018 (Devlin 2018) for adult ICU pain monitoring. NOT validated in deeply sedated (RASS ≤ -4) or paralyzed patients — both reduce observable pain behaviors. NOT validated in pediatric ICU (use FLACC or COMFORT-B).

## Source quote

"The CPOT is a valid and reliable tool for the assessment of pain in critically ill adult patients who are unable to communicate." — Gelinas 2006 §Conclusion.

## Renderer assertions

Verified locally:
- `META.cpot.derivation` has every required field per `lib/derivation.js validate()` and exactly 4 components.
- Components sum equals `cpot().score` at three boundary points (zero, cutoff 3, max 8).

## Defects opened
None.
