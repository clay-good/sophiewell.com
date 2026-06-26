// spec-v154 2.4: Palliative Performance Scale v2 (Victoria Hospice). Five
// columns read left-to-right with LEFTWARD PRECEDENCE -> level 0%-100% in 10%
// steps (0% = death). Each column descriptor maps to a SET of levels; the level
// is the best horizontal fit (running intersection from the left, conflicts
// overridden leftward and flagged).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pps } from '../../lib/function-v154.js';

test('tile example: reduced ambulation converges to 70%', () => {
  const r = pps({ ambulation: 'reduced', activity: 'unable-job', selfCare: 'full', intake: 'reduced', conscious: 'full' });
  assert.equal(r.valid, true);
  assert.equal(r.level, 70);
  assert.equal(r.bandLabel, 'Stable / ambulatory');
  assert.equal(r.conflicts.length, 0);
});

test('full ambulation disambiguated rightward to a single level', () => {
  // Ambulation "Full" spans 100/90/80; activity "normal, some evidence" pins 90.
  const r = pps({ ambulation: 'full', activity: 'normal-some-evidence', selfCare: 'full', intake: 'normal', conscious: 'full' });
  assert.equal(r.level, 90);
  assert.equal(r.conflicts.length, 0);
});

test('read-leftward: conflicting rightward column is overridden and flagged', () => {
  // Ambulation + activity say 40%; self-care "Full" (100/90/80/70) conflicts and
  // is overridden by leftward precedence -> level stays 40, conflict recorded.
  const r = pps({ ambulation: 'mainly-bed', activity: 'unable-most', selfCare: 'full', intake: 'reduced', conscious: 'full' });
  assert.equal(r.level, 40);
  assert.ok(r.conflicts.includes('self-care'));
  assert.ok(r.conflicts.includes('conscious level'));
  assert.match(r.band, /leftward precedence/i);
});

test('bottom rows disambiguated by intake / conscious level', () => {
  // Totally bed bound + total care span 30/20/10; intake "minimal to sips" pins 20.
  const r = pps({ ambulation: 'bed-bound', activity: 'unable-any', selfCare: 'total', intake: 'minimal', conscious: 'drowsy' });
  assert.equal(r.level, 20);
  assert.equal(r.bandLabel, 'End-of-life / bed-bound');
  assert.equal(r.abnormal, true);
});

test('death dominates; blank column -> valid:false', () => {
  const dead = pps({ ambulation: 'death', activity: 'unable-any', selfCare: 'total', intake: 'mouth-care', conscious: 'coma' });
  assert.equal(dead.level, 0);
  assert.equal(dead.bandLabel, 'Death');
  assert.equal(pps({ ambulation: 'full' }).valid, false);
  assert.match(pps({ ambulation: 'full' }).message, /each column/i);
});
