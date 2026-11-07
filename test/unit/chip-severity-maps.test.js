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
  ['lib/k6-v735.js', 'views/group-v735.js', 'K6_SEVERITY'],
  ['lib/phq15-v734.js', 'views/group-v734.js', 'PHQ15_SEVERITY'],
  ['lib/sad-persons-v701.js', 'views/group-v701.js', 'SAD_PERSONS_SEVERITY'],
  ['lib/mcmahon-rhabdo-v677.js', 'views/group-v677.js', 'MCMAHON_SEVERITY'],
  ['lib/bewe-v715.js', 'views/group-v715.js', 'BEWE_SEVERITY'],
  ['lib/osi-onychomycosis-v674.js', 'views/group-v674.js', 'OSI_SEVERITY'],
  ['lib/cobb-angle-v694.js', 'views/group-v694.js', 'COBB_SEVERITY'],
  ['lib/hhie-s-v728.js', 'views/group-v728.js', 'HHIE_SEVERITY'],
  ['lib/smast-v737.js', 'views/group-v737.js', 'SMAST_SEVERITY'],
  ['lib/meld3-v678.js', 'views/group-v678.js', 'MELD3_SEVERITY'],
  ['lib/qcsi-v698.js', 'views/group-v698.js', 'QCSI_SEVERITY'],
  ['lib/elemental-iron-ingested-v687.js', 'views/group-v687.js', 'IRON_SEVERITY'],
  ['lib/prostate-health-index-v714.js', 'views/group-v714.js', 'PHI_SEVERITY'],
  ['lib/forrest-classification-v809.js', 'views/group-v809.js', 'FORREST_SEVERITY'],
];

const TOKENS = new Set(['low', 'moderate', 'high', 'critical']);
const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

// The tier literals a compute assigns: `tier: 'x'`, wherever it bands.
const tiersIn = (src) => new Set([...src.matchAll(/\btier:\s*'([^']+)'/g)].map((m) => m[1]));

// A view reads the tier off whichever field its compute exposes -- `r.tier`
// for most, `r.category` for the two that name it that way. The lookup field
// has to be the one the compute actually fills: reading an absent field yields
// undefined, which renders no chip on every band at once.
function lookupFieldIn(src, name) {
  const m = new RegExp(`${name}\\[r\\.([A-Za-z][A-Za-z0-9]*)\\]`).exec(src);
  assert.ok(m, `${name} is never used to look up a tier`);
  return m[1];
}

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

  test(`${mapName} is looked up on a field ${libPath.split('/').pop()} fills`, () => {
    const viewSrc = read(viewPath);
    const field = lookupFieldIn(viewSrc, mapName);
    const libSrc = read(libPath);
    // The compute must return that field, assigned from a banding result.
    const assigns = new RegExp(`^\\s+${field}: `, 'm').test(libSrc);
    assert.ok(assigns, `${libPath} never returns \`${field}\`, so ${mapName}[r.${field}] is always undefined`);
  });

  test(`${mapName} uses only real severity tokens, and every chip carries a word`, () => {
    for (const [tier, { token, label }] of mapIn(read(viewPath), mapName)) {
      assert.ok(TOKENS.has(token), `${mapName}.${tier} -> '${token}' is not a severity token; styles.css defines ${[...TOKENS].join(', ')}`);
      assert.ok(label.trim().length > 0, `${mapName}.${tier} has an empty label; a chip must never be color alone`);
    }
  });
}
