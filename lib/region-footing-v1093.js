// spec-v1093: one sentence for "this total was scored from part of the body".
//
// Written once and shared, because this repo has paid three times for the same
// rule living in two places (see docs/spec-v1042.md): numeric-fact extraction,
// the sweeps' asking vocabulary, and `optNum` across 64 view modules. None of
// those drifts ever broke a build -- they just quietly stopped agreeing.
//
// The instruments this serves all share one shape. A body is divided into
// regions, each region contributes a non-negative term, and the total is their
// sum. So a region nobody examined contributes exactly what a region examined
// and found clear contributes: nothing. The arithmetic is right and the reading
// is not, because a partial examination can only UNDER-state severity, and
// under-stating is the reassuring direction -- the one where a threshold is not
// crossed and a therapy is not discussed.
//
// The fix is a footing, not a refusal (docs/spec-v1091.md). Scoring some regions
// and leaving others is a real way to use these instruments; what the reader is
// owed is the count and the direction of the error.
//
// Wording is deliberate: it carries "Scored from", "of N regions" and "not
// entered", so it lands inside the DISCLOSING vocabulary in
// test/lib/asking-language.js without that shared list having to grow a phrase
// for each new tile.

// A field counts as entered when it holds a real number. Blank, null, undefined
// and unparseable all mean "nobody wrote anything here", which is the state
// every one of these instruments silently reads as zero.
export function fieldEntered(v) {
  if (v === null || v === undefined || v === '') return false;
  if (typeof v === 'string' && v.trim() === '') return false;
  return Number.isFinite(Number(v));
}

export function anyEntered(o, keys) {
  return keys.some((k) => fieldEntered(o[k]));
}

// `missingLabels` names the parts nobody filled in. The options carry the nouns,
// because these instruments do not all divide a body: mSWAT counts lesion
// categories and SCORAD's subjective half counts symptoms the patient reports.
//
//   unit      plural noun for what is counted        ("regions")
//   singular  explicit, because stripping a trailing "s" turns "lesion
//             categories" into "lesion categorie", and a footing that exists to
//             be read carefully cannot be the thing with a typo in it
//   zeroReads how the zero state reads in that instrument's own terms
export function regionFooting(scored, total, missingLabels, opts = {}) {
  // Deliberately NOT guarded on `scored` being 0. An earlier draft returned null
  // when nothing at all had been entered, on the assumption that some other gate
  // covers the empty form -- which is the same deference to an unchecked gate
  // that produced the wrong judgments in docs/spec-v1088.md. Nothing entered is
  // the worst version of this defect, not the exempt one.
  if (scored >= total || !missingLabels.length) return null;
  const unit = opts.unit || 'regions';
  const singular = opts.singular || unit.replace(/s$/, '');
  const zeroReads = opts.zeroReads || 'exactly as a clear one does';
  const names = missingLabels.length > 1
    ? `${missingLabels.slice(0, -1).join(', ')} and ${missingLabels[missingLabels.length - 1]}`
    : missingLabels[0];
  const verb = missingLabels.length === 1 ? 'was' : 'were';
  return `Scored from ${scored} of ${total} ${unit}; ${names} ${verb} not entered. `
    + `An unscored ${singular} contributes 0, ${zeroReads}, `
    + 'so this total is a floor and can only rise.';
}
