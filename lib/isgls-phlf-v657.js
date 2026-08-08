// spec-v657: ISGLS definition and grading of post-hepatectomy liver failure (PHLF).
//
// The liver-surgery companion to the ISGPS pancreatic-fistula grade (isgps-popf).
// Source:
//   Rahbari NN, Garden OJ, Padbury R, et al. Posthepatectomy liver failure: a
//   definition and grading by the International Study Group of Liver Surgery (ISGLS).
//   Surgery. 2011;149(5):713-724. PMID 21236455.
//
// A decision-logic classifier. The defining gate: PHLF is an increased INR (or the need
// for clotting factors such as fresh frozen plasma to maintain a normal INR) AND
// concomitant hyperbilirubinemia, both above the local laboratory normal limits, on or
// after postoperative day 5. If INR and bilirubin were already abnormal preoperatively,
// the gate instead requires both to be INCREASING (rising) on or after POD 5. If the gate
// is not met there is no PHLF. Given the gate, grade by clinical management (most severe
// wins):
//   Grade C: requires invasive treatment (hemodialysis / renal replacement, mechanical
//     ventilation, vasopressor/circulatory support, rescue hepatectomy or salvage liver
//     transplant);
//   Grade B: deviates from the regular clinical course but is manageable WITHOUT invasive
//     treatment (fresh frozen plasma, albumin, diuretics, non-invasive ventilation; ICU
//     or intermediate-care admission by itself is a Grade B example);
//   Grade A: abnormal lab values with no change from routine clinical management.
//
// Pure: no DOM, no clock, no network.

function toBool(v) {
  if (v === true) return true;
  if (v === false || v === '' || v === null || v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'on';
}

export const ISGLS_PHLF_NOTE = 'ISGLS definition and grading of post-hepatectomy liver failure (Rahbari NN, et al., Surgery 2011;149(5):713-724). The defining gate is an increased INR (or the need for clotting factors such as fresh frozen plasma to maintain a normal INR) and concomitant hyperbilirubinemia, both above the local laboratory normal limits, on or after postoperative day 5; if INR and bilirubin were already abnormal preoperatively, the gate instead requires both to be increasing on or after POD 5. If the gate is not met there is no PHLF. Given the gate, the grade is set by clinical management: Grade C requires invasive treatment (hemodialysis or renal replacement, mechanical ventilation, vasopressor or circulatory support, rescue hepatectomy or salvage liver transplant); Grade B deviates from the regular course but is manageable without invasive treatment (fresh frozen plasma, albumin, diuretics, non-invasive ventilation, or ICU admission by itself); and Grade A is abnormal laboratory values with no change from routine management. This grades documented laboratory results and the postoperative course, read with the surgical team.';

export function isglsPhlf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const gate = o.labGate;
  if (gate === '' || gate === null || gate === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'labGate', message: 'Confirm whether the PHLF lab gate is met (increased INR and hyperbilirubinemia on/after POD 5).' };
  }
  const gateMet = toBool(gate);
  if (!gateMet) {
    return {
      valid: true,
      grade: 'none',
      code: 'No PHLF',
      gateMet: false,
      abnormal: false,
      gradeLabel: 'No PHLF (INR/bilirubin criteria not met)',
      bandLabel: 'No PHLF',
      detail: 'INR and bilirubin do not both meet the ISGLS criteria on/after POD 5 — no post-hepatectomy liver failure.',
      note: ISGLS_PHLF_NOTE,
    };
  }

  const gradeC = toBool(o.invasiveTreatment);
  const gradeB = toBool(o.managementDeviation);

  let grade, code, label, abnormal;
  if (gradeC) {
    grade = 'C'; code = 'Grade C'; abnormal = true;
    label = 'Grade C (requires invasive treatment)';
  } else if (gradeB) {
    grade = 'B'; code = 'Grade B'; abnormal = true;
    label = 'Grade B (deviation managed without invasive treatment)';
  } else {
    grade = 'A'; code = 'Grade A'; abnormal = false;
    label = 'Grade A (abnormal labs, no change in management)';
  }

  return {
    valid: true,
    grade,
    code,
    gateMet: true,
    abnormal,
    gradeLabel: label,
    bandLabel: code,
    detail: `${label}.`,
    note: ISGLS_PHLF_NOTE,
  };
}
