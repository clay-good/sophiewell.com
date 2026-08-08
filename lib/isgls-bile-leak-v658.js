// spec-v658: ISGLS definition and grading of bile leakage after hepatobiliary and
// pancreatic surgery.
//
// The third International Study Group surgical-complication grade in the cluster
// (isgps-popf, isgls-phlf). Source:
//   Koch M, Garden OJ, Padbury R, et al. Bile leakage after hepatobiliary and
//   pancreatic surgery: a definition and grading of severity by the International Study
//   Group of Liver Surgery. Surgery. 2011;149(5):680-688. PMID 21316725.
//
// A decision-logic classifier. The defining gate: bile leakage is a drain fluid
// bilirubin concentration at least 3x the serum bilirubin concentration on or after
// postoperative day 3, OR the need for radiologic or operative intervention for biliary
// collections or bile peritonitis. If the gate is not met there is no bile leak. Given
// the gate, grade by clinical impact (most severe wins):
//   Grade C: requires relaparotomy;
//   Grade B: requires a change in clinical management (additional diagnostic or
//     interventional procedures such as percutaneous drainage or ERCP/stent) but
//     manageable without relaparotomy, OR a grade A leak persisting more than 1 week;
//   Grade A: bile leakage requiring no or little change in clinical management.
//
// Pure: no DOM, no clock, no network.

function toBool(v) {
  if (v === true) return true;
  if (v === false || v === '' || v === null || v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'on';
}

export const ISGLS_BILE_NOTE = 'ISGLS definition and grading of bile leakage after hepatobiliary and pancreatic surgery (Koch M, et al., Surgery 2011;149(5):680-688). The defining gate is a drain fluid bilirubin concentration at least 3 times the serum bilirubin concentration on or after postoperative day 3, or the need for radiologic or operative intervention for biliary collections or bile peritonitis. If the gate is not met there is no bile leak. Given the gate, the grade is set by clinical impact: Grade C requires relaparotomy; Grade B requires a change in clinical management (additional diagnostic or interventional procedures such as percutaneous drainage or ERCP with stenting) but is manageable without relaparotomy, or is a Grade A leak that persists more than 1 week; and Grade A is bile leakage requiring no or little change in management. This grades a documented drain-bilirubin result and the postoperative course, read with the surgical team.';

export function isglsBileLeak(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const gate = o.bileGate;
  if (gate === '' || gate === null || gate === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'bileGate', message: 'Confirm whether the bile-leak gate is met (drain bilirubin >= 3x serum on/after POD 3, or need for intervention).' };
  }
  const gateMet = toBool(gate);
  if (!gateMet) {
    return {
      valid: true,
      grade: 'none',
      code: 'No bile leak',
      gateMet: false,
      abnormal: false,
      gradeLabel: 'No bile leak (criteria not met)',
      bandLabel: 'No bile leak',
      detail: 'Drain bilirubin not at least 3x serum on/after POD 3 and no intervention needed — no bile leak.',
      note: ISGLS_BILE_NOTE,
    };
  }

  const gradeC = toBool(o.relaparotomy);
  const gradeB = toBool(o.managementChange);

  let grade, code, label, abnormal;
  if (gradeC) {
    grade = 'C'; code = 'Grade C'; abnormal = true;
    label = 'Grade C (requires relaparotomy)';
  } else if (gradeB) {
    grade = 'B'; code = 'Grade B'; abnormal = true;
    label = 'Grade B (change in management without relaparotomy, or grade A leak > 1 week)';
  } else {
    grade = 'A'; code = 'Grade A'; abnormal = false;
    label = 'Grade A (no or little change in management)';
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
    note: ISGLS_BILE_NOTE,
  };
}
