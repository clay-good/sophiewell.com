// spec-v540 MCP wave: adapter for the ISHLT cardiac rejection grade in lib/ishlt-rejection-v540.js. The dom
// key mirrors the browser renderer (views/group-v540.js) and META['ishlt-rejection'].example: ishlt-grade
// maps to the lib arg `grade`.
//
// **THE ENUM PUBLISHES ONLY THE REVISED R GRADES, AND THE LIB REFUSES THE 1990 ONES WITH THEIR MAPPING.**
// That refusal is the design point. Both schemes use the numbers 1 through 4 and they do not mean the same
// things, so an agent that reads "grade 3" out of an older pathology report and passes it through has a
// coin-flip between 1990 grade 3A (which is 2R) and 3B (which is 3R) - and those sit on opposite sides of
// the threshold that usually decides treatment. Sending '3A' returns an explicit "this is a 1990-scheme
// grade, it maps to 2R" rather than a silent score; sending a bare '3' returns "ambiguous between the two
// schemes".
//
// THE MANY-TO-ONE MAPPING IS RETURNED, NOT JUST APPLIED. `legacyGrades` lists which old grades collapse into
// the reported one, so an agent reconciling a longitudinal record can see that a patient's "1B" three years
// ago and "2" last year are BOTH 1R today and represent no change, rather than reporting a trend that does
// not exist.
//
// EVERY BAND NAMES THE TWO BLIND SPOTS, because they are the ones an agent would otherwise paper over: this
// grades ACUTE CELLULAR rejection only. Antibody-mediated rejection has its own ISHLT pAMR scale using
// immunohistochemistry, so a biopsy can be 0R and still show it, and cardiac allograft vasculopathy - the
// chronic process that limits long-term survival - is invisible here. "ISHLT 0R" is not "no rejection".

import * as I from '../../lib/ishlt-rejection-v540.js';

export default [
  {
    id: 'ishlt-rejection',
    summary: 'The International Society for Heart and Lung Transplantation grading of ACUTE CELLULAR rejection in a CARDIAC allograft (Stewart and colleagues 2005). Four grades: 0R, no rejection, an unremarkable endomyocardium with no lymphocytic infiltration; 1R, mild or low grade, an interstitial and/or perivascular infiltrate with UP TO ONE FOCUS of myocyte damage; 2R, moderate or intermediate grade, TWO OR MORE FOCI of infiltrate with associated myocyte damage and uninvolved myocardium between the foci; and 3R, severe or high grade, a DIFFUSE infiltrate with MULTIFOCAL myocyte damage, with or without edema, hemorrhage, or vasculitis. THE R MEANS REVISED AND IS NOT DECORATION: the 1990 scheme also used grades 1, 2, 3 and 4 and they do not mean the same things, so an unqualified "grade 3" from a record is genuinely ambiguous. The mapping from the old scheme is MANY-TO-ONE and ASYMMETRIC: 1990 grade 0 becomes 0R; grades 1A, 1B and 2 ALL collapse into 1R; grade 3A becomes 2R; and grades 3B and 4 become 3R. The trap is that 3A and 3B are adjacent in the old scheme but land in DIFFERENT revised grades, on opposite sides of the threshold that usually decides treatment; at least one published source reproduces this incorrectly by claiming both collapse into 2R. This tool accepts only the revised R grades and will refuse a 1990-scheme grade or a bare number, returning its correct mapping instead of guessing. Conventionally 0R and 1R are read as low grade and 2R and 3R as high grade, which is where treatment is usually considered, but that is a convention rather than an order and the decision also turns on time since transplant, hemodynamics, symptoms, donor-specific antibody, and prior rejection history. This grades acute cellular rejection ONLY. It is blind to ANTIBODY-MEDIATED rejection, which is graded on a separate ISHLT pAMR scale using immunohistochemistry, so a biopsy can be 0R and still show antibody-mediated rejection, and it is blind to cardiac allograft vasculopathy, the chronic process that limits long-term survival. It reports what a biopsy shows rather than diagnosing rejection clinically, and it is not an indication to pulse steroids or change immunosuppression. Rejection is patchy, so a low grade on a biopsy with few evaluable fragments does not exclude a higher grade elsewhere. It grades a different organ and a different lesion set from the Banff classification, which grades T-cell mediated rejection in a KIDNEY allograft from interstitial inflammation, tubulitis and arteritis - lesions that do not exist in myocardium.',
    compute: I.ishltRejection,
    fields: [
      {
        dom: 'ishlt-grade',
        arg: 'grade',
        kind: 'enum',
        values: I.ISHLT_GRADES.map((g) => g.value),
        required: true,
        label: `The revised ISHLT grade. Enter the R form only - a 1990-scheme grade or a bare number is refused with its mapping, because the two schemes reuse the same numbers [${I.ISHLT_GRADES.map((g) => `${g.value} = ${g.label}: ${g.text} (from 1990 grade${g.legacy.length > 1 ? 's' : ''} ${g.legacy.join(', ')})`).join(' ')}]`,
      },
    ],
  },
];
