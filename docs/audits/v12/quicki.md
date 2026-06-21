# v12 audit - quicki

- Auditor: CG
- Date: 2026-06-21
- Citation re-verified against: Katz A, Nambi SS, Mather K, et al. Quantitative insulin sensitivity check index: a simple, accurate method for assessing insulin sensitivity in humans. J Clin Endocrinol Metab. 2000;85(7):2402-2410.

`lib/endo-v136.js quicki()` returns the QUICKI value. Class A (fixed published formula; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / formula note
- QUICKI = 1 / [log10(fasting insulin uU/mL) + log10(fasting glucose mg/dL)].
- Lower = lower insulin sensitivity; reference ~0.45 (healthy) to ~0.30-0.35 (type 2 diabetes). No universal diagnostic cut-point (reported as framing).

## Boundary worked examples added
- insulin 12 / glucose 100 -> QUICKI 0.3248; the lower-is-less-sensitive direction (higher insulin/glucose lowers it); the log-domain divide-by-zero guard (insulin 0.01 x glucose 100 = 1 -> log10 sum 0 -> surfaced fallback).

## Edge-input handling notes
- Requires insulin > 0 and glucose > 0; the reciprocal is checked for finiteness so log10-sum = 0 surfaces valid:false rather than +/-Infinity. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Two labeled number inputs; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
