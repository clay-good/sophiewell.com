// spec-v1485: ICDAS caries codes with the ICDAS-merged severity, beside DMFT.
//
// Sources, read 2026-09-25:
//   Ismail AI, Sohn W, Tellez M, et al. The International Caries Detection and Assessment System
//     (ICDAS): an integrated system for measuring dental caries. Community Dent Oral Epidemiol.
//     2007;35(3):170-178.
//   Codes as stated in Braz Oral Res 2026 (PMC12969832), Table 3: 0 sound tooth surface; 1 first
//     visual change in enamel (seen only after drying); 2 distinct visual change in enamel (seen
//     without drying); 3 localized enamel breakdown without visible dentin; 4 underlying dark shadow
//     from dentin; 5 distinct cavity with visible dentin; 6 extensive distinct cavity with visible
//     dentin.
//   The merged severity as stated in J Clin Exp Dent 2026 (PMC13354049): "sound (0), initial (ICDAS 1
//     and 2), moderate (ICDAS 3 and 4) and extensive (ICDAS 5 and 6)".
//
// Up to six surfaces; a surface left blank is not scored, not read as sound. Pure: no DOM, no clock.

export const ICDAS_CODES = [
  { value: '0', text: '0: sound' },
  { value: '1', text: '1: first visual change in enamel (after drying)' },
  { value: '2', text: '2: distinct visual change in enamel' },
  { value: '3', text: '3: localized enamel breakdown, no dentin visible' },
  { value: '4', text: '4: underlying dark shadow from dentin' },
  { value: '5', text: '5: distinct cavity with visible dentin' },
  { value: '6', text: '6: extensive distinct cavity with visible dentin' },
];
export const ICDAS_SURFACES = ['s1', 's2', 's3', 's4', 's5', 's6'];

const DESC = {
  0: 'sound tooth surface',
  1: 'first visual change in enamel, seen only after drying',
  2: 'distinct visual change in enamel, seen without drying',
  3: 'localized enamel breakdown without visible dentin',
  4: 'underlying dark shadow from dentin',
  5: 'distinct cavity with visible dentin',
  6: 'extensive distinct cavity with visible dentin',
};
export const icdasMerged = (c) => (c === 0 ? 'sound' : c <= 2 ? 'initial' : c <= 4 ? 'moderate' : 'extensive');

export function icdasCaries(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const codes = ICDAS_SURFACES.map((k, i) => ({ n: i + 1, v: o[k] }))
    .filter((s) => ICDAS_CODES.some((c) => c.value === String(s.v)))
    .map((s) => ({ n: s.n, code: Number(s.v) }));
  if (!codes.length) return { valid: false, message: 'Choose the ICDAS code (0 to 6) for at least one surface.' };
  const worst = Math.max(...codes.map((s) => s.code));
  const counts = { sound: 0, initial: 0, moderate: 0, extensive: 0 };
  for (const s of codes) counts[icdasMerged(s.code)] += 1;
  const summary = Object.entries(counts).filter(([, n]) => n).map(([k, n]) => `${n} ${k}`).join(', ');
  return {
    valid: true,
    worst,
    worstCategory: icdasMerged(worst),
    counts,
    abnormal: worst > 0,
    band: `Most severe: ICDAS ${worst}, ${DESC[worst]} (${icdasMerged(worst)}). ${codes.length === 1 ? 'One surface' : `${codes.length} surfaces`}: ${summary}.`,
    bandLabel: `ICDAS ${worst}, ${icdasMerged(worst)}`,
    notes: [
      'The merged severity groups the codes as sound (0), initial (1 and 2), moderate (3 and 4) and extensive (5 and 6).',
      'Codes 1 and 2 are read on a clean surface, code 1 only after drying; the examination conditions change the code.',
    ],
    note: 'ICDAS (Ismail AI et al, Community Dent Oral Epidemiol 2007); codes as stated in Braz Oral Res 2026 and the merged severity in J Clin Exp Dent 2026. It records what is seen; it does not decide treatment.',
  };
}
