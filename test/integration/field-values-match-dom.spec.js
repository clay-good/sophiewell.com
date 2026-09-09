// spec-v770: a declared value list must be the list the tile actually offers.
//
// A scored category is a number to the calculator -- its points get summed --
// and a fixed set of options to the person answering it. The registry used to
// say only the first half, so an agent reading "Mass lesion type: number" had
// no way to learn that 0, 2 and -3 are the only numbers that mean anything.
// Passing any other scored as if the finding were absent and returned a
// confident total: atlas-cdi took atl-abx = 9 where the options are 0 or 2 and
// answered ATLAS 4 instead of 6, valid: true. 234 of 560 such values changed
// the answer that way.
//
// `values` on a number field closes that, and this keeps it honest in both
// directions: a value the form does not offer must not be declared, and an
// option the form offers must not be left out -- an under-declared list is the
// worse failure, because it REJECTS a legal call.
//
// Read under perturbation, because some selects are repopulated by another
// field (rucam-course changes with the RUCAM scale) and a single snapshot of
// those would be too narrow.
//
// spec-v1106 widened it three ways, after spec-v1105 found a mismatch it could
// not see. All three are the same lesson in different clothes -- a check's REACH
// is part of its result (spec-v1099), and this one had been reporting clean over
// a question it was only asking of part of the catalog:
//
//   1. It filtered on `kind === 'number'`, so no ENUM field was ever compared.
//      `cauchy-frostbite`'s bone scan is an enum, and it declared five values
//      while the select offered four -- because one option read "Not done /
//      normal uptake", conflating a test that was not performed with one that
//      came back normal. While they shared an option, the tile could not tell
//      the reader which it had been given, so no honest footnote about the
//      outstanding test was possible (spec-v1105). Widening covered 917 tiles
//      the gate had not been looking at.
//
//   2. The perturbation moved selects and checkboxes and SKIPPED number inputs.
//      The header above gives `rucam-course` as the whole reason perturbation
//      exists, and the RUCAM scale is chosen by an R ratio computed from four
//      NUMBER inputs -- so the mechanism never did the thing it was documented
//      to do, and the two cholestatic options had been hand-waived in
//      spec-v770's own write-up rather than checked.
//
//   3. `read()` filtered the empty option out of the OFFERED list and nothing
//      filtered it out of the DECLARED one, so ten tiles that declare '' were
//      reported as short by exactly that. The empty option is not a value either
//      side claims: it is how a select says "not answered", and an agent says
//      the same by omitting the key.
//
// Together those took the run from 29 disagreements to 1.
//
// spec-v1169 widened it a FOURTH way, and this one is the reach question asked
// of the gate itself rather than of its filter. Everything above compares a
// DECLARED list against the rendered options; a field that declares no list at
// all was never a subject. 23 of them were selects: `kind: 'string'`, published
// to an agent as `{"type":"string","maxLength":2048}`, with the option set
// written out in English in the label -- and six of those labels named values
// the tile rejects (`nsa-cost-share` said "e.g. emergency, non-emergency,
// air-ambulance" for a picklist reading emergency / ancillary-in-network-
// facility / non-protected). So the second assertion below is not about
// agreement between two lists. It is that a field the tile renders as a
// PICKLIST must publish one.
import { test, expect } from '@playwright/test';
import { REGISTRY } from '../../mcp/tools.js';

// Fields whose select legitimately offers something the adapter does not accept.
// Keyed `tileId|dom`, and each needs the sentence: a bare id is a field somebody
// once looked at rather than a decision.
const OFFERS_MORE_THAN_IT_ACCEPTS = new Map([
  // A convenience control, not an input. Picking a Medicare locality fills the
  // three GPCI boxes from bundled data; the calculation takes the triplet, and
  // `toArgs` drops this field on the floor. So the option list is whatever the
  // bundled locality file happens to carry, and `values: ['manual']` says the
  // only mode an agent has is to pass the GPCIs itself. Resolving it properly
  // means teaching the adapter the locality table, which is a feature.
  ['rvu-payment|rvu-loc', 'a view-only mode whose options come from bundled GPCI data and which toArgs ignores'],
]);

test.skip(({ browserName }) => browserName !== 'chromium', 'catalog sweep is chromium-only');

test('every declared value list matches the options the tile renders', async ({ page }) => {
  test.setTimeout(600_000);

  const targets = [];
  for (const calc of REGISTRY.values()) {
    const doms = (calc.fields || [])
      // Two subjects in one pass, distinguished by `values`:
      //   an array -> the spec-v770 comparison, declared against offered.
      //   null     -> the spec-v1169 question, is this a picklist with nothing
      //               published? A `bool` is exempt: its schema is
      //               {"type":"boolean"} and its select is the two boolean
      //               values, so there is no vocabulary left to declare.
      .filter((f) => ((f.kind === 'number' || f.kind === 'enum') && Array.isArray(f.values))
        || (f.kind !== 'bool' && !Array.isArray(f.values)))
      .map((f) => ({ dom: f.dom, values: Array.isArray(f.values) ? f.values.map(String) : null }));
    if (doms.length) targets.push({ id: calc.id, doms });
  }
  // spec-v1106: the reach, asserted, so "clean" cannot come to mean "looked at
  // nothing". Before the enum widening this was 108 tiles.
  const declaring = targets.filter((t) => t.doms.some((d) => d.values));
  const undeclared = targets.filter((t) => t.doms.some((d) => !d.values));
  expect(declaring.length, 'the registry must carry declared value lists').toBeGreaterThan(800);
  // spec-v1169: and the second arm's reach, for the same reason. 887 tiles at
  // that wave, 2,935 fields -- almost all of them plain number inputs, which
  // render no options and produce no row.
  expect(undeclared.length, 'the registry must carry fields with no declared list').toBeGreaterThan(800);

  await page.goto('/');
  const wrong = [];
  const silent = [];
  for (const t of targets) {
    const got = await page.evaluate(async ({ id, doms, subjects }) => {
      const read = () => {
        const body = document.getElementById('tool-body');
        const m = {};
        for (const d of doms) {
          const n = body && body.querySelector(`#${CSS.escape(d)}`);
          if (n && n.tagName === 'SELECT') m[d] = [...n.options].map((o) => o.value).filter((v) => v !== '');
        }
        return m;
      };
      window.location.hash = '#' + id;
      await new Promise((r) => setTimeout(r, 40));
      const before = read();
      const body = document.getElementById('tool-body');
      for (const n of body.querySelectorAll('select, input')) {
        // spec-v1169: skip the fields being COMPARED, not every field being
        // read. The second arm added this tile's plain number inputs to `doms`,
        // and `rucam`'s scale is chosen by an R ratio computed from four of
        // them -- so skipping all of `doms` put the cholestatic options back out
        // of reach and undid the whole reason perturbation exists.
        if (subjects.includes(n.id)) continue;
        if (n.tagName === 'SELECT' && n.options.length > 1) n.selectedIndex = n.options.length - 1;
        else if (n.type === 'checkbox') n.checked = !n.checked;
        // spec-v1106: NUMBER inputs were skipped, and this gate's own header
        // gives `rucam-course` as the reason the perturbation exists -- a select
        // repopulated by another field. The RUCAM scale is chosen by an R ratio
        // computed from four number inputs, so the perturbation never moved it
        // and the two cholestatic options were never seen. Driving each number
        // to its own maximum (or a large value) crosses that kind of boundary.
        else if (n.type === 'number') n.value = n.max !== '' && n.max != null ? n.max : '999';
        else continue;
        n.dispatchEvent(new Event('input', { bubbles: true }));
        n.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await new Promise((r) => setTimeout(r, 60));
      const after = read();
      const union = {};
      for (const d of doms) union[d] = [...new Set([...(before[d] || []), ...(after[d] || [])])];
      return union;
    }, {
      id: t.id,
      doms: t.doms.map((d) => d.dom),
      subjects: t.doms.filter((d) => d.values).map((d) => d.dom),
    });

    for (const { dom, values } of t.doms) {
      const offered = got[dom];
      // A field the tile does not render as a select is not this gate's
      // business -- check-mcp-catalog owns whether it exists at all.
      if (!offered || !offered.length) continue;
      // spec-v1169: a picklist on the page and free text in the contract. The
      // agent's only vocabulary is then the label's prose, which nothing checks.
      if (!values) { silent.push({ id: t.id, dom, offered }); continue; }
      // spec-v1106: the empty option is not a VALUE either side is claiming --
      // it is how a select says "not answered", and an agent says the same by
      // omitting the key. `read()` already filters it out of the offered list;
      // filtering it out of the declared one too is the other half of that same
      // decision, and without it ten tiles that declare '' were reported as
      // offering one option fewer than they do.
      const declared = values.filter((v) => v !== '');
      const undeclared = offered.filter((v) => !declared.includes(v));
      const unoffered = declared.filter((v) => !offered.includes(v));
      if (OFFERS_MORE_THAN_IT_ACCEPTS.has(`${t.id}|${dom}`) && !unoffered.length) continue;
      if (undeclared.length || unoffered.length) {
        wrong.push({ id: t.id, dom, declared, offered, undeclared, unoffered });
      }
    }
  }

  expect(silent, 'fields the tile renders as a <select> while the registry declares no value list.\n'
    + 'An agent reading the schema is told free text, so the option set exists only in the\n'
    + "label's prose -- which nothing checks, and which was wrong on six of the 23 fields\n"
    + 'spec-v1169 found. Give the field `kind: \'enum\'` and a `values` list matching the\n'
    + 'options below; the first assertion in this file then keeps the two in step:\n'
    + JSON.stringify(silent, null, 2)).toEqual([]);

  expect(wrong, 'declared value lists that disagree with the rendered options.\n'
    + 'An "unoffered" value is a reader who cannot give an answer the tool accepts; an\n'
    + '"undeclared" one is a reader choosing an answer the tool would reject. Fixing either\n'
    + 'side is a fix. For a select the renderer populates from data the adapter does not have,\n'
    + 'add tileId|dom to OFFERS_MORE_THAN_IT_ACCEPTS above with a sentence saying why:\n'
    + JSON.stringify(wrong, null, 2)).toEqual([]);
});
