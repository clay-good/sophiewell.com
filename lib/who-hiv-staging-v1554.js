// spec-v1554 tool 1: the WHO clinical stage of HIV disease for adults and adolescents (15 years or older) or
// children (under 15).
//
// Source: WHO. Consolidated guidance for strengthening national routine surveillance systems: updated HIV
// case definitions, July 2026 (SURV26; IRIS 10665/386764; CC BY-NC-SA 3.0 IGO, facts restated), Annex 1
// (pp. 48-50), adapted from the 2016 consolidated ARV guidelines. Read October 6, 2026. Every condition in
// the annex is listed for its age group; the regional additions (talaromycosis in Asia, HIV-associated
// rectovaginal fistula in southern Africa, reactivated trypanosomiasis in Latin America) are labelled.
//
// Three selects, one per stage (2, 3, 4): a condition present, "none", or blank for not assessed. The stage
// is the highest with a condition present; a blank higher stage makes it "at least" that stage, and stage 1
// is given only when stages 2 to 4 are all assessed as none.
//
// Stated rather than hidden: the adult stage 3 severe bacterial infections include pneumonia, the child stage
// 4 recurrent severe bacterial infections exclude it; the annex gives no temperature for adult persistent
// fever (children above 37.5 C).
//
// Pure: no DOM, no clock.

export const AGE_OPTIONS = [
  { value: 'adult', text: 'Adult or adolescent (15 years or older)' },
  { value: 'child', text: 'Child (under 15 years)' },
];

// [value, text, group]: group 'a' adults only, 'c' children only, 'b' both.
const S2 = [
  ['wtloss-mod', 'Moderate unexplained weight loss, under 10% (15+)', 'a'],
  ['resp-rec', 'Recurrent respiratory tract infections: sinusitis, tonsillitis, otitis media, pharyngitis (15+)', 'a'],
  ['hsm', 'Unexplained persistent hepatosplenomegaly (under 15)', 'c'],
  ['urti', 'Recurrent or chronic upper respiratory infections: otitis media, otorrhea, sinusitis, tonsillitis (under 15)', 'c'],
  ['zoster', 'Herpes zoster', 'b'],
  ['cheilitis', 'Angular cheilitis (15+)', 'a'],
  ['lge', 'Lineal gingival erythema (under 15)', 'c'],
  ['ulcer', 'Recurrent oral ulceration', 'b'],
  ['ppe', 'Papular pruritic eruption', 'b'],
  ['nail', 'Fungal nail infections', 'b'],
  ['seb', 'Seborrheic dermatitis (15+)', 'a'],
  ['warts', 'Extensive wart virus infection (under 15)', 'c'],
  ['molluscum', 'Extensive molluscum contagiosum (under 15)', 'c'],
  ['parotid', 'Unexplained persistent parotid enlargement (under 15)', 'c'],
];
const S3 = [
  ['wtloss-sev', 'Unexplained severe weight loss, over 10% (15+)', 'a'],
  ['undernut', 'Unexplained moderate undernutrition not responding to standard therapy (under 15)', 'c'],
  ['diarrhea', 'Unexplained chronic diarrhea: over 1 month (15+), 14 days or more (under 15)', 'b'],
  ['fever', 'Unexplained persistent fever over 1 month (children: above 37.5 °C)', 'b'],
  ['candida', 'Persistent oral candidiasis (children: after the first 6 weeks)', 'b'],
  ['ohl', 'Oral hairy leukoplakia', 'b'],
  ['ptb', 'Pulmonary TB (children: or lymph node TB)', 'b'],
  ['sbi', 'Severe bacterial infection, including pneumonia, empyema, pyomyositis, bone or joint infection, meningitis, bacteremia (15+)', 'a'],
  ['pneum-rec', 'Severe recurrent bacterial pneumonia (under 15)', 'c'],
  ['anug', 'Acute necrotizing ulcerative gingivitis or periodontitis (adults: or stomatitis)', 'b'],
  ['cytopenia', 'Unexplained anemia under 8 g/dL, neutropenia under 0.5 x 10^9/L or chronic thrombocytopenia under 50 x 10^9/L', 'b'],
  ['lip', 'Symptomatic lymphoid interstitial pneumonitis (under 15)', 'c'],
  ['lung', 'Chronic HIV-associated lung disease, including bronchiectasis (under 15)', 'c'],
];
const S4 = [
  ['wasting', 'HIV wasting syndrome (15+)', 'a'],
  ['sam', 'Unexplained severe wasting, edema (severe acute malnutrition), stunting or severe undernutrition not responding to therapy (under 15)', 'c'],
  ['pcp', 'Pneumocystis (jirovecii) pneumonia', 'b'],
  ['pneum-rec4', 'Recurrent severe bacterial pneumonia (15+)', 'a'],
  ['sbi-rec', 'Recurrent severe bacterial infections, excluding pneumonia (under 15)', 'c'],
  ['hsv', 'Chronic herpes simplex over 1 month, or visceral at any site', 'b'],
  ['esoph', 'Esophageal candidiasis (or of the trachea, bronchi or lungs)', 'b'],
  ['eptb', 'Extrapulmonary TB', 'b'],
  ['ks', 'Kaposi sarcoma', 'b'],
  ['cmv', 'Cytomegalovirus infection: retinitis or other organs (children: onset after 1 month of age)', 'b'],
  ['toxo', 'Central nervous system toxoplasmosis (children: after the neonatal period)', 'b'],
  ['enceph', 'HIV encephalopathy', 'b'],
  ['crypto', 'Extrapulmonary cryptococcosis, including meningitis', 'b'],
  ['ntm', 'Disseminated nontuberculous mycobacterial infection', 'b'],
  ['pml', 'Progressive multifocal leukoencephalopathy', 'b'],
  ['cryptosp', 'Chronic cryptosporidiosis', 'b'],
  ['isospora', 'Chronic isosporiasis', 'b'],
  ['mycosis', 'Disseminated mycosis: extrapulmonary histoplasmosis, coccidioidomycosis (children: or penicilliosis)', 'b'],
  ['lymphoma', 'Cerebral or B-cell non-Hodgkin lymphoma', 'b'],
  ['nephro', 'HIV-associated nephropathy or cardiomyopathy', 'b'],
  ['septic', 'Recurrent septicemia, including nontyphoidal Salmonella (15+)', 'a'],
  ['cervix', 'Invasive cervical carcinoma (15+)', 'a'],
  ['leish', 'Atypical disseminated leishmaniasis (15+)', 'a'],
  ['talaro', 'Regional (Asia): talaromycosis (penicilliosis)', 'b'],
  ['fistula', 'Regional (southern Africa): HIV-associated rectovaginal fistula', 'b'],
  ['tryp', 'Regional (Latin America): reactivated trypanosomiasis', 'b'],
];

const NONE = { value: 'none', text: 'None of these' };
const opts = (list) => [NONE, ...list.map(([value, text]) => ({ value, text }))];
export const STAGE2_OPTIONS = opts(S2);
export const STAGE3_OPTIONS = opts(S3);
export const STAGE4_OPTIONS = opts(S4);

const NOTE = 'This follows WHO\'s clinical staging (Annex 1 of the 2026 HIV surveillance guidance, adapted from 2016). Stage 1 is no symptoms, or persistent generalized lymphadenopathy.';

// The condition as it reads for the chosen age group: drop the other group's qualifier.
function forGroup(text, g) {
  let t = text;
  if (g === 'a') t = t.replace(/, 14 days or more \(under 15\)/, '').replace(/ \(children: [^)]*\)/, '').replace(/ \(adults: ([^)]*)\)/, ' ($1)');
  else t = t.replace(/over 1 month \(15\+\), /, '').replace(/ \(adults: [^)]*\)/, '').replace(/ \(children: ([^)]*)\)/, ' ($1)');
  return t.replace(/ \((15\+|under 15)\)$/, '').replace(/over 1 month \(15\+\)/, 'over 1 month');
}

export function whoHivStaging(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = AGE_OPTIONS.find((x) => x.value === o.ageGroup);
  if (!age) return { valid: false, message: 'Choose the age group: 15 years or older, or under 15. The condition lists differ.' };
  const g = age.value === 'adult' ? 'a' : 'c';
  const read = (list, v, stage) => {
    if (v === undefined || v === null || v === '') return { state: 'open' };
    if (v === 'none') return { state: 'none' };
    const row = list.find((x) => x[0] === v);
    if (!row) return { state: 'bad' };
    if (row[2] !== 'b' && row[2] !== g) return { state: 'wrong', text: row[1], stage };
    return { state: 'yes', text: forGroup(row[1], g) };
  };
  const s = { 4: read(S4, o.s4, 4), 3: read(S3, o.s3, 3), 2: read(S2, o.s2, 2) };
  for (const k of [4, 3, 2]) {
    if (s[k].state === 'bad') return { valid: false, message: `Choose a stage ${k} condition from the list, "none", or leave it blank.` };
    if (s[k].state === 'wrong') return { valid: false, message: `Choose a stage ${k} condition for the age group: "${s[k].text}" is in the other age group's list.` };
  }
  const notes = [];
  if (g === 'c') notes.push('Under 5, moderate undernutrition is weight-for-height below -2 z or MUAC 115 to under 125 mm; severe wasting is below -3 z, and severe acute malnutrition also MUAC under 115 mm or edema.');
  const ahd = 'Where CD4 testing is unavailable, a stage 3 or 4 event at presentation defines advanced HIV disease.';
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });

  for (const k of [4, 3, 2]) {
    if (s[k].state !== 'yes') continue;
    const open = [4, 3, 2].filter((j) => j > k && s[j].state === 'open');
    if (k >= 3) notes.push(ahd);
    if (open.length) {
      notes.push(`Stage ${open.join(' and ')}: not assessed. The stage could be higher.`);
      return out(`At least clinical stage ${k}: ${s[k].text}.`, `At least stage ${k}`, k >= 3);
    }
    return out(`Clinical stage ${k}: ${s[k].text}.`, `Stage ${k}`, k >= 3);
  }
  const open = [4, 3, 2].filter((j) => s[j].state === 'open');
  if (open.length) return out(`Not staged: no condition chosen, and stage ${open.join(', ')} not assessed. Stage 1 is given only when stages 2 to 4 are all assessed as none.`, 'Not staged', false);
  return out('Clinical stage 1: no stage 2, 3 or 4 condition.', 'Stage 1', false);
}
