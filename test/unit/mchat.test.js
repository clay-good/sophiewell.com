import test from 'node:test';
import assert from 'node:assert/strict';
import { mchatScore as mc, ITEMS, REVERSE_ITEMS } from '../../lib/mchat-v862.js';

// "yes" on every item except the three reverse-scored ones is a clean sheet.
const clean = () => {
  const o = {};
  for (const i of ITEMS) o[`item${i.n}`] = i.reverse ? 'no' : 'yes';
  return o;
};
const flip = (o, ...ns) => {
  const out = { ...o };
  for (const n of ns) {
    const item = ITEMS.find((i) => i.n === n);
    out[`item${n}`] = item.reverse ? 'yes' : 'no';
  }
  return out;
};

test('mchat: a clean sheet scores zero', () => {
  const r = mc({ ...clean(), ageMonths: 20 });
  assert.equal(r.total, 0);
  assert.equal(r.risk, 'low');
  assert.equal(r.screen, 'negative');
  assert.equal(r.answeredCount, 20);
});

test('mchat: the three band boundaries', () => {
  const c = clean();
  assert.equal(mc(flip(c, 1, 3)).risk, 'low');
  assert.equal(mc(flip(c, 1, 3, 4)).risk, 'medium');
  assert.equal(mc(flip(c, 1, 3, 4, 6, 7, 8, 9)).risk, 'medium');
  assert.equal(mc(flip(c, 1, 3, 4, 6, 7, 8, 9, 10)).risk, 'high');
});

test('mchat: items 2, 5 and 12 are reverse-scored', () => {
  // The arithmetic error this tile exists to prevent.
  assert.deepEqual(REVERSE_ITEMS, [2, 5, 12]);
  const c = clean();
  // "yes" on a reverse item scores; "no" does not.
  assert.equal(mc({ ...c, item2: 'yes' }).total, 1);
  assert.equal(mc({ ...c, item2: 'no' }).total, 0);
  // The mirror holds on a normal item.
  assert.equal(mc({ ...c, item1: 'no' }).total, 1);
  assert.equal(mc({ ...c, item1: 'yes' }).total, 0);
  assert.deepEqual(mc({ ...c, item2: 'yes', item12: 'yes' }).reverseTriggered, [2, 12]);
  assert.match(mc(c).reverseNote, /None of the three scored here/);
});

test('mchat: a medium score is neither a referral nor a pass', () => {
  const r = mc(flip(clean(), 1, 3, 4));
  assert.equal(r.risk, 'medium');
  assert.equal(r.screen, null);
  assert.match(r.mediumNote, /neither a referral nor a pass/);
  assert.match(r.band, /administer the Follow-Up/);
});

test('mchat: the Follow-Up decides the medium band at 2', () => {
  const med = flip(clean(), 1, 3, 4);
  assert.equal(mc({ ...med, followUp: 2 }).screen, 'positive');
  assert.equal(mc({ ...med, followUp: 1 }).screen, 'negative');
  assert.equal(mc({ ...med, followUp: 0 }).screen, 'negative');
});

test('mchat: a high score bypasses the Follow-Up', () => {
  const high = flip(clean(), 1, 3, 4, 6, 7, 8, 9, 10);
  const r = mc({ ...high, followUp: 0 });
  assert.equal(r.risk, 'high');
  assert.equal(r.screen, 'positive');
  assert.match(r.bypassNote, /is not used/);
  // Without a Follow-Up entered there is nothing to say about bypassing it.
  assert.equal(mc(high).bypassNote, null);
});

test('mchat: the validated age range is stated, not enforced silently', () => {
  const c = clean();
  assert.match(mc({ ...c, ageMonths: 12 }).ageNote, /outside the 16 to 30 month range/);
  assert.match(mc({ ...c, ageMonths: 36 }).ageNote, /outside the 16 to 30 month range/);
  assert.match(mc({ ...c, ageMonths: 20 }).ageNote, /screened again after it/);
  assert.equal(mc({ ...c, ageMonths: 26 }).ageNote, null);
  assert.match(mc(c).ageNote, /was not entered/);
});

test('mchat: unanswered items are named rather than scored', () => {
  const r = mc({ item1: 'no', item3: 'no' });
  assert.equal(r.total, 2);
  assert.equal(r.answeredCount, 2);
  assert.match(r.unansweredNote, /18 of the 20 items/);
  assert.equal(mc(clean()).unansweredNote, null);
});

test('mchat: a negative screen is never presented as an exclusion', () => {
  assert.match(mc(clean()).negativeNote, /does not rule out autism/);
  assert.match(mc({ ...flip(clean(), 1, 3, 4), followUp: 0 }).negativeNote, /does not rule out autism/);
  assert.equal(mc(flip(clean(), 1, 3, 4, 6, 7, 8, 9, 10)).negativeNote, null);
});

test('mchat: implausible values are refused', () => {
  assert.equal(mc({ ageMonths: 300 }).valid, false);
  assert.equal(mc({ followUp: 25 }).valid, false);
  assert.equal(mc({ followUp: -1 }).valid, false);
});

test('mchat: the item table carries twenty topics and no instrument wording', () => {
  assert.equal(ITEMS.length, 20);
  assert.deepEqual(ITEMS.map((i) => i.n), Array.from({ length: 20 }, (_, k) => k + 1));
  assert.ok(ITEMS.every((i) => i.topic && i.topic.length > 3));
  assert.equal(ITEMS.filter((i) => i.reverse).length, 3);
});
