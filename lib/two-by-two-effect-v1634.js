// spec-v1634 tool 19: risk ratio, odds ratio and risk difference with 95% intervals from a 2x2 table.
//
// Sources, re-read October 16, 2026:
//   Deeks JJ, Higgins JPT, on behalf of the Cochrane Statistical Methods Group. Statistical algorithms
//   in Review Manager (May 2022), "Individual study estimates: dichotomous outcomes" (RevMan Knowledge
//   Base, Statistical methods), with a, b, c, d the cells and n1, n2 the group totals:
//     SE ln(OR) = sqrt(1/a + 1/b + 1/c + 1/d)
//     SE ln(RR) = sqrt(1/a + 1/c - 1/n1 - 1/n2)
//     SE RD     = sqrt(a b / n1^3 + c d / n2^3)
//   and "Where zeros cause problems ... 0.5 is added to all cells ... except when a = c = 0 or b = d = 0,
//   when the relative effect measures OR and RR are undefined". The spec asks for a refusal instead, so a
//   zero cell withholds the ratio intervals and the result names the 0.5 convention without applying it.
//   Bland JM, Altman DG. The odds ratio. BMJ 2000;320:1468 (PMC1127651): the interval is the log odds
//   ratio +/- 1.96 SE, antilogged; worked example 141/420 and 928/13 525 gives OR 4.89 (4.00 to 5.99),
//   relative risk 3.91 and difference 0.187. A test reproduces it.
//   Altman DG. Confidence intervals for the number needed to treat. BMJ 1998;317:1309-1312 (PMC1114210):
//   NNT = 1 / risk difference; its interval is the reciprocals of the difference's limits, in reversed
//   order; when that interval includes zero the NNT interval runs through infinity.
// As in or-rr-to-nnt, the tool does not know whether the event is wanted, so it says "one fewer event"
// or "one additional event" in the first group and leaves benefit and harm to the reader.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const Z = 1.96;
const NOTE = 'Group 1 is the treated or exposed group and group 2 the comparison. These are 95% intervals from the normal approximation for one table; they do not adjust for confounding or combine studies.';
const CITE = 'Deeks JJ, Higgins JPT. Statistical algorithms in Review Manager (Cochrane, May 2022); Bland JM, Altman DG. BMJ 2000;320:1468; Altman DG. BMJ 1998;317:1309-1312.';
const two = (x) => x.toFixed(2);
const pts = (x) => (x * 100).toFixed(1);
const whole = (x) => Math.ceil(x - 1e-9).toLocaleString('en-US');

function count(label, raw, lo) {
  const f = inputFault([[label, raw, lo, 10000000, '']]);
  if (f) return { f };
  const n = Number(String(raw).trim());
  if (!Number.isInteger(n)) return { f: `Enter ${label} as a whole number.` };
  return { n };
}

export function twoByTwoEffect(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = [];
  for (const [label, raw, lo] of [['the events in group 1', o.events1, 0], ['the total in group 1', o.total1, null], ['the events in group 2', o.events2, 0], ['the total in group 2', o.total2, null]]) {
    const r = count(label, raw, lo);
    if (r.f) return { valid: false, message: r.f };
    vals.push(r.n);
  }
  const [a, n1, c, n2] = vals;
  if (a > n1) return { valid: false, message: 'The events in group 1 cannot be more than its total.' };
  if (c > n2) return { valid: false, message: 'The events in group 2 cannot be more than its total.' };
  const b = n1 - a; const d = n2 - c;
  const p1 = a / n1; const p2 = c / n2; const rd = p1 - p2;
  const notes = [`Risk in group 1: ${a} of ${n1} (${pts(p1)}%). Risk in group 2: ${c} of ${n2} (${pts(p2)}%).`];
  const out = { valid: true, risk1: p1, risk2: p2, riskDifference: rd };

  // Risk difference and its interval.
  const seRd = Math.sqrt((a * b) / n1 ** 3 + (c * d) / n2 ** 3);
  let rdText = `risk difference ${pts(rd)} percentage points`;
  if (seRd > 0) {
    const lo = rd - Z * seRd; const hi = rd + Z * seRd;
    out.riskDifferenceCi = [lo, hi];
    rdText += ` (95% CI ${pts(lo)} to ${pts(hi)})`;
    if (rd === 0) notes.push('The risks are equal, so the number needed to treat is infinite.');
    else {
      const which = rd < 0 ? 'one fewer event' : 'one additional event';
      out.nnt = 1 / Math.abs(rd);
      let nnt = `Number needed to treat: ${whole(out.nnt)} for ${which} in group 1 (1 ÷ ${Math.abs(rd).toFixed(4)} = ${(out.nnt).toFixed(2)}).`;
      if (lo < 0 && hi > 0) {
        const fewer = whole(1 / -lo); const more = whole(1 / hi);
        nnt += ` Its interval passes through infinity: ${fewer} for one fewer event, through infinity, to ${more} for one additional event, because the risk-difference interval includes zero (Altman 1998).`;
      } else {
        const [x, y] = [1 / Math.abs(hi), 1 / Math.abs(lo)].sort((m, n) => m - n);
        nnt += ` 95% interval: ${x.toFixed(2)} to ${y.toFixed(2)}, the reciprocals of the risk-difference limits in reversed order.`;
      }
      notes.push(nnt);
    }
  } else {
    rdText += ' (no interval: every patient in both groups had the same outcome)';
  }

  // Ratios. A zero cell makes one or both undefined or their standard errors infinite.
  const parts = [];
  if (a === 0 && c === 0) notes.push('Neither group had an event, so the risk ratio and odds ratio are undefined.');
  else if (b === 0 && d === 0) notes.push('Every patient in both groups had the event, so the risk ratio and odds ratio are undefined.');
  else {
    if (a > 0 && c > 0) {
      const rr = p1 / p2; const se = Math.sqrt(1 / a + 1 / c - 1 / n1 - 1 / n2);
      out.riskRatio = rr; out.riskRatioCi = [Math.exp(Math.log(rr) - Z * se), Math.exp(Math.log(rr) + Z * se)];
      parts.push(`risk ratio ${two(rr)} (95% CI ${two(out.riskRatioCi[0])} to ${two(out.riskRatioCi[1])})`);
    }
    if (a > 0 && b > 0 && c > 0 && d > 0) {
      const or = (a * d) / (b * c); const se = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d);
      out.oddsRatio = or; out.oddsRatioCi = [Math.exp(Math.log(or) - Z * se), Math.exp(Math.log(or) + Z * se)];
      parts.push(`odds ratio ${two(or)} (95% CI ${two(out.oddsRatioCi[0])} to ${two(out.oddsRatioCi[1])})`);
      notes.push(`Log odds ratio ${Math.log(or).toFixed(3)} ± 1.96 × ${se.toFixed(3)}, antilogged (Bland and Altman 2000).`);
    }
    if (!(a > 0 && b > 0 && c > 0 && d > 0)) notes.push('A cell is zero, so the ratio that needs it has no interval here. Review Manager adds 0.5 to every cell in that case; that correction is not applied.');
  }
  parts.push(rdText);
  notes.push(CITE);
  const band = `${parts.join('; ')}.`;
  return {
    ...out, flag: 'two-by-two', abnormal: false,
    band: band.charAt(0).toUpperCase() + band.slice(1),
    bandLabel: out.riskRatio !== undefined ? `RR ${two(out.riskRatio)}` : `Difference ${pts(rd)} points`,
    notes, note: NOTE,
  };
}
