// spec-v600 MCP wave: adapter for the original Fisher grade in lib/fisher-grade-v600.js. The dom keys mirror
// the browser renderer (views/group-v600.js) and META['fisher-grade'].example.
//
// **THE GRADES ARE NOT ORDINAL FOR THE RISK THEY GRADE.** Vasospasm risk rises from grade 1 to grade 3, and
// GRADE 4 DOES NOT CONTINUE THE TREND - grade 3 carries the HIGHEST vasospasm risk. A higher Fisher grade
// does NOT mean higher vasospasm risk, and treating the number as a severity ordering is wrong at the top of
// the scale. `carriesHighestVasospasmRisk` marks grade 3; `outrankedByGradeThree` marks grade 4.
//
// **GRADE 4 IS DEFINED BY LOCATION, NOT BY AMOUNT, WHICH IS WHY THE ORDERING BREAKS.** It is intracerebral
// or intraventricular blood with diffuse or NO subarachnoid blood - not "more blood than grade 3" but
// DIFFERENT blood in a DIFFERENT COMPARTMENT. A speck of intraventricular blood with NO subarachnoid blood
// is grade 4; thick cisternal subarachnoid clot is grade 3.
//
// **THE SAME GRADE 4 COVERS A SPECK AND A VENTRICLE FULL OF CLOT** - the documented flaw that motivated the
// modified scale.
//
// **THE MODIFIED SCALE IS NOT A RENUMBERING AND GRADES DO NOT MAP ACROSS.** `modified-fisher` in this
// catalog adds a GRADE 0 and separates thickness from intraventricular hemorrhage into two independent axes.
// A Fisher 3 is NOT a modified Fisher 3. NEVER convert between the two scales.
//
// **THE 1 MM THRESHOLD WAS MEASURED ON 1980-ERA COMPUTED TOMOGRAPHY** and a layer identified on a modern
// scanner is not the same observation.

import * as F from '../../lib/fisher-grade-v600.js';

export default [
  {
    id: 'fisher-grade',
    summary: `The ORIGINAL FISHER GRADE (Fisher, Kistler and Davis 1980) grades the appearance of blood on the computed tomogram after subarachnoid hemorrhage. THE GRADES: ${F.GRADES.map((g) => `${g.grade} = ${g.text}`).join('; ')}. **THE GRADES ARE NOT ORDINAL FOR THE RISK THEY GRADE**: vasospasm risk rises from grade 1 to grade ${F.HIGHEST_VASOSPASM_RISK_GRADE}, and GRADE 4 DOES NOT CONTINUE THE TREND - **grade ${F.HIGHEST_VASOSPASM_RISK_GRADE} carries the HIGHEST vasospasm risk, higher than grade 4**. A higher Fisher grade does NOT mean higher vasospasm risk, and treating the number as a severity ordering is wrong at the top of the scale. **GRADE 4 IS DEFINED BY LOCATION, NOT BY AMOUNT, WHICH IS WHY THE ORDERING BREAKS**: it is intracerebral or intraventricular blood with diffuse or NO subarachnoid blood - not "more blood than grade 3" but DIFFERENT blood in a DIFFERENT COMPARTMENT. A speck of intraventricular blood with NO subarachnoid blood is grade 4, while thick cisternal subarachnoid clot is grade 3. **THE SAME GRADE 4 COVERS A SPECK AND A VENTRICLE FULL OF CLOT**, the documented flaw that motivated the modified scale. **THE MODIFIED SCALE IS NOT A RENUMBERING**: \`modified-fisher\` in this catalog adds a GRADE 0 and separates blood thickness from intraventricular hemorrhage into two INDEPENDENT AXES, so a Fisher 3 is NOT a modified Fisher 3 and grades must NEVER be converted between the two scales. **THE ${F.THICKNESS_THRESHOLD_MM} MM THRESHOLD WAS MEASURED ON 1980-ERA COMPUTED TOMOGRAPHY** - slice thickness, resolution and windowing have changed beyond recognition, so a layer identified on a modern scanner is not the same observation the scale was built on. This grades the APPEARANCE OF BLOOD ON A SCAN in a patient who ALREADY HAS a diagnosis of subarachnoid hemorrhage. It does NOT diagnose subarachnoid hemorrhage, does NOT grade CLINICAL severity - the Hunt and Hess and WFNS scales do that, and both are in this catalog - and does NOT localize or identify an aneurysm. It does NOT indicate nimodipine, transcranial Doppler surveillance, angiography or any intervention, and **A LOW GRADE IS NOT A REASON TO RELAX VASOSPASM MONITORING**.`,
    compute: F.fisherGrade,
    fields: [
      {
        dom: 'fish-ivh', arg: 'intracerebralOrIntraventricular', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Intracerebral or intraventricular blood. THIS DECIDES GRADE 4 BY COMPARTMENT, regardless of how much subarachnoid blood there is - and grade 4 is NOT the highest vasospasm risk.',
      },
      {
        dom: 'fish-sah', arg: 'subarachnoidBlood', kind: 'enum',
        values: ['none', 'thin', 'thick-or-localized-clot'], required: true,
        label: `Subarachnoid blood on CT: none; thin (a diffuse or vertical layer less than ${F.THICKNESS_THRESHOLD_MM} mm thick, grade 2); or thick-or-localized-clot (a localized clot or a vertical layer ${F.THICKNESS_THRESHOLD_MM} mm or more, grade 3 - the HIGHEST vasospasm risk on the scale).`,
      },
    ],
  },
];
