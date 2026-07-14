// spec-v306: Immune effector cell-associated neurotoxicity syndrome (ICANS)
// severity — the ASTCT consensus grading (a catalog gap surfaced when spec-v305
// shipped the companion CRS tile: ICANS is the neurotoxicity counterpart graded
// alongside CRS on every cellular-therapy assessment). Given the ICE score and the
// consciousness / seizure / motor / raised-ICP findings, the tile reports the
// ASTCT ICANS grade (1-4) as the MOST SEVERE of the five domains.
//
// The ICE score (0-10) is ENTERED as a sub-score computed by the clinician with the
// official ICE tool; this module does not reproduce the ICE assessment items.
//
// This reports the classification's own grade, NOT a treatment order
// (spec-v11 §5.3) — steroids / anti-seizure / ICU escalation stay with the
// clinician.
//
// TABLE RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build against two
// independent sources that agree on the five domains and their grade thresholds:
//   - Lee DW, Santomasso BD, Locke FL, et al. ASTCT consensus grading for cytokine
//     release syndrome and neurologic toxicity associated with immune effector
//     cells. Biol Blood Marrow Transplant. 2019;25(4):625-638.
//   - The NCBI/PDQ and NHS-Wales reproductions of the same ASTCT ICANS grading.

// Each domain contributes a grade (0 = normal / absent). Overall grade = the max.
const LOC = { spontaneous: 0, voice: 2, tactile: 3, unarousable: 4 };
const SEIZURE = { none: 0, g3: 3, g4: 4 };
const ICP = { none: 0, focal: 3, diffuse: 4 };

// ICE score (0-10) -> grade: 10 = normal (0); 7-9 = grade 1; 3-6 = grade 2;
// 0-2 = grade 3. (Grade 4 for an unarousable patient comes via the consciousness
// domain, not the ICE score.)
function iceGrade(ice) {
  if (ice >= 10) return 0;
  if (ice >= 7) return 1;
  if (ice >= 3) return 2;
  return 3;
}

const NOTE = 'ASTCT consensus ICANS grading (Lee 2019) after immune-effector-cell / CAR-T therapy. The grade is the MOST SEVERE of five domains: ICE score (10 normal; 7-9 grade 1; 3-6 grade 2; 0-2 grade 3), level of consciousness (awakens to voice = 2; to tactile stimulus = 3; unarousable = 4), seizure (any resolving clinical or non-convulsive seizure = 3; prolonged >5 min or repetitive without return to baseline = 4), deep focal motor weakness (hemiparesis/paraparesis = 4), and raised ICP / cerebral edema (focal edema on imaging = 3; diffuse edema, decerebrate/decorticate posturing, CN VI palsy, papilledema, or Cushing triad = 4). The ICE score is entered as a sub-score. This reports the ASTCT grade, not a treatment order, which stays with the clinician.';

// input.ice (number 0-10, optional), input.loc / input.seizure / input.icp (enum
// keys), input.motor (bool). Returns the ASTCT ICANS grade (0-4; 0 = no ICANS).
export function icansGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const b = (v) => v === true || v === 'true' || v === 1 || v === '1' || v === 'on';

  let iceG = 0;
  const raw = typeof o.ice === 'string' ? o.ice.trim() : o.ice;
  if (raw !== '' && raw !== undefined && raw !== null) {
    const ice = Number(raw);
    if (!Number.isInteger(ice) || ice < 0 || ice > 10) {
      throw new RangeError('ICE score must be a whole number from 0 to 10.');
    }
    iceG = iceGrade(ice);
  }
  const locG = Object.prototype.hasOwnProperty.call(LOC, o.loc) ? LOC[o.loc] : 0;
  const seizureG = Object.prototype.hasOwnProperty.call(SEIZURE, o.seizure) ? SEIZURE[o.seizure] : 0;
  const icpG = Object.prototype.hasOwnProperty.call(ICP, o.icp) ? ICP[o.icp] : 0;
  const motorG = b(o.motor) ? 4 : 0;

  const grade = Math.max(iceG, locG, seizureG, motorG, icpG);

  const drivers = [];
  if (iceG >= 1 && iceG === grade) drivers.push('ICE score');
  if (locG === grade && locG > 0) drivers.push('level of consciousness');
  if (seizureG === grade && seizureG > 0) drivers.push('seizure');
  if (motorG === grade && motorG > 0) drivers.push('deep focal motor weakness');
  if (icpG === grade && icpG > 0) drivers.push('raised ICP / cerebral edema');

  let band;
  if (grade === 0) {
    band = 'No ICANS (ICE 10 and no consciousness, seizure, motor, or raised-ICP findings).';
  } else {
    band = `ICANS grade ${grade} of 4, driven by the ${drivers.join(' and ')} domain${drivers.length > 1 ? 's' : ''}.`;
  }
  if (grade >= 3) band += ' Severe neurotoxicity — typically ICU-level care.';

  return {
    valid: true,
    grade,
    severe: grade >= 3,
    abnormal: grade >= 3,
    meetsCriteria: grade >= 1,
    bandLabel: grade === 0 ? 'No ICANS' : `ICANS grade ${grade}`,
    band,
    note: NOTE,
  };
}
