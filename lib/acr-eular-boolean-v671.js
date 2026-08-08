// spec-v671: ACR/EULAR Boolean-based remission for rheumatoid arthritis.
//
// A companion to the built RA disease-activity indices (das28, cdai-ra, sdai-ra):
// the Boolean remission definition is a strict AND of four thresholds, all of which
// must be met at the same visit. Sources:
//   Felson DT, Smolen JS, Wells G, et al. ACR/EULAR provisional definition of
//   remission in rheumatoid arthritis for clinical trials. Arthritis Rheum.
//   2011;63(3):573-586 (2011 Boolean, v1.0).
//   Studenic P, Aletaha D, de Wit M, et al. ACR/EULAR remission criteria for
//   rheumatoid arthritis: 2022 revision. Ann Rheum Dis 2023 (Boolean 2.0).
//
// Both versions require ALL of: TJC28 <= 1, SJC28 <= 1, CRP <= 1 mg/dL, and a
// patient global assessment (PtGA) threshold that is the ONLY difference between
// them: <= 1 (2011) vs <= 2 (2022 Boolean 2.0), on a 0-10 cm scale.
//
// UNIT TRAP: CRP is <= 1 mg/dL, which equals <= 10 mg/L. PtGA is on a 0-10 scale
// (a 0-100 mm VAS would use <= 10 for 2011 and <= 20 for 2022).
//
// Pure: no DOM, no clock, no network.

export const BOOLEAN_NOTE = 'ACR/EULAR Boolean-based remission for rheumatoid arthritis (Felson 2011; 2022 revision Studenic). Remission requires ALL FOUR of: tender joint count (28-joint) 1 or fewer, swollen joint count (28-joint) 1 or fewer, C-reactive protein 1 mg/dL or less (equivalently 10 mg/L or less), and patient global assessment of disease activity at or below its threshold on a 0-10 cm scale. The 2011 definition sets the patient-global threshold at 1 or less; the 2022 Boolean 2.0 revision loosened only that one item to 2 or less (tender, swollen, and CRP thresholds are unchanged) to better agree with the index-based SDAI/CDAI remission definitions without losing predictive value. It is a strict AND: failing any single criterion means not in Boolean remission. Watch the units: CRP is milligrams per deciliter (1 mg/dL = 10 mg/L), and the patient global is the 0-10 scale (a 0-100 mm VAS uses 10 and 20). This reports the Boolean definition only; the separate index-based SDAI 3.3-or-less definition is not computed here.';

function num(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

export function acrEularBoolean(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const tjc = num(o.tjc);
  if (!Number.isInteger(tjc) || tjc < 0 || tjc > 28) {
    return { valid: false, code: 'MISSING_INPUT', field: 'tjc', message: 'Enter the 28-joint tender joint count (whole number 0-28).' };
  }
  const sjc = num(o.sjc);
  if (!Number.isInteger(sjc) || sjc < 0 || sjc > 28) {
    return { valid: false, code: 'MISSING_INPUT', field: 'sjc', message: 'Enter the 28-joint swollen joint count (whole number 0-28).' };
  }
  const crp = num(o.crp);
  if (!Number.isFinite(crp) || crp < 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'crp', message: 'Enter the C-reactive protein in mg/dL (0 or more).' };
  }
  const ptga = num(o.ptga);
  if (!Number.isFinite(ptga) || ptga < 0 || ptga > 10) {
    return { valid: false, code: 'MISSING_INPUT', field: 'ptga', message: 'Enter the patient global assessment on a 0-10 scale.' };
  }

  const crit = {
    tjc: tjc <= 1,
    sjc: sjc <= 1,
    crp: crp <= 1,
  };
  const shared = crit.tjc && crit.sjc && crit.crp;
  const remission2011 = shared && ptga <= 1;
  const remission2022 = shared && ptga <= 2;

  const failed = [];
  if (!crit.tjc) failed.push(`tender joints ${tjc} (> 1)`);
  if (!crit.sjc) failed.push(`swollen joints ${sjc} (> 1)`);
  if (!crit.crp) failed.push(`CRP ${crp} mg/dL (> 1)`);
  const ptgaFail2022 = ptga > 2;

  return {
    valid: true,
    remission2011,
    remission2022,
    // Highlight when not in remission even by the looser 2022 definition.
    abnormal: !remission2022,
    tjc,
    sjc,
    crp,
    ptga,
    band: `2022 Boolean 2.0: ${remission2022 ? 'in remission' : 'not in remission'}; 2011 Boolean: ${remission2011 ? 'in remission' : 'not in remission'}.`,
    detail: remission2022
      ? (remission2011
          ? 'Meets all four criteria under both the 2011 and 2022 Boolean definitions.'
          : `Meets the 2022 Boolean 2.0 definition but not 2011 (patient global ${ptga} is > 1 but <= 2).`)
      : `Not in Boolean remission: ${[...failed, ...(ptgaFail2022 ? [`patient global ${ptga} (> 2)`] : [])].join(', ')}.`,
    note: BOOLEAN_NOTE,
  };
}
