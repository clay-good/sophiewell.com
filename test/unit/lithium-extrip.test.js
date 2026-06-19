// spec-v110 2.5: Lithium dialysis decision (EXTRIP 2015, Decker). ECTR
// recommended for life-threatening features or impaired renal function with
// level > 4.0; suggested at level > 5.0 / confusion / slow clearance.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lithiumExtrip } from '../../lib/tox-v110.js';

test('band flip: level crosses 4.0 with renal impairment into the recommended limb', () => {
  const below = lithiumExtrip({ level: 3.9, renalImpaired: true });
  assert.equal(below.recommendation, 'not indicated');
  const above = lithiumExtrip({ level: 4.1, renalImpaired: true });
  assert.equal(above.recommendation, 'recommended');
  assert.match(above.band, /RECOMMENDED -- impaired kidney function with a lithium level > 4\.0 mmol\/L/);
});

test('life-threatening features recommend ECTR irrespective of level', () => {
  const r = lithiumExtrip({ level: 1.5, seizures: true });
  assert.equal(r.recommendation, 'recommended');
  assert.match(r.band, /life-threatening features \(seizures\)/);
});

test('level > 5.0 alone is suggested, not recommended', () => {
  const r = lithiumExtrip({ level: 5.5 });
  assert.equal(r.recommendation, 'suggested');
  assert.match(r.band, /lithium level > 5\.0 mmol\/L/);
});

test('renal impairment alone at a low level is not indicated', () => {
  const r = lithiumExtrip({ level: 2.0, renalImpaired: true });
  assert.equal(r.recommendation, 'not indicated');
  assert.equal(r.abnormal, false);
});

test('confusion and slow clearance are suggested limbs', () => {
  assert.equal(lithiumExtrip({ level: 2.0, confusion: true }).recommendation, 'suggested');
  assert.equal(lithiumExtrip({ level: 2.0, slowClearance: true }).recommendation, 'suggested');
});

test('guards blank / negative level', () => {
  assert.equal(lithiumExtrip({}).valid, false);
  assert.equal(lithiumExtrip({ level: -1 }).valid, false);
});
