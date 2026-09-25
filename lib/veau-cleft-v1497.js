// spec-v1497: the Veau classification of cleft palate.
//
// Sources, read 2026-09-25:
//   Veau V. Division palatine: anatomie, chirurgie, phonétique. Paris: Masson; 1931 (the original).
//   Classes as stated in Laryngoscope 2026 (PMC13569703), Table 1: "Veau classification I: cleft soft
//     palate; II: cleft soft and hard palate; III: complete unilateral cleft; IV: complete bilateral
//     cleft." Natl J Maxillofac Surg 2025 (PMC12469169) uses the same classes ("unilateral cleft palate
//     (Veau type 3) ... a cleft palate of the soft palate (Veau type 1)").
//
// Derived from how far the palate is cleft and whether the cleft runs through the lip and alveolus.
// Pure: no DOM, no clock.

export const PALATE = [
  { value: 'none', text: 'Palate intact' },
  { value: 'soft', text: 'Soft palate only' },
  { value: 'hard', text: 'Soft and hard palate' },
];
export const LIP = [
  { value: 'none', text: 'No: lip and alveolus intact' },
  { value: 'unilateral', text: 'Yes, on one side' },
  { value: 'bilateral', text: 'Yes, on both sides' },
];

const TEXT = {
  I: 'a cleft of the soft palate only',
  II: 'a cleft of the soft and hard palate, with the lip and alveolus intact',
  III: 'a complete unilateral cleft, through the lip, alveolus and palate on one side',
  IV: 'a complete bilateral cleft, through the lip, alveolus and palate on both sides',
};
const pick = (v, list) => (list.some((x) => x.value === v) ? v : null);

export function veauCleft(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const palate = pick(o.palate, PALATE);
  const lip = pick(o.lip, LIP);
  if (!palate) return { valid: false, message: 'Choose how far the palate is cleft.' };
  if (palate === 'none') {
    return { valid: false, message: 'Veau classes clefts of the palate; with the palate intact there is nothing to class. Choose the palate finding again if it is cleft.' };
  }
  if (!lip) return { valid: false, message: 'Choose whether the cleft runs through the lip and alveolus.' };
  let cls;
  if (lip === 'none') cls = palate === 'soft' ? 'I' : 'II';
  else if (palate === 'soft') {
    return { valid: false, message: 'Choose again: a complete cleft through the lip and alveolus also clefts the hard palate.' };
  } else cls = lip === 'unilateral' ? 'III' : 'IV';
  return {
    valid: true,
    veau: cls,
    abnormal: true,
    band: `Veau class ${cls}: ${TEXT[cls]}.`,
    bandLabel: `Veau ${cls}`,
    notes: [
      'Veau classes clefts of the palate; a cleft of the lip alone falls outside the four classes.',
      'The class describes extent, not width; the gap across the cleft is recorded separately.',
    ],
    note: 'Veau V, Division palatine, 1931; classes as stated in Laryngoscope 2026. It describes the cleft; the timing and type of repair are clinical decisions.',
  };
}
