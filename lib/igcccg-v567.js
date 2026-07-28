// spec-v567: the International Germ Cell Consensus Classification (IGCCCG) for metastatic germ cell cancer.
// "igcccg" was zero-hit across corpus.json, app.js and lib/meta.js, and `grep -c "id: 'igcccg'" app.js`
// returned 0.
//
// **SEMINOMA HAS NO POOR-PROGNOSIS CATEGORY AT ALL, AND THAT IS A CELL OF THE MATRIX THAT SIMPLY DOES NOT
// EXIST.** The source says it in as many words: no patients with seminoma are classified as poor prognosis.
// A three-by-two grid invites filling in the sixth cell, and an implementation that let a seminoma fall
// through to "poor" would invent a category the classification refuses to contain. This lib caps seminoma at
// intermediate and says why.
//
// **THE TABLE MIXES "ALL OF" AND "ANY OF" IN ONE CLASSIFICATION.** Good prognosis requires EVERY marker
// criterion to be met, an AND. Intermediate and poor are triggered by ANY ONE of their marker criteria, an
// OR. Reading the whole table as one direction misclassifies in both directions: treating good as any-of
// would promote patients who fail a marker, and treating poor as all-of would demote almost nobody.
//
// **SEMINOMA IGNORES hCG AND LDH ENTIRELY, AND ITS AFP FIELD IS A GATE RATHER THAN A GRADED VARIABLE.** The
// seminoma rows read "normal AFP, any hCG, any LDH". A raised AFP does not make a seminoma higher risk -- it
// means the tumor is NOT a pure seminoma and must be classified as a nonseminoma. This lib treats a raised
// AFP in seminoma as a reclassification, not a score, because that is what it is.
//
// **LDH IS A MULTIPLE OF THE LOCAL UPPER LIMIT OF NORMAL, NOT AN ABSOLUTE VALUE.** The thresholds are 1.5
// times and 10 times normal. A raw LDH in units per litre cannot be classified without the laboratory's own
// reference limit, so the input is explicitly a multiple.
//
// **hCG IS IN IU/L.** One widely used secondary source prints "IU/mL" in two rows and "IU/L" in a third
// while quoting the same numbers; the original and an independent reproduction use IU/L throughout, so the
// mL rendering is a typographic error. Reading 5,000 IU/L as 5,000 IU/mL would be wrong by a factor of a
// thousand (spec-v97).
//
// **THE MARKERS MUST BE POST-ORCHIECTOMY, PRE-CHEMOTHERAPY VALUES.** A dedicated study exists showing that
// using pre-orchiectomy markers mis-assigns risk groups, because markers fall after the primary is removed.
// This is stated on the input rather than assumed.
//
// TWO VINTAGES OF SURVIVAL FIGURES, AND THE GROUP DEFINITIONS ARE THE SAME IN BOTH. The 1997 original and a
// 2021 update classify patients identically; only the outcomes differ, most sharply for poor-risk
// nonseminoma, which moved from 48 percent to 71 percent. That is a real change in what the same group
// means, not a disagreement between sources, so this lib reports BOTH figures labeled by vintage rather
// than picking one.
//
// A NOTE ON ONE SOURCE DIVERGENCE THAT WAS RESOLVED RATHER THAN CARRIED: one secondary table lists
// "testis or retroperitoneal primary" for the seminoma intermediate row, while the original and an
// independent source both say ANY primary site for both seminoma rows. Two sources against one, and the
// original among them, so any primary site is used.
//
// HIGH-STAKES: this assigns a PROGNOSTIC GROUP for METASTATIC disease, and the groups map onto very
// different chemotherapy intensities in practice. It does NOT diagnose germ cell cancer, does not establish
// that disease is metastatic, and does not distinguish seminoma from nonseminoma -- that is a pathologic and
// serologic determination this tile takes as an input. It does not select a regimen or a number of cycles,
// and it does not apply to stage I disease, to relapsed or refractory disease, or to non-germ-cell tumors
// (spec-v11 section 5.3). The oncologic decision stays with the clinician.
//
// GROUPS, CRITERIA AND SURVIVAL FIGURES RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two
// independent reproductions of the classification that agree on every marker cut point:
//   - International Germ Cell Cancer Collaborative Group. International Germ Cell Consensus Classification:
//     a prognostic factor-based staging system for metastatic germ cell cancers. J Clin Oncol.
//     1997;15(2):594-603.
//   - Gillessen S, et al. Predicting outcomes in men with metastatic nonseminomatous germ cell tumors:
//     results from the IGCCCG Update Consortium. J Clin Oncol. 2021;39(14):1563-1574 (updated outcomes;
//     group definitions unchanged).

export const HISTOLOGIES = [
  { value: 'nonseminoma', text: 'Nonseminoma' },
  { value: 'seminoma', text: 'Seminoma (pure, with a normal AFP)' },
];

export const PRIMARY_SITES = [
  { value: 'testis-retroperitoneal', text: 'Testis or retroperitoneal' },
  { value: 'mediastinal', text: 'Mediastinal' },
];

// ng/mL for AFP, IU/L for hCG, multiples of the local upper limit of normal for LDH.
export const AFP_INTERMEDIATE = 1000;
export const AFP_POOR = 10000;
export const HCG_INTERMEDIATE = 5000;
export const HCG_POOR = 50000;
export const LDH_INTERMEDIATE = 1.5;
export const LDH_POOR = 10;

export const SURVIVAL = {
  nonseminoma: {
    good: { original1997: '92 percent', update2021: '92 to 94 percent' },
    intermediate: { original1997: '80 percent', update2021: '80 to 83 percent' },
    poor: { original1997: '48 percent', update2021: '71 percent' },
  },
  seminoma: {
    good: { original1997: '86 percent', update2021: '86 percent' },
    intermediate: { original1997: '72 percent', update2021: '72 percent' },
  },
};

export const MARKER_TIMING = 'Markers must be the POST-ORCHIECTOMY, PRE-CHEMOTHERAPY values. Using pre-orchiectomy markers mis-assigns the risk group, because markers fall once the primary is removed.';

const NO_POOR_SEMINOMA = 'Seminoma has NO poor-prognosis category: the classification states that no patients with seminoma are classified as poor prognosis. This is a cell of the matrix that does not exist, not a cell this patient failed to reach.';

const AFP_GATE = 'A raised AFP means the tumor is NOT a pure seminoma. It is not a higher-risk seminoma: by definition it must be classified as a nonseminoma, so no seminoma group is assigned here.';

const AND_OR_TEXT = 'Good prognosis requires EVERY criterion to be met, while intermediate and poor are triggered by ANY ONE of their marker criteria. Both directions live in the same table.';

const LDH_UNITS = 'LDH is a MULTIPLE of the local upper limit of normal, not an absolute value.';

const HCG_UNITS = 'hCG thresholds are in IU/L. One widely used secondary source prints IU/mL in two rows while quoting the same numbers; that is a typographic error, and reading it as IU/mL would be wrong by a factor of a thousand.';

const LDH_BOUNDARY = `The printed wording makes intermediate LDH "1.5 or more and less than 10 times normal" and poor "more than 10 times normal", which would leave exactly 10 times normal in no group. This lib treats 10 times normal or above as poor so the bands stay exhaustive, and says so at that value.`;

const NOTE = 'The International Germ Cell Consensus Classification (IGCCCG 1997) assigns a prognostic group for metastatic germ cell cancer. For nonseminoma, good prognosis requires a testis or retroperitoneal primary, no nonpulmonary visceral metastases, and all of AFP below 1000 ng/mL, hCG below 5000 IU/L and LDH below 1.5 times the upper limit of normal. Intermediate is the same primary and metastasis picture with any one of AFP 1000 to 10000, hCG 5000 to 50000, or LDH at least 1.5 and under 10 times normal. Poor is a mediastinal primary, or nonpulmonary visceral metastases, or any one of AFP above 10000, hCG above 50000, or LDH at or above 10 times normal. For seminoma, any primary site is permitted, AFP must be normal, and hCG and LDH are ignored entirely: good prognosis is the absence of nonpulmonary visceral metastases and intermediate is their presence. Seminoma has no poor-prognosis category at all, which the classification states outright, so a seminoma is never assigned one. The table mixes all-of and any-of logic: good prognosis requires every criterion to be met while intermediate and poor are triggered by any one marker criterion, and reading the whole table in one direction misclassifies both ways. A raised AFP in an apparent seminoma is a reclassification rather than a score, because by definition such a tumor must be treated as a nonseminoma. LDH is a multiple of the local upper limit of normal rather than an absolute value, and hCG thresholds are in IU/L, a secondary source printing IU/mL for the same numbers being a typographic error that would be wrong by a factor of a thousand. Markers must be post-orchiectomy and pre-chemotherapy, since a dedicated study showed that pre-orchiectomy values mis-assign the risk group. The group definitions are identical in the 1997 original and a 2021 update, and only the outcomes differ, most sharply for poor-risk nonseminoma which moved from 48 percent to 71 percent five-year survival, so both figures are reported labeled by vintage. This assigns a prognostic group for metastatic disease and the groups map onto very different chemotherapy intensities in practice. It does not diagnose germ cell cancer, does not establish that disease is metastatic, and does not distinguish seminoma from nonseminoma, which is a pathologic and serologic determination taken here as an input. It does not select a regimen or a number of cycles, and it does not apply to stage I disease, to relapsed or refractory disease, or to non-germ-cell tumors.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

function readNumber(raw, max) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 0 || n > max) return NaN;
  return n;
}

export function igcccg(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const histology = HISTOLOGIES.find((h) => h.value === String(o.histology || '').trim().toLowerCase());
  if (!histology) {
    return { valid: false, message: 'Choose the histology: seminoma or nonseminoma. This is a pathologic and serologic determination, not something the classification derives.' };
  }

  const npvm = readBool(o.nonpulmonaryVisceralMets);
  if (npvm === null) {
    return { valid: false, message: 'Say whether there are nonpulmonary visceral metastases. Pulmonary metastases do not count for this criterion.' };
  }
  if (Number.isNaN(npvm)) {
    return { valid: false, message: 'The nonpulmonary visceral metastasis answer must be yes or no.' };
  }

  // ---- Seminoma: any primary site, AFP is a gate, hCG and LDH are ignored, and there is no poor group.
  if (histology.value === 'seminoma') {
    const afpNormal = readBool(o.afpNormal);
    if (afpNormal === null) {
      return { valid: false, message: 'Say whether the AFP is normal. In seminoma this is a gate, not a graded marker: a raised AFP means the tumor is classified as a nonseminoma.' };
    }
    if (Number.isNaN(afpNormal)) {
      return { valid: false, message: 'The AFP answer must be yes or no.' };
    }
    if (!afpNormal) {
      return {
        valid: true,
        classified: false,
        histology: 'seminoma',
        group: null,
        reclassifyAsNonseminoma: true,
        bandLabel: 'Not classifiable as seminoma',
        bandText: `${AFP_GATE} Re-enter this patient as a nonseminoma, with the AFP, hCG and LDH values. ${MARKER_TIMING}`,
        note: NOTE,
      };
    }

    const group = npvm ? 'intermediate' : 'good';
    const survival = SURVIVAL.seminoma[group];
    return {
      valid: true,
      classified: true,
      histology: 'seminoma',
      group,
      poorCategoryExists: false,
      survival,
      bandLabel: `IGCCCG ${group} prognosis (seminoma)`,
      bandText: `IGCCCG ${group} prognosis, seminoma. Five-year survival ${survival.update2021} in the 2021 update and ${survival.original1997} in the 1997 original. ${NO_POOR_SEMINOMA} Seminoma permits ANY primary site, requires a normal AFP, and ignores hCG and LDH entirely. ${MARKER_TIMING} This assigns a prognostic group and does not select a regimen or number of cycles.`,
      note: NOTE,
    };
  }

  // ---- Nonseminoma.
  const primary = PRIMARY_SITES.find((p) => p.value === String(o.primarySite || '').trim().toLowerCase());
  if (!primary) {
    return { valid: false, message: 'Choose the primary site: testis or retroperitoneal, or mediastinal. A mediastinal primary is poor prognosis on its own.' };
  }

  const afp = readNumber(o.afp, 1e7);
  if (afp === null) return { valid: false, message: 'Enter the AFP in ng/mL, post-orchiectomy and pre-chemotherapy.' };
  if (Number.isNaN(afp)) return { valid: false, message: 'AFP must be a number in ng/mL.' };

  const hcg = readNumber(o.hcg, 1e8);
  if (hcg === null) return { valid: false, message: 'Enter the hCG in IU/L (not IU/mL), post-orchiectomy and pre-chemotherapy.' };
  if (Number.isNaN(hcg)) return { valid: false, message: 'hCG must be a number in IU/L.' };

  const ldh = readNumber(o.ldhMultiple, 1000);
  if (ldh === null) return { valid: false, message: 'Enter the LDH as a MULTIPLE of the local upper limit of normal, not an absolute value.' };
  if (Number.isNaN(ldh)) return { valid: false, message: 'LDH must be a number expressed as a multiple of the upper limit of normal.' };

  const poorReasons = [];
  if (primary.value === 'mediastinal') poorReasons.push('mediastinal primary');
  if (npvm) poorReasons.push('nonpulmonary visceral metastases');
  if (afp > AFP_POOR) poorReasons.push(`AFP above ${AFP_POOR} ng/mL`);
  if (hcg > HCG_POOR) poorReasons.push(`hCG above ${HCG_POOR} IU/L`);
  if (ldh >= LDH_POOR) poorReasons.push(`LDH at or above ${LDH_POOR} times normal`);

  const intermediateReasons = [];
  if (afp >= AFP_INTERMEDIATE && afp <= AFP_POOR) intermediateReasons.push(`AFP ${AFP_INTERMEDIATE} to ${AFP_POOR} ng/mL`);
  if (hcg >= HCG_INTERMEDIATE && hcg <= HCG_POOR) intermediateReasons.push(`hCG ${HCG_INTERMEDIATE} to ${HCG_POOR} IU/L`);
  if (ldh >= LDH_INTERMEDIATE && ldh < LDH_POOR) intermediateReasons.push(`LDH ${LDH_INTERMEDIATE} to under ${LDH_POOR} times normal`);

  let group;
  let reasons;
  if (poorReasons.length) { group = 'poor'; reasons = poorReasons; }
  else if (intermediateReasons.length) { group = 'intermediate'; reasons = intermediateReasons; }
  else { group = 'good'; reasons = ['all criteria met: testis or retroperitoneal primary, no nonpulmonary visceral metastases, and every marker below its intermediate threshold']; }

  const survival = SURVIVAL.nonseminoma[group];
  const onLdhBoundary = ldh === LDH_POOR;

  return {
    valid: true,
    classified: true,
    histology: 'nonseminoma',
    group,
    reasons,
    survival,
    onLdhBoundary,
    bandLabel: `IGCCCG ${group} prognosis (nonseminoma)`,
    bandText: `IGCCCG ${group} prognosis, nonseminoma, on ${reasons.join('; ')}. Five-year survival ${survival.update2021} in the 2021 update and ${survival.original1997} in the 1997 original; the group DEFINITIONS are identical in both and only the outcomes changed. ${AND_OR_TEXT} ${LDH_UNITS} ${HCG_UNITS}${onLdhBoundary ? ` ${LDH_BOUNDARY}` : ''} ${MARKER_TIMING} This assigns a prognostic group and does not select a regimen or number of cycles.`,
    note: NOTE,
  };
}
