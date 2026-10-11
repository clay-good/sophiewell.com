// spec-v1634 tool 6: disproportionality statistics from a 2x2 table of spontaneous-report counts.
//
// Sources, re-read on October 11, 2026:
//   European Medicines Agency. Screening for adverse reactions in EudraVigilance. EMA/849944/2016
//   (December 19, 2016), section 4.1.3 and the annex on the reporting odds ratio:
//     ROR = (a/b) / (c/d);  s = sqrt(1/a + 1/b + 1/c + 1/d);
//     95% interval = ROR / exp(1.96 s) to ROR x exp(1.96 s).
//     "When c is equals to 0, the ROR cannot be computed"; EudraVigilance then sets it to 99.9.
//     A signal of disproportionate reporting in EudraVigilance: the lower bound of the 95% interval
//     greater than one; at least 5 individual cases, or 3 for substances on the additional
//     monitoring list (unless a post-authorisation safety study is the sole reason for listing);
//     and the event is on the Important Medical Event list.
//   Noren GN, Hopstadius J, Bate A. Shrinkage observed-to-expected ratios for robust and
//   transparent large-scale pattern discovery. Stat Methods Med Res 2013;22(1):57-69 (PMC6331976),
//   equations (12) to (14) with both shrinkage terms at 1/2:
//     IC = log2[(a + 0.5) / (E + 0.5)],  E = (a + b)(a + c) / (a + b + c + d)
//     IC025 = IC - 3.3 (a + 0.5)^(-1/2) - 2 (a + 0.5)^(-3/2)
//     IC975 = IC + 2.4 (a + 0.5)^(-1/2) - 0.5 (a + 0.5)^(-3/2)
//     With an observed count of 0 the exact limits "should be used", so none are given here.
//   The proportional reporting ratio is PRR = [a/(a+b)] / [c/(c+d)]. Its published screen (Evans
//   2001: 3 or more cases, PRR at least 2, chi-squared at least 4) is NOT applied: only the abstract
//   was read, and it does not say whether the chi-squared carries a continuity correction.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const MONITORING = [
  { value: 'standard', text: 'Not on the additional monitoring list (5 cases)' },
  { value: 'additional', text: 'On the additional monitoring list (3 cases)' },
];
export const IME = [
  { value: 'yes', text: 'Yes, the event is on the IME list' },
  { value: 'no', text: 'No' },
];
const NOTE = 'A disproportionate reporting ratio is a screening statistic, not a rate or a risk: spontaneous reports have no denominator of people exposed, and reporting varies with publicity, time on the market and many other things. It says where to look, not what a drug causes.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const r2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
const n0 = (x) => x.toLocaleString('en-US');

export function disproportionality2x2(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cells = [['a', 'the reports with the drug and the event (a)'], ['b', 'the reports with the drug and other events (b)'], ['c', 'the reports with other drugs and the event (c)'], ['d', 'the reports with other drugs and other events (d)']];
  const f = inputFault(cells.map(([k, label]) => [label, o[k], 0, 1e10, '']));
  if (f) return { valid: false, message: f };
  const [a, b, c, d] = cells.map(([k]) => Number(o[k]));
  if (![a, b, c, d].every(Number.isInteger)) return { valid: false, message: 'Enter each of the four counts as a whole number of reports.' };
  if (a + b === 0) return { valid: false, message: 'Enter the reports for the drug: a and b are both 0, so there is nothing to compare.' };
  if (c + d === 0) return { valid: false, message: 'Enter the reports for the other drugs: c and d are both 0, so there is nothing to compare with.' };
  const monitoring = blank(o.monitoring) ? null : String(o.monitoring).trim();
  if (monitoring !== null && monitoring !== 'standard' && monitoring !== 'additional') return { valid: false, message: 'Choose whether the substance is on the additional monitoring list, or leave it blank.' };
  const ime = blank(o.ime) ? null : String(o.ime).trim();
  if (ime !== null && ime !== 'yes' && ime !== 'no') return { valid: false, message: 'Choose whether the event is on the IME list, or leave it blank.' };

  const notes = [];
  const out = { valid: true, flag: 'disproportionality', cases: a };
  // Reporting odds ratio.
  let rorText; let lower = null;
  if (c === 0) {
    rorText = 'ROR not computable (no reports of the event with other drugs)';
    notes.push('Reporting odds ratio: not computable, because c is 0. EudraVigilance sets it to 99.9 by convention in that case, to mark a possible signal; no number is given here.');
  } else if (b === 0 || d === 0) {
    rorText = 'ROR not computable (a zero cell)';
    notes.push(`Reporting odds ratio: not computable, because ${b === 0 ? 'b' : 'd'} is 0.`);
  } else {
    const ror = (a / b) / (c / d);
    out.ror = Number(ror.toPrecision(6));
    if (a === 0) {
      rorText = 'ROR 0';
      notes.push('Reporting odds ratio: 0 (no reports of the event with the drug). No interval: a cell is 0.');
    } else {
      const s = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d);
      lower = ror / Math.exp(1.96 * s); const upper = ror * Math.exp(1.96 * s);
      out.rorLower = Number(lower.toPrecision(6)); out.rorUpper = Number(upper.toPrecision(6));
      rorText = `ROR ${r2(ror)} (95% interval ${r2(lower)} to ${r2(upper)})`;
      notes.push(`Reporting odds ratio: (${n0(a)} ÷ ${n0(b)}) ÷ (${n0(c)} ÷ ${n0(d)}) = ${r2(ror)}; s = ${s.toFixed(4)}; 95% interval ${r2(lower)} to ${r2(upper)}.`);
    }
  }
  // Proportional reporting ratio.
  let prrText;
  if (c === 0) { prrText = 'PRR not computable'; notes.push('Proportional reporting ratio: not computable, because c is 0.'); } else {
    const prr = (a / (a + b)) / (c / (c + d));
    out.prr = Number(prr.toPrecision(6)); prrText = `PRR ${r2(prr)}`;
    notes.push(`Proportional reporting ratio: (${n0(a)} ÷ ${n0(a + b)}) ÷ (${n0(c)} ÷ ${n0(c + d)}) = ${r2(prr)}. The published PRR screen (Evans 2001) is not applied here: the form of its chi-squared was not confirmed from the full paper.`);
  }
  // Information component.
  const E = ((a + b) * (a + c)) / (a + b + c + d);
  const ic = Math.log2((a + 0.5) / (E + 0.5));
  out.ic = Number(ic.toFixed(4)); out.expected = Number(E.toPrecision(6));
  let icText = `IC ${r2(ic)}`;
  if (a === 0) notes.push(`Information component: log2(0.5 ÷ (${r2(E)} + 0.5)) = ${r2(ic)}. No limits: with an observed count of 0 the paper says the exact limits should be used, and they are not computed here.`);
  else {
    const k = a + 0.5;
    const lo = ic - 3.3 * k ** -0.5 - 2 * k ** -1.5; const hi = ic + 2.4 * k ** -0.5 - 0.5 * k ** -1.5;
    out.ic025 = Number(lo.toFixed(4)); out.ic975 = Number(hi.toFixed(4));
    icText = `IC ${r2(ic)} (IC025 ${r2(lo)}, IC975 ${r2(hi)})`;
    notes.push(`Information component: expected count ${r2(E)}; log2((${n0(a)} + 0.5) ÷ (${r2(E)} + 0.5)) = ${r2(ic)}; approximate 95% limits ${r2(lo)} to ${r2(hi)}. The paper read gives no threshold sentence for IC025, so it is reported as a value.`);
  }
  // The EudraVigilance screen: each criterion stated separately.
  const lowerMet = lower !== null && lower > 1;
  const lowerLine = lower === null ? 'the lower bound of the ROR interval cannot be judged (no interval)' : `the lower bound of the ROR interval is ${r2(lower)}, ${lowerMet ? 'above' : 'not above'} 1`;
  const need = monitoring === 'additional' ? 3 : 5;
  const countLine = monitoring === null
    ? `${n0(a)} case${a === 1 ? '' : 's'}: ${a >= 5 ? 'meets' : 'below'} the count of 5${a >= 5 ? '' : `, and ${a >= 3 ? 'meets' : 'below'} the count of 3 that applies to substances on the additional monitoring list`}`
    : `${n0(a)} case${a === 1 ? '' : 's'}: ${a >= need ? 'meets' : 'below'} the count of ${need}`;
  const imeLine = ime === null ? 'whether the event is on the Important Medical Event list is for the reader to check' : `the event is ${ime === 'yes' ? '' : 'not '}on the Important Medical Event list`;
  notes.push(`EudraVigilance criteria (EMA/849944/2016): ${lowerLine}; ${countLine}; ${imeLine}.`);
  const countMet = monitoring === null ? a >= 5 : a >= need;
  out.eudravigilance = { lowerBoundAboveOne: lower === null ? null : lowerMet, caseCountMet: monitoring === null && a >= 3 && a < 5 ? null : countMet, ime: ime === null ? null : ime === 'yes' };
  const all = lowerMet && countMet && ime === 'yes';
  out.abnormal = all;
  notes.push('EMA/849944/2016, section 4.1.3 and annex; Norén GN, et al. Stat Methods Med Res 2013;22:57-69.');
  return {
    ...out,
    band: `${rorText}; ${prrText}; ${icText}.${all ? ' All three EudraVigilance criteria for a signal of disproportionate reporting are met.' : ''}`,
    bandLabel: out.ror !== undefined && a > 0 ? `ROR ${r2(out.ror)}` : `IC ${r2(ic)}`,
    notes, note: NOTE,
  };
}
