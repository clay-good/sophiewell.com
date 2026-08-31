// spec-v941: the source links recovered by bibliographic lookup, pinned.
//
// Each row was matched against Crossref on journal + volume + first page (with
// the year or the journal name as a second check), then resolved through the
// DOI handle system before it was written into lib/meta.js. Pinning the pairs
// here means a later edit that drops a link, or swaps one paper's DOI for
// another's, fails in CI rather than silently sending a reader to the wrong
// paper -- which is the defect this spec fixed on four tiles.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { META } from '../../lib/meta.js';

const RECOVERED = [
  ['4at', 'https://doi.org/10.3310/hta23400'],
  ['anion-gap-dd', 'https://doi.org/10.1016/s0196-0644(05)82292-9'],
  ['apache2', 'https://doi.org/10.1097/00003246-198510000-00009'],
  ['auditc', 'https://doi.org/10.1001/archinte.158.16.1789'],
  ['avpu-gcs', 'https://doi.org/10.1111/j.1365-2044.2004.03526.x'],
  ['burch-wartofsky', 'https://doi.org/10.1016/s0889-8529(18)30165-8'],
  ['cage', 'https://doi.org/10.1001/jama.1984.03350140051025'],
  ['ciwa', 'https://doi.org/10.1111/j.1360-0443.1989.tb00737.x'],
  ['epds', 'https://doi.org/10.1192/bjp.150.6.782'],
  ['free-water-deficit', 'https://doi.org/10.1056/nejm200005183422006'],
  ['gad7', 'https://doi.org/10.1001/archinte.166.10.1092'],
  ['gds15', 'https://doi.org/10.1300/j018v05n01_09'],
  ['grace', 'https://doi.org/10.1001/archinte.163.19.2345'],
  ['hacor', 'https://doi.org/10.1007/s00134-016-4601-3'],
  ['heart', 'https://doi.org/10.1007/bf03086144'],
  ['ich-score', 'https://doi.org/10.1161/01.str.32.4.891'],
  ['local-anesthetic-max', 'https://doi.org/10.1097/aap.0000000000000720'],
  ['mini-cog', 'https://doi.org/10.1002/1099-1166(200011)15:11%3C1021::aid-gps234%3E3.0.co;2-6'],
  ['npass', 'https://doi.org/10.1038/sj.jp.7211861'],
  ['opioid-mme', 'https://doi.org/10.15585/mmwr.rr7103a1'],
  ['phq9', 'https://doi.org/10.1046/j.1525-1497.2001.016009606.x'],
  ['psi', 'https://doi.org/10.1056/nejm199701233360402'],
  ['r-factor', 'https://doi.org/10.1016/0168-8278(90)90124-a'],
  ['rsbi', 'https://doi.org/10.1056/nejm199105233242101'],
  ['sgarbossa', 'https://doi.org/10.1016/j.annemergmed.2012.07.119'],
  ['silverman-andersen', 'https://doi.org/10.1542/peds.17.1.1'],
  ['urine-anion-gap', 'https://doi.org/10.1097/00000441-198610000-00003'],
  ['wells-dvt', 'https://doi.org/10.1016/s0140-6736(97)08140-3'],
  ['wells-pe', 'https://doi.org/10.1055/s-0037-1613830'],
  ['sodium-correction', 'https://doi.org/10.1056/nejm200005253422107'],
  ['cincinnati', 'https://doi.org/10.1016/s0196-0644(99)70299-4'],
  ['delta-gap', 'https://doi.org/10.1016/s0196-0644(05)82292-9'],
  ['aldrete', 'https://doi.org/10.1016/0952-8180(94)00001-k'],
];

test('spec-v941: every recovered citation link is still in place', () => {
  const bad = [];
  for (const [id, url] of RECOVERED) {
    const m = META[id];
    if (!m) { bad.push(`${id}: no longer a tile`); continue; }
    if (m.citationUrl !== url) bad.push(`${id}: citationUrl is ${m.citationUrl}, expected ${url}`);
  }
  assert.deepEqual(bad, []);
});

test('spec-v941: no recovered tile is still on the frozen backlog', () => {
  const backlog = new Set(JSON.parse(
    readFileSync(new URL('../../data/citation-url-backlog.json', import.meta.url), 'utf8'),
  ).tiles);
  const stuck = RECOVERED.map(([id]) => id).filter((id) => backlog.has(id));
  assert.deepEqual(stuck, []);
});

// The two citations whose own numbers pointed at a different paper.
test('spec-v941: sodium-correction cites the Hyponatremia paper it names', () => {
  // Adrogue & Madias published Hyponatremia (342:1581-1589) and Hypernatremia
  // (342:1493-1499) in the same 2000 NEJM volume. This tile named the first and
  // carried the second's page range.
  assert.match(META['sodium-correction'].citation, /Hyponatremia\. NEJM 2000;342:1581-1589\./);
  assert.match(META['free-water-deficit'].citation, /Hypernatremia\. NEJM 2000;342:1493-1499\./);
  assert.notEqual(META['sodium-correction'].citationUrl, META['free-water-deficit'].citationUrl);
});

test('spec-v941: cincinnati cites the CPSS validation paper it names', () => {
  // Ann Emerg Med 1999;33(4):373-378, not the 1997 out-of-hospital NIHSS paper
  // whose volume and pages the citation had been carrying.
  assert.match(META.cincinnati.citation, /Ann Emerg Med\. 1999;33\(4\):373-378\./);
  assert.equal(META.cincinnati.citationUrl, META.cpss.citationUrl);
});

// ---- spec-v942: the tiles whose citation names two papers, both linked ----

const TWO_PAPER = [
  ['alvarado-pas', 'Alvarado 1986', 'Samuel 2002'],
  ['dast10', 'Skinner 1982', 'Yudko 2007'],
  ['fast', 'Kleindorfer 2007', 'Aroor 2017'],
  ['hypothermia-rewarm', 'Durrer 2003', 'ERC 2021'],
  ['iss-rts', 'Baker 1974', 'Champion 1989'],
  ['lams', 'Llanes 2004', 'Nazliel 2008'],
  ['nexus-cspine', 'Hoffman 2000', 'Stiell 2001'],
  ['phq2-gad2', 'Kroenke 2003', 'Kroenke 2007'],
  ['vent-sbt-peep', 'Boles 2007', 'ARDS Network 2000'],
  ['wells-dvt-caprini', 'Wells 1997', 'Caprini 2005'],
  ['wells-pe-geneva', 'Wells 2000', 'Le Gal 2006'],
];

test('spec-v942: each two-paper citation links both papers, labelled and distinct', () => {
  const bad = [];
  for (const [id, ...labels] of TWO_PAPER) {
    const list = META[id]?.citationUrls;
    if (!Array.isArray(list)) { bad.push(`${id}: no citationUrls`); continue; }
    if (META[id].citationUrl) bad.push(`${id}: also carries a singular citationUrl`);
    assert.deepEqual(list.map((e) => e.label), labels, `${id}: labels drifted`);
    const urls = new Set(list.map((e) => e.url));
    if (urls.size !== list.length) bad.push(`${id}: two labels share one link`);
    for (const e of list) {
      if (!e.url.startsWith('https://doi.org/')) bad.push(`${id}: ${e.label} is not a DOI link`);
    }
  }
  assert.deepEqual(bad, []);
});

// ---- spec-v943: the links that did not reach a source ----

// Twelve DOIs that looked right and 404ed at doi.org. They read like real
// records -- correct prefix, plausible suffix -- which is exactly why nothing
// caught them for so long. Assert by string, so a copy-paste cannot bring one
// back under a different tile.
const FABRICATED_DOIS = [
  '10.1016/0735-1097(85)90581-1', '10.1097/00003086-197901000-00012',
  '10.1027/1015-5759.19.1.12', '10.1080/01621459.1927.10502667',
  '10.1111/j.1748-1716.1942.tb00363.x', '10.1097/TA.0b013e31824157e6',
  '10.1016/0002-9343(81)90178-4', '10.1016/S0140-6736(73)93104-5',
  '10.1016/0016-5085(92)90845-Q', '10.1016/0002-9610(44)90000-0',
  '10.1016/S0022-5347(17)38501-5', '10.1001/archinte.1990.00390150103019',
];

test('spec-v943: no tile links a DOI that does not resolve', () => {
  const live = new Set();
  for (const m of Object.values(META)) {
    if (m.citationUrl) live.add(m.citationUrl);
    for (const e of m.citationUrls || []) live.add(e.url);
  }
  const back = FABRICATED_DOIS.filter((d) => live.has(`https://doi.org/${d}`));
  assert.deepEqual(back, []);
});

test('spec-v943: the olbi and Wilson DOIs keep the exact form that resolves', () => {
  // Hogrefe DOIs carry a double slash after the prefix; dropping one 404s.
  assert.equal(META.olbi.citationUrl, 'https://doi.org/10.1027//1015-5759.19.1.12');
  // The shipped Wilson DOI had the wrong article number, not the wrong journal.
  assert.equal(META['proportion-ci'].citationUrl, 'https://doi.org/10.1080/01621459.1927.10502953');
});

test('spec-v943: every PubMed link names a record, not a query, outside the frozen set', () => {
  const offenders = [];
  for (const [id, m] of Object.entries(META)) {
    const url = m.citationUrl || '';
    if (!url.includes('pubmed.ncbi.nlm.nih.gov')) continue;
    if (/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/?$/.test(url)) continue;
    offenders.push(id);
  }
  // The frozen set is the only place a search URL may live; it is checked
  // against the catalog by check-citations.test.js.
  assert.equal(offenders.length, 12, offenders.join(', '));
});
