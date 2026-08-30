// spec-v894: the acute tryptase rise that supports mast cell activation.
//
// Sources:
//   Valent P, Akin C, Arock M, et al. Definitions, criteria and global classification of mast
//   cell disorders. Int Arch Allergy Immunol. 2012;157(3):215-225.
//   Valent P, Akin C, Bonadonna P, et al. Proposed diagnostic algorithm for patients with
//   suspected mast cell activation syndrome. J Allergy Clin Immunol Pract. 2019;7(4):1125-1133.
//
//   The consensus rule: an acute tryptase above (1.2 x baseline) + 2 ng/mL supports mast cell
//   activation. It is a rise from that person's own baseline, not a fixed number.
//
// IT IS A RISE FROM THE PERSON'S OWN BASELINE, NOT A THRESHOLD, AND THAT IS WHY THIS TILE EXISTS.
// An acute tryptase inside the laboratory reference range can still meet the rule, and one above
// the reference range can still fail it. A single acute value alone answers nothing.
//
// THE TIMING IS PART OF THE TEST. The acute sample is drawn within roughly 30 minutes to 4 hours
// of the reaction; the baseline is drawn at least 24 hours after everything has settled. A
// baseline drawn too early is not a baseline.
//
// A NORMAL TRYPTASE DOES NOT EXCLUDE ANAPHYLAXIS. It frequently does not rise in food-triggered
// reactions, and anaphylaxis is a clinical diagnosis that is never withheld pending a level.
//
// A PERSISTENTLY RAISED BASELINE IS A DIFFERENT QUESTION. Above 20 ng/mL it is a minor criterion
// for systemic mastocytosis; hereditary alpha-tryptasemia raises it too, and neither is what this
// rule measures.
//
// Pure: no DOM, no clock, no network.

export const TRYPTASE_NOTE = 'The consensus rule for mast cell activation is that an acute serum tryptase above 1.2 times the person\\u2019s own baseline plus 2 ng/mL supports mast cell activation (Valent and colleagues, 2012 and 2019). Four things about it are worth stating plainly. It is a rise from that person\\u2019s own baseline rather than a threshold, so an acute value inside the laboratory reference range can still meet the rule and one above the reference range can still fail it, and a single acute value on its own answers nothing. The timing is part of the test: the acute sample is drawn roughly thirty minutes to four hours after the reaction and the baseline at least twenty-four hours after everything has settled, so a baseline drawn too early is not a baseline. A normal tryptase does not exclude anaphylaxis, since it frequently fails to rise in food-triggered reactions and anaphylaxis is a clinical diagnosis that is never withheld pending a level. And a persistently raised baseline is a different question altogether: above 20 ng/mL it is a minor criterion for systemic mastocytosis, hereditary alpha-tryptasemia raises it too, and neither is what this rule measures. It computes a published comparison from two levels already drawn. It does not diagnose anaphylaxis, and it does not diagnose a mast cell disorder.';

export const MULTIPLIER = 1.2;
export const ADDEND_NG_ML = 2;
export const MASTOCYTOSIS_BASELINE = 20;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const round2 = (n) => Math.round(n * 100) / 100;

export function tryptase(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const acute = num(o.acuteTryptase);
  const baseline = num(o.baselineTryptase);

  for (const [label, v] of [['acute tryptase', acute], ['baseline tryptase', baseline]]) {
    if (v !== null && (v < 0 || v > 2000)) {
      return { valid: false, message: `Enter the ${label} in ng/mL, between 0 and 2000.` };
    }
  }
  if (acute === null || baseline === null) {
    return { valid: false, message: 'Enter both the acute tryptase and the baseline tryptase, in ng/mL. The rule is a comparison; neither value answers it alone.' };
  }

  const threshold = round2(MULTIPLIER * baseline + ADDEND_NG_ML);
  const meets = acute > threshold;
  const shortBy = meets ? 0 : round2(threshold - acute);

  const action = meets
    ? `An acute tryptase of ${acute} ng/mL is above the ${threshold} ng/mL this baseline of ${baseline} requires, which supports mast cell activation.`
    : `An acute tryptase of ${acute} ng/mL is below the ${threshold} ng/mL this baseline of ${baseline} requires, short by ${shortBy}. The rise does not meet the consensus rule.`;

  // The reason the tile exists, on every result.
  const notAThresholdNote = `This is a rise from this person's own baseline, not a fixed threshold: the bar is 1.2 times the baseline plus 2 ng/mL, so it moves with them. An acute value inside the laboratory reference range can meet it, and one above that range can fail it.`;

  const timingNote = 'The timing is part of the test. The acute sample is drawn roughly thirty minutes to four hours after the reaction, and the baseline at least twenty-four hours after everything has settled. A baseline drawn too early is not a baseline, and it raises the bar this comparison has to clear.';

  const notExcludedNote = !meets
    ? 'A tryptase that does not rise does not exclude anaphylaxis. It frequently fails to rise in food-triggered reactions, and anaphylaxis is a clinical diagnosis that is never withheld pending a level.'
    : null;

  const baselineHighNote = baseline > MASTOCYTOSIS_BASELINE
    ? `A baseline of ${baseline} ng/mL is above ${MASTOCYTOSIS_BASELINE}, which is a minor criterion for systemic mastocytosis and a separate question from this rise. Hereditary alpha-tryptasemia also raises a baseline, and neither is what this rule measures.`
    : null;

  const singleValueNote = 'A single acute value answers nothing on its own. Without a baseline there is no rule to apply, which is why this asks for both.';

  const scopeNote = 'This computes a published comparison from two levels already drawn. It does not diagnose anaphylaxis, and it does not diagnose a mast cell disorder.';

  return {
    valid: true,
    acuteTryptase: acute,
    baselineTryptase: baseline,
    threshold,
    meets,
    shortBy,
    action,
    notAThresholdNote,
    timingNote,
    notExcludedNote,
    baselineHighNote,
    singleValueNote,
    scopeNote,
    abnormal: meets,
    bandLabel: meets ? 'Supports mast cell activation' : 'Does not meet the rule',
    band: action,
    detail: `The consensus rule is an acute tryptase above ${MULTIPLIER} times the baseline plus ${ADDEND_NG_ML} ng/mL. It is a rise from the person's own baseline, not a fixed threshold. A baseline persistently above ${MASTOCYTOSIS_BASELINE} ng/mL is a minor criterion for systemic mastocytosis and a different question.`,
    note: TRYPTASE_NOTE,
  };
}
