// spec-v1656 tool 3: OSHA lead standard (general industry) blood lead monitoring, medical removal and
// return.
//
// Source: 29 CFR 1910.1025, read on the eCFR (title 29 current to October 16, 2026) on October 19, 2026:
//   (j)(1)(i): medical surveillance for employees exposed at or above the action level for more than
//     30 days per year.
//   (j)(2)(i)(A) blood lead at least every 6 months; (B) at least every two months when the last
//     result was "at or above 40 µg/100 g of whole blood", continuing "until two consecutive blood
//     samples and analyses indicate a blood lead level below 40 µg/100 g"; (C) at least monthly
//     during removal.
//   (j)(2)(ii): a follow-up test within two weeks after the employer receives a result at or above
//     the (k)(1)(i)(A) criterion.
//   (k)(1)(i)(A): removal when "a periodic and a follow-up blood sampling test" are at or above 60.
//   (k)(1)(i)(B): removal when "the average of the last three blood sampling tests ... (or the
//     average of all blood sampling tests conducted over the previous six (6) months, whichever is
//     longer)" is at or above 50, "provided, however, that an employee need not be removed if the
//     last blood sampling test indicates a blood lead level below 40 µg/100 g".
//   (k)(1)(iii)(A)(1): return "when two consecutive blood sampling tests indicate that the
//     employee's blood lead level is below 40 µg/100 g of whole blood".
// Units: the standard writes µg/100 g of whole blood and states no equivalence to µg/dL, so results
// are taken as entered in µg/100 g. "Previous six months" is counted back from the last test's date.
// Removal for a final medical determination ((k)(1)(ii)) and the construction standard (29 CFR
// 1926.62) are out of scope.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, fmtUtc, addMonthsUtc } from './deadline.js';

const round1 = (n) => Math.round(n * 10) / 10;

// "2026-03-02, 62" per line: a test date and the blood lead result in µg/100 g.
export function parseResults(text) {
  const out = [];
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const at = `Line ${i + 1}`;
    const cells = line.split(/[,\t]/).map((c) => c.trim());
    if (cells.length !== 2) return { error: `${at} needs a test date and a result, such as 2026-03-02, 62.` };
    let date;
    try { date = parseIsoStrict(cells[0], `${at}'s date`); } catch (err) { return { error: `${err.message}.` }; }
    if (!/^\d*\.?\d+$/.test(cells[1])) return { error: `${at}: "${cells[1]}" is not a blood lead result.` };
    const value = Number(cells[1]);
    if (value > 300) return { error: `${at}: ${value} µg/100 g is above 300. Check the value entered.` };
    out.push({ date, value, order: i });
  }
  out.sort((a, b) => a.date - b.date || a.order - b.order);
  return { results: out };
}

export function oshaLeadMedicalRemoval(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = parseResults(o.results);
  if (p.error) return { valid: false, message: p.error };
  const rs = p.results;
  if (!rs.length) return { valid: false, message: 'Enter the blood lead results, one per line as a date and a result in µg/100 g, oldest or newest first.' };
  const removed = o.currentlyRemoved === 'yes';
  const last = rs[rs.length - 1];
  const prev = rs.length > 1 ? rs[rs.length - 2] : null;
  const notes = [];

  // (k)(1)(i)(A): a periodic test and its follow-up both at or above 60.
  const ruleA = o.lastIsFollowUp === 'yes' && prev !== null && last.value >= 60 && prev.value >= 60;
  if (o.lastIsFollowUp === 'yes' && prev === null) return { valid: false, message: 'The last result is marked as a follow-up test, so enter the periodic test before it too.' };
  if (last.value >= 60 && o.lastIsFollowUp !== 'yes') {
    notes.push(`The last result is at or above 60 µg/100 g: a follow-up test is due within two weeks after the employer receives it (§1910.1025(j)(2)(ii)), and removal under (k)(1)(i)(A) turns on both.`);
  }

  // (k)(1)(i)(B): the average over the last three tests or the previous six months, whichever is longer.
  let avg = null;
  let basis = null;
  if (rs.length >= 3) {
    const from = addMonthsUtc(last.date, -6);
    const six = rs.filter((r) => r.date >= from);
    const set = six.length >= 3 ? six : rs.slice(-3);
    basis = six.length >= 3 ? `all ${six.length} tests since ${fmtUtc(from)}, the previous six months` : 'the last three tests';
    avg = round1(set.reduce((s, r) => s + r.value, 0) / set.length);
  } else {
    notes.push('The average rule in (k)(1)(i)(B) compares the last three tests with the previous six months, so it is not evaluated on fewer than three results.');
  }
  const ruleB = avg !== null && avg >= 50 && last.value >= 40;

  const lines = [];
  if (ruleA) lines.push('Removal required under (k)(1)(i)(A): a periodic and a follow-up test are both at or above 60 µg/100 g.');
  if (ruleB) lines.push(`Removal required under (k)(1)(i)(B): the average of ${basis} is ${avg} µg/100 g, at or above 50, and the last test is not below 40.`);
  if (!ruleA && !ruleB && avg !== null) {
    lines.push(avg >= 50
      ? `The average of ${basis} is ${avg} µg/100 g, but the last test is below 40, so (k)(1)(i)(B) does not require removal.`
      : `No removal under (k)(1)(i)(B): the average of ${basis} is ${avg} µg/100 g, under 50.`);
  }

  // (k)(1)(iii)(A)(1): return after two consecutive results below 40.
  const twoBelow = prev !== null && last.value < 40 && prev.value < 40;
  let returnLine = null;
  if (removed) {
    returnLine = twoBelow
      ? 'Return criteria met: the last two consecutive tests are below 40 µg/100 g (§1910.1025(k)(1)(iii)(A)(1)).'
      : 'Return criteria not met: return needs two consecutive tests below 40 µg/100 g (§1910.1025(k)(1)(iii)(A)(1)).';
  }

  // (j)(2)(i): monitoring frequency.
  let months;
  let why;
  if (removed && !twoBelow) { months = 1; why = 'at least monthly during removal ((j)(2)(i)(C))'; }
  else if (!removed && (ruleA || ruleB)) { months = 1; why = 'at least monthly once removed ((j)(2)(i)(C))'; }
  else if (last.value >= 40 || (prev !== null && prev.value >= 40)) {
    months = 2;
    why = last.value >= 40
      ? 'at least every two months, because the last result is at or above 40 µg/100 g ((j)(2)(i)(B))'
      : 'at least every two months until two consecutive results are below 40 µg/100 g; only the last one is ((j)(2)(i)(B))';
  } else { months = 6; why = 'at least every 6 months ((j)(2)(i)(A))'; }
  const due = fmtUtc(addMonthsUtc(last.date, months));

  const removal = ruleA || ruleB;
  const head = removed
    ? (returnLine)
    : removal ? lines[0] : 'No removal required by the blood lead rules for the results entered.';
  return {
    valid: true, removal, ruleA, ruleB, average: avg, averageBasis: basis, returnMet: removed ? twoBelow : null,
    nextTestBy: due, monitoringMonths: months, abnormal: removal || (removed && !twoBelow) || last.value >= 40,
    band: `${head} Next blood lead test by ${due}: ${why}.`,
    bandLabel: removed ? (twoBelow ? 'Return criteria met' : 'Stay removed') : removal ? 'Removal required' : 'No removal',
    notes: [...(removed ? lines : lines.slice(removal ? 1 : 0)), ...notes],
    note: 'Under 29 CFR 1910.1025 (general industry), for an employee with exposure at or above the action level. Results are in µg/100 g of whole blood, as the standard writes them. Removal for a medical determination, and the construction standard, are not covered.',
  };
}
