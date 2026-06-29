// spec-v177 §2.4: PRISMA-7. 7 yes/no, item 6 reverse-scored, >= 3 flags.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prisma7 } from '../../lib/ltcga-v177.js';

const allNo = { over85: 'no', male: 'no', healthLimitActivities: 'no', needHelpRegularly: 'no', healthStayHome: 'no', canCountOnSomeone: 'yes', usesMobilityAid: 'no' };

test('PRISMA-7 all-low (can count on someone) -> 0', () => {
  assert.equal(prisma7(allNo).total, 0);
});

test('PRISMA-7 support item is reverse-scored: cannot count -> +1', () => {
  assert.equal(prisma7({ ...allNo, canCountOnSomeone: 'no' }).total, 1);
  assert.equal(prisma7({ ...allNo, canCountOnSomeone: 'yes' }).total, 0);
});

test('PRISMA-7 2 -> negative, 3 -> positive (the >= 3 cut flip)', () => {
  assert.equal(prisma7({ ...allNo, over85: 'yes', male: 'yes' }).positive, false);
  const three = prisma7({ ...allNo, over85: 'yes', male: 'yes', healthLimitActivities: 'yes' });
  assert.equal(three.total, 3);
  assert.equal(three.positive, true);
});

test('PRISMA-7 blank -> complete-the-fields', () => {
  assert.equal(prisma7({ ...allNo, over85: '' }).valid, false);
  assert.equal(prisma7({}).valid, false);
});
