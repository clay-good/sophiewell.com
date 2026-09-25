// spec-v1445: nasogastric tube insertion length in adults -- NEX, Hanson, and corrected NEX (CoNEX).
//
// Source, read 2026-09-24: Boeykens K, Holvoet T, Duysburgh I. Nasogastric tube insertion length
// measurement and tip verification in adults: a narrative review. Crit Care 2023;27:317
// (PMC10439641):
//   Hanson method "((NEX x 0.38696) + 30.37 cm)"; in an RCT of 183 ICU patients, "in > 20% of all
//   patients insertion length underestimated the required depth" with both NEX and Hanson.
//   CoNEX: "((NEX x 0.38696) + 30.37 + 6 cm)"; in 218 ICU patients it gave "a correct tip position
//   (defined as > 3 cm in the stomach) in all patients". Table 1 converts NEX 40-69 cm to CoNEX
//   (40 -> 52, 50 -> 56, 60 -> 60, 69 -> 63), which this formula reproduces when rounded.
//   On verification: "a properly obtained and interpreted X-ray is the gold standard", but misread
//   X-rays "caused 12/21 (57%) of gastric tube-related deaths" in a UK safety report.
//
// NEX = nose tip to earlobe to xiphoid, measured in cm. Pure: no DOM, no clock, no network.

const TABLE_MIN = 40;
const TABLE_MAX = 69;

function isBlank(v) {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}

export function ngTubeLength(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.nexCm)) return { valid: false, message: 'Enter the NEX distance: nose tip to earlobe to xiphoid, in cm.' };
  const nex = Number(o.nexCm);
  if (!Number.isFinite(nex)) return { valid: false, message: 'Enter the NEX distance as a number of cm.' };
  // A transcription check, not a clinical range: an adult NEX of under 20 or over 120 cm is a typo.
  if (nex < 20 || nex > 120) return { valid: false, message: 'An adult NEX distance must be between 20 and 120 cm. Check the measurement.' };
  const hanson = nex * 0.38696 + 30.37;
  const conex = Math.round(hanson + 6);
  const notes = [
    `For comparison: NEX alone ${Math.round(nex)} cm and the Hanson formula ${Math.round(hanson)} cm. In an ICU trial both left the tube short in more than 20% of patients; the corrected length reached the stomach in all 218 patients of the follow-up study.`,
    'The length gets the tip to the stomach; it does not confirm where the tip is. Verify placement before any feed or medication, as your policy requires: an X-ray is the reference standard, and misread X-rays caused most tube-related deaths in one UK safety report.',
  ];
  if (nex < TABLE_MIN || nex > TABLE_MAX) {
    notes.unshift(`NEX ${Math.round(nex)} cm is outside the published conversion table (${TABLE_MIN} to ${TABLE_MAX} cm); the formula was not checked there.`);
  }
  return {
    valid: true,
    abnormal: false,
    conexCm: conex,
    hansonCm: Math.round(hanson),
    nexCm: Math.round(nex),
    band: `Insert to about ${conex} cm (corrected NEX): NEX ${Math.round(nex)} cm x 0.38696 + 30.37 + 6.`,
    bandLabel: `${conex} cm`,
    notes,
    note: 'Boeykens K et al, Crit Care 2023 (narrative review of adult nasogastric tube length and tip verification). Adults; the corrected formula was studied in ICU patients.',
  };
}
