// spec-v704: Caton-Deschamps index (patellar height).
//
// A radiographic index of patellar height, a companion to the Insall-Salvati ratio already in
// the catalog. Source:
//   Caton J, Deschamps G, Chambat P, Lerat JL, Dejour H. Patella infera. Apropos of 128 cases.
//   Rev Chir Orthop Reparatrice Appar Mot. 1982;68(5):317-325. (Thresholds per standard
//   radiology references.)
//
//   Caton-Deschamps index (CDI) = A / B
//     A = distance from the most inferior point of the patellar articular surface to the
//         anterosuperior angle of the tibial plateau (mm)
//     B = length of the patellar articular surface (mm)
//   Measured on a lateral knee radiograph at about 30 degrees of flexion.
//
// Interpretation: normal ~0.6-1.2; < 0.6 = patella baja (infera); > 1.2 = patella alta.
//
// Pure: no DOM, no clock, no network.

export const CATON_DESCHAMPS_NOTE = 'Caton-Deschamps index of patellar height (Caton J, Deschamps G, Chambat P, Lerat JL, Dejour H, Rev Chir Orthop 1982;68(5):317-325). On a lateral knee radiograph taken at about 30 degrees of flexion, it is the ratio A / B, where A is the distance from the most inferior point of the patellar articular surface to the anterosuperior angle of the tibial plateau and B is the length of the patellar articular surface, both in millimetres. A ratio of about 0.6 to 1.2 is normal; below 0.6 indicates patella baja (a low-riding patella, also called patella infera) and above 1.2 indicates patella alta (a high-riding patella). Unlike the Insall-Salvati ratio it uses the articular surface rather than the tendon and is less affected by patellar-tendon abnormalities. It is a radiographic measurement that supports rather than replaces the full clinical and imaging assessment.';

function pos(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

function band(cdi) {
  if (cdi < 0.6) return { tier: 'baja', label: 'patella baja (infera)' };
  if (cdi <= 1.2) return { tier: 'normal', label: 'normal patellar height' };
  return { tier: 'alta', label: 'patella alta' };
}

export function catonDeschamps(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const a = pos(o.distanceA);
  if (!Number.isFinite(a) || a <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'distanceA', message: 'Enter distance A (inferior patellar articular surface to anterosuperior tibial plateau, mm).', note: CATON_DESCHAMPS_NOTE };
  }
  const b = pos(o.lengthB);
  if (!Number.isFinite(b) || b <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'lengthB', message: 'Enter length B (patellar articular surface length, mm).', note: CATON_DESCHAMPS_NOTE };
  }

  const cdi = a / b;
  const rounded = Math.round(cdi * 100) / 100;
  const bnd = band(cdi);

  return {
    valid: true,
    index: rounded,
    tier: bnd.tier,
    abnormal: cdi < 0.6 || cdi > 1.2,
    bandLabel: `Caton-Deschamps ${rounded}`,
    band: `Caton-Deschamps ${rounded} — ${bnd.label}.`,
    detail: `A ${a} / B ${b} = ${rounded}. Normal ~0.6-1.2; < 0.6 patella baja; > 1.2 patella alta.`,
    note: CATON_DESCHAMPS_NOTE,
  };
}
