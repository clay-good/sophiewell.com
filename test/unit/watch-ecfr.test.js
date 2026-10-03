// spec-v1517 route B watcher 1: the eCFR amendment watcher's parsing and comparison (the API call is not made).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { citedSections, amendedAfter, unverified, markdown } from '../../scripts/data/watch-ecfr.mjs';

const META = {
  a: { citation: 'Hospice cap, 42 CFR 418.309 and 42 CFR 414.20-414.22.', citationAccessed: '2026-09-26' },
  b: { citation: 'Premium credit, 26 CFR 1.36B-2(b).', citationUrl: 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-418/subpart-G/section-418.309', citationAccessed: '2026-10-02' },
  c: { citation: '45 CFR 164.524 right of access.' },
};

test('sections come from the citation text and the eCFR link; a range is its first section; an IRS section keeps its suffix', () => {
  const s = citedSections(META);
  assert.deepEqual([...s.keys()].sort(), ['26 CFR 1.36B-2', '42 CFR 414.20', '42 CFR 418.309', '45 CFR 164.524']);
  assert.deepEqual(s.get('42 CFR 418.309').map((t) => t.tile), ['a', 'b']);
});

test('a section amended after a tool verified it is listed with that tool only; an undated tool is listed apart', () => {
  const s = citedSections(META);
  const rows = amendedAfter(s, new Map([['42 CFR 418.309', '2026-10-01'], ['45 CFR 164.524', '2016-12-30']]));
  assert.deepEqual(rows, [{ section: '42 CFR 418.309', amended: '2026-10-01', tiles: [{ tile: 'a', verified: '2026-09-26' }] }]);
  assert.deepEqual(unverified(s), ['c']);
  const md = markdown(rows, { checked: 2, unchecked: ['42 CFR 414.20'], undated: unverified(s) });
  assert.match(md, /- 42 CFR 418\.309 was amended on 2026-10-01\. Tools to re-check: `a` \(verified 2026-09-26\)\./);
  assert.match(md, /1 tool cites a CFR section with no verification date to compare against: `c`\./);
  assert.match(markdown([], { checked: 9, unchecked: [] }), /No cited CFR section was amended after the tools citing it last verified it \(9 sections checked\)\./);
});
