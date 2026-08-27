# spec-v832 — Triple I Framework (Intraamniotic Infection)

## What this gives you

Enter the temperature, the supporting features and any confirmatory results; get which of the
three NICHD categories applies.

## §1 Three graded categories, replacing one label

**Isolated maternal fever** — one reading **≥39.0 °C**, *or* two readings of **38.0–38.9 °C**
at least 30 minutes apart, with no clear alternative source.

**Suspected Triple I** — that fever **plus ≥1** of: fetal tachycardia **>160 bpm**; maternal
white cell count **>15,000/mm³** *in the absence of recent corticosteroids*; purulent fluid
from the cervical os.

**Confirmed Triple I** — suspected **plus ≥1** of: a positive amniotic fluid Gram stain; low
amniotic fluid glucose or a positive culture; histologic evidence of infection in the
placenta.

## §2 The first category is the reform

Before 2015, isolated intrapartum fever was routinely labelled *chorioamnionitis* — which
committed the mother to antibiotics and the newborn to a sepsis evaluation. **Separating
fever from infection was the entire point of the framework.**

So "isolated maternal fever" is reported as a category in its own right and explicitly **not
an infection diagnosis**, and that note appears on that category alone. A tool that reported
fever as chorioamnionitis would undo the reform.

Confirmed also requires *suspected* first: a positive placental histology in someone without
fever and a supporting feature is not confirmed Triple I. Tested.

## §3 Two things that get dropped

**The fever definition has two routes, and a single 38.5 °C satisfies neither.** One reading
counts only at ≥39.0; between 38.0 and 38.9 it takes **two**, at least 30 minutes apart. The
tile says so at exactly those values rather than silently returning "no fever".

**The leukocytosis criterion is void after recent corticosteroids** — betamethasone raises
the count on its own, and antenatal steroids are common in precisely this group. A count
above threshold with recent steroids is reported as *not counted*, with the reason, rather
than quietly dropped.

## §4 One unit note

Temperature takes a unit select and **does** convert, unlike the alpha-1 antitrypsin tile:
Celsius and Fahrenheit interconvert exactly, so nothing is invented by doing it. 39.0 °C is
102.2 °F, and a test pins that boundary.

## §5 Sourcing (spec-v97 gate)

- Higgins RD, Saade G, Polin RA, et al. Evaluation and Management of Women and Newborns With
  a Maternal Diagnosis of Chorioamnionitis: Summary of a Workshop. *Obstet Gynecol.*
  2016;127(3):426-436 — the 2015 NICHD workshop.
- All three categories and every threshold were corroborated across two independent sources
  before encoding.

## §6 Posture

Decision support, not a verdict. It applies published criteria to findings already gathered.
It does not start or withhold antibiotics, and it does not decide on a neonatal sepsis
evaluation.

Catalog 1623 → 1624.
