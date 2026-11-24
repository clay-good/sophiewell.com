// spec-v1772 (public-health-epidemiology tool 6): the herd immunity threshold from R0, and the coverage a
// vaccine of a given efficacy must reach.
//
// Sources, read November 23, 2026. The spec's gate named Fine 1993 and Fine, Eames and Heymann 2011, both of
// which are still behind their publisher; what is used here instead is the same mathematics stated in two
// independent open sources, which is how this change sourced Levin's formula in spec-v1663:
//
//   Martcheva M. An Introduction to Mathematical Epidemiology. Springer, 2015, chapter 9, "Control
//   Strategies" (doi 10.1007/978-1-4899-7612-3_9, open in PubMed Central as part of the COVID-19 collection):
//     the critical vaccination proportion for a perfect vaccine   p = 1 - 1/R0
//     for an imperfect vaccine of efficacy e                      p(e) = (1/e)(1 - 1/R0)
//     and eradication by vaccination is possible only if          e > 1 - 1/R0
//   Its Table 9.3 ("Diseases and their eradication vaccination levels") prints both columns for eight
//   diseases, and those rows are the tests.
//
//   Randolph HE, Barreiro LB. Herd Immunity: Understanding COVID-19. Immunity. 2020;52(5):737-741
//   (doi 10.1016/j.immuni.2020.04.012, PMC7236739): "the herd immunity threshold is defined by 1 - 1/R0
//   (e.g., if R0 = 4, the corresponding herd immunity threshold is 0.75)", and the standing caution that in
//   real populations "the situation is often much more complex".
//
// The threshold is a proportion of the whole population that must be immune, by any route. The coverage line
// is what a vaccination program must reach, which is higher whenever the vaccine is less than perfect, and
// unreachable when the efficacy itself is at or below the threshold.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// R0 is a count of secondary cases, not a percentage: the largest values reported for any human pathogen
// (measles, pertussis) sit under 20, and the envelope leaves room above them rather than at them.
export const R0_MAX = 50;

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const r1 = (x) => Math.round(x * 10) / 10;
const pct = (x) => `${r1(x).toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;

const CAVEAT = 'The threshold assumes a population that mixes evenly and immunity that protects completely and does not wane. Real populations are clustered by age, place and contact, so a national figure can be reached while a community below it still has outbreaks. It is a target for coverage, not a guarantee.';

export function herdImmunityThreshold(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (blank(o.r0)) return { valid: false, message: 'Enter the basic reproduction number (R0): the average number of further cases one case causes in a population with no immunity.' };
  // The two optional figures are checked only when they were entered, and each is checked whether or not
  // the other was: a blank field must not carry a value past its range check (spec-v1759).
  const f = inputFault([
    ['the basic reproduction number', o.r0, 0, R0_MAX, ''],
    ...(blank(o.efficacy) ? [] : [['the vaccine efficacy', o.efficacy, 0, 100, '%']]),
    ...(blank(o.coverage) ? [] : [['the coverage reached', o.coverage, 0, 100, '%']]),
  ]);
  if (f) return { valid: false, message: f };
  const r0 = Number(String(o.r0).trim());
  if (r0 <= 1) {
    return {
      valid: false,
      message: `At an R0 of ${r1(r0).toLocaleString('en-US')} each case causes one further case or fewer, so the infection does not sustain itself and there is no herd immunity threshold to reach. The formula 1 - 1/R0 is for an R0 above 1.`,
    };
  }
  const threshold = (1 - 1 / r0) * 100;

  const notes = [`1 - 1/R0 = 1 - 1/${r1(r0).toLocaleString('en-US')} = ${pct(threshold)} of the population immune.`];
  const out = { valid: true, r0, thresholdPercent: r1(threshold), abnormal: false };

  let needed = null;
  if (!blank(o.efficacy)) {
    const e = Number(String(o.efficacy).trim());
    if (e <= 0) return { valid: false, message: 'Enter a vaccine efficacy above 0%: a vaccine with no efficacy moves no one into the immune group.' };
    needed = threshold / (e / 100);
    out.efficacyPercent = e;
    out.coverageNeededPercent = r1(needed);
    out.reachable = needed <= 100;
    notes.push(`A vaccine that is ${pct(e)} efficacious must reach (1 - 1/R0) / efficacy = ${pct(threshold)} / ${pct(e)} = ${pct(needed)} of the population.`);
    if (!out.reachable) {
      notes.push(`That is above 100%, so no coverage reaches the threshold with this vaccine: eradication by vaccination needs an efficacy above the threshold itself (${pct(threshold)}).`);
    }
  }

  if (!blank(o.coverage)) {
    const c = Number(String(o.coverage).trim());
    const target = needed === null ? threshold : needed;
    const gap = target - c;
    out.coveragePercent = c;
    out.gapPoints = r1(gap);
    out.reachesTarget = gap <= 0;
    out.abnormal = !out.reachesTarget;
    notes.push(out.reachesTarget
      ? `Coverage of ${pct(c)} is at or above the ${pct(target)} needed, by ${pct(-gap)} of the population.`
      : `Coverage of ${pct(c)} is ${pct(gap)} of the population short of the ${pct(target)} needed.`);
    // spec-v1788: with the efficacy left blank, `target` is the threshold itself, which is the arithmetic
    // for a vaccine that works every time. The field's label says a blank is a perfect vaccine; the READING
    // did not, and this is the comparison a reader acts on. At the worked example it said coverage of 80%
    // clears the 75% needed "by 5% of the population" -- while the same example WITH its 95% efficacy needs
    // 78.9% and clears it by 1.1. The assumption is named here, with what it costs.
    if (needed === null) {
      const atNinety = threshold / 0.9;
      notes.push(`No vaccine efficacy was entered, so this compares coverage with the threshold itself: the`
        + ` arithmetic for a vaccine that protects every single person it reaches. A real vaccine needs more`
        + ` coverage than the threshold -- at 90% efficacy, ${pct(threshold)} / 90% = ${pct(atNinety)}`
        + `${atNinety > 100 ? ', which no coverage reaches' : ''}. Enter the efficacy to compare against that`
        + ` figure instead.`);
    }
  }

  const headline = needed === null
    ? `Herd immunity threshold ${pct(threshold)} of the population immune, at an R0 of ${r1(r0).toLocaleString('en-US')}.`
    : out.reachable
      ? `Herd immunity threshold ${pct(threshold)} immune; a vaccine ${pct(out.efficacyPercent)} efficacious must cover ${pct(needed)}.`
      : `Herd immunity threshold ${pct(threshold)} immune, which a vaccine ${pct(out.efficacyPercent)} efficacious cannot reach at any coverage.`;
  const tail = out.coveragePercent === undefined ? '' : out.reachesTarget ? ' Coverage entered reaches it.' : ' Coverage entered falls short.';

  return {
    ...out,
    band: `${headline}${tail}`,
    bandLabel: needed === null || !out.reachable ? `${pct(threshold)} immune` : `Cover ${pct(needed)}`,
    notes,
    note: CAVEAT,
  };
}
