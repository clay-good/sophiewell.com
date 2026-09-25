// spec-v1418: Paprosky classification of acetabular bone loss before revision hip arthroplasty.
//
// Sources, read 2026-09-24:
//   Paprosky WG, Perona PG, Lawrence JM. Acetabular defect classification and surgical
//     reconstruction in revision arthroplasty: a 6-year follow-up evaluation. J Arthroplasty
//     1994;9(1):33-44 -- the original (147 failed acetabular components).
//   Telleria JJM, Gee AO. Classifications in brief: Paprosky classification of acetabular bone loss.
//     Clin Orthop Relat Res 2013;471(11):3725-3730 (PMC3792247). Its Table 1, per type -- teardrop
//     (medial wall) / hip center (superior dome) / Kohler line (anterior column) / ischium
//     (posterior column):
//       1   intact / no migration / intact / intact
//       2A  intact / < 2 cm superomedial / intact / intact
//       2B  intact / < 2 cm superolateral / intact / intact
//       2C  moderate lysis / < 2 cm medial / disrupted / intact
//       3A  moderate lysis / > 2 cm superolateral / intact / moderate lysis
//       3B  severe lysis / > 2 cm superomedial / disrupted / severe lysis
//     Text: 2A is "direct superior" migration; in 3A "Kohler's line remains intact preventing
//     significant medial displacement" ("up and out"); 3B is "up-and-in"; type 3 "can be associated
//     with pelvic discontinuity"; the original 2 cm migration line was later liberalized to 3 cm;
//     interobserver kappa has ranged from 0.02 to 0.79, mostly 0.4 to 0.6.
//
// The type is DERIVED from the radiographic findings: migration decides the grade, then the
// direction (grade 2) or the Kohler line (grade 3) the subtype. The teardrop and ischium, when
// entered, are checked against the table row, and a disagreement is reported rather than hidden.
// Pure: no DOM, no clock, no network.

export const PAP_MIGRATION = [
  { value: 'none', text: 'None' },
  { value: 'lt', text: 'Less than 2 cm (3 cm in the later description)' },
  { value: 'gt', text: 'More than 2 cm (3 cm in the later description)' },
];
export const PAP_DIRECTION = [
  { value: 'superior', text: 'Superior or superomedial' },
  { value: 'superolateral', text: 'Superolateral (up and out)' },
  { value: 'medial', text: 'Medial' },
];
export const PAP_KOHLER = [
  { value: 'intact', text: 'Intact' },
  { value: 'disrupted', text: 'Disrupted' },
];
export const PAP_LYSIS = [
  { value: 'intact', text: 'Intact' },
  { value: 'moderate', text: 'Moderate lysis' },
  { value: 'severe', text: 'Severe lysis' },
];

// Table 1, the columns this tool checks.
const ROW = {
  1: { teardrop: 'intact', kohler: 'intact', ischium: 'intact' },
  '2A': { teardrop: 'intact', kohler: 'intact', ischium: 'intact' },
  '2B': { teardrop: 'intact', kohler: 'intact', ischium: 'intact' },
  '2C': { teardrop: 'moderate', kohler: 'disrupted', ischium: 'intact' },
  '3A': { teardrop: 'moderate', kohler: 'intact', ischium: 'moderate' },
  '3B': { teardrop: 'severe', kohler: 'disrupted', ischium: 'severe' },
};
const WORDS = {
  1: 'minimal focal bone loss; the hemispheric shape, walls and columns are intact and the hip center has not moved',
  '2A': 'moderate bone loss with direct superior migration; the dome and teardrop stop lateral and medial displacement',
  '2B': 'a deficient superior dome with superolateral migration',
  '2C': 'a deficient medial wall (teardrop) with direct medial migration; the dome is intact',
  '3A': 'severe loss of the walls and posterior column with superolateral ("up and out") migration; the Kohler line holds',
  '3B': 'destruction of both walls and both columns with superomedial ("up and in") migration',
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);
const lysisText = (v) => ({ intact: 'intact', moderate: 'moderate lysis', severe: 'severe lysis', disrupted: 'disrupted' }[v]);

export function paproskyAcetabular(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const migration = pick(PAP_MIGRATION, o.migration);
  const direction = pick(PAP_DIRECTION, o.direction);
  const kohler = pick(PAP_KOHLER, o.kohler);
  const teardrop = pick(PAP_LYSIS, o.teardrop);
  const ischium = pick(PAP_LYSIS, o.ischium);

  if (!migration) return { valid: false, message: 'Choose how far the hip center has migrated.' };
  if (!kohler) return { valid: false, message: 'Say whether the Kohler line is intact or disrupted.' };
  if (migration === 'lt' && !direction) {
    return { valid: false, message: 'Choose the direction of migration: under 2 cm it is what separates 2A, 2B and 2C.' };
  }

  let type;
  if (migration === 'none') type = '1';
  else if (migration === 'gt') type = kohler === 'disrupted' ? '3B' : '3A';
  else if (direction === 'medial' || kohler === 'disrupted') type = '2C';
  else type = direction === 'superolateral' ? '2B' : '2A';

  const row = ROW[type];
  const discord = [];
  if (kohler !== row.kohler) discord.push(`the Kohler line is ${lysisText(kohler)} (the table has ${lysisText(row.kohler)})`);
  if (teardrop && teardrop !== row.teardrop) discord.push(`the teardrop shows ${lysisText(teardrop)} (the table has ${lysisText(row.teardrop)})`);
  if (ischium && ischium !== row.ischium) discord.push(`the ischium shows ${lysisText(ischium)} (the table has ${lysisText(row.ischium)})`);
  if (type === '2C' && direction && direction !== 'medial') discord.push(`the migration is ${direction} (2C migrates medially)`);
  if (type === '3A' && direction && direction !== 'superolateral') discord.push(`the migration is ${direction} (3A migrates up and out)`);
  if (type === '3B' && direction && direction === 'superolateral') discord.push('the migration is superolateral (3B migrates up and in)');

  const notes = [];
  if (discord.length) {
    notes.push(`Not a clean fit for ${type}: ${discord.join('; ')}. The migration and Kohler line set the type here; check the films, and read the type as approximate.`);
  }
  if (type.startsWith('3')) notes.push('Type 3 defects can be associated with pelvic discontinuity; look for it before planning the reconstruction.');
  notes.push('Agreement between observers has varied widely (kappa 0.02 to 0.79, mostly 0.4 to 0.6), and the cup can hide landmarks on a plain film.');

  return {
    valid: true,
    abnormal: type !== '1',
    type,
    band: `Paprosky type ${type}: ${WORDS[type]}.`,
    bandLabel: `Type ${type}`,
    concordant: discord.length === 0,
    notes,
    note: 'Paprosky WG et al, J Arthroplasty 1994; criteria as tabulated by Telleria JJM and Gee AO, Clin Orthop Relat Res 2013 (Table 1). '
      + 'The original separated grades 2 and 3 at 2 cm of hip center migration; a later publication moved the line to 3 cm. The type describes the defect; the reconstruction is a surgical decision.',
  };
}
