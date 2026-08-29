// spec-v563 MCP wave: adapter for the Mayo imaging classification of ADPKD in lib/mayo-adpkd-v563.js. The
// dom keys mirror the browser renderer (views/group-v563.js) and META['mayo-adpkd'].example.
//
// **CLASS 2 IS A TERMINAL DEAD END, NOT A ROUTE TO A LOW SUBCLASS.** Atypical patients receive NO 1A-1E
// subclass at all - the classification explicitly does not risk-stratify them. An agent handed an atypical
// patient's volume and age will happily run the formula, and the answer would be a class the instrument
// refuses to give. Worse, because atypical disease is often asymmetric or segmental, the computed figure
// tends to look falsely REASSURING. The tool returns `subclassified: false` and stops.
//
// **THE MORPHOLOGY CLASS IS A DESCRIPTOR AND CANNOT BE INFERRED.** Whether a patient is class 1 or class 2
// is a radiologist's judgment about the pattern of cystic replacement. Nothing in the volume, the height or
// the age determines it, so it is required and never guessed.
//
// **AGE SITS IN A DENOMINATOR INSIDE AN EXPONENT AND THE MODEL IS NOT VALIDATED BELOW 15.** The published
// cut-off table starts at 15, and the reciprocal exponent makes the estimate increasingly unstable as age
// falls. The tool refuses below 15 rather than returning a confident-looking number from the unvalidated,
// numerically unstable end of the model.
//
// **K = 150 IS THE PUBLISHED MODEL; A COMPETING K = 130 IS A RIVAL PARAMETERIZATION, NOT A CORRECTION.** An
// independent validation found the alternative tended to OVERESTIMATE the class. It is named in the summary
// so an agent meeting it in the literature knows which model this implements, and it is not applied.
//
// HOW THE VOLUME WAS MEASURED CAN CHANGE THE CLASS: the ellipsoid equation overestimated stereologic volume
// by a mean of about 5.3 percent with wide spread, enough to move a patient a whole subclass. The method is
// recorded as an input rather than assumed, though it does not enter the arithmetic.

import * as M from '../../lib/mayo-adpkd-v563.js';

export default [
  {
    id: 'mayo-adpkd',
    summary: `The Mayo Imaging Classification of autosomal dominant polycystic kidney disease (ADPKD) (Irazabal and colleagues, JASN 2015). TWO STEPS, AND ONLY THE SECOND IS ARITHMETIC. Step one: a radiologist classifies the MORPHOLOGY as CLASS 1 (typical) - bilateral and diffuse distribution with mild, moderate or severe replacement of kidney tissue by cysts, where all cysts contribute similarly to total kidney volume - or CLASS 2 (atypical), being 2A for unilateral, segmental, asymmetric or lopsided presentations and 2B for bilateral presentation with acquired unilateral atrophy or bilateral kidney atrophy. Step two: ONLY class 1 patients are subclassified 1A to 1E. **CLASS 2 IS A TERMINAL DEAD END**: atypical patients receive NO 1A-1E subclass at all, because the classification explicitly does not risk-stratify them. Do NOT run the growth model on an atypical patient - the answer would be a class the instrument refuses to give, and because atypical disease is often asymmetric or segmental the computed figure tends to look falsely REASSURING. THE MORPHOLOGY CLASS IS A RADIOLOGIST'S DESCRIPTOR AND CANNOT BE INFERRED from the volume, the height or the age, so it is required and never guessed. For class 1, the estimated yearly percentage growth rate is 100 x ((htTKV / ${M.THEORETICAL_START_HTTKV})^(1/age) - 1), where htTKV is the height-adjusted total kidney volume, that is total kidney volume in mL (BOTH KIDNEYS SUMMED) divided by height in METERS. SUBCLASSES: below 1.5 percent = 1A; 1.5 to under 3 = 1B; 3 to under 4.5 = 1C; 4.5 to 6 inclusive = 1D; above 6 = 1E. The published bands adjoin at 1.5, 3 and 4.5, so each is lower-inclusive and upper-exclusive here except the last pair, which follows the printed text. **AGE SITS IN A DENOMINATOR INSIDE AN EXPONENT AND THE MODEL IS NOT VALIDATED BELOW AGE ${M.MIN_VALIDATED_AGE}**: the published cut-off table starts there and the reciprocal exponent makes the estimate increasingly unstable as age falls, so the tool refuses below that age rather than returning a confident-looking number from the unvalidated end of the model. **K = ${M.THEORETICAL_START_HTTKV} IS THE PUBLISHED MODEL** with a theoretical starting age of 0; a later proposal substitutes K = ${M.ALTERNATIVE_K}, which an independent validation found tended to OVERESTIMATE the class. That is a RIVAL PARAMETERIZATION rather than a correction, and it is not applied here. HOW THE VOLUME WAS MEASURED CAN CHANGE THE CLASS: the ellipsoid equation, pi/6 x length x width x depth, overestimated stereologic volume by a mean of about 5.3 percent with wide spread in an independent cohort, enough to move a patient a whole subclass, so the method is recorded although it does not enter the arithmetic. This is an imaging-based risk stratification built TO SELECT PATIENTS FOR CLINICAL TRIALS. It does NOT diagnose ADPKD, which rests on imaging criteria by age together with family history, or on genetic testing. It does NOT measure kidney function - a patient can sit in a high subclass with a completely normal estimated glomerular filtration rate - so it says nothing about current function. It does not decide treatment and is not by itself an indication for a vasopressin receptor antagonist, which carries its own eligibility and monitoring requirements. It does not apply to atypical morphology, to other cystic kidney diseases, or below the validated age.`,
    compute: M.mayoAdpkd,
    fields: [
      {
        dom: 'mayo-morphology', arg: 'morphology', kind: 'enum',
        values: M.MORPHOLOGY_CLASSES.map((m) => m.value), required: true,
        label: `Imaging morphology class, a RADIOLOGIST'S DESCRIPTOR that cannot be inferred from the numbers. Class 2 receives no subclass at all [${M.MORPHOLOGY_CLASSES.map((m) => `${m.value} = ${m.text}`).join(' ')}]`,
      },
      {
        dom: 'mayo-tkv', arg: 'tkv', kind: 'number', unit: 'mL', required: false,
        label: 'Total kidney volume in mL, BOTH KIDNEYS SUMMED. Required for class 1; not used for class 2.',
      },
      {
        dom: 'mayo-height', arg: 'height', kind: 'number', unit: 'm', required: false,
        label: 'Patient height in METERS (not cm). Required for class 1. The volume is divided by this to give the height-adjusted volume.',
      },
      {
        dom: 'mayo-age', arg: 'age', kind: 'number', unit: 'years', required: false,
        label: `Patient age in years. Required for class 1, and must be at least ${M.MIN_VALIDATED_AGE}: the model is not validated below that and age sits in a denominator inside an exponent.`,
      },
      {
        dom: 'mayo-method', arg: 'tkvMethod', kind: 'enum',
        values: M.TKV_METHODS.map((m) => m.value), required: false,
        label: `Optional. How the volume was measured. Recorded but NOT used in the arithmetic; the ellipsoid method overestimates stereologic volume by about 5.3 percent on average, enough to shift a subclass [${M.TKV_METHODS.map((m) => `${m.value} = ${m.text}`).join('; ')}]`,
      },
    ],
  },
];
