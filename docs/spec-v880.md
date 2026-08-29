# spec-v880 — EWGSOP2 sarcopenia algorithm

## What this gives you

Probable, confirmed, or severe sarcopenia — and the reason a muscle-mass measurement on its own
answers nothing.

## §1 Find, assess, confirm, grade

| Step | Threshold | Result |
|---|---|---|
| **Find** | SARC-F ≥ 4, or clinical suspicion | A prompt to measure |
| **Assess** — strength | Grip < 27 kg (men) / < 16 kg (women), or 5 chair rises > 15 s | **Probable** sarcopenia |
| **Confirm** — quantity | ASM < 20 kg (men) / < 15 kg (women), or index < 7.0 / < 5.5 kg/m² | **Confirmed** |
| **Grade** — performance | Gait ≤ 0.8 m/s, SPPB ≤ 8, TUG ≥ 20 s, or a failed 400 m walk | **Severe** |

## §2 Strength comes first, not mass

This is why the tile exists. The 2019 revision moved strength ahead of muscle mass deliberately;
the 2010 consensus led with mass. Nothing downstream is read until strength is low — a low muscle
mass with a normal grip is **not** sarcopenia by this algorithm, and the tile says exactly that
rather than returning a bare "not met". On every result.

## §3 Probable sarcopenia is actionable

Confirmation needs a muscle-mass measurement, and EWGSOP2 says intervention need not wait for it.
Printed on the probable result, which is otherwise easy to read as "not yet a diagnosis".

## §4 Performance grades severity; it does not diagnose

A slow gait speed with normal strength is not sarcopenia here, however much it matters
clinically. On every result.

## §5 Every cutoff is sex-specific

Reading a woman against the men's grip threshold is the easy error, so every result states which
set it used and what those numbers are. A grip of 24 kg is low in a man and normal in a woman,
and the tile answers differently for the two.

## §6 Sourcing (spec-v97 gate)

- Cruz-Jentoft AJ, Bahat G, Bauer J, et al. *Sarcopenia: revised European consensus on definition
  and diagnosis.* Age Ageing. 2019;48(1):16-31.

No tracked guideline issuer, so no `docs/citation-staleness.md` row is owed.

## §7 Posture

Decision support, not a verdict. It applies a published algorithm to measurements already taken.
It does not decide treatment.

Catalog 1670 → 1671.
