// Naming a tool this server does not carry.
//
// Exposure is opt-in by the existence of an adapter, so the website's document
// generators, reference tables and time-dependent timers are not callable
// calculators here. `find_calculator` can only rank the ones it has, and it
// used to answer as if the question had been about one of them: an agent
// asking for "Prior-Auth Packet Linter" got `cosyntropin-stim` at rank 1, a
// cosyntropin stimulation test, with nothing to say the tool it named exists.
//
// Naming a tool in full is unambiguous -- every word of its name, the same
// rule an exact name is promoted by -- so the server says what happened.
import test from 'node:test';
import assert from 'node:assert/strict';
import { findCalculator } from '../../mcp/tools.js';
import { UNEXPOSED, getCalculator } from '../../mcp/catalog.js';

test('every tile the site has and this server does not is named, not guessed at', () => {
  assert.ok(UNEXPOSED.size > 0, 'the unexposed set must be discoverable');
  const wrong = [];
  for (const u of UNEXPOSED.values()) {
    assert.equal(getCalculator(u.id), null, `${u.id} is in UNEXPOSED but has an adapter`);
    const r = findCalculator({ query: u.name, limit: 3 });
    if (r.code !== 'NOT_EXPOSED' || r.tile !== u.id) {
      wrong.push(`${u.id} ("${u.name}") -> ${r.code || (r.candidates || []).map((c) => c.id).join(', ')}`);
    }
    if ((r.candidates || []).length) wrong.push(`${u.id} returned candidates alongside NOT_EXPOSED`);
  }
  assert.deepEqual(wrong, [], `${wrong.length} unexposed tiles are answered with an unrelated calculator`);
});

test('the refusal tells the agent where the tool is', () => {
  const r = findCalculator({ query: 'Prior-Auth Packet Linter' });
  assert.equal(r.code, 'NOT_EXPOSED');
  assert.equal(r.tile, 'pa-lint');
  assert.match(r.hint, /sophiewell\.com\/tools\/pa-lint\//);
  assert.match(r.hint, /mcp-coverage\.md/);
});

// The rule has to be as tight as naming: a partial query is a description and
// must still be ranked, not refused.
test('a partial name is still ranked', () => {
  for (const q of ['appeal letter', 'tetanus', 'prior auth', 'unit converter']) {
    const r = findCalculator({ query: q, limit: 2 });
    assert.notEqual(r.code, 'NOT_EXPOSED', `"${q}" is a description, not a naming`);
    assert.ok((r.candidates || []).length > 0, `"${q}" should still rank something`);
  }
});

// The same distinction at the other end: an agent that read an id off a page
// URL and called describe/compute with it was told the id was unknown, which is
// false and sends it looking for a tool it had already found.
test('describe and compute name the tile rather than deny it', async () => {
  const { describeCalculator, computeCalculator } = await import('../../mcp/tools.js');
  for (const u of UNEXPOSED.values()) {
    for (const [what, r] of [
      ['describe', describeCalculator({ id: u.id })],
      ['compute', computeCalculator({ id: u.id, inputs: {} })],
    ]) {
      assert.equal(r.code, 'NOT_EXPOSED', `${what}(${u.id}) must not report an unknown id`);
      assert.equal(r.name, u.name);
      assert.match(r.message, new RegExp(`/tools/${u.id}/`));
    }
  }
});

test('an id that is not a tile at all is still UNKNOWN_ID', async () => {
  const { describeCalculator, computeCalculator } = await import('../../mcp/tools.js');
  assert.equal(describeCalculator({ id: 'not-a-tile' }).code, 'UNKNOWN_ID');
  assert.equal(computeCalculator({ id: 'not-a-tile', inputs: {} }).code, 'UNKNOWN_ID');
});

test('answer_query says the tool exists rather than that nothing matched', async () => {
  const { answerQuery } = await import('../../mcp/tools.js');
  const r = answerQuery({ query: 'Appeal Letter Generator' });
  assert.equal(r.code, 'NOT_EXPOSED');
  assert.equal(r.tile, 'appeal-letter');
  // And a query it can actually answer is untouched.
  assert.equal(answerQuery({ query: 'bmi 80kg 180cm' }).tile, 'bmi');
});

// The same silence in the two places a partial view is easiest to mistake for
// a complete one: an empty list, and an empty field.
test('describe names the related tools it cannot offer', async () => {
  const { describeCalculator } = await import('../../mcp/tools.js');
  const { META } = await import('../../lib/meta.js');
  const { allCalculators } = await import('../../mcp/catalog.js');
  let checked = 0;
  for (const c of allCalculators()) {
    const declared = (META[c.id] && META[c.id].related) || [];
    const hidden = declared.filter((rid) => UNEXPOSED.has(rid));
    const d = describeCalculator({ id: c.id });

    // Whatever the field carries, it never names something the agent could
    // have called instead, and it is never present-but-empty.
    for (const r of d.relatedOnWebsite || []) {
      assert.ok(UNEXPOSED.has(r.id), `${c.id}: relatedOnWebsite names ${r.id}, which is callable here`);
    }
    assert.ok(!('relatedOnWebsite' in d) || d.relatedOnWebsite.length > 0,
      `${c.id} carries an empty relatedOnWebsite`);

    // Where curation applies -- the tile has at least one curated sibling this
    // server can call -- the field is exactly the curated ids it cannot.
    if (declared.some((rid) => !UNEXPOSED.has(rid))) {
      if (!hidden.length) {
        assert.ok(!('relatedOnWebsite' in d), `${c.id} has no browser-only siblings and should not carry the field`);
        continue;
      }
      checked += 1;
      assert.deepEqual((d.relatedOnWebsite || []).map((r) => r.id), hidden, `${c.id} drops a related tool silently`);
    }
  }
  assert.ok(checked > 0, 'at least one calculator has a browser-only sibling to name');
});

// spec-v939: a tile with no curated siblings falls back to the shortlist the
// website computes for it, and the same rule applies to that list -- the ones
// this server cannot call are named rather than dropped. Every tile the website
// pairs restraint-timer with is one of the four time-dependent timers, so its
// answer used to be silence about four pages that exist.
test('describe fills an empty related list from what the website shows', async () => {
  const { describeCalculator } = await import('../../mcp/tools.js');
  const { META } = await import('../../lib/meta.js');

  assert.deepEqual(META['restraint-timer'].related || [], [],
    'fixture drift: restraint-timer is supposed to have no curated siblings');
  const d = describeCalculator({ id: 'restraint-timer' });
  assert.deepEqual(d.related, []);
  assert.deepEqual((d.relatedOnWebsite || []).map((r) => r.id),
    ['code-blue-clock', 'ews-escalation', 'sepsis-bundle-clock', 'device-day-counter']);

  // And where the fill does find callable tiles, it answers with them.
  const acet = describeCalculator({ id: 'acetaminophen-nomogram' });
  assert.deepEqual(META['acetaminophen-nomogram'].related || [], []);
  assert.ok(acet.related.length > 0, 'acetaminophen-nomogram still answers with nothing');
  assert.ok(acet.related.includes('nac-dosing'),
    `expected the NAC dosing tile among ${acet.related.join(', ')}`);
});

test('list_calculators says when a query only matches a browser-only tool', async () => {
  const { listCalculators } = await import('../../mcp/tools.js');
  const hit = listCalculators({ query: 'appeal letter' });
  assert.equal(hit.total, 0);
  assert.deepEqual((hit.onlyOnWebsite || []).map((r) => r.id), ['appeal-letter']);
  // A query that matches exposed rows, and one that matches nothing anywhere,
  // both stay exactly as they were.
  assert.ok(!('onlyOnWebsite' in listCalculators({ query: 'wells' })));
  assert.ok(!('onlyOnWebsite' in listCalculators({ query: 'zzznothing' })));
});

test('naming an exposed calculator in full is unaffected', () => {
  for (const [q, id] of [['TIMI Risk Index', 'timi-risk-index'], ['Wells Score for DVT', 'wells-dvt']]) {
    const r = findCalculator({ query: q, limit: 1 });
    assert.equal(r.code, undefined, `"${q}" must not be refused`);
    assert.equal(r.candidates[0].id, id);
  }
});
