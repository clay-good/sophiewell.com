# v12 audit - warfarin-gage

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Gage BF, et al. Clin Pharmacol Ther. 2008;84(3):326-331. All 12 log-linear coefficients confirmed verbatim against the Shin & Cao 2009 validation reprint (PMC2538606, Table 5 footnote) and independently reconciled to the original Gage Table-3 percentages (PMC2683977); CYP4F2-absence confirmed against CPIC 2017 (PMC5546947).

`lib/warfarin-v133.js warfarinGage()` evaluates the published Gage pharmacogenomic exponential model, predicting the therapeutic daily dose directly (x7 for mg/week). Class A (fixed 2008 coefficients; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / coefficient note
- dose(mg/day) = exp(0.9751 + 0.4317*BSA - 0.00745*age - 0.2066*CYP2C9*2_alleles - 0.4008*CYP2C9*3_alleles - 0.3238*VKORC1(-1639/3673 G>A)_A_alleles + 0.2029*targetINR - 0.2538*amiodarone + 0.0922*smoker - 0.0901*AfricanAmerican - ... + 0.0664*DVT/PE).
- Cross-check: ln-conversions of the original Table-3 percentages reconcile to within rounding (VKORC1 -28%/allele = e^-0.3238 - 1 = -27.7%; CYP2C9*3 -33% = e^-0.4008 - 1 = -33.0%; age -7%/decade = e^(-0.00745*10) - 1 = -7.2%; amiodarone -22% = e^-0.2538 - 1 = -22.4%) - proving the betas are the genuine Gage model, not a transcription artifact.
- BSA uses the **DuBois** formula the Gage paper itself cites (DuBois & DuBois 1916): BSA = 0.007184 * weight(kg)^0.425 * height(cm)^0.725. (warfarindosing.org's live BSA choice could not be confirmed; DuBois is the paper's cited reference and the defensible default - documented as a known ambiguity.)
- The original 2008 model carries NO CYP4F2 term. CYP4F2 was added later by Sagreiya 2010 to the IWPC model, not Gage. (This corrects the spec-v133 draft, which wrongly stated "Gage adds CYP4F2.")
- Distinct from the separate clinical-only Gage equation (intercept 0.613, BSA 0.425, no genetic terms) - its coefficients are deliberately kept out of this genetic model.

## Boundary worked examples added
- The published model gives NO numeric worked example, so the reference test pins our own arithmetic: age 60, 175 cm, 70 kg, VKORC1 G/G, CYP2C9 *1/*1, target INR 2.5, non-smoker, non-AA, no amiodarone, AF (DVT/PE no) -> BSA ~1.85, dose ~6.3 mg/day (~43.8 mg/week). Per-allele genotype effects lower the dose monotonically; amiodarone lowers and smoking raises it; the BSA term scales with body size.

## Edge-input handling notes
- Genotype is an enumerated dropdown key; Gage has NO unknown-genotype imputation term, so a blank/unknown genotype (or a blank required field, or target INR <= 0) surfaces valid:false rather than dropping a coefficient. A non-positive or non-finite exponent surfaces the fallback rather than returning a degenerate dose. Joined the spec-v59 fuzz harness (zero non-finite leaks) with the exp() step exercised.

## A11y / keyboard notes
- Four labeled number inputs + six labeled selects; output aria-live="polite". 320px sweep, no hscroll; renders the spec-v100 §2 clause-5 high-stakes second-check caveat in the output.

## Defects opened
- none
