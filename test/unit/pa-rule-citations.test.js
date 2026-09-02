// spec-v981: the invariant that keeps a rule's citation and the ledger in step.
//
// A source URL lives in two places: pa-staleness-ledger.json, and the citation
// string of every rule that names it in lib/pa/rules.js. The second copy is the
// one a reader clicks in a pa-lint report. spec-v979 fixed 18 dead URLs in the
// first place only, and 133 rule citations kept pointing at the dead pages.
//
// The rule below needs no rule-to-source mapping, which is why it holds: every
// URL a rule cites must be one the ledger knows.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ledgerUrls, citedUrls, unknownCitedUrls } from '../../scripts/check-pa-rule-citations.mjs';

const LEDGER = {
  sources: [
    { id: 'a', url: 'https://payer.example/prior-auth', alsoCited: ['https://payer.example/cpb/0157'] },
    { id: 'b', url: 'https://gov.example/policy' },
  ],
};

test('the ledger knows a source url and everything on its alsoCited', () => {
  assert.deepEqual([...ledgerUrls(LEDGER)].sort(), [
    'https://gov.example/policy',
    'https://payer.example/cpb/0157',
    'https://payer.example/prior-auth',
  ]);
});

test('citedUrls reads every angle-bracketed url and names the rules citing it', () => {
  const rules = [
    { id: 'R-1', citation: 'Some text <https://payer.example/prior-auth>' },
    { id: 'R-2', citation: 'More <https://payer.example/prior-auth> and <https://gov.example/policy>' },
    { id: 'R-3', citation: 'No url here at all.' },
  ];
  const cited = citedUrls(rules);
  assert.deepEqual(cited.get('https://payer.example/prior-auth'), ['R-1', 'R-2']);
  assert.deepEqual(cited.get('https://gov.example/policy'), ['R-2']);
  assert.equal(cited.size, 2);
});

test('a citation the ledger does not know is a violation', () => {
  const drifted = [{ id: 'R-9', citation: 'Stale <https://payer.example/old-prior-auth>' }];
  const bad = unknownCitedUrls(LEDGER, drifted);
  assert.equal(bad.length, 1);
  assert.equal(bad[0][0], 'https://payer.example/old-prior-auth');
  assert.deepEqual(bad[0][1], ['R-9']);
});

test('a rule may cite a further page on the same authority, if the ledger lists it', () => {
  const ok = [{ id: 'R-8', citation: 'Obesity surgery CPB <https://payer.example/cpb/0157>' }];
  assert.deepEqual(unknownCitedUrls(LEDGER, ok), []);
});

test('the live ruleset and the live ledger agree', async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const root = fileURLToPath(new URL('../..', import.meta.url));
  const ledger = JSON.parse(readFileSync(`${root}/pa-staleness-ledger.json`, 'utf8'));
  const { STARTER_RULES } = await import('../../lib/pa/rules.js');
  const unknown = unknownCitedUrls(ledger, STARTER_RULES);
  assert.deepEqual(unknown.map(([u]) => u), [], 'rule citations point at urls the ledger does not carry');
});
