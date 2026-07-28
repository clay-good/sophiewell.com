// spec-v574 MCP wave: adapter for COMPERA 2.0 in lib/compera-2-v574.js. The dom keys mirror the browser
// renderer (views/group-v574.js) and META['compera-2'].example.
//
// **WHO FUNCTIONAL CLASS HAS ONLY THREE GRADES IN A FOUR-GRADE MODEL.** Class I/II = 1, III = 2, IV = 3.
// NO functional class scores 4. A four-column table whose first row stops at three columns looks like a
// missing cell, and "completing" it by mapping class IV to 4 would push every class IV patient a whole
// stratum higher.
//
// **THREE ROWS HAVE NUMERIC GAPS, BECAUSE THE TABLE ASSUMES INTEGER INPUTS.** 6MWD runs 440-320 then
// 319-165; NT-proBNP runs to 649 then from 650; BNP runs to 199 then from 200. A walk distance of 319.5 m
// or an NT-proBNP of 649.5 ng/L falls in NO band. The tool REFUSES such a value and names the gap rather
// than rounding the patient into whichever neighbour is nearer.
//
// **THE DENOMINATOR IS THE NUMBER OF VARIABLES ACTUALLY AVAILABLE, NOT A FIXED THREE.** The mean is the sum
// of grades divided by how many were graded, so a patient with two of three is scorable. Treating a missing
// variable as zero, or holding the denominator at 3, drags every incomplete patient toward low risk.
//
// **BNP AND NT-proBNP ARE MUTUALLY EXCLUSIVE WITH A STATED PRECEDENCE: NT-proBNP WINS.** They are not two
// variables that both count - scoring both would give the peptide axis double the weight of functional
// class and walk distance combined.
//
// **THE ROUNDING RULE DIFFERS FROM THE THREE-STRATUM MODEL AND REUSING ONE FOR THE OTHER IS THE CLASSIC
// ERROR.** COMPERA 2.0 rounds the mean to the NEAREST INTEGER. The older three-stratum model uses banded
// rounding with different boundaries entirely.
//
// **THIS PAPER PUBLISHES NO PER-STRATUM MORTALITY PERCENTAGES.** The four-strata figures that circulate come
// from other cohorts and must not be attributed to this citation, so the tool quotes none.

import * as C from '../../lib/compera-2-v574.js';

export default [
  {
    id: 'compera-2',
    summary: `COMPERA 2.0 (Hoeper and colleagues, Eur Respir J 2022), the FOUR-STRATUM risk assessment model for pulmonary arterial hypertension at FOLLOW-UP, adopted by the 2022 ESC/ERS guidelines. It is the European counterpart to REVEAL Lite 2 and, by its own footnote, BORROWS that model's 6-minute walk distance and BNP cut points, so the two are not independent. Up to three variables are each graded 1 to 4 and the MEAN is taken, rounded to the NEAREST INTEGER, giving stratum 1 low risk, 2 intermediate-low, 3 intermediate-high, 4 high. WHO FUNCTIONAL CLASS: I or II = 1; III = 2; IV = ${C.MAX_WHO_FC_GRADE}. **NO FUNCTIONAL CLASS SCORES 4** - a four-column table whose first row stops at three columns looks like a missing cell, and mapping class IV to 4 would push every such patient a whole stratum higher. 6-MINUTE WALK DISTANCE: over 440 m = 1; 440 to 320 = 2; 319 to 165 = 3; under 165 = 4. BNP: under 50 = 1; 50 to 199 = 2; 200 to 800 = 3; over 800 ng/L = 4. NT-proBNP: under 300 = 1; 300 to 649 = 2; 650 to 1100 = 3; over 1100 ng/L = 4. **THREE ROWS HAVE NUMERIC GAPS BECAUSE THE TABLE IS WRITTEN AS THOUGH EVERY INPUT IS AN INTEGER**: a walk distance strictly between 319 and 320, a BNP between 199 and 200, or an NT-proBNP between 649 and 650 falls in NO band. Those gaps are narrow but reachable, since a walk distance is routinely recorded to the metre. The tool REFUSES such a value and names the gap rather than rounding into whichever neighbour is nearer. **THE DENOMINATOR IS THE NUMBER OF VARIABLES ACTUALLY AVAILABLE, NOT A FIXED THREE**: the mean is the sum of grades divided by how many were graded, so a patient with two of the three is still scorable, and treating a missing variable as zero or holding the denominator at three would drag every incomplete patient toward low risk. **BNP AND NT-proBNP ARE MUTUALLY EXCLUSIVE, AND WHEN BOTH ARE AVAILABLE NT-proBNP IS USED** - they are not two variables that both count, and scoring both would give the natriuretic peptide axis double the weight of functional class and walk distance combined. **THE ROUNDING RULE DIFFERS FROM THE THREE-STRATUM MODEL**, which uses banded rounding with different boundaries; applying those bands here would misclassify most of the middle. **THIS PAPER PUBLISHES NO PER-STRATUM MORTALITY PERCENTAGES OF ITS OWN**, so none is quoted: the four-strata figures that circulate come from other cohorts and must not be attributed to this citation. This is a FOLLOW-UP RISK STRATIFICATION, not a diagnosis. It does NOT diagnose pulmonary arterial hypertension, which requires right heart catheterization, and it does not distinguish it from the other groups of pulmonary hypertension - disease due to left heart disease, lung disease or chronic thromboembolism is managed completely differently and is not what this model was built on. It does not select or escalate PAH therapy and is not by itself an indication for combination treatment, parenteral prostacyclin, or transplant referral.`,
    compute: C.compera2,
    fields: [
      {
        dom: 'compera-fc', arg: 'whoFc', kind: 'enum',
        values: C.WHO_FC_GRADES.map((g) => g.value), required: false,
        label: `WHO functional class. Optional. NOTE THE LADDER STOPS AT ${C.MAX_WHO_FC_GRADE}: no class scores 4 [${C.WHO_FC_GRADES.map((g) => `${g.value} = grade ${g.grade}`).join('; ')}]`,
      },
      {
        dom: 'compera-6mwd', arg: 'sixMwd', kind: 'number', unit: 'm', required: false,
        label: 'Six-minute walk distance. Optional. Over 440 = 1; 440 to 320 = 2; 319 to 165 = 3; under 165 = 4. A value strictly between 319 and 320 falls in a GAP and is refused.',
      },
      {
        dom: 'compera-ntprobnp', arg: 'ntProBnp', kind: 'number', unit: 'ng/L', required: false,
        label: 'NT-proBNP. Optional, and TAKES PRECEDENCE over BNP when both are supplied. Under 300 = 1; 300 to 649 = 2; 650 to 1100 = 3; over 1100 = 4. A value between 649 and 650 falls in a GAP.',
      },
      {
        dom: 'compera-bnp', arg: 'bnp', kind: 'number', unit: 'ng/L', required: false,
        label: 'BNP. Optional, and IGNORED if NT-proBNP is supplied. Under 50 = 1; 50 to 199 = 2; 200 to 800 = 3; over 800 = 4. A value between 199 and 200 falls in a GAP.',
      },
    ],
  },
];
