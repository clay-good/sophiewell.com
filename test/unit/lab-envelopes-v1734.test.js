// spec-v1734: the sourced ALT/AST/triglyceride envelopes in lib/bounds.js, applied
// to every tool that read one of these labs and answered an impossible value.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { REGISTRY } from '../../mcp/catalog.js';

const run = (id, over) => {
  const e = REGISTRY.get(id);
  try {
    return e.compute(e.toArgs({ ...META[id].example.fields, ...over }));
  } catch (err) {
    return { valid: false, thrown: err };
  }
};
const refused = (r) => r == null || r.valid === false;

// [tool, field, a high but reported value in the field's own unit]
const ROWS = [
  ['bard-score', 'bd-ast', '15000'], ['bard-score', 'bd-alt', '15000'],
  ['fatty-liver-index', 'fl-tg', '20000'],
  ['lok-index', 'lk-ast', '15000'], ['lok-index', 'lk-alt', '15000'],
  ['nafld-fibrosis', 'nf-ast', '15000'], ['nafld-fibrosis', 'nf-alt', '15000'],
  ['hscore-hlh', 'hs-tg', '225'], ['hscore-hlh', 'hs-ast', '15000'],
  ['fullpiers', 'fp-ast', '15000'],
  ['vacs-index', 'vacs-ast', '15000'], ['vacs-index', 'vacs-alt', '15000'],
  ['fib4', 'fib4-ast', '15000'], ['fib4', 'fib4-alt', '15000'],
  ['apri', 'apri-ast', '15000'],
  ['hlh-2004', 'hlh-trig', '20000'],
  ['rucam', 'rucam-alt', '15000'],
  ['kobayashi-kawasaki', 'kob-ast', '15000'],
  ['sano-kawasaki', 'sano-ast', '15000'],
  ['hys-law', 'hl-alt', '15000'],
  ['udca-response', 'ur-ast', '15000'],
];

for (const [id, dom, real] of ROWS) {
  test(`${id} ${dom}: an impossible value is refused, a reported extreme is not`, () => {
    assert.ok(!refused(run(id, {})), 'the worked example answers');
    assert.ok(refused(run(id, { [dom]: '999999' })), '999999 is refused');
    assert.ok(!refused(run(id, { [dom]: real })), `${real} still answers`);
  });
}
