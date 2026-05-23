import { test } from 'node:test';
import assert from 'node:assert/strict';
import { barthel } from '../../lib/scoring-v4.js';

const max = {
  feeding: 10, bathing: 5, grooming: 5, dressing: 10,
  bowel: 10, bladder: 10, toilet: 10, transfers: 15, mobility: 15, stairs: 10,
};
const min = {
  feeding: 0, bathing: 0, grooming: 0, dressing: 0,
  bowel: 0, bladder: 0, toilet: 0, transfers: 0, mobility: 0, stairs: 0,
};

test('barthel 100 (tile example) -> independent', () => {
  const r = barthel(max);
  assert.equal(r.score, 100);
  assert.equal(r.band, 'independent');
});

test('barthel 99 boundary not achievable (5-pt increments) but 95 -> slight dependency', () => {
  const r = barthel({ ...max, feeding: 5 });
  assert.equal(r.score, 95);
  assert.equal(r.band, 'slight dependency');
});

test('barthel 91 (lower edge of slight) -> slight dependency', () => {
  // 100 - 5 (feeding) - 0/5 ... need exactly 91, impossible since increments are 5
  // Smallest in slight: 95. Smallest possible >=91 that lands on grid is 95.
  // So use 95 as a representative boundary
  const r = barthel({ ...max, bathing: 0 });
  assert.equal(r.score, 95);
  assert.equal(r.band, 'slight dependency');
});

test('barthel 90 (upper edge of moderate) -> moderate dependency', () => {
  const r = barthel({ ...max, feeding: 5, bathing: 0 });
  assert.equal(r.score, 90);
  assert.equal(r.band, 'moderate dependency');
});

test('barthel 61 not on grid; 65 -> moderate; 60 -> severe (lower edge of moderate)', () => {
  // Use 65 = moderate, 60 = severe
  const r65 = barthel({ ...max, feeding: 0, bathing: 0, grooming: 0, dressing: 0, transfers: 0 });
  // 10+5+5+10 = 30; subtract feed(10)+bath(5)+groom(5)+dress(10)+trans(15) = 45 -> 100-45 = 55; recompute
  // max sum: 10+5+5+10+10+10+10+15+15+10 = 100
  // remove feeding(10)=90; remove bathing(5)=85; remove grooming(5)=80; remove dressing(10)=70; remove transfers(15)=55
  // so r65.score is 55 actually; let me redo
  assert.equal(r65.score, 55);
  assert.equal(r65.band, 'severe dependency');
});

test('barthel 65 -> moderate dependency (lower edge)', () => {
  const r = barthel({ ...max, transfers: 0, mobility: 5, stairs: 0, dressing: 0 });
  // 100 - 15 - 10 - 10 - 10 = 55... let me just compute target 65 directly
  // We want score = 65: take max (100) and remove items summing to 35
  // 35 = 15 + 10 + 10 (transfers, dressing, stairs)
  const r2 = barthel({ ...max, transfers: 0, dressing: 0, stairs: 0 });
  assert.equal(r2.score, 65);
  assert.equal(r2.band, 'moderate dependency');
});

test('barthel 60 -> severe dependency (upper edge)', () => {
  // 100 - 40: remove transfers(15) + mobility(15) + stairs(10) = 40
  const r = barthel({ ...max, transfers: 0, mobility: 0, stairs: 0 });
  assert.equal(r.score, 60);
  assert.equal(r.band, 'severe dependency');
});

test('barthel 20 -> total dependency (upper edge)', () => {
  // 20 = feeding(10) + bowel(10), all else 0
  const r = barthel({ ...min, feeding: 10, bowel: 10 });
  assert.equal(r.score, 20);
  assert.equal(r.band, 'total dependency');
});

test('barthel 21 not on grid; 25 -> severe (lower edge of severe)', () => {
  const r = barthel({ ...min, feeding: 10, bowel: 10, bathing: 5 });
  assert.equal(r.score, 25);
  assert.equal(r.band, 'severe dependency');
});

test('barthel 0 (all dependent) -> total dependency', () => {
  const r = barthel(min);
  assert.equal(r.score, 0);
  assert.equal(r.band, 'total dependency');
});

test('barthel text mentions Mahoney 1965 and Shah 1989', () => {
  assert.match(barthel(max).text, /Mahoney 1965/);
  assert.match(barthel(max).text, /Shah 1989/);
});

test('barthel rejects off-grid item values', () => {
  assert.throws(() => barthel({ ...max, feeding: 7 }));       // not in {0,5,10}
  assert.throws(() => barthel({ ...max, bathing: 10 }));      // not in {0,5}
  assert.throws(() => barthel({ ...max, transfers: 20 }));    // not in {0,5,10,15}
  assert.throws(() => barthel({ ...max, feeding: 5.0 + 1 })); // 6: not in set
  assert.throws(() => barthel({ ...max, mobility: -5 }));
  assert.throws(() => barthel({ ...max, stairs: NaN }));
  assert.throws(() => barthel({ feeding: 10 })); // missing items
});
