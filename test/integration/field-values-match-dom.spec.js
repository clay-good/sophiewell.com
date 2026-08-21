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
import { test, expect } from '@playwright/test';
import { REGISTRY } from '../../mcp/tools.js';

test.skip(({ browserName }) => browserName !== 'chromium', 'catalog sweep is chromium-only');

test('every declared value list matches the options the tile renders', async ({ page }) => {
  test.setTimeout(600_000);

  const targets = [];
  for (const calc of REGISTRY.values()) {
    const doms = (calc.fields || [])
      .filter((f) => f.kind === 'number' && Array.isArray(f.values))
      .map((f) => ({ dom: f.dom, values: f.values }));
    if (doms.length) targets.push({ id: calc.id, doms });
  }
  expect(targets.length, 'the registry must carry declared value lists').toBeGreaterThan(50);

  await page.goto('/');
  const wrong = [];
  for (const t of targets) {
    const got = await page.evaluate(async ({ id, doms }) => {
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
        if (doms.includes(n.id)) continue;
        if (n.tagName === 'SELECT' && n.options.length > 1) n.selectedIndex = n.options.length - 1;
        else if (n.type === 'checkbox') n.checked = !n.checked;
        else continue;
        n.dispatchEvent(new Event('input', { bubbles: true }));
        n.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await new Promise((r) => setTimeout(r, 60));
      const after = read();
      const union = {};
      for (const d of doms) union[d] = [...new Set([...(before[d] || []), ...(after[d] || [])])];
      return union;
    }, { id: t.id, doms: t.doms.map((d) => d.dom) });

    for (const { dom, values } of t.doms) {
      const offered = got[dom];
      // A field the tile does not render as a select is not this gate's
      // business -- check-mcp-catalog owns whether it exists at all.
      if (!offered || !offered.length) continue;
      const undeclared = offered.filter((v) => !values.includes(v));
      const unoffered = values.filter((v) => !offered.includes(v));
      if (undeclared.length || unoffered.length) {
        wrong.push({ id: t.id, dom, declared: values, offered, undeclared, unoffered });
      }
    }
  }

  expect(wrong, `declared value lists that disagree with the rendered options:\n${JSON.stringify(wrong, null, 2)}`).toEqual([]);
});
