// spec-v1789: a label that says what a blank means, and a reading that must say it too.
//
// [spec-v1788](../../docs/spec-v1788.md) found `herd-immunity-threshold` comparing coverage with the herd
// immunity threshold itself when the vaccine efficacy was left blank -- the arithmetic for a vaccine that
// protects every person it reaches -- and saying nothing about it. Its field label did say
// "optional; blank is a perfect vaccine", and that is exactly the trap: **the label is not the answer.** A
// reader fills a form once and then reads a result; the result is what they act on and what they copy into
// a note. The label is above a box they left empty.
//
// That defect was found by hand, by reading four tiles a prioritiser had flagged. This is the same question
// asked of the whole catalog, and it is cheap because the labels announce themselves: a field whose label
// states a SUBSTITUTION for a blank ("blank is 1", "500 if blank", "the measure's usual one if blank") is a
// field whose reading has to name the substitute when it is used.
//
// "Omit for X" is a different promise and is not covered here: it offers a DIFFERENT ANSWER rather than a
// substituted value -- the anion gap without albumin correction, the oxygenation index without the
// saturation index -- and the answer itself changes to the one named. Those are honest by construction.
//
// Four tools already passed when this was written, which is why the rule is worth having rather than a
// one-off fix: `f100-rutf-amount` says "No sachet energy was entered, so the standard 92 g, 500 kcal sachet
// is used"; `mortality-measures` says "until then the measure's usual one, per 100,000, is used";
// `sample-size-proportion` and its two-group sibling say "Design effect 1: simple random sampling (none
// entered). A cluster or other design needs a larger sample". The sample-size pair shipped in spec-v1769
// and herd-immunity in spec-v1772, three days apart: one batch got it right and the next did not, which is
// the gap a gate closes and a review does not.

import test from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators, REGISTRY } from '../../mcp/catalog.js';
import { META } from '../../lib/meta.js';

// A blank standing in for a VALUE. `omit for`/`omit to` is excluded above.
const SUBSTITUTES = /blank is|if blank|blank = |blank means|blank counts as/i;
const OFFERS_ANOTHER_ANSWER = /omit (for|to)/i;

// Rows read and judged, with the reason the rule cannot be asked of them.
const JUDGED = {
  // The tool returns structured fields and no prose at all: its renderer writes the sentence, so there is no
  // reading here to hold to the promise. The field is also absent from the worked example, so there is
  // nothing to blank.
  'overpayment-60day:ov-inv-end': 'this tool returns no band or notes; the view writes its sentence, and the field is not in the worked example',
};

const textOf = (r) => JSON.stringify(r && r.result !== undefined ? r.result : r);

test('spec-v1789: a label that says what a blank means has a reading that says it too', () => {
  const offenders = [];
  const seen = new Set();
  let checked = 0;
  for (const t of allCalculators()) {
    const example = META[t.id]?.example?.fields;
    if (!example) continue;
    const entry = REGISTRY.get(t.id);
    if (!entry) continue;
    for (const f of t.fields || []) {
      const label = f.label || '';
      if (!SUBSTITUTES.test(label) || OFFERS_ANOTHER_ANSWER.test(label)) continue;
      const key = `${t.id}:${f.dom}`;
      if (JUDGED[key]) { seen.add(key); continue; }
      const inputs = { ...example };
      delete inputs[f.dom];
      let r;
      try { r = entry.compute(entry.toArgs(inputs)); } catch { continue; }
      if (!r || r.valid === false) continue;   // refusing is a fine answer to a blank
      checked += 1;
      // The reading has to carry a sentence about the blank. The words a tool uses are its own, so this
      // looks for the shape rather than a phrase: it must say the value was not given, or name what was
      // used instead.
      // `assessed:` is the ENUMERATING form of the same disclosure, which spec-v1218 already counts as one:
      // `modified-marshall` prints "(assessed: respiratory 3, renal 2)" and the cardiovascular score the
      // reader left blank is not in that list. Naming what was scored names what was not.
      const said = /not entered|none entered|not given|was not given|no .{0,30}(was|were) entered|blank|assumed|default|is used|usual one|until then|simple random|assessed:/i
        .test(textOf(r));
      if (!said) offenders.push(`${key}: label says "${label.slice(0, 70)}" and the reading never mentions it`);
    }
  }
  assert.ok(checked >= 6, `expected the labels to be reached; checked ${checked}`);
  assert.deepEqual(offenders, [], `\n${offenders.join('\n')}`);
  const stale = Object.keys(JUDGED).filter((k) => !seen.has(k));
  assert.deepEqual(stale, [], `judged here, but no longer reached: ${stale.join(', ')}`);
});
