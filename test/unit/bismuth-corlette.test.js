// spec-v399: Bismuth-Corlette classification of perihilar cholangiocarcinoma (types I/II/IIIa/IIIb/IV).
// Worked-example tests: each type and its ductal-extent description, roman + numeric + 3a/3b input, the
// ambiguous-bare-III guard, and the invalid-type guard. Types transcribed from Bismuth-Corlette 1975
// (Surg Gynecol Obstet) with the IIIa/IIIb split from Bismuth 1992 (Ann Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bismuthCorlette } from '../../lib/bismuth-corlette-v399.js';

test('type II: reaching the confluence (the META example)', () => {
  const r = bismuthCorlette({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /reaching the confluence/);
  assert.match(r.band, /without involving the secondary/);
});

test('type I: below / sparing the confluence', () => {
  const r = bismuthCorlette({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /below \(sparing\) the confluence/);
});

test('type IIIa vs IIIb: right vs left secondary ducts', () => {
  const a = bismuthCorlette({ type: 'IIIa' });
  assert.equal(a.type, 'IIIa');
  assert.match(a.band, /RIGHT secondary/);
  const b = bismuthCorlette({ type: 'IIIb' });
  assert.equal(b.type, 'IIIb');
  assert.match(b.band, /LEFT secondary/);
});

test('type IV: bilateral secondary ducts or multifocal', () => {
  const r = bismuthCorlette({ type: 'IV' });
  assert.equal(r.type, 'IV');
  assert.match(r.band, /BOTH sides/);
});

test('numeric and 3a/3b input map to the types', () => {
  assert.equal(bismuthCorlette({ type: 2 }).type, 'II');
  assert.equal(bismuthCorlette({ type: '3a' }).type, 'IIIa');
  assert.equal(bismuthCorlette({ type: '3B' }).type, 'IIIb');
  assert.equal(bismuthCorlette({ type: 4 }).type, 'IV');
});

test('a missing, ambiguous, or out-of-range type is invalid', () => {
  assert.equal(bismuthCorlette({}).valid, false);
  assert.equal(bismuthCorlette({ type: 'III' }).valid, false);
  assert.equal(bismuthCorlette({ type: 'V' }).valid, false);
  assert.equal(bismuthCorlette({ type: '0' }).valid, false);
});
