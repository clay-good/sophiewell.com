// spec-v1403: an optional sex must not be answered as one sex.
//
// The page preselects a sex; the agent tool may omit an optional one. ewgsop2 read a blank as male
// (a woman's 20 kg grip was "low strength" against the male 27) and masld-criteria read it as female
// (the HDL cut and the MetALD alcohol band). The same shape was fixed before on findrisc
// (spec-v1166) and lvh-criteria (spec-v1116).
//
// For every tool whose adapter leaves `sex` optional, run its worked example without a sex, as
// male, and as female. Where male and female answer differently, a blank must not answer exactly
// like either of them: it asks, or it gives an answer that holds for both.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { META } from '../../lib/meta.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'mcp', 'adapters');
const strip = (r) => JSON.stringify(r, (k, v) => (k === 'note' || k === 'postureNote' ? undefined : v));

test('an optional sex is never answered as one sex', async () => {
  const offenders = [];
  let reach = 0;
  for (const file of readdirSync(DIR).filter((f) => f.endsWith('.js')).sort()) {
    const mod = await import(pathToFileURL(join(DIR, file)).href);
    for (const e of mod.default || []) {
      const sx = (e.fields || []).find((f) => f.arg === 'sex');
      if (!sx || sx.required) continue;
      const ex = META[e.id]?.example?.fields;
      if (!ex) continue;
      const args = {};
      for (const f of e.fields) if (ex[f.dom] !== undefined && f.arg !== 'sex') args[f.arg] = ex[f.dom];
      const run = (a) => (e.toArgs ? e.compute(e.toArgs(a)) : e.compute(a));
      reach++;
      const blank = run(args);
      if (!blank || blank.valid === false) continue;
      const male = strip(run({ ...args, sex: 'male' }));
      const female = strip(run({ ...args, sex: 'female' }));
      if (male === female) continue;
      const b = strip(blank);
      if (b === male) offenders.push(`${e.id}: a blank sex answers as male (${file})`);
      if (b === female) offenders.push(`${e.id}: a blank sex answers as female (${file})`);
    }
  }
  assert.ok(reach >= 10, `reach collapsed to ${reach} tools; the check is no longer looking`);
  assert.deepEqual(offenders, []);
});
