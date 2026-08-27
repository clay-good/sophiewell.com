import test from 'node:test';
import assert from 'node:assert/strict';
import { forrestClassification, FORREST_STIGMATA } from '../../lib/forrest-classification-v809.js';

test('forrest: each stigma maps to its published class code', () => {
  const expected = { ia: 'Ia', ib: 'Ib', iia: 'IIa', iib: 'IIb', iic: 'IIc', iii: 'III' };
  for (const key of FORREST_STIGMATA) {
    const r = forrestClassification({ stigma: key });
    assert.equal(r.valid, true);
    assert.equal(r.grade, expected[key]);
    assert.equal(r.code, 'Forrest ' + expected[key]);
  }
});

test('forrest: active bleeding and a visible vessel are the high-risk classes', () => {
  for (const key of ['ia', 'ib', 'iia']) {
    const r = forrestClassification({ stigma: key });
    assert.equal(r.tier, 'high');
    assert.equal(r.abnormal, true);
    assert.equal(r.endoscopicTherapy, 'indicated');
  }
});

test('forrest: a flat spot and a clean base are low risk and get no endoscopic therapy', () => {
  for (const key of ['iic', 'iii']) {
    const r = forrestClassification({ stigma: key });
    assert.equal(r.tier, 'low');
    assert.equal(r.abnormal, false);
    assert.equal(r.endoscopicTherapy, 'not indicated');
  }
});

test('forrest: the adherent clot is reported as equivocal, not forced either way', () => {
  const r = forrestClassification({ stigma: 'iib' });
  assert.equal(r.tier, 'intermediate');
  assert.equal(r.endoscopicTherapy, 'equivocal');
  assert.ok(r.management.includes('conflicting'));
  // It must not be silently lumped in with the classes that do get treated.
  assert.notEqual(r.endoscopicTherapy, 'indicated');
});

test('forrest: the classes are NOT an ordered ladder - IIa outranks Ib on rebleeding', () => {
  // This is the whole reason the tile exists. A reader ranking by roman numeral would put
  // Ib above IIa; the published rates run the other way.
  const ib = forrestClassification({ stigma: 'ib' });
  const iia = forrestClassification({ stigma: 'iia' });
  assert.ok(ib.rebleedRisk.includes('10 to 27'));
  assert.ok(iia.rebleedRisk.includes('43 to 50'));
  assert.ok(iia.detail.includes('backwards'));
});

test('forrest: input is normalized, and anything else is refused rather than guessed', () => {
  assert.equal(forrestClassification({ stigma: 'IIa' }).grade, 'IIa');
  assert.equal(forrestClassification({ stigma: ' II-a ' }).grade, 'IIa');
  assert.equal(forrestClassification({}).valid, false);
  assert.equal(forrestClassification({ stigma: '' }).valid, false);
  assert.equal(forrestClassification({ stigma: 'iv' }).valid, false);
  assert.equal(forrestClassification().valid, false);
});
