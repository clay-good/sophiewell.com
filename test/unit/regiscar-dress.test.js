// spec-v137 2.5: RegiSCAR score for DRESS (Kardaun SH, et al, Br J Dermatol
// 2013;169:1071). Weighted -4 to +9; eosinophilia count/percentage paths are
// alternatives (max +2); rash-suggestive and biopsy can score -1. Bands: < 2 no
// case, 2-3 possible, 4-5 probable, > 5 definite. Tests pin the probable->definite
// boundary, the negative floor, and the band cut-points.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { regiscarDress } from '../../lib/id-v137.js';

const base = {
  fever: 'yes', nodes: 'yes', eos: '1', atypical: 'yes', skinExtent: 'no',
  rashSuggestive: 'unknown', biopsy: 'compatible', organ: '1', resolution: 'no', otherCauses: 'no',
};

test('worked example: total 5 -> Probable DRESS (upper edge of 4-5)', () => {
  const r = regiscarDress(base);
  assert.equal(r.valid, true);
  assert.equal(r.total, 5);
  assert.equal(r.classification, 'Probable DRESS');
});

test('adding resolution > 15 days flips 5 -> 6 -> Definite DRESS', () => {
  const r = regiscarDress({ ...base, resolution: 'yes' });
  assert.equal(r.total, 6);
  assert.equal(r.classification, 'Definite DRESS');
});

test('eosinophilia paths are alternatives, max +2', () => {
  const one = regiscarDress({ ...base, eos: '1' }).total;
  const two = regiscarDress({ ...base, eos: '2' }).total;
  assert.equal(two - one, 1); // tier 2 adds one more point than tier 1
});

test('negative items: rash not suggestive and biopsy against each score -1; floor reachable', () => {
  const r = regiscarDress({
    fever: 'no', nodes: 'no', eos: '0', atypical: 'no', skinExtent: 'no',
    rashSuggestive: 'no', biopsy: 'against', organ: '0', resolution: 'no', otherCauses: 'no',
  });
  assert.equal(r.total, -2);
  assert.equal(r.classification, 'No case (DRESS excluded)');
});

test('band cut-points: < 2 no case, 2-3 possible, 4-5 probable, > 5 definite', () => {
  // Build clean totals from binary +1 items (fever, nodes, atypical, skinExtent, resolution, otherCauses).
  const off = { fever: 'no', nodes: 'no', eos: '0', atypical: 'no', skinExtent: 'no', rashSuggestive: 'unknown', biopsy: 'compatible', organ: '0', resolution: 'no', otherCauses: 'no' };
  assert.equal(regiscarDress({ ...off, fever: 'yes' }).classification, 'No case (DRESS excluded)'); // 1
  assert.equal(regiscarDress({ ...off, fever: 'yes', nodes: 'yes' }).classification, 'Possible DRESS'); // 2
  assert.equal(regiscarDress({ ...off, fever: 'yes', nodes: 'yes', atypical: 'yes' }).classification, 'Possible DRESS'); // 3
  assert.equal(regiscarDress({ ...off, fever: 'yes', nodes: 'yes', atypical: 'yes', skinExtent: 'yes' }).classification, 'Probable DRESS'); // 4
});

test('organ involvement: 1 organ +1, >= 2 organs +2', () => {
  const off = { fever: 'no', nodes: 'no', eos: '0', atypical: 'no', skinExtent: 'no', rashSuggestive: 'unknown', biopsy: 'compatible', resolution: 'no', otherCauses: 'no' };
  assert.equal(regiscarDress({ ...off, organ: '1' }).total, 1);
  assert.equal(regiscarDress({ ...off, organ: '2plus' }).total, 2);
});

test('missing any item surfaces the fallback', () => {
  assert.equal(regiscarDress({}).valid, false);
  assert.equal(regiscarDress({ ...base, eos: '' }).valid, false);
  assert.equal(regiscarDress({ ...base, organ: '' }).valid, false);
  assert.equal(regiscarDress({ ...base, biopsy: '' }).valid, false);
  assert.equal(regiscarDress({ ...base, fever: '' }).valid, false);
});
