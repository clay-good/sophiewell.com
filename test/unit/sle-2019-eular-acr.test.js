// spec-v160 2.4: 2019 EULAR/ACR SLE classification (Aringer 2019). ANA entry
// gate; within-domain max-weight rule; classify if entry + total>=10 + >=1 clinical.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sle2019EularAcr } from '../../lib/rheum-v160.js';

test('tile example: entry + joint (6) + anti-dsDNA (6) = 12 classifies', () => {
  const r = sle2019EularAcr({ anaEntry: true, jointInvolvement: true, dsDnaOrSm: true });
  assert.equal(r.valid, true);
  assert.equal(r.total, 12);
  assert.equal(r.classifies, true);
});

test('the ANA entry gate is hard: no ANA -> not classified regardless of total', () => {
  const r = sle2019EularAcr({ anaEntry: false, jointInvolvement: true, dsDnaOrSm: true, lowC3andC4: true });
  assert.equal(r.classifies, false);
  assert.match(r.band, /Entry criterion not met/);
});

test('within-domain maximum-weight rule: two hematologic items count once at the max', () => {
  // leukopenia 3 + thrombocytopenia 4 + hemolysis 4 -> domain max 4, not 11.
  const r = sle2019EularAcr({ anaEntry: true, leukopenia: true, thrombocytopenia: true, hemolysis: true });
  assert.equal(r.total, 4);
  // ...and 4 alone (no clinical >=10) does not classify, and is hematologic (clinical) but < 10.
  assert.equal(r.classifies, false);
});

test('>=1 clinical criterion required even when immunologic points reach 10', () => {
  // anti-dsDNA/Sm (6) + low C3 and C4 (4) = 10, both immunologic -> not classified.
  const r = sle2019EularAcr({ anaEntry: true, dsDnaOrSm: true, lowC3andC4: true });
  assert.equal(r.total, 10);
  assert.equal(r.classifies, false);
  assert.match(r.band, /no clinical criterion/);
});

test('below threshold: entry met but total < 10', () => {
  const r = sle2019EularAcr({ anaEntry: true, fever: true }); // 2
  assert.equal(r.total, 2);
  assert.equal(r.classifies, false);
});
