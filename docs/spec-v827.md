# spec-v827 — ATS/IDSA Criteria (NTM Pulmonary Disease)

## What this gives you

Enter the symptoms, the imaging and the cultures; get whether the ATS/ERS/ESCMID/IDSA
criteria for nontuberculous mycobacterial pulmonary disease are met, and by which
microbiologic route.

## §1 The four domains, all required

- **Clinical** — pulmonary or systemic symptoms.
- **Radiologic** — nodular or cavitary opacities on chest radiograph, **or** an HRCT showing
  bronchiectasis with multiple small nodules. (The guideline marks clinical and radiologic as
  *both required*.)
- **Exclusion** — appropriate exclusion of other diagnoses.
- **Microbiologic** — any **one** of three routes:
  1. positive cultures from **≥2 separate expectorated sputum samples**;
  2. a positive culture from **≥1 bronchial wash or lavage**;
  3. a lung biopsy with mycobacterial histologic features *plus* a positive culture — from the
     biopsy, or from sputum or washings.

## §2 The microbiologic domain goes wrong in two opposite directions

**One positive sputum is not enough.** Two separate expectorated samples are needed, and the
guideline is explicit that they must grow the **same species** — or subspecies, for
*M. abscessus*. These are environmental organisms and a single isolate is often contamination
or transient colonisation. Treating on one culture commits a patient to a year or more of
multidrug therapy for something they may not have.

So sputum is a **count**, not a "positive: yes/no". One is the commonest wrong answer and a
boolean cannot see the difference. The same-species question sits beside it, because two
positives of *different* species do not satisfy the criterion either — and a raw count hides
that.

**But one bronchial wash IS enough.** The two-sample rule applies to expectorated sputum and
does not carry across to bronchoscopic samples. Demanding two of a lavage withholds a
diagnosis the criteria grant. The tile says so whenever a wash is the route.

Both errors are tested, in both directions.

## §3 A posture point the guideline makes itself

Making this diagnosis **does not, in itself, require starting treatment**. That is unusual
enough — most criteria sets are silent on it — that the tile carries it in the result when
the criteria are met, and stays quiet when they are not.

The guideline's other instruction is carried too: patients suspected of the disease who do
*not* meet the criteria should be followed until the diagnosis is firmly established or
excluded, rather than discharged as negative.

## §4 Sourcing (spec-v97 gate)

- Daley CL, Iaccarino JM, Lange C, et al. Treatment of nontuberculous mycobacterial pulmonary
  disease: an official ATS/ERS/ESCMID/IDSA clinical practice guideline. *Clin Infect Dis.*
  2020;71(4):905-913 / *Eur Respir J.* 2020;56(1):2000535 — Table 2 taken verbatim from the
  guideline PDF, together with the same-species requirement from the surrounding text.

ATS and IDSA are tracked issuers, so `docs/citation-staleness.md` carries a row.

## §5 Posture

Decision support, not a verdict. It applies published criteria to results already obtained.
It does not choose or start an antimycobacterial regimen.

Catalog 1618 → 1619.
