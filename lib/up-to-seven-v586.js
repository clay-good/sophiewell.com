// spec-v586: the up-to-seven (Metroticket) criteria for liver transplantation in hepatocellular carcinoma.
// A CLUSTER-COMPLETION gap, and one the catalog documented against itself: `milan-criteria` has shipped
// since spec-v93, and its own note says the criterion it reports "is not a listing decision (MELD
// allocation, downstaging, UCSF/extended criteria and center policy all apply)". The extended criteria it
// points at were not in the catalog. `grep -ci "up-to-seven" app.js` returned 0.
//
// **THE CRITERION IS CONDITIONAL ON SOMETHING THAT CANNOT BE MEASURED WHEN THE DECISION IS MADE.** This is
// the load-bearing fact and it is routinely lost. Up-to-seven as published applies to tumors "in the absence
// of microvascular invasion", and MICROVASCULAR INVASION CANNOT BE ASSESSED BEFORE TRANSPLANT: imaging shows
// only gross (macro) vascular invasion, and biopsy cannot exclude microvascular invasion because of sampling
// bias. The published survival therefore describes patients who TURNED OUT, on the explant, not to have had
// it. Applied prospectively to select a candidate, the criterion rests on a condition nobody can verify at
// the time of the decision. This tool asks only what is actually knowable before transplant -- gross
// vascular invasion and extrahepatic spread -- and states the gap rather than pretending the pre-transplant
// and published questions are the same one.
//
// **"SEVEN" IS A SUM OF TWO DIFFERENT KINDS OF THING.** It adds the size of the largest tumor IN CENTIMETERS
// to the NUMBER OF TUMORS, a count. That is dimensionally odd on purpose: it is a single line that trades
// size against number, so one 6 cm tumor (6 + 1 = 7) and four 3 cm tumors (3 + 4 = 7) sit at the same
// boundary. It is not a size limit and not a count limit; it is an exchange rate between them.
//
// **ONLY THE LARGEST TUMOR'S SIZE ENTERS THE SUM.** The other tumors contribute 1 each by being counted, no
// matter how large they are. Three tumors of 4.9, 4.8 and 4.7 cm score 4.9 + 3 = 7.9 and fall outside; three
// tumors of 4.9, 0.5 and 0.5 cm score exactly the same 7.9. The criterion cannot tell those two patients
// apart, and total tumor burden is not what it measures.
//
// **MILAN IS FULLY CONTAINED WITHIN UP-TO-SEVEN, WHICH IS WHY THE COMPARISON IS WORTH MAKING.** Every
// Milan-eligible patient also satisfies up-to-seven (a single tumor of 5 cm gives 6; three tumors of 3 cm
// give 6), so up-to-seven can only ever add candidates, never remove them. A test asserts the containment by
// enumeration rather than by assertion.
//
// **UCSF IS DELIBERATELY NOT COMPUTED HERE.** It is the other widely used set of extended criteria, but its
// published renderings diverge on whether the nodule limit is two or three and on whether the size
// thresholds are strict or inclusive. Under the spec-v97 sourcing gate a divergent cell is reported, not
// guessed, so this tool names UCSF as a separate set of criteria and does not evaluate it.
//
// HIGH-STAKES: this reports a criterion, NOT a listing decision. Transplant candidacy also depends on MELD
// allocation and exception points, on response to downstaging or bridging therapy, on organ availability and
// on center policy, none of which this knows. It does not stage HCC, does not read imaging, and does not
// decide between transplantation, resection, ablation and locoregional therapy (spec-v11 section 5.3).
//
// DEFINITION AND THE MICROVASCULAR-INVASION CONDITION RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED
// (spec-v97), from the derivation report and an independent review that states the pre-transplant
// measurement problem explicitly:
//   - Mazzaferro V, Llovet JM, Miceli R, et al. Predicting survival after liver transplantation in patients
//     with hepatocellular carcinoma beyond the Milan criteria: a retrospective, exploratory analysis.
//     Lancet Oncol. 2009;10(1):35-43.

export const UP_TO_SEVEN_LIMIT = 7;
export const MILAN_SINGLE_MAX_CM = 5;
export const MILAN_MULTI_MAX_CM = 3;
export const MILAN_MAX_NODULES = 3;
export const FIVE_YEAR_SURVIVAL_WITHIN = 71.2;

export const MVI_NOTE = 'The published criterion applies "in the absence of microvascular invasion", and MICROVASCULAR INVASION CANNOT BE ASSESSED BEFORE TRANSPLANT: imaging shows only gross vascular invasion, and biopsy cannot exclude it because of sampling bias. The published survival describes patients who turned out on the explant not to have had it. Used prospectively, the criterion rests on a condition nobody can verify when the decision is made.';
export const SUM_NOTE = 'The seven is a sum of two different kinds of thing - the largest tumor’s size in centimeters plus the NUMBER of tumors - so it is an exchange rate between size and number rather than a limit on either. One 6 cm tumor and four 3 cm tumors sit at the same boundary.';
export const LARGEST_ONLY_NOTE = 'Only the largest tumor’s size enters the sum; every other tumor contributes 1 by being counted, however large it is. Three tumors of 4.9, 4.8 and 4.7 cm and three tumors of 4.9, 0.5 and 0.5 cm score identically. Total tumor burden is not what this measures.';
export const UCSF_NOTE = 'The UCSF criteria are the other widely used extended set and are NOT computed here: published renderings diverge on whether the nodule limit is two or three and on whether the size thresholds are strict or inclusive, and a divergent cell is reported rather than guessed.';

const NOTE = `The up-to-seven (Metroticket) criteria for liver transplantation in hepatocellular carcinoma (Mazzaferro and colleagues 2009): a patient is within the criteria when the size of the largest tumor in centimeters PLUS the number of tumors is ${UP_TO_SEVEN_LIMIT} or less, in the absence of microvascular invasion, with reported 5-year survival of ${FIVE_YEAR_SURVIVAL_WITHIN} percent. The criterion is conditional on something that cannot be measured when the decision is made: microvascular invasion cannot be assessed before transplant, since imaging shows only gross vascular invasion and biopsy cannot exclude microvascular invasion because of sampling bias, so the published survival describes patients who turned out on the explant not to have had it. This tool asks only what is knowable before transplant, gross vascular invasion and extrahepatic spread, and states the gap. The seven is a sum of two different kinds of thing, centimeters plus a count, so it is an exchange rate between size and number rather than a limit on either, and one 6 cm tumor and four 3 cm tumors sit at the same boundary. Only the largest tumor’s size enters the sum; every other tumor contributes 1 by being counted however large it is, so total tumor burden is not what this measures. Milan is fully contained within up-to-seven, so up-to-seven can only add candidates, never remove them. The UCSF criteria are the other widely used extended set and are deliberately not computed here, because their published renderings diverge on the nodule limit and the operators. This reports a criterion, not a listing decision: candidacy also depends on MELD allocation and exception points, on response to downstaging or bridging therapy, on organ availability and on center policy. It does not stage HCC, does not read imaging, and does not decide between transplantation, resection, ablation and locoregional therapy.`;

function readNum(v, name, { integer = false } = {}) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${name} must be a number greater than 0.`);
  if (integer && !Number.isInteger(n)) throw new Error(`${name} must be a whole number.`);
  return n;
}
function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// Milan, as already carried by `milan-criteria` (lib/hepgi-v93.js), recomputed here only so the containment
// can be shown against the same inputs.
export function milanStatus(tumorCount, largestCm) {
  if (tumorCount === 1) return largestCm <= MILAN_SINGLE_MAX_CM;
  return tumorCount <= MILAN_MAX_NODULES && largestCm <= MILAN_MULTI_MAX_CM;
}

// input: tumorCount, largestTumorCm, grossVascularInvasion, extrahepaticSpread.
export function upToSeven(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let count, largest, gvi, extra;
  try {
    count = readNum(o.tumorCount, 'Number of tumors', { integer: true });
    largest = readNum(o.largestTumorCm, 'Largest tumor diameter', {});
    gvi = readBool(o.grossVascularInvasion, 'Gross vascular invasion');
    extra = readBool(o.extrahepaticSpread, 'Extrahepatic spread');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (count === null || largest === null || gvi === null || extra === null) {
    return { valid: false, message: 'Enter the number of tumors, the diameter of the largest, and whether there is gross vascular invasion or extrahepatic spread. Only the LARGEST tumor’s size is used; the others count as 1 each.' };
  }

  const sum = Number((largest + count).toFixed(2));
  const sumWithin = sum <= UP_TO_SEVEN_LIMIT;
  const disqualified = gvi || extra;
  const within = sumWithin && !disqualified;
  const milan = milanStatus(count, largest) && !disqualified;

  const parts = [];
  parts.push(`Largest tumor ${largest} cm plus ${count} tumor${count === 1 ? '' : 's'} = ${sum}. That is ${sumWithin ? `within the limit of ${UP_TO_SEVEN_LIMIT}` : `beyond the limit of ${UP_TO_SEVEN_LIMIT}`}.`);
  if (disqualified) {
    parts.push(`${gvi ? 'Gross vascular invasion' : ''}${gvi && extra ? ' and extrahepatic spread are' : (gvi ? ' is' : 'Extrahepatic spread is')} present, which places the patient outside these criteria regardless of the sum.`);
  }
  parts.push(within
    ? `Within up-to-seven; the derivation reported ${FIVE_YEAR_SURVIVAL_WITHIN} percent 5-year survival for this group.`
    : 'Beyond up-to-seven.');
  parts.push(milan
    ? 'Also within the Milan criteria. Milan is fully contained within up-to-seven, so up-to-seven can only add candidates, never remove them.'
    : `Outside the Milan criteria${within ? ' but within up-to-seven, which is exactly the group these extended criteria were built to describe' : ''}. Milan is fully contained within up-to-seven, so up-to-seven can only add candidates, never remove them.`);
  parts.push(MVI_NOTE);
  parts.push(SUM_NOTE);
  parts.push(LARGEST_ONLY_NOTE);
  parts.push(UCSF_NOTE);
  parts.push('This reports a criterion, not a listing decision: MELD allocation and exception points, downstaging or bridging response, organ availability and center policy all apply and none is known here.');

  return {
    valid: true,
    sum,
    limit: UP_TO_SEVEN_LIMIT,
    sumWithinLimit: sumWithin,
    withinUpToSeven: within,
    withinMilan: milan,
    disqualifiedByInvasionOrSpread: disqualified,
    fiveYearSurvivalPercent: within ? FIVE_YEAR_SURVIVAL_WITHIN : null,
    band: within ? 'Within up-to-seven' : 'Beyond up-to-seven',
    bandLabel: `Sum ${sum} — ${within ? 'within' : 'beyond'} up-to-seven`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
