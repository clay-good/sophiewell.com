// Numerical correctness sweep. For every tool that ships a META.example, we
// click "Test with example", read the rendered output, and assert that every
// numeric token from the documented expected string appears in the result.
//
// Numbers (integers, decimals, percentages) are highly diagnostic: if the
// calculator silently computes the wrong value, the expected numbers won't
// appear in the rendered output and this test fails loudly.
//
// This is a complement to the per-function unit tests, which assert the
// JS layer in isolation. This sweep asserts the wiring all the way through:
// example payload -> input fill -> renderer -> live-render listener -> DOM.
//
// SHARDED, because the wall-clock grows linearly with the catalog and the
// timeout was becoming a ratchet. This was one serial test whose budget had been
// raised four times (600s -> 900s -> 1200s -> 1800s), each bump made reactively
// after a contended run tipped over; at 1638 tiles a clean chromium-only run was
// 28.6 min against the 1800s cap, leaving ~84 seconds of headroom and shrinking
// by roughly a second per tile added. Raising it a fifth time would buy another
// few months of the same problem.
//
// Instead the catalog is split across SHARDS tests by index. `fullyParallel` is
// already on in playwright.config.js, so the shards run on separate workers and
// wall-clock drops by about the shard count. Nothing about the assertions
// changes -- every tile is still visited exactly once, and every numeric fact is
// still checked the same way -- so this is a scheduling change, not a coverage
// one. A tile's shard is `index % SHARDS`, which keeps each shard's mix of slow
// and fast tiles even without needing to know how long any tile takes.
//
// Raise SHARDS if the per-shard runtime approaches its budget again. That is a
// cheap, non-reactive knob; the old single timeout was not.

import { test, expect } from '@playwright/test';

// Split the catalog this many ways. Each shard visits every SHARDS-th tile.
const SHARDS = 4;

// Per-shard budget. A shard is ~1/SHARDS of the serial sweep, so this is
// generous headroom rather than a ceiling being approached. A real numeric
// mismatch still fails fast (per-tile), never via this timeout.
const SHARD_TIMEOUT_MS = 900_000;

// Skip in firefox/webkit; the long serial loop is unreliable there
// (see test/integration/tool-interactions.spec.js for the same rationale).
test.skip(({ browserName }) => browserName !== 'chromium', 'numeric sweep is chromium-only');

// Pull all numeric values out of a string, returning [{value, raw, isApprox,
// isPercent, rangeEnd}]. Skips citation years and explicit ranges' second
// halves, and recognizes "~" / "approx" markers.
function numericFacts(s) {
  const facts = [];
  // Match optional ~ then a number then optional % or range "-N"
  const re = /(~)?(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?(\s*%)?/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const raw = m[0];
    const value = Number(m[2]);
    // Skip 4-digit year-shaped integers (citation years).
    if (Number.isInteger(value) && value >= 1900 && value <= 2100 && /^\d{4}$/.test(m[2])) continue;
    // spec-v1023: a digit glued to a letter is part of a LABEL, not a value --
    // "T1 discordance" is a trimester, "G2" a GOLD grade, "S3" a heart sound.
    // Those were the reason whole tiles sat in SCENARIO_ONLY below, which
    // exempted every real number in the same sentence along with them.
    const before = s[m.index + (m[1] ? m[1].length : 0) - 1];
    if (before && /[A-Za-z]/.test(before)) continue;
    facts.push({
      value,
      raw,
      isApprox: !!m[1],
      rangeEnd: m[3] ? Number(m[3]) : null,
      isPercent: !!m[4],
    });
  }
  return facts;
}

function toleranceWindow(fact) {
  // Tolerance: explicit ~ means +/-15%; ranges accept any value in range;
  // otherwise +/-2% relative or 0.05 absolute (whichever is larger), so
  // 5.0 matches 5 and 2.0 matches 2 and 22.86 matches 22.9.
  const tol = fact.isApprox ? Math.max(Math.abs(fact.value) * 0.15, 1)
            : Math.max(Math.abs(fact.value) * 0.02, 0.05);
  const lo = fact.rangeEnd != null ? Math.min(fact.value, fact.rangeEnd) - tol : fact.value - tol;
  const hi = fact.rangeEnd != null ? Math.max(fact.value, fact.rangeEnd) + tol : fact.value + tol;
  return [lo, hi];
}

// spec-v1048: every documented number needs its OWN number in the output.
//
// This used to ask, of each expected fact independently, "does SOME number in
// the output fall in its window?" -- so one output number could satisfy several
// expected ones. ranson-bisap documented "Ranson 2 - roughly 2% mortality" while
// the tile printed "Ranson 2 - <1% mortality", and the sweep passed it for two
// years: the 2 from the SCORE satisfied the 2 from the MORTALITY. The tile
// disagreed with its own interpretation table, printed directly beneath.
//
// A matching, not a search. Each fact is an edge to the output numbers it could
// be, and the assertion is that a perfect matching exists on the facts' side --
// standard augmenting-path search, on lists of at most a few dozen.
function allFactsMatchDistinctly(haystack, facts) {
  const nums = [...haystack.matchAll(/\d+(?:\.\d+)?/g)].map((x) => Number(x[0]));
  const windows = facts.map(toleranceWindow);
  const takenBy = new Array(nums.length).fill(-1);
  const augment = (fi, seen) => {
    for (let ni = 0; ni < nums.length; ni += 1) {
      if (seen[ni]) continue;
      const [lo, hi] = windows[fi];
      if (!(nums[ni] >= lo && nums[ni] <= hi)) continue;
      seen[ni] = true;
      if (takenBy[ni] === -1 || augment(takenBy[ni], seen)) { takenBy[ni] = fi; return true; }
    }
    return false;
  };
  for (let fi = 0; fi < facts.length; fi += 1) {
    if (!augment(fi, new Array(nums.length).fill(false))) return facts[fi];
  }
  return null;
}

function findNumberNear(haystack, fact) {
  const [lo, hi] = toleranceWindow(fact);
  const found = [...haystack.matchAll(/\d+(?:\.\d+)?/g)].map((x) => Number(x[0]));
  return found.some((n) => n >= lo && n <= hi);
}

// META examples whose `expected` text describes scenario inputs or
// citation-derived reference numbers rather than the calculator's actual
// output. The numeric sweep can't validate these without misfiring; the
// unit tests in test/unit/ cover their math.
const SCENARIO_ONLY = new Set([
  // expected echoes input scenario, tool only renders the result
  // (vasopressor: the "70 kg" weight is an input the output never echoes, and
  // the drug select is populated async from a data shard the static sweep
  // can't reliably drive; the mcp round-trip + unit tests cover the math)
  'conc-rate', 'opioid-mme', 'free-water-deficit', 'vasopressor',
  // expected describes the reference band, not the computed cell
  'rcri',
  // spec-v752: four more of the same kind, surfaced when the `Example:
  // <expected>` lede came off the tool view. Every one of these numbers is
  // prose -- a regulation, a source's criteria count, a trimester label, a
  // protocol hour -- not a cell the tile computes, so the numeric sweep was
  // never validating them; it was reading them back out of the lede's copy of
  // the expected string. Their math is covered by unit tests.
  //   hipaa-auth          "45 CFR 164.508" is the regulation the letter cites
  //   vent-sbt-peep       "all 5 Boles 2007 criteria" counts the source's list
  //   sepsis-bundle-clock "hour-1 elements", "at 6 h" name SSC bundle windows
  //
  // spec-v1023: preg-dating is NO LONGER HERE. Its skip was granted for the "1"
  // inside the trimester label "T1", and it exempted the rest of the sentence
  // with it -- including "~3 days", the discordance the tile actually computes.
  // The tile printed 172 days for two years (spec-v1018) and this sweep had
  // nothing to say, because one label had bought the whole tile a pass. A digit
  // glued to a letter is now skipped as a token, not as a tile.
  'hipaa-auth', 'vent-sbt-peep', 'sepsis-bundle-clock',
  // expected includes derivation breakdown the tool doesn't echo
  'maint-fluids', 'iron-ganzoni',
  // expected hour-band is local-tz-dependent (datetime-local input,
  // ISO output uses runner's offset); the unit test asserts the
  // math directly.
  'ews-escalation',
  // spec-v52 wave 52-1b: pa-lint is a document-linter tile (shape:
  // document-linter); its output is computed at file-drop time, not
  // from a META.example.fields payload, and its expected text is
  // descriptive (mentions "SHA-256" and "spec-v29 §3"). The numeric
  // sweep can't drive a file-drop, so this tile is allowlisted; the
  // unit tests cover the hashing path indirectly via crypto.subtle.
  'pa-lint',
  // phq9 renders via the generic renderScreener (radio inputs keyed to
  // renderScreener's own ids); the numeric sweep sets input.value and can't
  // select radios, so the example is driven through the mcp round-trip and the
  // scoring-v4 screener unit tests instead.
  'phq9', 'gad7', 'epds', 'auditc', 'cage',
  // spec-v1048 exempted lab-interpret here; spec-v1054 un-exempted it by pressing
  // the button the tile asks you to press. It is checked like any other tile now.
]);

// Pull META.example payloads out of the live module so the test stays in
// sync with whatever lib/meta.js currently declares -- no duplication.
async function loadExamples(page) {
  await page.goto('/');
  const examples = await page.evaluate(async () => {
    const mod = await import('/lib/meta.js');
    const out = [];
    for (const [id, m] of Object.entries(mod.META)) {
      if (m && m.example && m.example.expected) {
        out.push({ id, expected: m.example.expected });
      }
    }
    return out;
  });
  expect(examples.length).toBeGreaterThan(40);
  return examples;
}

async function checkTile(page, id, expected) {
  const facts = numericFacts(expected);
  if (facts.length === 0) return null;

  await page.goto('/#' + id, { waitUntil: 'load' });
  await page.waitForTimeout(60);

  // spec-v9 §3.3: examples are prefilled on load and a "Reset to
  // example" link restores them. Click the link to re-apply the
  // example so the test is robust even if defaults change later.
  const resetLink = page.locator('.example-reset').first();
  if (!(await resetLink.isVisible().catch(() => false))) {
    return { id, reason: 'no example reset link rendered' };
  }
  await resetLink.click();
  await page.waitForTimeout(120);

  // spec-v1054: a tile that renders nothing until a button is pressed was being
  // "verified" against the values in its own input boxes.
  //
  // Eleven tiles compute on a click rather than on input -- ten document builders
  // ("Build printable letter") and lab-interpret ("Interpret values"). This sweep
  // filled the example, read a result region that was still empty, fell through to
  // the input-value haystack (added in spec-v752 for examples that name their own
  // inputs), matched the numbers there, and passed. lab-interpret's documented
  // range "(4.0-5.6%)" was being satisfied by the 5.4 sitting in the A1C field.
  //
  // So press the button. One click, only when the region is empty, on a label the
  // tile itself chose -- which turns eleven tiles from silently unverified into
  // actually checked.
  const resultEmpty = await page.evaluate(() => {
    const q = document.querySelector('#q-results') || document.querySelector('.screener-result');
    return !q || !(q.textContent || '').trim();
  });
  if (resultEmpty) {
    const generate = page.locator('#tool-body button', { hasText: /^(Build|Generate|Interpret)/ }).first();
    if (await generate.count()) {
      await generate.click().catch(() => {});
      await page.waitForTimeout(200);
    }
  }

  const text = await page.locator('main').innerText();
  const cleaned = text.replace(/Expected:[^\n]*/g, '');
  const unmatched = (haystack) => {
    const loose = facts.filter((f) => !findNumberNear(haystack, f)).map((f) => f.raw);
    if (loose.length) return loose;
    // spec-v1048: every fact accounted for individually, but do they have
    // DISTINCT numbers to be? If not, one output number is standing in for two
    // documented ones and the sweep is passing on a coincidence.
    const clash = allFactsMatchDistinctly(haystack, facts);
    return clash ? [`${clash.raw} (no number of its own; another documented value is using it)`] : [];
  };
  let missing = unmatched(cleaned);

  // spec-v752: an example's documented output routinely names its own INPUTS
  // -- "15 kg x 20 mL/kg = 300 mL bolus" -- and an input's value is not text,
  // so innerText never saw the 15. Until now that did not show, because the
  // tool view printed `Example: <expected>` above the fields and this sweep
  // was matching the expected string against a verbatim copy of ITSELF. That
  // lede is gone, and 19 tiles turned out to be leaning on it.
  //
  // So when the rendered text alone does not account for every number, look
  // in the fields before calling it a failure. Done only on the miss path:
  // reading values for every tile added a second round trip each and pushed
  // the sweep past its wall-clock cap for no benefit, since the great majority
  // of tiles state their numbers in the output.
  if (missing.length) {
    const values = await page.locator('main').evaluate((root) => {
      const parts = [];
      for (const node of root.querySelectorAll('input, select, textarea')) {
        if (node.type === 'checkbox' || node.type === 'radio') continue;
        if (node.tagName === 'SELECT') {
          const opt = node.selectedOptions && node.selectedOptions[0];
          if (opt) parts.push(opt.textContent);
        }
        if (node.value) parts.push(String(node.value));
      }
      return parts.join(' \n');
    });
    missing = unmatched(`${cleaned}\n${values}`);
  }

  if (missing.length) {
    return { id, expected, missing, got: cleaned.slice(0, 400) };
  }
  return null;
}

for (let shard = 0; shard < SHARDS; shard++) {
  test(`every example payload produces the documented numeric output (shard ${shard + 1} of ${SHARDS})`, async ({ page }) => {
    test.setTimeout(SHARD_TIMEOUT_MS);

    const examples = await loadExamples(page);

    const failures = [];
    for (let i = 0; i < examples.length; i++) {
      if (i % SHARDS !== shard) continue;
      const { id, expected } = examples[i];
      if (SCENARIO_ONLY.has(id)) continue;
      const failure = await checkTile(page, id, expected);
      if (failure) failures.push(failure);
    }

    if (failures.length) {
      console.log(`CORRECTNESS FAILURES (shard ${shard + 1}/${SHARDS}):\n` + JSON.stringify(failures, null, 2));
    }
    expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
  });
}
