// spec-v1691 (closes spec-v1658 tool 1): the classic Westgard multirule, two control levels, across runs.
//
// SOURCES, AND WHY TWO. The rules originate in Westgard JO, Barry PL, Hunt MR, Groth T, "A multi-rule
// Shewhart chart for quality control in clinical chemistry", Clin Chem 1981;27:493-501. That paper is
// behind the publisher (Oxford returned HTTP 403 on November 7, 2026, as it did on October 19, 2026).
// The rule statements encoded here were read on November 7, 2026 at westgard.com/mltirule.htm,
// "Westgard Rules and Multirules", which is the first author stating his own rules. Both are cited, as
// the owner's November 2026 rule for originals and verified reprints requires.
//
// The proposal's design already scoped it this way: the classic set is taken "as the author's page
// describes for two levels", and only the three-level alternatives (2of3_2s, 3_1s, 6_x, 9_x) wait on
// the paper. Those are NOT evaluated here, for that reason.
//
// THE RULES, in the author's words:
//   1_3s  "A run is rejected when a single control measurement exceeds the mean plus 3s or the mean
//          minus 3s control limit."
//   1_2s  "In the original Westgard multirule QC procedure, this rule is used as a warning rule to
//          trigger careful inspection of the control data by the following rejection rules."
//   2_2s  "reject when 2 consecutive control measurements exceed the same mean plus 2s or the same
//          mean minus 2s control limit."
//   R_4s  "reject when 1 control measurement in a group exceeds the mean plus 2s and another exceeds
//          the mean minus 2s. Please note: this rule should only be interpreted within-run, not
//          between-run."
//   4_1s  "reject when 4 consecutive control measurements exceed the same mean plus 1s or the same
//          mean minus 1s control limit."
//   10_x  "reject when 10 consecutive control measurements fall on one side of the mean."
//
// FOUR THINGS THAT ARE EASY TO GET WRONG, and which this encodes explicitly:
//
// 1. 1_2s IS A WARNING, NOT A REJECTION. The author is blunt about the cost of treating it as one:
//    with a 2s limit "when N=2, it is expected than 9% of good runs will be falsely rejected; with
//    N=3, it is even higher, about 14%; with N=4, it's almost 18%". So a single point past 2s never
//    rejects here; it reports a warning and names which rejection rules to inspect by.
//
// 2. "THE SAME" SIDE IS LOAD-BEARING in 2_2s and 4_1s. Two points straddling the mean do not violate
//    2_2s, and four alternating points do not violate 4_1s. Getting this wrong turns ordinary scatter
//    into a rejected run.
//
// 3. R_4s IS WITHIN-RUN ONLY, in the author's own note. It is evaluated on the current run's two
//    levels and never across runs.
//
// 4. 4_1s AND 10_x CROSS RUNS AND MATERIALS. "Often the 4 1s and 10 x must be used across runs in
//    order to get the number of control measurements needed to apply the rules ... thus the rule may
//    also be applied across materials." A consecutive series therefore has to be ordered, and the
//    order changes the answer, so the order used is stated on every result: oldest run first, and
//    within a run level 1 then level 2.
//
// THE CLASSIC TRIGGER, reported rather than silently chosen. In the manual procedure the 1_2s warning
// is what sends you to the other rules, and the author says of 4_1s and 10_x that "In order for this
// to be violated, you must first see a 1:2s violation". A computer application does not work that
// way: "Computer applications don't need to use the 1 2s warning rule." Both readings are reported --
// every rule that fired, and whether the 1_2s warning the classic procedure gates on was present --
// so neither is hidden behind the other.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const WARNING_LIMIT = 2;

export const RULES = [
  { key: '1_3s', label: '1-3s', text: 'One control measurement past 3s' },
  { key: '2_2s', label: '2-2s', text: 'Two consecutive measurements past the same 2s limit' },
  { key: 'R_4s', label: 'R-4s', text: 'One measurement past +2s and another past -2s, within the run' },
  { key: '4_1s', label: '4-1s', text: 'Four consecutive measurements past the same 1s limit' },
  { key: '10_x', label: '10-x', text: 'Ten consecutive measurements on one side of the mean' },
];

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const round2 = (n) => Math.round(n * 100) / 100;

// "1.02\n0.98" -> [1.02, 0.98]; oldest run first. Blank lines are skipped, not read as zeros.
export function parseSeries(text, label) {
  const out = [];
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    if (!/^-?\d*\.?\d+$/.test(line)) return { error: `${label}, line ${i + 1}: enter one control result per line.` };
    out.push(Number(line));
  }
  return { values: out };
}

export function westgardMultirule(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  // Bounds are explicit: `inputFault`'s `null` low bound means "must be above
  // zero", and a control mean may legitimately be zero or negative (a base
  // excess, a delta). Using null there refused valid input and, worse, caught a
  // zero SD with a range message before the SD check below could explain it.
  const LIM = 1e9;
  const f = inputFault([
    ['the level 1 mean', o.mean1, -LIM, LIM, ''],
    ['the level 1 SD', o.sd1, 0, LIM, ''],
    ['the level 2 mean', o.mean2, -LIM, LIM, ''],
    ['the level 2 SD', o.sd2, 0, LIM, ''],
    ["this run's level 1 result", o.current1, -LIM, LIM, ''],
    ["this run's level 2 result", o.current2, -LIM, LIM, ''],
  ]);
  if (f) return { valid: false, message: f };

  const mean1 = Number(o.mean1);
  const mean2 = Number(o.mean2);
  const sd1 = Number(o.sd1);
  const sd2 = Number(o.sd2);
  if (sd1 <= 0 || sd2 <= 0) {
    return { valid: false, message: 'Each level needs an SD above zero: every rule here is a distance from the mean in SDs, so there is nothing to measure against a zero SD.' };
  }

  const p1 = parseSeries(o.previous1, 'Level 1 previous runs');
  if (p1.error) return { valid: false, message: p1.error };
  const p2 = parseSeries(o.previous2, 'Level 2 previous runs');
  if (p2.error) return { valid: false, message: p2.error };
  if (p1.values.length !== p2.values.length) {
    return {
      valid: false,
      message: `The two levels have different numbers of previous runs (${p1.values.length} and ${p2.values.length}). `
        + 'A run contributes one measurement per level, and the consecutive series is built run by run, so pair them up '
        + 'or leave both blank.',
    };
  }
  if (p1.values.length > 10) {
    return { valid: false, message: 'Enter at most ten previous runs per level; the longest rule here looks back ten measurements.' };
  }

  const z = (x, mean, sd) => (x - mean) / sd;

  // The consecutive series, in the stated order: oldest run first, level 1 then level 2 within a run.
  const series = [];
  for (let i = 0; i < p1.values.length; i += 1) {
    series.push({ run: i + 1, level: 1, value: p1.values[i], z: z(p1.values[i], mean1, sd1), current: false });
    series.push({ run: i + 1, level: 2, value: p2.values[i], z: z(p2.values[i], mean2, sd2), current: false });
  }
  const cur1 = { run: p1.values.length + 1, level: 1, value: Number(o.current1), z: z(Number(o.current1), mean1, sd1), current: true };
  const cur2 = { run: p1.values.length + 1, level: 2, value: Number(o.current2), z: z(Number(o.current2), mean2, sd2), current: true };
  series.push(cur1, cur2);

  const fired = [];
  const add = (key, why) => { if (!fired.some((r) => r.key === key)) fired.push({ key, label: RULES.find((r) => r.key === key).label, why }); };

  // 1_3s: this run only. A past run that broke 3s rejected that run, not this one.
  for (const m of [cur1, cur2]) {
    if (Math.abs(m.z) > 3) add('1_3s', `Level ${m.level} is ${round2(m.z)} SD from its mean, past 3s.`);
  }

  // 2_2s: two CONSECUTIVE measurements past the SAME 2s limit. With two levels that
  // is two distinct pairs, and a single flat interleaved series only sees one of
  // them: the same level in two consecutive runs is not adjacent once the other
  // level sits between them. Both axes are evaluated, which is how the rule is
  // applied for N=2 -- within the run across materials, and across runs within a
  // material.
  const pairs = [
    [cur1, cur2, 'within this run'],
    ...(p1.values.length
      ? [
        [series[series.length - 4], cur1, 'across runs on level 1'],
        [series[series.length - 3], cur2, 'across runs on level 2'],
      ]
      : []),
  ];
  for (const [a, b] of pairs) {
    if (a.z > 2 && b.z > 2) add('2_2s', `${describe(a)} and ${describe(b)} are both past +2s.`);
    if (a.z < -2 && b.z < -2) add('2_2s', `${describe(a)} and ${describe(b)} are both past -2s.`);
  }

  // R_4s: within THIS run only, as the author's note requires.
  if ((cur1.z > 2 && cur2.z < -2) || (cur2.z > 2 && cur1.z < -2)) {
    add('R_4s', `This run's levels are on opposite sides past 2s: level 1 ${round2(cur1.z)} SD and level 2 ${round2(cur2.z)} SD.`);
  }

  // 4_1s and 10_x: consecutive runs of the series, which may cross runs and materials.
  const tail = (n) => series.slice(-n);
  if (series.length >= 4) {
    const last4 = tail(4);
    if (last4.every((m) => m.z > 1)) add('4_1s', 'The last four measurements are all past +1s.');
    if (last4.every((m) => m.z < -1)) add('4_1s', 'The last four measurements are all past -1s.');
  }
  if (series.length >= 10) {
    const last10 = tail(10);
    if (last10.every((m) => m.z > 0)) add('10_x', 'The last ten measurements are all above their means.');
    if (last10.every((m) => m.z < 0)) add('10_x', 'The last ten measurements are all below their means.');
  }

  // 1_2s: the warning, never a rejection.
  const warned = [cur1, cur2].filter((m) => Math.abs(m.z) > WARNING_LIMIT);

  const rejected = fired.length > 0;
  const notes = [];
  notes.push(`Level 1 ${round2(cur1.z)} SD from its mean; level 2 ${round2(cur2.z)} SD.`);
  for (const r of fired) notes.push(`${r.label}: ${r.why}`);

  if (warned.length) {
    notes.push(`1-2s warning: level${warned.length > 1 ? 's' : ''} ${warned.map((m) => m.level).join(' and ')} past 2s. `
      + 'In the classic manual procedure this is the warning that sends you to inspect the other rules, not a rejection on its own: '
      + 'at a 2s limit about 9% of good runs are falsely rejected with two controls, and about 18% with four.');
  } else if (rejected) {
    notes.push('No 1-2s warning in this run. The classic manual procedure reaches 4-1s and 10-x only after a 1-2s warning, '
      + 'while a computer application applies the rejection rules directly; both readings are in the list above, so a rule that '
      + 'fired without a warning is shown rather than suppressed.');
  }
  if (series.length < 10) {
    notes.push(`The 10-x rule needs ten consecutive measurements and ${series.length} were entered, so it was not evaluated. `
      + 'With two levels a run contributes two, so ten means five runs.');
  }
  if (series.length < 4) {
    notes.push(`The 4-1s rule needs four consecutive measurements and ${series.length} were entered, so it was not evaluated.`);
  }
  notes.push('Consecutive means: oldest run first, and level 1 before level 2 within a run. The 4-1s and 10-x rules cross runs and materials, so a different order can change whether they fire.');
  notes.push('The three-level rules (2of3-2s, 3-1s, 6-x, 9-x) are not evaluated: their definitions are in the 1981 paper, which has not been read.');

  return {
    valid: true,
    rejected,
    rules: fired.map((r) => r.label),
    warning: warned.length > 0,
    z1: round2(cur1.z),
    z2: round2(cur2.z),
    measurements: series.length,
    abnormal: rejected,
    band: rejected
      ? `Run rejected: ${fired.map((r) => r.label).join(', ')}.`
      : (warned.length
        ? 'Run in control by the rejection rules, with a 1-2s warning to inspect.'
        : 'Run in control: no rejection rule fired.'),
    bandLabel: rejected ? `Rejected (${fired.map((r) => r.label).join(', ')})` : (warned.length ? 'In control, 1-2s warning' : 'In control'),
    notes,
    note: 'The classic Westgard multirule for two control levels: 1-3s, 2-2s, R-4s, 4-1s and 10-x as rejection rules, with 1-2s as a warning only. Rule statements read on westgard.com by the first author; they originate in Westgard, Barry, Hunt and Groth, Clin Chem 1981;27:493. A rejected run is a signal to investigate the method, not a patient result.',
  };
}

function describe(m) {
  return m.current ? `this run's level ${m.level}` : `run ${m.run} level ${m.level}`;
}
