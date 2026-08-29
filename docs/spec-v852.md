# spec-v852 — Ascitic Fluid Criteria for Spontaneous Bacterial Peritonitis

## What this gives you

The one arithmetic step that decides the diagnosis, done correctly: the neutrophil count
**corrected for a bloody tap**, read against 250, with the culture result kept in its proper
place.

## §1 The rule

| | |
|---|---|
| Corrected PMN | raw ascitic PMN − (ascitic red cells ÷ 250), floored at 0 |
| **≥ 250 /mm³** | Neutrocytic ascites. Treated as spontaneous bacterial peritonitis. |
| < 250 /mm³ with a single organism grown | Bacterascites. Repeat the tap. |
| < 250 /mm³, no growth | Neither. |

## §2 A bloody tap inflates the count, and that is what the tile is for

Blood carries neutrophils. A traumatic paracentesis therefore raises the ascitic PMN count in
proportion to the red cells it drags in, and the correction is **one PMN subtracted per 250 red
cells**.

Uncorrected, a bloody tap crosses 250 on blood alone and the patient is treated for an
infection they do not have. The tile always shows both numbers and how far apart they are.

## §3 A negative culture does not exclude it

Roughly two thirds of taps meeting the neutrophil criterion grow nothing. **Culture-negative
neutrocytic ascites** presents the same way, carries the same mortality, and is treated the same
as culture-positive disease. Waiting on a culture to decide is the second common error, so the
tile names the state by what it is rather than reporting a bare "negative".

## §4 It is the neutrophil count, not the total white count

A total nucleated count of 500 with 30% neutrophils is 150 PMN — under the line. The tile takes
a percentage when that is what the lab reported and does the multiplication itself.

## §5 Polymicrobial growth points away from this diagnosis

Spontaneous bacterial peritonitis is a single-organism infection. More than one organism raises
**secondary** peritonitis — a perforated or inflamed viscus — which is a surgical question and
not one antibiotics settle. Flagged, not resolved.

## §6 The albumin criteria are reported, not ordered

The trial that established the benefit gave albumin where the creatinine was above 1 mg/dL, the
urea nitrogen above 30 mg/dL, **or** the bilirubin above 4 mg/dL: 1.5 g/kg within six hours and
1 g/kg on day 3. The tile reports whether those criteria are met, and computes the grams if a
weight is given. It does not order anything.

## §7 Sourcing (spec-v97 gate)

- Runyon BA; AASLD. Management of adult patients with ascites due to cirrhosis: update 2012.
  *Hepatology.* 2013;57(4):1651-1653.
- Sort P, Navasa M, Arroyo V, et al. Effect of intravenous albumin on renal impairment and
  mortality in patients with cirrhosis and spontaneous bacterial peritonitis.
  *N Engl J Med.* 1999;341(6):403-409.

AASLD is not in the tracked-issuer set, so no staleness row.

## §8 Posture

Decision support, not a verdict. It applies a published fluid criterion to numbers already
measured. It does not select an antibiotic, a dose or a route.

Catalog 1643 → 1644.
