# spec-v825 — 2020 RCD Criteria (IgG4-Related Disease)

## What this gives you

Enter the organ finding, the serum IgG4 and the biopsy; get definite, probable, possible, or
none, under the **2020 revised** comprehensive diagnostic criteria.

IgG4-related disease was a zero-hit word here — a multi-organ mimic of malignancy that is
steroid-responsive when recognised, and whose criteria are exactly the kind of scattered
three-source checklist a tool is for.

## §1 The three items

1. **Clinical and radiological** — one or more organs showing diffuse or localized swelling,
   a mass or a nodule characteristic of IgG4-RD. Where a **single** organ is involved, lymph
   node swelling is omitted.
2. **Serological** — elevated serum IgG4, around 135 mg/dL.
3. **Pathological** — **two of three**: dense lymphoplasmacytic infiltration with fibrosis;
   IgG4+/IgG+ ratio >40% *and* >10 IgG4+ cells/HPF; typical tissue fibrosis, particularly
   storiform fibrosis, or obliterative phlebitis.

**Definite** = 1+2+3 · **Probable** = 1+3 · **Possible** = 1+2.

## §2 This is the 2020 version, and the pathology item is where it differs

The 2011 originals leaned on the IgG4 immunostain. The 2020 revision requires **two of
three** sub-items and adds storiform fibrosis or obliterative phlebitis as a third route —
precisely so that a biopsy with poor immunostaining can still carry the pathological item.

A tool implementing item 3 as "the IgG4 count" reproduces the problem the revision was
written to fix. So when only the immunostain is present the tile says the item needs two of
three; when the item is carried *without* the immunostain it says that this is what the
revision made possible. Both tested.

## §3 "Possible" is the weak category, not a mild one

Possible is items 1+2: organ swelling plus a raised serum IgG4, **with no tissue at all**.
Serum IgG4 also rises in malignancy, infection and other autoimmune disease — which is
exactly where a mimic would be sitting. The tile says so on that category and on no other.

## §4 One boundary the sources disagree about

Published statements of the serological threshold differ at exactly **135 mg/dL**: some read
"at or above 135", others "above 135". At any other value they agree.

Rather than pick one silently, the tile counts 135 as elevated **and says the item is
unsettled at that value**. Elsewhere it stays quiet. This is the same posture used when
sources disagree on a cut-point rather than asserting a precision the literature does not
have.

## §5 Sourcing (spec-v97 gate)

- Umehara H, Okazaki K, Kawa S, et al. The 2020 revised comprehensive diagnostic (RCD)
  criteria for IgG4-RD. *Mod Rheumatol.* 2021;31(3):529-533.
- Umehara H, Okazaki K, Masaki Y, et al. Comprehensive diagnostic criteria for IgG4-RD, 2011.
  *Mod Rheumatol.* 2012;22(1):21-30 — checked specifically to establish what the 2020
  revision changed, rather than building on the superseded version.

## §6 Posture

Decision support, not a verdict. It applies published criteria to findings already gathered.
It does not start corticosteroids or rituximab, and it does not exclude the malignancy these
criteria assume has already been considered.

Catalog 1616 → 1617.
