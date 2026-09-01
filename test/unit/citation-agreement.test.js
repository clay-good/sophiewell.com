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

test('spec-v968: the frozen disagreement list is down to the one needing an owner decision', () => {
  // spec-v950 settled rdw-index: the Jayabose RDW index is a meeting abstract,
  // "#262", J Pediatr Hematol Oncol 1999;21:314 -- a single page, which is why
  // every full-record search had missed it.
  // spec-v961 settled no-apnea-score: its citation named a "4-item instrument" in Sleep Breath,
  // which is neither the right paper nor the right instrument. The derivation is the 2-item
  // model in J Clin Sleep Med 2018;14(7):1097-1107.
  // spec-v968 settled two more. delbet-femoral-neck named a JAAOS 2018 review that PubMed does
  // not carry at any pagination, and linked an unrelated bone-graft article in the same volume;
  // the real Spence paper is J Pediatr Orthop 2016;36(2):111-116. rhig-dose described AABB
  // RhIG dosing while its numbers named Sandler's RHD-genotyping editorial; the paper that
  // states the four-step 300 ug dosing procedure is Obstet Gynecol 2012;120(6):1428-1438.
  assert.deepEqual([...KNOWN_DISAGREEMENTS].sort(), ['savary-miller']);
  assert.equal(META['no-apnea-score'].citationUrl, 'https://pubmed.ncbi.nlm.nih.gov/29991419/');
  assert.equal(META['rdw-index'].citationUrl, 'https://doi.org/10.1097/00043426-199907000-00040');
  assert.equal(META['delbet-femoral-neck'].citationUrl, 'https://pubmed.ncbi.nlm.nih.gov/25730381/');
  assert.equal(META['rhig-dose'].citationUrl, 'https://pubmed.ncbi.nlm.nih.gov/23168770/');
});

// ---- spec-v954 ----

test('spec-v954: a surname written without its diacritics still matches', () => {
  // The citation writes "Allgower"; PubMed records "Allgöwer". Before the fold
  // that read as a mismatch, and with the page absent too it tripped the
  // two-strike rule on a link that was correct.
  const citation = 'Allgower M, Burri C. Schockindex. Dtsch Med Wochenschr. 1967;92(43):1947-1950.';
  assert.deepEqual(disagreements(citation, { year: 1967, page: '1947-50', author: 'Allgöwer' }), []);
  assert.deepEqual(disagreements('Raiche M. PRISMA-7. 2008;47:9-18.', { year: 2008, page: '9-18', author: 'Raîche' }), []);
});

test('spec-v954: the guideline links added to the backlog tiles are in place', () => {
  const expected = {
    'kdigo-aki': 'https://doi.org/10.1038/kisup.2012.1',
    'code-blue-clock': 'https://pubmed.ncbi.nlm.nih.gov/33081529/',
    'digoxin': 'https://pubmed.ncbi.nlm.nih.gov/35363499/',
    'peds-resus': 'https://pubmed.ncbi.nlm.nih.gov/33081526/',
    'finnegan': 'https://pubmed.ncbi.nlm.nih.gov/1163358/',
    'maint-fluids': 'https://pubmed.ncbi.nlm.nih.gov/13431307/',
    'shock-index': 'https://pubmed.ncbi.nlm.nih.gov/5299769/',
    'insulin-correction': 'https://pubmed.ncbi.nlm.nih.gov/38078585/',
  };
  const bad = Object.entries(expected).filter(([id, url]) => META[id]?.citationUrl !== url);
  assert.deepEqual(bad, []);
  // crrt-dose names two works and links both.
  assert.deepEqual(META['crrt-dose'].citationUrls.map((e) => e.label), ['KDIGO 2012', 'Davenport 2009']);
});
