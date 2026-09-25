// spec-v1478: an optional select must not be answered as one of its options, when that option
// decides the verdict and nothing says so.
//
// The generalization of optional-sex-not-defaulted (spec-v1403) to every optional select. It is the
// probe behind spec-v1459..v1467 and v1477, which found a blank assay read as the lenient one
// (acromegaly), blank HINTS steps read as benign, a blank Jones risk tier read as the stricter one,
// a blank FeNO age read as adult, a blank RTA potassium read as low, a blank empiric DigiFab setting
// dosed as acute, and blank RIPASA demographics scored at the higher weight across the diagnostic
// cutoff.
//
// For each tool, the worked example and its one-field variations (each other select's values, each
// checkbox flipped, each number x0.5, x1.5, x3) are the contexts. In each, an optional select is
// dropped. If the blank's verdict (bandLabel) equals exactly one option's verdict while the options
// disagree, and the answer neither asks nor discloses (test/lib/asking-language.js), it is a default
// posing as a finding.
//
// Exempt by rule, not by id: a blank that reads as an ABSENCE (none, 0, no, absent, not-done,
// normal, na, intact) is the house convention for an optional criterion, and a unit select is a
// stated default. Three instruments that average over what was answered, and the rows below by id,
// are exempt, each with the reason.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators } from '../../mcp/catalog.js';
import { META } from '../../lib/meta.js';
import { computeCalculator } from '../../mcp/tools.js';
import { ASKING, DISCLOSING, addedText } from '../lib/asking-language.js';

const ABSENCE = /^(none|0|no|absent|not-done|normal|na|intact|unknown|pending|unset|not-assessed|)$/;

// Scored as the mean over the sections answered, the instruments' published rule for a missing
// section, so a blank reads as the mean of the rest: HAQ-DI needs 6 of its 8 categories, the
// Oswestry index states how many of its 10 sections were answered, and COMPERA 2.0 divides by the
// number of variables available.
const MEAN_OF_ANSWERED = new Set(['haq-di', 'oswestry-odi', 'compera-2']);

const ACCEPTED = {
  // GLI-2012's own other/mixed equations are its fallback, and a printed note says so (spec-v1116).
  'predicted-spirometry|ethnicity': 'GLI-2012 fallback, stated in a note',
  // Derived from the UACR when that is entered, so the blank is not a default.
  'ckd-staging|aCategory': 'derived from the entered UACR',
  // The blank's value is named in the answer ("Wilson 95% CI", "RMI 1 = ...", "capped at 125").
  'proportion-ci|level': 'named in the answer',
  'rmi-ovarian|variant': 'named in the answer',
  'calvert-carboplatin|capGfr': 'named in the answer',
  // Monotone items that can only raise an already-positive reading; below the line it discloses.
  'ves-13|age': 'already vulnerable; below the line the tool discloses',
  'niosh-lifting|duration': 'above 1.0 the index is already a floor; within 1.0 it is named (spec-v1465)',
  'niosh-lifting|coupling': 'above 1.0 the index is already a floor; within 1.0 it is named (spec-v1465)',
  // Named in the answer: "every right bundle criterion", "with a 50% cross-tolerance reduction".
  'griffith-vt|pattern': 'named in the answer',
  'opioid-conversion|reduction': 'named in the answer',
  // The field's label says to leave it empty to derive the type from the flap.
  'skin-tear|type': 'derived from the flap when blank, as the label says',
  // AAST grades by the highest criterion available; grade I is the floor, so a blank adds nothing.
  'aast-cholecystitis|imaging': 'highest grade across the criteria given',
  'aast-cholecystitis|clinicalPathologic': 'highest grade across the criteria given',
};

const texts = (v, out = []) => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => texts(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => texts(x, out));
  return out;
};
const run = (id, inputs) => {
  try { const r = computeCalculator({ id, inputs }); return r.valid === false ? null : r.result; } catch { return null; }
};
const verdict = (r) => (r ? String(r.bandLabel ?? r.category ?? r.band ?? '') : null);

function contextsFor(tool, ex) {
  const out = [{ ...ex }];
  // Pairs of checkbox flips reach a criteria set's other combinations: the Jones tier decides the
  // answer only with carditis and monoarthritis but no polyarthritis, two flips from its example.
  const on = (v) => v === true || v === 'true' || v === '1';
  const bools = (tool.fields || []).filter((g) => g.kind === 'bool' || g.kind === 'boolean');
  for (let i = 0; i < bools.length; i += 1) {
    for (let j = i + 1; j < bools.length; j += 1) {
      out.push({ ...ex, [bools[i].dom]: !on(ex[bools[i].dom]), [bools[j].dom]: !on(ex[bools[j].dom]) });
    }
  }
  for (const g of tool.fields || []) {
    if (g.kind === 'enum' && Array.isArray(g.values)) for (const v of g.values) out.push({ ...ex, [g.dom]: v });
    else if (g.kind === 'bool' || g.kind === 'boolean') out.push({ ...ex, [g.dom]: !(ex[g.dom] === true || ex[g.dom] === 'true' || ex[g.dom] === '1') });
    else if (g.kind === 'number' && ex[g.dom] !== undefined && Number.isFinite(Number(ex[g.dom]))) {
      for (const k of [0.5, 1.5, 3]) out.push({ ...ex, [g.dom]: String(Math.round(Number(ex[g.dom]) * k * 100) / 100) });
    }
  }
  return out;
}

function findOffenders() {
  const found = new Map();
  let reach = 0;
  for (const tool of allCalculators()) {
    const ex = META[tool.id]?.example?.fields;
    if (!ex || MEAN_OF_ANSWERED.has(tool.id)) continue;
    const selects = (tool.fields || []).filter((f) => !f.required && f.kind === 'enum' && Array.isArray(f.values) && f.values.length >= 2
      && !/unit/i.test(`${f.dom} ${f.arg} ${f.label || ''}`));
    if (!selects.length) continue;
    const contexts = contextsFor(tool, ex);
    for (const f of selects) {
      reach += 1;
      for (const c of contexts) {
        const blankIn = { ...c };
        delete blankIn[f.dom];
        const b = run(tool.id, blankIn);
        if (!b) continue;
        const per = f.values.map((v) => { const r = run(tool.id, { ...c, [f.dom]: v }); return [v, verdict(r), r]; }).filter(([, s]) => s !== null);
        if (new Set(per.map(([, s]) => s)).size < 2) continue;
        const same = per.filter(([, s]) => s === verdict(b));
        if (same.length !== 1 || ABSENCE.test(String(same[0][0]))) continue;
        // The movement rule (spec-v1196): only what the blank reading ADDED over the option it matches
        // can own up to this blank. A disclosure of some other blank field is in both, so it is not.
        const added = addedText(texts(same[0][2]).join(' '), texts(b).join(' '));
        if (ASKING.test(added) || DISCLOSING.test(added)) continue;
        const key = `${tool.id}|${f.arg}`;
        if (!found.has(key)) found.set(key, `${key}: blank reads as "${same[0][0]}" in ${JSON.stringify(blankIn).slice(0, 120)}`);
      }
    }
  }
  return { found, reach };
}

test('no optional select silently answers as one option that decides the verdict', () => {
  const { found, reach } = findOffenders();
  assert.ok(reach > 400, `the sweep reached only ${reach} optional selects`);
  const offenders = [...found.entries()].filter(([k]) => !(k in ACCEPTED)).map(([, v]) => v);
  assert.deepEqual(offenders, [], `${offenders.length} optional select(s) read a blank as one option.\n`
    + 'Ask when the blank decides the answer, disclose ("No X was entered") when it does not, '
    + 'or add the row to ACCEPTED with the reason (docs/spec-v1478.md).');
  const stale = Object.keys(ACCEPTED).filter((k) => !found.has(k));
  assert.deepEqual(stale, [], 'ACCEPTED rows the sweep no longer finds: remove them');
});
