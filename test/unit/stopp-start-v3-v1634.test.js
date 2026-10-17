// spec-v1634 tool 12: STOPP/START version 3 (O'Mahony 2023, Appendix 1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stoppStartV3 as f, CRITERIA, DRUGS, CONDITIONS } from '../../lib/stopp-start-v3-v1634.js';

test('the appendix as published: 133 STOPP and 57 START, numbered without gaps', () => {
  const by = (p) => CRITERIA.filter((c) => c.part === p);
  assert.equal(by('STOPP').length, 133);
  assert.equal(by('START').length, 57);
  for (const p of ['STOPP', 'START']) {
    const secs = new Map();
    for (const c of by(p)) secs.set(c.section, [...(secs.get(c.section) || []), Number(c.id.slice(p.length + 2))]);
    for (const [s, ns] of secs) assert.deepEqual(ns, ns.map((_, i) => i + 1), `${p} ${s}`);
  }
  assert.deepEqual(CRITERIA.filter((c) => c.general).map((c) => c.id), ['STOPP A1', 'STOPP A2', 'STOPP A3', 'START A1']);
});

test('the extraction defects that were checked: line-end hyphens and the D21 reading order', () => {
  const t = (id) => CRITERIA.find((c) => c.id === id).text;
  assert.match(t('STOPP B13'), /potassium-conserving drugs/);
  assert.match(t('STOPP B15'), /life-threatening ventricular/);
  assert.match(t('STOPP D21'), /chlorpromazine for relief of persistent hiccoughs and levomepromazine as an anti-emetic in palliative care\)\.$/);
  for (const c of CRITERIA) assert.doesNotMatch(c.text, /\w- \w|\s{2}/, c.id);
  assert.equal(new Set([...DRUGS, ...CONDITIONS].map((x) => x.value)).size, DRUGS.length + CONDITIONS.length);
});

test('the page example: drug-only, drug-and-condition, kidney and omission matches', () => {
  const r = f({ ageYears: '80', egfr: '40', drugs: ['benzodiazepine', 'nsaid'], conditions: ['falls', 'hypertension'] });
  assert.equal(r.band, '3 STOPP criteria and 6 START criteria to review.');
  assert.deepEqual(r.stopp.map((x) => x.id), ['STOPP D8', 'STOPP E4', 'STOPP K1']);
  assert.deepEqual(r.start.map((x) => x.id), ['START B1', 'START F3', 'START L1', 'START L2', 'START L3', 'START L4']);
  assert.equal(r.stopp[1].sectionTitle, 'Renal System');
});

test('eGFR: below the threshold matches, at it does not, and blank names what was not checked', () => {
  const ids = (egfr) => f({ ageYears: '75', egfr, drugs: ['nsaid', 'ppi', 'flu-vaccine', 'pneumococcal-vaccine', 'zoster-vaccine', 'covid-vaccine'] });
  assert.ok(ids('49.9').stopp.some((x) => x.id === 'STOPP E4'));
  assert.ok(!ids('50').stopp.some((x) => x.id === 'STOPP E4'));
  const blank = ids('');
  assert.equal(blank.egfrChecked, false);
  assert.match(blank.notes.join(' '), /No eGFR was entered, so these kidney criteria were not checked: STOPP E4 \(below 50\)/);
  // START B7 (MRA in heart failure) is skipped only when an entered eGFR is 30 or less.
  const b7 = (egfr) => f({ ageYears: '75', egfr, conditions: ['hf-ref'] }).start.some((x) => x.id === 'START B7');
  assert.deepEqual([b7(''), b7('31'), b7('30')], [true, true, false]);
});

test('exceptions a tick can express, and the anticholinergic count', () => {
  const s = (drugs, conditions = []) => f({ ageYears: '70', drugs, conditions }).stopp.map((x) => x.id);
  assert.ok(s(['beta-blocker'], ['hypertension']).includes('STOPP B5'), 'monotherapy');
  assert.ok(!s(['beta-blocker', 'thiazide'], ['hypertension']).includes('STOPP B5'), 'not monotherapy');
  assert.ok(s(['aspirin']).includes('STOPP C16'));
  assert.ok(!s(['aspirin'], ['cad']).includes('STOPP C16'), 'secondary, not primary, prevention');
  assert.ok(s(['opioid']).includes('STOPP L2'));
  assert.ok(!s(['opioid', 'laxative']).includes('STOPP L2'));
  assert.ok(s(['tca', 'bladder-antimuscarinic']).includes('STOPP M1'), 'two anticholinergic classes');
  assert.ok(!s(['tca']).includes('STOPP M1'));
  assert.ok(s(['anticholinergic-2']).includes('STOPP M1'), 'two drugs of one class, ticked as such');
  const st = (drugs, conditions) => f({ ageYears: '70', drugs, conditions }).start.map((x) => x.id);
  assert.ok(st(['corticosteroid', 'bisphosphonate', 'vitamin-d'], []).includes('START H2'), 'calcium still missing');
  assert.ok(!st(['corticosteroid', 'bisphosphonate', 'vitamin-d', 'calcium'], []).includes('START H2'));
});

test('refusals ask for what is missing, in one sentence', () => {
  for (const [r, re] of [
    [f({}), /^Enter the age/],
    [f({ ageYears: '64', drugs: ['nsaid'] }), /65 or older/],
    [f({ ageYears: '70' }), /^Tick the patient's drugs and conditions/],
    [f({ ageYears: '70', drugs: ['not-a-tag'] }), /is not one of this screen's/],
    [f({ ageYears: '70', egfr: '-3', drugs: ['nsaid'] }), /eGFR/],
  ]) {
    assert.equal(r.valid, false);
    assert.match(r.message, re);
    assert.ok(r.message.length < 160, r.message);
  }
  assert.equal(f({ ageYears: '70', drugs: 'nsaid, ppi' }).valid, true, 'a comma list is read');
});
