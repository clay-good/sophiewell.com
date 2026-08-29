import test from 'node:test';
import assert from 'node:assert/strict';
import { whoSevereMalaria as sm, FEATURES } from '../../lib/who-severe-malaria-v867.js';

test('who-severe-malaria: twelve features, and any one of them is enough', () => {
  // Eleven checkbox features plus hyperparasitemia, which is derived from the percentage.
  assert.equal(FEATURES.length, 11);
  for (const f of FEATURES) {
    const r = sm({ [f.key]: true });
    assert.equal(r.count, 1, f.key);
    assert.equal(r.severe, true, f.key);
  }
  const hyper = sm({ parasitemia: 15 });
  assert.equal(hyper.hyperparasitemia, true);
  assert.equal(hyper.severe, true);
});

test('who-severe-malaria: hyperparasitemia is strictly above 10 percent', () => {
  assert.equal(sm({ parasitemia: 10 }).hyperparasitemia, false);
  assert.equal(sm({ parasitemia: 10 }).severe, false);
  assert.equal(sm({ parasitemia: 10.1 }).hyperparasitemia, true);
});

test('who-severe-malaria: the parasite count does not grade severity', () => {
  // The single most common misread, so it prints on every result -- including the one with a
  // low count and nothing else entered.
  for (const input of [{}, { parasitemia: 0.5 }, { parasitemia: 40, shock: true }]) {
    assert.match(sm(input).parasiteCountNote, /does not grade severity/);
    assert.match(sm(input).parasiteCountNote, /does not exclude severe malaria/);
  }
  // A low peripheral count with a clinical feature is still severe.
  const r = sm({ parasitemia: 0.2, impairedConsciousness: true });
  assert.equal(r.severe, true);
  assert.equal(r.hyperparasitemia, false);
});

test('who-severe-malaria: it is a list, not a score', () => {
  for (const input of [{}, { shock: true }, { shock: true, bleeding: true, renal: true }]) {
    assert.match(sm(input).notAScoreNote, /not a score/);
  }
  assert.match(sm({ shock: true }).band, /Any one is enough/);
  assert.equal(sm({ shock: true, bleeding: true }).count, 2);
});

test('who-severe-malaria: nothing ticked is not a clearance', () => {
  const r = sm({});
  assert.equal(r.severe, false);
  assert.equal(r.count, 0);
  assert.match(r.negativeNote, /not the same as uncomplicated malaria/);
  assert.equal(sm({ shock: true }).negativeNote, null);
});

test('who-severe-malaria: anemia and jaundice are conjunctive with a parasite density', () => {
  assert.match(sm({ anemia: true }).conjunctiveNote, /together with a parasite density/);
  assert.match(sm({ jaundice: true }).conjunctiveNote, /together with a parasite density/);
  assert.equal(sm({ shock: true }).conjunctiveNote, null);
});

test('who-severe-malaria: the age-dependent thresholds are named', () => {
  assert.match(sm({ age: 'child' }).ageNote, /Blantyre/);
  assert.match(sm({ age: 'child' }).ageNote, /5 g\/dL/);
  assert.match(sm({ age: 'adult' }).ageNote, /Glasgow/);
  assert.match(sm({ age: 'adult' }).ageNote, /7 g\/dL/);
  // Anything that is not the child option reads as an adult.
  assert.equal(sm({}).age, 'adult');
});

test('who-severe-malaria: confirmation and scope print on every result', () => {
  for (const input of [{}, { shock: true }]) {
    assert.match(sm(input).confirmationNote, /does not rule malaria out/);
    assert.match(sm(input).scopeNote, /does not diagnose malaria/);
  }
});

test('who-severe-malaria: an out-of-range parasitemia is rejected', () => {
  assert.equal(sm({ parasitemia: -1 }).valid, false);
  assert.equal(sm({ parasitemia: 101 }).valid, false);
  assert.equal(sm({ parasitemia: '' }).valid, true);
  assert.equal(sm({ parasitemia: 'abc' }).parasitemia, null);
});

test('who-severe-malaria: the documented example', () => {
  const r = sm({ age: 'adult', parasitemia: '15', impairedConsciousness: true, acidosis: true });
  assert.equal(r.count, 3);
  assert.equal(r.severe, true);
  assert.match(r.band, /^3 features/);
  assert.match(r.metNote, /15% parasitized red cells/);
});
