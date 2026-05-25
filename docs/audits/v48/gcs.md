# v48 derivation provenance — Glasgow Coma Scale (`gcs`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-1a
- Citation re-verified against: Teasdale G, Jennett B. *Assessment of coma and impaired consciousness: a practical scale.* Lancet. 1974;2(7872):81-84.

## Components — verbatim source mapping

GCS is the sum of three independently scored neurological components. The source paper defines six observation levels for the three components (E 1-4, V 1-5, M 1-6; total 3-15).

| Component | Source levels (Teasdale & Jennett 1974) |
|---|---|
| Eye opening (1-4) | 1 None, 2 To pain, 3 To speech, 4 Spontaneously |
| Best verbal response (1-5) | 1 None, 2 Incomprehensible sounds, 3 Inappropriate words, 4 Confused conversation, 5 Oriented |
| Best motor response (1-6) | 1 None, 2 Extension to pain (decerebrate), 3 Abnormal flexion (decorticate), 4 Withdrawal to pain, 5 Localizing pain, 6 Obeying commands |

In `META.gcs.derivation.components`, `points` is the function `(v) => Number(v) || 0` because the input value *is* the per-component contribution (each component is an integer in its allowed range). This differs from binary-additive scores (Wells, qSOFA) where `points` is a fixed integer contributed only when the boolean criterion is true. Both shapes are accepted by `lib/derivation.js scoreComponent`.

## Bands — verbatim source mapping

The standard severity bands (Mild 13-15, Moderate 9-12, Severe 3-8) are from the consensus accumulated since the 1974 paper. The 1974 paper itself uses the scale as a *descriptive* tool rather than prescribing bands; the 8-or-below threshold for "consider definitive airway protection" is part of the existing `META.gcs.interpretation` text and is repeated here in the derivation `bands` array because that text is what the renderer's terminal-band annotation surfaces.

## Population (verbatim from source)

Teasdale & Jennett 1974 §Material and methods: "The scale was used to assess 700 patients with acute head injury at the Institute of Neurological Sciences, Glasgow."

## Validity

The scale was designed for adults with acute brain injury (traumatic and non-traumatic). Standard caveats:
- Intubation, sedation, facial trauma, or aphasia can preclude scoring a component; the convention is to record the components individually (e.g., "E2_VT_M5") rather than collapsing to a partial total. The Sophie tile does not enforce this convention; the derivation's `validity` field documents it.
- The scale has not been redesigned for pediatric scoring; the Pediatric Glasgow Coma Scale is a separate instrument not covered here.

## Source quote

"To assess the depth and duration of impaired consciousness and coma three aspects of behaviour are independently measured—motor responsiveness, verbal performance, and eye opening." — Teasdale & Jennett 1974 §Abstract.

## Renderer assertions

Verified locally:
- `META.gcs.derivation` has every required field per `lib/derivation.js validate()`.
- Components sum equals `gcs()` total at three boundary points (3, 12, 15) — see `test/unit/derivation.test.js`.
- Bands span 3-15 contiguously.

## Defects opened
None.
