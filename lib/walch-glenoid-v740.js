// spec-v740: Walch classification of glenoid morphology (primary glenohumeral OA).
//
// A decision-logic classifier returning a type code (A1, A2, B1, B2, B3, C, D) from the
// humeral-head centering, glenoid concavity, retroversion, and central-erosion severity.
// Sources:
//   Walch G, Badet R, Boulahia A, Khoury A. Morphologic study of the glenoid in primary
//   glenohumeral osteoarthritis. J Arthroplasty. 1999;14(6):756-760 (types A1, A2, B1, B2, C).
//   Bercik MJ, Kruse K, Yalizis M, Gauci MO, Chaoui J, Walch G. A modification to the Walch
//   classification of the glenoid in primary glenohumeral osteoarthritis using three-
//   dimensional imaging. J Shoulder Elbow Surg. 2016;25(10):1601-1606 (adds B3 and D).
//
// Logic: humeral head centered = A (A1 minor central erosion, A2 major); posterior
// subluxation = B (B1 no significant posterior wear / no biconcavity; B2 biconcave; B3
// monoconcave with >= 15 deg retroversion or >= 70% posterior subluxation); glenoid
// retroversion > 25 deg of dysplastic origin = C; anterior subluxation or anteversion
// (retroversion < 0) = D.
//
// Pure: no DOM, no clock, no network.

export const WALCH_NOTE = "Walch classification of glenoid morphology in primary glenohumeral osteoarthritis (Walch G et al, J Arthroplasty 1999;14(6):756-760; modified with B3 and D by Bercik MJ et al, J Shoulder Elbow Surg 2016;25(10):1601-1606). A centered humeral head is type A (A1 minor central erosion, A2 major). Posterior subluxation is type B (B1 posterior narrowing without a biconcave glenoid; B2 biconcave glenoid; B3 monoconcave with at least 15 degrees retroversion or at least 70% posterior subluxation). A dysplastic glenoid with more than 25 degrees retroversion is type C. Anterior subluxation or glenoid anteversion is type D. It is a radiographic classification read from CT and imaging; surgical planning stays with the treating surgeon.";

function enumIn(v, allowed) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  return allowed.includes(s) ? s : null;
}
function optNum(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
}
function onFlag(v) { return v === true || v === 'yes' || v === 'on' || v === 1 || v === '1'; }

const TYPE_LABEL = {
  A1: 'centered head, minor central erosion',
  A2: 'centered head, major central erosion',
  B1: 'posterior subluxation, no biconcavity or major posterior wear',
  B2: 'posterior subluxation, biconcave glenoid',
  B3: 'posterior subluxation, monoconcave with high retroversion or subluxation',
  C: 'dysplastic glenoid, retroversion over 25 degrees',
  D: 'anterior subluxation or glenoid anteversion',
};

export function walchGlenoid(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const subluxation = enumIn(o.subluxation, ['centered', 'posterior', 'anterior']);
  if (subluxation === null) {
    return { valid: false, code: 'MISSING_INPUT', field: 'subluxation', message: 'Select humeral-head position: centered, posterior, or anterior.', note: WALCH_NOTE };
  }
  const retroversion = optNum(o.retroversion);
  if (retroversion === null) {
    return { valid: false, code: 'MISSING_INPUT', field: 'retroversion', message: 'Enter glenoid retroversion in degrees (anteversion negative).', note: WALCH_NOTE };
  }
  const concavity = enumIn(o.concavity, ['single', 'biconcave']);
  if (concavity === null) {
    return { valid: false, code: 'MISSING_INPUT', field: 'concavity', message: 'Select glenoid concavity: single or biconcave.', note: WALCH_NOTE };
  }
  const erosion = enumIn(o.erosion, ['minor', 'major']);
  if (erosion === null) {
    return { valid: false, code: 'MISSING_INPUT', field: 'erosion', message: 'Select central erosion severity: minor or major.', note: WALCH_NOTE };
  }
  const dysplastic = onFlag(o.dysplastic);

  let type;
  if (subluxation === 'anterior' || retroversion < 0) {
    type = 'D'; // anterior subluxation or glenoid anteversion
  } else if (dysplastic && retroversion > 25) {
    type = 'C'; // dysplastic retroversion > 25 deg (not erosion-caused)
  } else if (subluxation === 'centered') {
    type = erosion === 'major' ? 'A2' : 'A1';
  } else { // posterior subluxation -> B
    if (concavity === 'biconcave') type = 'B2';
    else if (retroversion >= 15) type = 'B3'; // monoconcave, high retroversion
    else type = 'B1';
  }

  // The posterior/dysplastic/anterior deformities (B2/B3/C/D) complicate glenoid
  // component placement and are the actionable planning states.
  const abnormal = type === 'B2' || type === 'B3' || type === 'C' || type === 'D';
  return {
    valid: true,
    type,
    abnormal,
    bandLabel: `Walch type ${type}`,
    band: `Walch type ${type} — ${TYPE_LABEL[type]}.`,
    detail: `Retroversion ${retroversion} deg; ${subluxation} humeral head; ${concavity} concavity.`,
    note: WALCH_NOTE,
  };
}
