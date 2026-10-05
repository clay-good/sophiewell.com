// spec-v1551 tool 4: which malaria treatment in pregnancy (WHO 2026). Each branch, the first-trimester
// exclusions, vivax relapse handling, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { malariaPregnancyTreatment as m } from '../../lib/malaria-pregnancy-treatment-v1551.js';

test('uncomplicated falciparum, first trimester: artemether + lumefantrine; no AS+SP or pyronaridine', () => {
  const r = m({ trimester: 'first', severity: 'uncomplicated', species: 'falciparum' });
  assert.equal(r.bandLabel, 'Artemether + lumefantrine');
  const n = r.notes.join(' ');
  assert.match(n, /Not artesunate \+ sulfadoxine-pyrimethamine: antifolates are contraindicated/);
  assert.match(n, /Not artesunate-pyronaridine/);
  assert.match(n, /artesunate \+ amodiaquine, artesunate \+ mefloquine or dihydroartemisinin \+ piperaquine may be considered/);
});

test('uncomplicated falciparum, second and third trimesters: any of the five first-line ACTs', () => {
  for (const t of ['second', 'third']) {
    const r = m({ trimester: t, severity: 'uncomplicated', species: 'falciparum' });
    assert.equal(r.bandLabel, 'Any first-line ACT');
    assert.match(r.band, /artesunate \+ sulfadoxine-pyrimethamine\)/);
    assert.doesNotMatch(r.band, /pyronaridine/);
    assert.match(r.notes.join(' '), /folic acid at 5 mg/);
  }
});

test('severe, any trimester or species: injectable artesunate', () => {
  for (const t of ['first', 'second', 'third']) {
    for (const sp of ['falciparum', 'vivax']) {
      const r = m({ trimester: t, severity: 'severe', species: sp });
      assert.equal(r.bandLabel, 'Injectable artesunate');
      assert.equal(r.abnormal, true);
    }
  }
});

test('vivax or ovale: chloroquine or an ACT; no primaquine or tafenoquine; weekly chloroquine until breastfeeding ends', () => {
  const r = m({ trimester: 'second', severity: 'uncomplicated', species: 'vivax' });
  assert.equal(r.bandLabel, 'Chloroquine or an ACT');
  const n = r.notes.join(' ');
  assert.match(n, /25 mg base\/kg over 3 days: 10 mg\/kg on days 1 and 2, then 5 mg\/kg on day 3/);
  assert.match(n, /Primaquine is contraindicated in pregnancy/);
  assert.match(n, /weekly chloroquine can be given until delivery and breastfeeding are over; then primaquine for 14 days/);
  assert.doesNotMatch(n, /first-trimester ACT rule/);
  assert.match(m({ trimester: 'first', severity: 'uncomplicated', species: 'vivax' }).notes.join(' '), /first-trimester ACT rule/);
});

test('every blank is refused', () => {
  const base = { trimester: 'first', severity: 'uncomplicated', species: 'falciparum' };
  for (const k of Object.keys(base)) assert.equal(m({ ...base, [k]: '' }).valid, false, k);
  assert.equal(m().valid, false);
});
