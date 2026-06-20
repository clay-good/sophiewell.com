# v12 audit - mgfa

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Jaretzki A 3rd, Barohn RJ, Ernstoff RM, et al. Myasthenia gravis: recommendations for clinical research standards. Neurology. 2000;55(1):16-23, and the MG-ADL of Wolfe GI, Herbelin L, Statland JM, et al. Neurology. 1999;52:1487-1489 (re-fetched; the classification was read verbatim from the official MGFA Foundation PDF and the mg-united/argenx reprint; the MG-ADL anchor table from the Peerview practice aid citing Wolfe 1999 + Muppidi 2011 and the CADTH/NCBI NBK567509 range confirmation).

`lib/neuro-v121.js mgfa()` maps the predominant weakness pattern and severity to
Class I (any ocular weakness, all other strength normal), II (mild generalized),
III (moderate), IV (severe), or V (intubation, with or without mechanical
ventilation), with an "a" (limb/axial-predominant) or "b" (oropharyngeal/
respiratory-predominant) subtype on Classes II-IV; Class I and V carry no subtype.
The MG-ADL is the 8-item scale (talking, chewing, swallowing, breathing, brushing
teeth/combing hair, rising from a chair, double vision, eyelid droop), each clamped
0-3 so the total cannot exceed 24. Class A (fixed classification + ordinal sum;
journal+author citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md
row).

## Boundary worked examples added
- ocular only -> Class I, no subtype, MG-ADL 0/24.
- mild generalized + subtype a -> Class IIa, not severe-flagged.
- class-II vs class-IV band-flip: IIa (not flagged) vs IVb (flagged) with an
  MG-ADL total of 5.
- intubation -> Class V, no subtype, severe-flagged.
- MG-ADL with an out-of-range item (talking = 9) clamps each item to 0-3; total
  cannot exceed 24.
- scalar fuzz arg -> valid Class I, never NaN.

## Cross-implementation differential
- Reference: the class definitions and a/b subtype meaning match the official MGFA
  Foundation PDF verbatim (a = limb/axial-predominant, b = oropharyngeal/respiratory-
  predominant; Class V = intubation). The MG-ADL 8 items and 0-24 range match Wolfe
  1999 and the NBK567509 confirmation. The "feeding tube without intubation = IVb"
  edge is documented in the note but not added as a separate input. Match. PASS.

## Edge-input handling notes
- One severity select (ocular / mild / moderate / severe / intubation), one subtype
  select (a/b, applied only to II-IV), and eight MG-ADL selects clamped 0-3. A scalar
  fuzz arg yields a valid Class I with MG-ADL 0, never NaN.

## A11y / keyboard notes
- Ten labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
