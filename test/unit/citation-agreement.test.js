// spec-v945: the rule that separates "the link resolves" from "the link opens
// the paper the citation names". The network half lives in
// scripts/check-citation-agreement.mjs; this pins the rule itself and the
// frozen list of tiles it still excuses.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { disagreements, linkRows, KNOWN_DISAGREEMENTS } from '../../scripts/check-citation-agreement.mjs';
import { META } from '../../lib/meta.js';

const CITATION = 'Pipkin G. Treatment of grade IV fracture-dislocation of the hip. J Bone Joint Surg Am. 1957;39-A(5):1027-1042.';

test('a record that matches the citation disagrees on nothing', () => {
  assert.deepEqual(
    disagreements(CITATION, { year: 1957, page: '1027-42', author: 'Pipkin' }),
    [],
  );
});

test('the wrong article in the right journal and year disagrees on two counts', () => {
  // The record this tile actually linked before spec-v945.
  const notes = disagreements(CITATION, { year: 1957, page: '1106-18', author: 'BASMAJIAN' });
  assert.equal(notes.length, 2, notes.join(', '));
  assert.ok(notes.some((n) => n.startsWith('page')));
  assert.ok(notes.some((n) => n.startsWith('author')));
});

test('one disagreement is not enough: online-first years and corporate authors are normal', () => {
  // Published online the year before the issue.
  assert.deepEqual(disagreements(CITATION, { year: 1958, page: '1027-42', author: 'Pipkin' }), []);
  // A guideline whose first author the citation does not name.
  assert.equal(
    disagreements(CITATION, { year: 1957, page: '1027-42', author: 'Committee' }).length, 1,
  );
});

test('linkRows covers both link shapes and carries the citation with each', () => {
  const rows = linkRows({
    one: { citation: 'A. J. 2000;1:1.', citationUrl: 'https://doi.org/10.1/a' },
    two: { citation: 'B. J. 2001;2:2.', citationUrls: [{ label: 'x', url: 'https://doi.org/10.1/b' }, { label: 'y', url: 'https://doi.org/10.1/c' }] },
    none: { citation: 'C. J. 2002;3:3.' },
  });
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map((r) => r.id), ['one', 'two', 'two']);
  assert.equal(rows[2].citation, 'B. J. 2001;2:2.');
});

test('every id in the frozen disagreement list is still a tile that carries a link', () => {
  const stale = [...KNOWN_DISAGREEMENTS].filter((id) => !META[id] || !(META[id].citationUrl || META[id].citationUrls));
  assert.deepEqual(stale, []);
});

test('the four links spec-v945 corrected point at their own paper', () => {
  assert.equal(META['pipkin-femoral-head'].citationUrl, 'https://pubmed.ncbi.nlm.nih.gov/13475403/');
  assert.equal(META['russe-scaphoid'].citationUrl, 'https://pubmed.ncbi.nlm.nih.gov/13854612/');
  assert.equal(META['berndt-harty'].citationUrl, 'https://pubmed.ncbi.nlm.nih.gov/13849029/');
  // hamada was off by one PMID: 2323151 is the neighbouring article.
  assert.equal(META.hamada.citationUrl, 'https://pubmed.ncbi.nlm.nih.gov/2323152/');
});

// ---- spec-v946: the citations whose own numbers were wrong ----

test('spec-v946: the four corrected citations name the journal that carries them', () => {
  assert.match(META.femg.citation, /Magnes Res\. 1997;10\(4\):315-320\./);
  assert.match(META['std-ktv'].citation, /Semin Dial\. 2004;17\(2\):142-145\./);
  assert.match(META['increment-cpe'].citation, /Mayo Clin Proc\. 2016;91\(10\):1362-1371\./);
  assert.match(META['goligher-hemorrhoids'].citation, /Tech Coloproctol\. 2022;26\(5\):387-392\./);
});

test('spec-v946: eat-sleep-console links both papers it names', () => {
  assert.deepEqual(META['eat-sleep-console'].citationUrls.map((e) => e.label), ['Grossman 2017', 'Young 2023']);
  assert.equal(META['eat-sleep-console'].citationUrl, undefined);
});

test('spec-v946: the frozen disagreement list is down to the five needing source review', () => {
  assert.deepEqual([...KNOWN_DISAGREEMENTS].sort(),
    ['delbet-femoral-neck', 'no-apnea-score', 'rdw-index', 'rhig-dose', 'savary-miller']);
});
