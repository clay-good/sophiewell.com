// spec-v656: ISGPS 2016 grading of postoperative pancreatic fistula (POPF).
//
// A surgical-complication grading gap. Source:
//   Bassi C, Marchegiani G, Dervenis C, et al; International Study Group on Pancreatic
//   Surgery (ISGPS). The 2016 update of the International Study Group (ISGPS) definition
//   and grading of postoperative pancreatic fistula: 11 Years After. Surgery.
//   2017;161(3):584-591. PMID 28040257.
//
// A decision-logic classifier. The defining gate: a POPF requires drain fluid amylase
// greater than 3x the upper limit of the institutional normal SERUM amylase, in any
// measurable drain volume, on or after postoperative day 3. If the gate is not met there
// is no POPF. Given the gate, grade by clinical impact (most severe wins):
//   Grade C: reoperation, single/multiple organ failure, or death attributable to POPF;
//   Grade B: a clinically relevant change in management (drains kept > 3 weeks or
//     repositioned, percutaneous/endoscopic drainage of a collection, somatostatin
//     analogues/antibiotics, angiographic procedures for POPF-related bleeding, or
//     signs of infection WITHOUT organ failure);
//   Biochemical leak (BL): gate met but no change in management (the former "Grade A",
//     which the 2016 update no longer calls a true fistula).
//
// Pure: no DOM, no clock, no network.

function toBool(v) {
  if (v === true) return true;
  if (v === false || v === '' || v === null || v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'on';
}

export const ISGPS_POPF_NOTE = 'ISGPS 2016 grading of postoperative pancreatic fistula (Bassi C, et al., Surgery 2017;161(3):584-591). The defining gate is drain fluid amylase greater than 3 times the upper limit of the institutional normal serum amylase, in any measurable drain volume, on or after postoperative day 3; if this is not met there is no POPF. Given the gate, the grade is set by clinical impact: Grade C is a POPF requiring reoperation, causing single or multiple organ failure, or resulting in death; Grade B is a clinically relevant change in management (drains kept beyond 3 weeks or repositioned, percutaneous or endoscopic drainage of a collection, somatostatin analogues or antibiotics, angiographic procedures for POPF-related bleeding, or signs of infection without organ failure); and a biochemical leak is the gate met with no change in management (the former Grade A, which the 2016 update no longer calls a true fistula). This grades a documented drain-amylase result and the postoperative course, read with the surgical team.';

export function isgpsPopf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const gate = o.amylaseGate;
  if (gate === '' || gate === null || gate === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'amylaseGate', message: 'Confirm whether the drain-amylase gate is met (> 3x upper limit of normal serum amylase, on/after POD 3).' };
  }
  const gateMet = toBool(gate);
  if (!gateMet) {
    return {
      valid: true,
      grade: 'none',
      code: 'No POPF',
      gateMet: false,
      abnormal: false,
      gradeLabel: 'No POPF (drain-amylase criteria not met)',
      bandLabel: 'No POPF',
      detail: 'Drain amylase not greater than 3x the upper limit of normal serum amylase on/after POD 3 — no postoperative pancreatic fistula.',
      note: ISGPS_POPF_NOTE,
    };
  }

  const gradeC = toBool(o.gradeCFeature);
  const gradeB = toBool(o.gradeBFeature);

  let grade, code, label, abnormal;
  if (gradeC) {
    grade = 'C'; code = 'Grade C'; abnormal = true;
    label = 'Grade C (reoperation, organ failure, or death)';
  } else if (gradeB) {
    grade = 'B'; code = 'Grade B'; abnormal = true;
    label = 'Grade B (clinically relevant change in management)';
  } else {
    grade = 'BL'; code = 'Biochemical leak'; abnormal = false;
    label = 'Biochemical leak (no change in management; not a true fistula)';
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
    note: ISGPS_POPF_NOTE,
  };
}
