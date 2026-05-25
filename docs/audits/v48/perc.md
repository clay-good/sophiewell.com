# v48 derivation provenance — PERC rule (`perc`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-1b
- Citation re-verified against: Kline JA, Mitchell AM, Kabrhel C, Richman PB, Courtney DM. *Clinical criteria to prevent unnecessary diagnostic testing in emergency department patients with suspected pulmonary embolism.* J Thromb Haemost. 2004;2(8):1247-1255.

## Components — verbatim source mapping

Eight binary criteria from Kline 2004 Table 1. PE can be ruled out by PERC ONLY when (a) clinical pretest probability is low AND (b) all 8 criteria are negative.

| Component (this file) | Source phrasing (Kline 2004) | Points |
|---|---|---|
| Age >= 50 | "Age ≥ 50 years" | 1 |
| Heart rate >= 100/min | "Pulse > 99 beats/min" | 1 |
| SaO2 < 95% on room air | "SaO₂ on room air < 95%" | 1 |
| Hemoptysis | "Hemoptysis" | 1 |
| Estrogen use (OCPs, HRT) | "Recent use of exogenous estrogen" | 1 |
| Prior DVT or PE | "Prior history of DVT or PE" | 1 |
| Recent surgery or trauma | "Recent surgery or trauma (≤ 4 weeks ago requiring treatment with general anesthesia)" | 1 |
| Unilateral leg swelling | "Unilateral leg swelling" | 1 |

The score is the *count of positive features*. PERC negative is defined as exactly 0 positive features (any positive feature → "PERC positive").

## Bands — verbatim source mapping

| Range | Source label |
|---|---|
| 0 features | "PERC negative" — PE can be ruled out at low pretest probability |
| ≥ 1 feature | "PERC positive" — rule-out does not apply |

## Population

Derivation: 3148 ED patients with suspected PE across 10 US sites (Kline 2004). Validation: prospective multicenter study of 8138 patients (Kline 2008, J Thromb Haemost. 2008;6(5):772-780).

## Validity

PERC applies ONLY to adults with low pretest probability of PE (e.g., gestalt < 15%, or Wells PE ≤ 4). In moderate or high pretest probability patients, PE workup proceeds regardless of PERC. Not validated in pregnancy. The renderer's `bands` text is intentionally explicit about the low-pretest precondition because PERC's misuse outside that population is the most common source of false reassurance.

## Source quote

"We propose that pulmonary embolism may be safely ruled out without further testing in patients with a low pretest probability of pulmonary embolism if they have a negative pulmonary embolism rule-out criteria (PERC) result." — Kline 2004 §Abstract.

## Renderer assertions

Verified locally:
- `META.perc.derivation` has every required field per `lib/derivation.js validate()`.
- Components sum equals `perc().score` at two boundary points (0 = PERC-negative; 1 = first failing criterion).
- Bands array makes the precondition (low pretest probability) explicit.

## Defects opened
None.
