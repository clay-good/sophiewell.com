// spec-v716: DMFT index (decayed, missing, filled teeth) for dental caries experience.
//
// The classic summary measure of lifetime caries experience in the permanent dentition.
// Source:
//   Klein H, Palmer CE, Knutson JW. Studies on dental caries. I. Dental status and dental
//   needs of elementary school children. Public Health Rep. 1938;53:751-765. (Origin of the
//   DMF index.) Severity levels per the World Health Organization oral-health survey
//   methodology (mean-DMFT population bands).
//
//   DMFT = D + F + M
//     D = number of decayed permanent teeth
//     M = number of permanent teeth missing due to caries
//     F = number of filled permanent teeth
//
// Population caries-severity levels (by mean DMFT, WHO):
//   0.0-1.1 very low; 1.2-2.6 low; 2.7-4.4 moderate; 4.5-6.5 high; >= 6.6 very high.
// (For an individual, DMFT is a count 0-32; the level gives population-severity context.)
//
// Pure: no DOM, no clock, no network.

export const DMFT_NOTE = 'DMFT index of dental caries experience (origin: Klein H, Palmer CE, Knutson JW, Public Health Rep 1938;53:751-765; severity levels per the World Health Organization oral-health survey methodology). DMFT equals the number of decayed permanent teeth plus those missing due to caries plus those filled, so it counts lifetime caries experience in the permanent dentition and ranges from 0 to 32. The World Health Organization defines population caries-severity levels by mean DMFT: 0.0 to 1.1 is very low, 1.2 to 2.6 low, 2.7 to 4.4 moderate, 4.5 to 6.5 high, and 6.6 or more very high; for an individual the DMFT is simply a count, and these levels provide population-severity context rather than an individual diagnosis. It is a descriptive caries-experience measure, not a treatment plan, and it supports rather than replaces the clinical dental examination.';

function count(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 32) return null;
  return n;
}

function level(dmft) {
  if (dmft <= 1.1) return 'very low';
  if (dmft <= 2.6) return 'low';
  if (dmft <= 4.4) return 'moderate';
  if (dmft <= 6.5) return 'high';
  return 'very high';
}

export function dmftCaries(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const d = count(o.decayed);
  if (d === null) return { valid: false, code: 'MISSING_INPUT', field: 'decayed', message: 'Enter the number of decayed permanent teeth (0-32).', note: DMFT_NOTE };
  const m = count(o.missing);
  if (m === null) return { valid: false, code: 'MISSING_INPUT', field: 'missing', message: 'Enter the number of permanent teeth missing due to caries (0-32).', note: DMFT_NOTE };
  const f = count(o.filled);
  if (f === null) return { valid: false, code: 'MISSING_INPUT', field: 'filled', message: 'Enter the number of filled permanent teeth (0-32).', note: DMFT_NOTE };

  const dmft = d + m + f;
  if (dmft > 32) {
    return { valid: false, code: 'INVALID_INPUT', field: 'decayed', message: 'D + M + F cannot exceed 32 permanent teeth.', note: DMFT_NOTE };
  }
  const lvl = level(dmft);

  return {
    valid: true,
    score: dmft,
    tier: lvl.replace(' ', '-'),
    // High or very-high caries experience (>= 4.5 by the WHO band) is the elevated flag.
    abnormal: dmft >= 4.5,
    severityLevel: lvl,
    bandLabel: `DMFT ${dmft}`,
    band: `DMFT ${dmft} — ${lvl} caries experience (population severity level).`,
    detail: `DMFT = D ${d} + M ${m} + F ${f} = ${dmft}. Population severity levels (mean DMFT): 0-1.1 very low, 1.2-2.6 low, 2.7-4.4 moderate, 4.5-6.5 high, >= 6.6 very high.`,
    note: DMFT_NOTE,
  };
}
