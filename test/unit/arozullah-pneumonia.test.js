// spec-v97 2.3: Arozullah Postoperative Pneumonia Risk Index (Ann Intern Med
// 2001). Weighted total -> risk class 1-5 with the cited pneumonia probability.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arozullahPneumonia } from '../../lib/periop-v97.js';

const base = { surgery: 'other', age: 'under-50', functional: 'independent', bun: '8-21' };

test('class edge 15/16 (class 1 -> class 2)', () => {
  // upper-abdominal (10) + 50-59 (4) -> 14 = class 1.
  const c1 = arozullahPneumonia({ ...base, surgery: 'upper-abdominal', age: '50-59' });
  assert.equal(c1.total, 14);
  assert.equal(c1.riskClass, 1);
  assert.equal(c1.probability, '0.2%');
  // add COPD (5) -> 19 = class 2.
  const c2 = arozullahPneumonia({ ...base, surgery: 'upper-abdominal', age: '50-59', copd: true });
  assert.equal(c2.total, 19);
  assert.equal(c2.riskClass, 2);
  assert.equal(c2.probability, '1.2%');
});

test('class edge into class 3 with cited probability', () => {
  // thoracic (14) + 60-69 (9) + COPD (5) = 28 -> class 3, 4.0%.
  const r = arozullahPneumonia({ ...base, surgery: 'thoracic', age: '60-69', copd: true });
  assert.equal(r.total, 28);
  assert.equal(r.riskClass, 3);
  assert.equal(r.probability, '4.0%');
});

test('BUN is U-shaped: low and high BUN both add points', () => {
  const low = arozullahPneumonia({ ...base, bun: 'under-8' });
  const normal = arozullahPneumonia({ ...base, bun: '8-21' });
  const high = arozullahPneumonia({ ...base, bun: 'over-30' });
  assert.equal(low.total, 4);
  assert.equal(normal.total, 0);
  assert.equal(high.total, 3);
});

test('a required item left unselected withholds the class', () => {
  const r = arozullahPneumonia({ surgery: 'thoracic', age: '60-69' });
  assert.equal(r.valid, false);
  assert.ok(!/NaN/.test(r.band));
});
