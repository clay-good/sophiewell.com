// spec-v1483: Simplified Oral Hygiene Index (OHI-S) of Greene and Vermillion, beside the plaque and
// gingival indices.
//
// Sources, read 2026-09-25:
//   Greene JC, Vermillion JR. The simplified oral hygiene index. J Am Dent Assoc. 1964;68:7-13.
//   As applied in Pathogens 2026 (PMC13304723): the OHI-S "comprises the Debris Index Simplified (DI-S)
//     and Calculus Index Simplified (CI-S) and was recorded on six index teeth" (16, 11, 26, 46, 31,
//     36; buccal surfaces of 16, 11, 26 and 31, lingual of 36 and 46); "Each tooth was scored from 0 to
//     3"; each index is "the sum of ... scores divided by the number of examined teeth"; "The OHI-S
//     score was obtained by summing DI-S and CI-S values and was interpreted as follows: 0.0-1.2 = good
//     oral hygiene; 1.3-3.0 = fair oral hygiene; 3.1-6.0 = poor oral hygiene."
//
// A tooth left blank is a tooth not examined, not a score of 0: each index averages over the teeth
// that were scored. Pure: no DOM, no clock.

export const OHI_TEETH = [
  { key: 't16', label: '16 (buccal)' },
  { key: 't11', label: '11 (labial)' },
  { key: 't26', label: '26 (buccal)' },
  { key: 't36', label: '36 (lingual)' },
  { key: 't31', label: '31 (labial)' },
  { key: 't46', label: '46 (lingual)' },
];
export const OHI_SCORES = [
  { value: '0', text: '0' }, { value: '1', text: '1' }, { value: '2', text: '2' }, { value: '3', text: '3' },
];

const band = (x) => (x <= 1.2 ? 'good' : x <= 3.0 ? 'fair' : 'poor');
const r1 = (x) => Math.round(x * 10) / 10;

export function ohiS(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const read = (prefix) => OHI_TEETH.map((t) => o[`${prefix}${t.key.slice(1)}`])
    .map((v) => (OHI_SCORES.some((s) => s.value === String(v)) ? Number(v) : null));
  const debris = read('d');
  const calculus = read('c');
  const scoredBoth = OHI_TEETH.filter((_, i) => debris[i] !== null && calculus[i] !== null).length;
  if (!debris.some((v) => v !== null) || !calculus.some((v) => v !== null)) {
    return { valid: false, message: 'Choose the debris and the calculus score (0 to 3) for at least one index tooth.' };
  }
  const mean = (xs) => { const s = xs.filter((v) => v !== null); return s.reduce((a, b) => a + b, 0) / s.length; };
  const dis = mean(debris);
  const cis = mean(calculus);
  // Rounded to one decimal before banding, as the bands are written (1.2 good, 1.3 fair).
  const ohi = r1(dis + cis);
  const nD = debris.filter((v) => v !== null).length;
  const nC = calculus.filter((v) => v !== null).length;

  const notes = [];
  if (nD < 6 || nC < 6) {
    notes.push(`Not all six index teeth were scored (debris on ${nD}, calculus on ${nC}); each index averages over the teeth scored, and no score was entered for the rest.`);
  }
  if (scoredBoth < Math.max(nD, nC)) notes.push('Some teeth have a debris score without a calculus score, or the reverse.');

  return {
    valid: true,
    dis: r1(dis),
    cis: r1(cis),
    ohi,
    abnormal: band(ohi) !== 'good',
    band: `OHI-S ${ohi.toFixed(1)}: ${band(ohi)} oral hygiene (debris index ${r1(dis).toFixed(1)}, calculus index ${r1(cis).toFixed(1)}).`,
    bandLabel: `OHI-S ${ohi.toFixed(1)}, ${band(ohi)}`,
    notes,
    note: 'Greene JC, Vermillion JR, J Am Dent Assoc 1964; as applied in Pathogens 2026. Good 0.0 to 1.2, fair 1.3 to 3.0, poor 3.1 to 6.0.',
  };
}
