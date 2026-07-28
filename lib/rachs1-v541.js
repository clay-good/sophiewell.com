// spec-v541: RACHS-1, the Risk Adjustment for Congenital Heart Surgery. Zero-hit before this tile: "rachs",
// "jenkins", "aristotle", and "congenital heart surgery" across corpus.json, app.js, and lib/meta.js.
//
// AN AGE-BAND AND POPULATION GAP NEXT TO THE EXISTING euroscore TILE, which estimates operative mortality in
// ADULT ACQUIRED cardiac surgery. RACHS-1 covers CONGENITAL heart surgery, mostly in infants and children.
// The two share the phrase "cardiac surgery risk" and nothing else: EuroSCORE's predictors are things like
// prior cardiac surgery, pulmonary hypertension, and left-ventricular function, none of which carry the same
// meaning in a neonate having an arterial switch.
//
// THE CATEGORY COMES FROM THE PROCEDURE, NOT FROM THE PATIENT. RACHS-1 is a consensus grouping of surgical
// procedures into six categories of expected risk. That is unusual among the catalog's risk tools, which
// mostly score patient features, and it is why the tile takes a procedure or a category rather than a list
// of comorbidities.
//
// **CATEGORY 5 HAS NO PUBLISHED MORTALITY, AND THE TILE RETURNS NONE.** The derivation reported in-hospital
// mortality of 0.4 percent for category 1, 3.8 for 2, 8.5 for 3, 19.4 for 4, and 47.7 for 6 -- and for
// category 5 it reported NO ESTIMATE, because there were too few cases. Category 5 was nonetheless kept as
// its own category: the consensus panel judged those patients to be at higher risk than category 4 and lower
// than category 6, and merging 5 into a neighbour would have degraded comparisons. So a category 5 result
// returns the ORDERING (above 4, below 6) and explicitly no percentage. Interpolating between 19.4 and 47.7
// would invent a number the source deliberately withheld.
//
// THE MODIFIERS ARE ADJUSTED ODDS RATIOS, NOT POINTS TO ADD. Age at surgery of 30 days or less carried an
// adjusted odds ratio of about 3.0 and 31 days to 1 year about 1.9, both against over 1 year; prematurity
// about 1.8; a major non-cardiac structural anomaly about 1.8. These multiply risk within the model; they do
// not move a patient into a different RACHS-1 category, and they cannot be summed with the category. The
// tile reports them alongside the category as separate factors and says so.
//
// THE MORTALITY FIGURES ARE HISTORICAL AND THE TILE LABELS THEM AS SUCH. They come from a registry cohort
// analysed for the 2002 publication. Congenital cardiac surgical outcomes have improved substantially since,
// so these are the numbers the instrument was calibrated on rather than the risk facing a child operated on
// today, and a tile that presented them as current would overstate contemporary mortality.
//
// THE PROCEDURE LISTS HERE ARE REPRESENTATIVE, NOT EXHAUSTIVE. The published appendix assigns a long list of
// named procedures; this tile carries a subset for orientation and also accepts a category directly, so a
// procedure that is not listed can still be scored once its category is known from the source.
//
// HIGH-STAKES: this is a RISK-ADJUSTMENT tool built to compare outcomes BETWEEN PROGRAMS and BETWEEN
// CASE-MIXES. It was not designed to predict an individual child's outcome, and it is not a basis for
// counselling a family about their own child, for choosing between operations, or for declining surgery
// (spec-v11 section 5.3). It says nothing about the surgeon, the institution, the timing, or the child's
// physiology beyond the three modifiers, and a category is not a difficulty rating for the operating room.
// The clinical decision stays with the surgical team.
//
// CATEGORIES, MORTALITY, AND MODIFIERS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two
// independent sources agreeing on every value:
//   - Jenkins KJ, Gauvreau K, Newburger JW, Spray TL, Moller JH, Iezzoni LI. Consensus-based method for risk
//     adjustment for surgery for congenital heart disease. J Thorac Cardiovasc Surg. 2002;123(1):110-118.
//   - A later summary by the first author reporting the adjusted odds ratios, and an independent validation
//     reproducing the same category mortality figures.

export const RACHS_CATEGORIES = [
  {
    value: '1',
    mortality: '0.4 percent',
    examples: 'Secundum atrial septal defect repair; patent ductus arteriosus closure over 30 days of age; coarctation repair over 30 days of age; partial anomalous pulmonary venous return repair; aortopexy.',
  },
  {
    value: '2',
    mortality: '3.8 percent',
    examples: 'Ventricular septal defect repair; tetralogy of Fallot repair; primum atrial septal defect repair; Glenn shunt; pulmonary valvuloplasty or replacement; coarctation repair at 30 days or less; total anomalous pulmonary venous return repair over 30 days; vascular ring surgery.',
  },
  {
    value: '3',
    mortality: '8.5 percent',
    examples: 'Arterial switch operation; atrial switch operation; Fontan procedure; complete atrioventricular septal defect repair; aortic valve replacement or Ross procedure; mitral or tricuspid valve replacement; right ventricle to pulmonary artery conduit; systemic-to-pulmonary artery shunt; pulmonary artery banding.',
  },
  {
    value: '4',
    mortality: '19.4 percent',
    examples: 'Aortic valvuloplasty at 30 days or less; Konno procedure; Rastelli procedure; truncus arteriosus repair; interrupted aortic arch repair with or without ventricular septal defect repair; total anomalous pulmonary venous return repair at 30 days or less; arterial switch with ventricular septal defect closure; unifocalization for tetralogy with pulmonary atresia.',
  },
  {
    value: '5',
    mortality: null,
    examples: 'Tricuspid valve repositioning for neonatal Ebstein anomaly at 30 days or less; truncus arteriosus repair with interrupted aortic arch repair. Only two procedures are assigned here.',
  },
  {
    value: '6',
    mortality: '47.7 percent',
    examples: 'Norwood operation.',
  },
];

// Adjusted odds ratios from the derivation model. These MULTIPLY risk; they are not points and do not change
// the category.
export const RACHS_MODIFIERS = [
  { value: 'age<=30d', text: 'Age at surgery 30 days or less', oddsRatio: 3.0 },
  { value: 'age31d-1y', text: 'Age at surgery 31 days to 1 year', oddsRatio: 1.9 },
  { value: 'age>1y', text: 'Age at surgery over 1 year (the reference)', oddsRatio: 1.0 },
];

const CATEGORY5_TEXT = 'No mortality estimate was published for category 5, because there were too few cases. The consensus panel nonetheless kept it as its own category, judging these patients to be at higher risk than category 4 and lower than category 6. No percentage is given here, because interpolating between the neighbouring categories would invent a figure the source deliberately withheld.';

const NOTE = 'RACHS-1 (Jenkins and colleagues 2002) groups congenital heart surgery procedures into six consensus categories of expected risk. The category comes from the PROCEDURE rather than from the patient, which is unusual among risk tools. Reported in-hospital mortality in the derivation cohort was 0.4 percent for category 1, 3.8 for category 2, 8.5 for category 3, 19.4 for category 4, and 47.7 for category 6. No estimate was published for category 5 because there were too few cases; the panel kept it as its own category, judging it higher risk than category 4 and lower than category 6, so no percentage is given here rather than interpolating one the source withheld. Three modifiers carried adjusted odds ratios in the derivation model: age at surgery of 30 days or less about 3.0 and 31 days to 1 year about 1.9, both relative to over 1 year, prematurity about 1.8, and a major non-cardiac structural anomaly about 1.8. These multiply risk within the model, they are not points to add to a category, and they do not move a patient into a different category. The mortality figures come from a registry cohort analysed for the 2002 publication and are historical: congenital cardiac surgical outcomes have improved substantially since, so they are the numbers the instrument was calibrated on rather than the risk facing a child operated on today. The procedure lists shown are representative rather than exhaustive; the published appendix assigns many more, and a category can be entered directly once known. This is a risk-adjustment tool built to compare outcomes between programs and between case-mixes. It was not designed to predict an individual child’s outcome, and it is not a basis for counselling a family about their own child, for choosing between operations, or for declining surgery. It says nothing about the surgeon, the institution, the timing, or the child’s physiology beyond the three modifiers, and a category is not a difficulty rating for the operating room.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input: category '1'-'6'; ageBand one of RACHS_MODIFIERS values; premature yes/no; majorAnomaly yes/no.
export function rachs1(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const raw = o.category;
  if (raw === '' || raw === null || raw === undefined) {
    return { valid: false, message: 'Choose a RACHS-1 category from 1 to 6, based on the procedure performed.' };
  }
  const cat = RACHS_CATEGORIES.find((c) => c.value === String(raw).trim());
  if (!cat) {
    return { valid: false, message: 'Category must be 1, 2, 3, 4, 5, or 6.' };
  }

  const band = RACHS_MODIFIERS.find((m) => m.value === String(o.ageBand || '').trim());
  if (!o.ageBand) {
    return { valid: false, message: 'Choose the age band at surgery: it carried a separate adjusted odds ratio in the derivation model.' };
  }
  if (!band) {
    return { valid: false, message: 'Age band must be age<=30d, age31d-1y, or age>1y.' };
  }

  const premature = readBool(o.premature);
  const majorAnomaly = readBool(o.majorAnomaly);
  if (premature === null || majorAnomaly === null) {
    return { valid: false, message: 'Answer both prematurity and major non-cardiac structural anomaly: each carried its own adjusted odds ratio.' };
  }
  if (Number.isNaN(premature) || Number.isNaN(majorAnomaly)) {
    return { valid: false, message: 'Prematurity and major structural anomaly must each be yes or no.' };
  }

  const modifiers = [];
  if (band.oddsRatio !== 1.0) modifiers.push(`${band.text} (adjusted odds ratio about ${band.oddsRatio})`);
  if (premature) modifiers.push('Prematurity (adjusted odds ratio about 1.8)');
  if (majorAnomaly) modifiers.push('Major non-cardiac structural anomaly (adjusted odds ratio about 1.8)');

  const mortalityText = cat.mortality
    ? `Reported in-hospital mortality in the derivation cohort was ${cat.mortality}.`
    : CATEGORY5_TEXT;

  return {
    valid: true,
    category: cat.value,
    mortalityPublished: cat.mortality !== null,
    mortality: cat.mortality,
    modifiers,
    bandLabel: `RACHS-1 category ${cat.value}`,
    band: `RACHS-1 category ${cat.value}. ${mortalityText} Those figures are historical, from a cohort analysed for the 2002 publication; congenital cardiac surgical outcomes have improved substantially since.${modifiers.length ? ` Separate risk modifiers present: ${modifiers.join('; ')}. These multiply risk within the model and are not points to add to the category.` : ' No additional risk modifiers were selected.'} This is a risk-adjustment tool for comparing programs and case-mixes, not a prediction for an individual child.`,
    note: NOTE,
  };
}
