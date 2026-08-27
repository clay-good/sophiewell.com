// spec-v828: 2017 Cystic Fibrosis Foundation consensus criteria for the diagnosis of cystic
// fibrosis.
//
// Sources:
//   Farrell PM, White TB, Ren CL, et al. Diagnosis of Cystic Fibrosis: Consensus Guidelines
//     from the Cystic Fibrosis Foundation. J Pediatr. 2017;181S:S4-S15.e1.
//   Corroborated on the sweat chloride bands and the threshold change in PMC5760465.
//
// A DIAGNOSIS NEEDS BOTH HALVES:
//   an entry route     a positive newborn screen, clinical features consistent with CF, or a
//                      sibling with CF
//   AND evidence of CFTR dysfunction
//                      a sweat chloride of 60 mmol/L or more, or two CF-causing CFTR variants
//                      in trans
//
// SWEAT CHLORIDE BANDS:
//   >= 60 mmol/L   consistent with CF
//   30-59 mmol/L   intermediate; CFTR genetic analysis is needed
//   <  30 mmol/L   CF unlikely
//
// THE THRESHOLD MOVED IN 2017, AND IT MOVED DOWN AND ACROSS ALL AGES. The intermediate band
// used to begin at 40 mmol/L for anyone over six months; it now begins at 30 for everyone.
// A sweat chloride of 35 in a nine-month-old was "normal" under the older reading and is
// intermediate now - which means CFTR analysis and continued follow-up rather than
// reassurance and discharge. That is the whole reason to state the age-independence out loud.
//
// AND SWEAT CHLORIDE ALONE IS NOT A DIAGNOSIS. Without a positive newborn screen, clinical
// features or an affected sibling, a raised sweat chloride does not make CF by these
// criteria. A tool that reported "consistent with CF" on a number alone would skip the half
// of the definition that says who should have been tested.
//
// Pure: no DOM, no clock, no network.

export const CF_NOTE = 'The 2017 Cystic Fibrosis Foundation consensus criteria (Farrell PM, White TB, Ren CL, et al, J Pediatr 2017;181S:S4-S15) diagnose cystic fibrosis when two things hold together: an entry route, meaning a positive newborn screen, clinical features consistent with the disease, or a sibling with cystic fibrosis; and evidence of CFTR dysfunction, meaning a sweat chloride of 60 millimoles per litre or more, or two CF-causing CFTR variants in trans. Sweat chloride falls into three bands: 60 or more is consistent with the diagnosis, 30 to 59 is intermediate and calls for CFTR genetic analysis, and under 30 makes it unlikely. The lower boundary moved in 2017 and it moved both down and across all ages. The intermediate band used to start at 40 for anyone over six months and now starts at 30 for everyone, so a sweat chloride of 35 in a nine-month-old was read as normal before and is intermediate now, meaning genetic analysis and continued follow-up rather than reassurance and discharge. The other half matters too: a raised sweat chloride on its own is not a diagnosis without an entry route, and reporting one as consistent with cystic fibrosis skips the part of the definition that says who should have been tested. It applies published criteria to results already obtained and it does not order the sweat test or the genetic panel, nor start any therapy.';

export const CF_DIAGNOSTIC = 60;      // mmol/L, at or above
export const CF_INTERMEDIATE = 30;    // mmol/L, at or above is intermediate
export const OLD_INTERMEDIATE = 40;   // pre-2017, for age over 6 months
export const MAX_SWEAT = 200;

const CFTR_STATES = ['two-cf-causing', 'one-or-none', 'not-tested'];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function cfDiagnosis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const sweat = num(o.sweatChloride);
  const ageMonths = num(o.ageMonths);
  if (sweat !== null && (sweat < 0 || sweat > MAX_SWEAT)) {
    return { valid: false, message: `Sweat chloride must be between 0 and ${MAX_SWEAT} mmol/L.` };
  }
  if (ageMonths !== null && (ageMonths < 0 || ageMonths > 1500)) {
    return { valid: false, message: 'Age in months is out of range.' };
  }

  const cftr = String(o.cftrVariants == null ? '' : o.cftrVariants).trim().toLowerCase() || 'not-tested';
  if (!CFTR_STATES.includes(cftr)) {
    return { valid: false, message: 'CFTR status must be two-cf-causing, one-or-none or not-tested.' };
  }

  const routes = [];
  if (truthy(o.newbornScreenPositive)) routes.push('a positive newborn screen');
  if (truthy(o.clinicalFeatures)) routes.push('clinical features consistent with cystic fibrosis');
  if (truthy(o.affectedSibling)) routes.push('a sibling with cystic fibrosis');
  const hasRoute = routes.length >= 1;

  let band = null;
  if (sweat !== null) {
    if (sweat >= CF_DIAGNOSTIC) band = 'consistent with CF';
    else if (sweat >= CF_INTERMEDIATE) band = 'intermediate';
    else band = 'CF unlikely';
  }

  const twoVariants = cftr === 'two-cf-causing';
  const cftrDysfunction = (sweat !== null && sweat >= CF_DIAGNOSTIC) || twoVariants;
  const diagnosis = hasRoute && cftrDysfunction;

  // The half people skip.
  const routeNote = !hasRoute && cftrDysfunction
    ? 'Evidence of CFTR dysfunction is present, but these criteria also require an entry route: a positive newborn screen, clinical features consistent with cystic fibrosis, or a sibling with the disease. A sweat chloride on its own is not a diagnosis.'
    : null;

  // The 2017 change, raised only where the two readings disagree.
  const inOldNormalGap = sweat !== null && sweat >= CF_INTERMEDIATE && sweat < OLD_INTERMEDIATE;
  const thresholdNote = inOldNormalGap
    ? `A sweat chloride of ${sweat} mmol/L is INTERMEDIATE under the 2017 criteria, which lowered the lower boundary from ${OLD_INTERMEDIATE} to ${CF_INTERMEDIATE} mmol/L and applied it at every age${ageMonths !== null && ageMonths > 6 ? `, including at ${ageMonths} months` : ''}. The older reading would have called this normal, and the difference is CFTR analysis and continued follow-up rather than discharge.`
    : null;

  // What to do with an intermediate value.
  const intermediateNote = band === 'intermediate'
    ? (twoVariants
      ? 'An intermediate sweat chloride with two CF-causing CFTR variants in trans is evidence of CFTR dysfunction and supports the diagnosis where an entry route is present.'
      : (cftr === 'not-tested'
        ? 'An intermediate sweat chloride calls for CFTR genetic analysis, which has not been done here. It neither establishes nor excludes the diagnosis on its own.'
        : 'An intermediate sweat chloride without two CF-causing variants does not establish the diagnosis. Infants identified by newborn screening in this position are designated CRMS or CFSPID and followed, not discharged.'))
    : null;

  const missing = [];
  if (!hasRoute) missing.push('an entry route: a positive newborn screen, clinical features, or an affected sibling');
  if (!cftrDysfunction) missing.push(`evidence of CFTR dysfunction: a sweat chloride of ${CF_DIAGNOSTIC} mmol/L or more, or two CF-causing variants in trans`);

  return {
    valid: true,
    diagnosis,
    sweatBand: band,
    entryRoutes: routes,
    cftrDysfunction,
    routeNote,
    thresholdNote,
    intermediateNote,
    missing,
    abnormal: diagnosis,
    bandLabel: diagnosis ? 'Cystic fibrosis criteria met' : (band ? `Sweat chloride ${band}` : 'Criteria not met'),
    band: diagnosis
      ? `Cystic fibrosis criteria met — ${routes.join(' and ')}, with evidence of CFTR dysfunction.`
      : `Cystic fibrosis criteria not met — outstanding: ${missing.join('; ')}.`,
    detail: `Sweat chloride bands: ${CF_DIAGNOSTIC} mmol/L or more is consistent with CF; ${CF_INTERMEDIATE} to ${CF_DIAGNOSTIC - 1} is intermediate and calls for CFTR analysis; under ${CF_INTERMEDIATE} makes CF unlikely. The lower boundary is ${CF_INTERMEDIATE} at EVERY age since 2017, where it was ${OLD_INTERMEDIATE} above six months.`,
    note: CF_NOTE,
  };
}
