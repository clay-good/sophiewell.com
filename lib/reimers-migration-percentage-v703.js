// spec-v703: Reimers migration percentage (hip migration index).
//
// The standard radiographic measure of hip displacement, central to cerebral-palsy hip
// surveillance. Source:
//   Reimers J. The stability of the hip in children: a radiological study of the results of
//   muscle surgery in cerebral palsy. Acta Orthop Scand Suppl. 1980;184:1-100. (Thresholds
//   per the AACPDM / CPUP hip-surveillance care pathways.)
//
//   Migration percentage (MP) = (a / b) x 100
//     a = width of the femoral head lateral to Perkin's line (mm)
//     b = total width of the femoral head (mm)
//   (Perkin's line is drawn perpendicular to Hilgenreiner's line at the lateral edge of the
//    bony acetabulum.)
//
// Interpretation: <= 33% is normal/contained; > 33% indicates subluxation (the surveillance
// referral threshold); >= ~90-100% indicates dislocation.
//
// Pure: no DOM, no clock, no network.

export const REIMERS_NOTE = "Reimers migration percentage, also called the hip migration index (Reimers J, Acta Orthop Scand Suppl 1980;184:1-100), is the standard radiographic measure of hip displacement and is central to cerebral-palsy hip surveillance. Migration percentage = (a / b) x 100, where a is the width of the femoral head lateral to Perkin's line and b is the total width of the femoral head, both measured in millimetres on an anteroposterior pelvis radiograph; Perkin's line is perpendicular to Hilgenreiner's line at the lateral edge of the bony acetabulum. A value of 33 percent or less is considered normal or contained, above 33 percent indicates subluxation and is the usual threshold to refer within a hip-surveillance program, and a value approaching 90 to 100 percent indicates dislocation. It measures displacement on a single film and does not by itself dictate surgery; it supports rather than replaces the surveillance program and clinical judgment.";

function nonneg(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

function band(mp) {
  if (mp <= 33) return { tier: 'normal', label: 'normal / contained' };
  if (mp < 90) return { tier: 'subluxated', label: 'subluxated' };
  return { tier: 'dislocated', label: 'dislocated / severe displacement' };
}

export function reimersMigrationPercentage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const a = nonneg(o.lateralWidth);
  if (!Number.isFinite(a) || a < 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'lateralWidth', message: "Enter the femoral-head width lateral to Perkin's line (mm).", note: REIMERS_NOTE };
  }
  const b = nonneg(o.totalWidth);
  if (!Number.isFinite(b) || b <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'totalWidth', message: 'Enter the total femoral-head width (mm).', note: REIMERS_NOTE };
  }
  if (a > b) {
    return { valid: false, code: 'INVALID_INPUT', field: 'lateralWidth', message: 'The lateral width cannot exceed the total femoral-head width.', note: REIMERS_NOTE };
  }

  const mp = (a / b) * 100;
  const rounded = Math.round(mp);
  const bnd = band(mp);

  return {
    valid: true,
    migrationPercentage: rounded,
    tier: bnd.tier,
    abnormal: mp > 33,
    bandLabel: `Reimers MP ${rounded}%`,
    band: `Reimers MP ${rounded}% — hip ${bnd.label}${mp > 33 ? '' : ''}.`,
    detail: `(a ${a} / b ${b}) x 100 = ${rounded}%. Thresholds: <= 33% normal, > 33% subluxated (surveillance referral), ~90-100% dislocated.`,
    note: REIMERS_NOTE,
  };
}
