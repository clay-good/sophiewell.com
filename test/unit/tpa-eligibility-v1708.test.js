// spec-v1708: the IV thrombolysis checklist against the AHA/ASA 2026 guideline (Table 8, sections 4.3 and 4.6, as read
// from the published images on November 7, 2026) and the TNKase and Activase labels. A high-stakes tool: every path is
// pinned, and no output may read as an order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tpaEligibility as tpa, CONDITIONS } from '../../lib/tpa-eligibility-v1708.js';

const base = { timing: 'within-3h', disabling: 'yes', sbp: '160', dbp: '90', glucose: '120' };
const all = (r) => [r.band, ...r.notes, r.note].join(' ');

test('Table 8 has the guideline\'s 10 absolute, 18 relative and 9 favorable rows', () => {
  const n = (t) => CONDITIONS.filter((c) => c.tier === t).length;
  assert.deepEqual([n('absolute'), n('relative'), n('favorable')], [10, 18, 9]);
  assert.equal(new Set(CONDITIONS.map((c) => c.key)).size, CONDITIONS.length);
});

test('nothing ticked within 4.5 hours: no absolute contraindication, never "eligible"', () => {
  for (const timing of ['within-3h', '3-4.5h']) {
    const r = tpa({ ...base, timing });
    assert.equal(r.timingMet, true);
    assert.match(r.band, /^No absolute contraindication was ticked/);
    assert.doesNotMatch(r.band, /\beligible\b/i);
  }
});

test('every absolute row stops the checklist and names itself', () => {
  for (const c of CONDITIONS.filter((x) => x.tier === 'absolute')) {
    const r = tpa({ ...base, [c.key]: true });
    assert.equal(r.bandLabel, 'Absolute contraindication', c.key);
    assert.deepEqual(r.absolute, [c.key]);
  }
});

test('2026 moved prior ICH, stroke within 3 months and DOAC within 48 h to relative', () => {
  const r = tpa({ ...base, priorIch: true, ischemicStroke3mo: true, doac48h: true });
  assert.deepEqual(r.absolute, []);
  assert.deepEqual(r.relative.sort(), ['doac48h', 'ischemicStroke3mo', 'priorIch']);
  assert.match(r.band, /3 relative contraindications to weigh/);
});

test('labs fire the coagulopathy row by number; blank labs say so', () => {
  assert.deepEqual(tpa({ ...base, inr: '1.8' }).absolute, ['coagulopathy']);
  assert.deepEqual(tpa({ ...base, platelets: '99' }).absolute, ['coagulopathy']);
  assert.deepEqual(tpa({ ...base, aptt: '41' }).absolute, ['coagulopathy']);
  assert.deepEqual(tpa({ ...base, pt: '15.1' }).absolute, ['coagulopathy']);
  assert.deepEqual(tpa({ ...base, inr: '1.7', platelets: '100', aptt: '40', pt: '15' }).absolute, [], 'the limits themselves are not beyond them');
  assert.ok(tpa(base).notes.some((n) => n.startsWith('No coagulation results were entered')));
  assert.ok(tpa({ ...base, recentAnticoagulant: true }).notes.some((n) => n.includes('applies only without recent warfarin or heparin')));
});

test('non-disabling deficits: 3: No Benefit', () => {
  const r = tpa({ ...base, disabling: 'no' });
  assert.match(r.band, /3: No Benefit/);
});

test('extended windows name the condition they need', () => {
  assert.equal(tpa({ ...base, timing: 'unknown-onset' }).timingMet, false);
  assert.equal(tpa({ ...base, timing: 'unknown-onset', dwiFlairMismatch: true }).timingMet, true);
  assert.match(tpa({ ...base, timing: '4.5-9h', perfusionPenumbra: true }).band, /not answered/);
  assert.match(tpa({ ...base, timing: '4.5-9h', perfusionPenumbra: true, evtCandidate: 'yes' }).band, /thrombectomy was marked as an option/);
  assert.equal(tpa({ ...base, timing: 'wake-up', perfusionPenumbra: true, evtCandidate: 'no' }).timingMet, true);
  assert.equal(tpa({ ...base, timing: '9-24h', perfusionPenumbra: true, evtCandidate: 'no' }).timingMet, false, 'beyond 9 h needs an LVO');
  assert.ok(tpa({ ...base, timing: '9-24h', perfusionPenumbra: true, lvo: true, evtCandidate: 'no' }).notes.some((n) => n.includes('class 2b')));
  assert.match(tpa({ ...base, timing: 'beyond-24h' }).band, /no IV thrombolysis recommendation/);
});

test('the labels are stated beside the guideline', () => {
  assert.ok(tpa({ ...base, timing: '3-4.5h' }).notes.some((n) => n.startsWith('Both labels state treatment within 3 hours')));
  assert.ok(!tpa(base).notes.some((n) => n.startsWith('Both labels state treatment within 3 hours')));
  const a = tpa({ ...base, unrupturedAneurysm: true });
  assert.ok(a.notes.some((n) => n.includes('benefit generally greater than bleeding risk') && n.includes('A labeled contraindication for both labels (aneurysm)')));
  assert.ok(tpa({ ...base, activeInternalBleeding: true }).notes.some((n) => n.startsWith('Active internal bleeding: a contraindication in both labels')));
});

test('BP and glucose are things to correct, stated as the guideline\'s', () => {
  assert.ok(tpa({ ...base, sbp: '190' }).notes.some((n) => n.includes('lowered below 185') && n.includes('class 1')));
  assert.ok(tpa({ ...base, dbp: '110' }).notes.some((n) => n.includes('below 110')));
  assert.ok(tpa({ ...base, glucose: '45' }).notes.some((n) => n.startsWith('Glucose 45 mg/dL: correct it and reassess')));
});

test('unanswered is never favorable', () => {
  assert.match(tpa({ disabling: 'yes' }).message, /^Choose the time/);
  assert.match(tpa({ timing: 'within-3h' }).message, /^Answer whether the deficits are disabling/);
});

test('no output reads as an order: no "give", "administer" or a computed dose', () => {
  const cases = [base, { ...base, ctHemorrhage: true }, { ...base, disabling: 'no' }, { ...base, timing: '9-24h' }, { ...base, priorIch: true }, { ...base, sbp: '200' }];
  for (const c of cases) {
    const text = all(tpa(c));
    assert.doesNotMatch(text, /\b(give|administer|start|push|infuse)\b(?! before)/i, text.slice(0, 120));
  }
});

test('a lapsed or superseded label withholds the label statements; the guideline part still answers', () => {
  const later = new Date('2028-06-01T12:00:00Z');
  const r = tpa({ ...base, timing: '3-4.5h', unrupturedAneurysm: true }, later);
  assert.ok(r.notes.some((n) => n.startsWith('Label statements withheld:')));
  assert.ok(!r.notes.some((n) => n.startsWith('Both labels state treatment within 3 hours')));
  assert.ok(!r.notes.some((n) => n.includes('A labeled contraindication')));
  assert.match(r.band, /^No absolute contraindication was ticked/);
});
