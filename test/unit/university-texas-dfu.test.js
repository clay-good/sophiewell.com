// spec-v155 2.5: University of Texas diabetic foot ulcer classification
// (Lavery/Armstrong 1996/1998). A two-axis grade × stage grid where every cell
// is defined. Grade (depth) 0-3, stage A clean / B infection / C ischemia /
// D infection + ischemia. Higher grade AND stage -> poorer prognosis.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { universityTexasDfu } from '../../lib/suites-v155.js';

test('tile example: grade 2, stage B -> cell IIB', () => {
  const r = universityTexasDfu({ grade: 2, stage: 'B' });
  assert.equal(r.valid, true);
  assert.equal(r.cell, 'IIB');
  assert.equal(r.grade, 2);
  assert.equal(r.stage, 'B');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /tendon or capsule/);
  assert.match(r.band, /infection/);
});

test('roman-numeral grade mapping (0/I/II/III) and stage letter', () => {
  assert.equal(universityTexasDfu({ grade: 0, stage: 'A' }).cell, '0A');
  assert.equal(universityTexasDfu({ grade: 1, stage: 'A' }).cell, 'IA');
  assert.equal(universityTexasDfu({ grade: 3, stage: 'D' }).cell, 'IIID');
});

test('clean shallow cell is not flagged; ischemia/infection or deep wound flags', () => {
  assert.equal(universityTexasDfu({ grade: 0, stage: 'A' }).abnormal, false);
  assert.equal(universityTexasDfu({ grade: 1, stage: 'A' }).abnormal, false);
  assert.equal(universityTexasDfu({ grade: 1, stage: 'C' }).abnormal, true); // ischemia
  assert.equal(universityTexasDfu({ grade: 2, stage: 'A' }).abnormal, true); // deep wound
  const d = universityTexasDfu({ grade: 3, stage: 'D' });
  assert.equal(d.abnormal, true);
  assert.match(d.detail, /highest amputation risk/);
});

test('every grade × stage cell (16) resolves to one defined value', () => {
  let cells = 0;
  for (let g = 0; g <= 3; g += 1) {
    for (const s of ['A', 'B', 'C', 'D']) {
      const r = universityTexasDfu({ grade: g, stage: s });
      assert.equal(r.valid, true);
      assert.ok(r.cell && !/NaN|undefined/.test(r.band));
      cells += 1;
    }
  }
  assert.equal(cells, 16);
});

test('lowercase stage accepted; missing/invalid axis -> valid:false', () => {
  assert.equal(universityTexasDfu({ grade: 1, stage: 'b' }).cell, 'IB');
  assert.equal(universityTexasDfu({ grade: 4, stage: 'A' }).valid, false);
  assert.equal(universityTexasDfu({ grade: 2 }).valid, false);
  assert.equal(universityTexasDfu({ stage: 'B' }).valid, false);
  assert.equal(universityTexasDfu({ grade: 2, stage: 'E' }).valid, false);
  assert.match(universityTexasDfu({}).message, /grade.*stage|Choose/);
});
