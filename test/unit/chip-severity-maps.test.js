// A status chip's severity is authored per tile: the view declares a map from
// the tier its compute returns to one of the four severity tokens. If that map
// misses a tier -- a typo, or a tier added to the compute later -- the lookup
// yields undefined and `resultRow` renders NO chip for that band. Nothing else
// fails: the tile still computes, the band still reads, and the chip is simply
// absent for exactly the patients in the missed tier.
//
// So the map's key set must be exactly the set of tiers its compute can return.
// Both are read from source: the tier literals the lib assigns, and the keys
// the view's map declares.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const PAIRS = [
  ['lib/heckerling-pneumonia-v673.js', 'views/group-v673.js', 'HECKERLING_SEVERITY'],
  ['lib/opioid-risk-tool-v709.js', 'views/group-v709.js', 'ORT_SEVERITY'],
  ['lib/ausdrisk-v711.js', 'views/group-v711.js', 'AUSDRISK_SEVERITY'],
  ['lib/pederson-difficulty-v717.js', 'views/group-v717.js', 'PEDERSON_SEVERITY'],
  ['lib/loe-silness-gingival-index-v722.js', 'views/group-v722.js', 'GI_SEVERITY'],
  ['lib/isi-v726.js', 'views/group-v726.js', 'ISI_SEVERITY'],
];

const TOKENS = new Set(['low', 'moderate', 'high', 'critical']);
const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

// The tier literals a compute assigns: `tier: 'x'`, wherever it bands.
const tiersIn = (src) => new Set([...src.matchAll(/\btier:\s*'([^']+)'/g)].map((m) => m[1]));

// The map the view declares, as `{ key: ['token', 'Label'], ... }`.
function mapIn(src, name) {
  const m = new RegExp(`const ${name} = \\{([^;]*)\\};`).exec(src);
  assert.ok(m, `${name} is not declared as a single-statement object literal`);
  const entries = [...m[1].matchAll(/'?([A-Za-z][A-Za-z0-9-]*)'?:\s*\['([^']+)',\s*'([^']+)'\]/g)];
  return new Map(entries.map((e) => [e[1], { token: e[2], label: e[3] }]));
}

for (const [libPath, viewPath, mapName] of PAIRS) {
  test(`${mapName} covers every tier ${libPath.split('/').pop()} can return`, () => {
    const tiers = tiersIn(read(libPath));
    const map = mapIn(read(viewPath), mapName);
    assert.ok(tiers.size >= 2, `${libPath}: expected a banded compute, found tiers ${[...tiers]}`);

    const missing = [...tiers].filter((t) => !map.has(t));
    assert.deepEqual(missing, [], `${mapName} has no entry for ${missing.join(', ')} -- those bands would show no chip`);

    const stale = [...map.keys()].filter((k) => !tiers.has(k));
    assert.deepEqual(stale, [], `${mapName} maps ${stale.join(', ')}, which the compute never returns`);
  });

  test(`${mapName} uses only real severity tokens, and every chip carries a word`, () => {
    for (const [tier, { token, label }] of mapIn(read(viewPath), mapName)) {
      assert.ok(TOKENS.has(token), `${mapName}.${tier} -> '${token}' is not a severity token; styles.css defines ${[...TOKENS].join(', ')}`);
      assert.ok(label.trim().length > 0, `${mapName}.${tier} has an empty label; a chip must never be color alone`);
    }
  });
}
