// spec-v1604 tool 3: MCP adapter for claims-pct-medicare. The dom keys mirror views/group-v1604.js. The fee
// schedule is the data/mpfs files the website ships, read from disk for the codes the claims name.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { claimsPctMedicare } from '../../lib/claims-pct-medicare.js';
import { shardOf } from '../../lib/mpfs-load.js';
import { datasetStatus } from '../../lib/data.js';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data', 'mpfs');
const readJson = (rel) => JSON.parse(readFileSync(join(DATA, rel), 'utf8'));
const LOCALITIES = readJson('gpci.json');

function compute(a) {
  const first = claimsPctMedicare(a);
  if (!first.needCodes) return first;
  let mpfs;
  try {
    const manifest = readJson('manifest.json');
    if (datasetStatus(manifest).status === 'expired') mpfs = { status: 'expired' };
    else {
      const rows = {};
      for (const code of first.needCodes) {
        const file = join('shards', shardOf(code));
        if (existsSync(join(DATA, file))) { const hits = readJson(file).filter((r) => r.code === code); if (hits.length) rows[code] = hits; }
      }
      mpfs = { status: 'ok', rows, localities: LOCALITIES, conversionFactor: readJson('conversion-factor.json').conversionFactor, edition: manifest.sourceEdition };
    }
  } catch {
    mpfs = { status: 'unavailable' };
  }
  return claimsPctMedicare({ ...a, mpfs });
}

export default [
  {
    id: 'claims-pct-medicare',
    summary: 'What a health plan paid as a percent of Medicare. Each professional claim line repriced at the Medicare physician fee schedule for one locality, summed by provider and by service category; lines that cannot be repriced are left out and counted with their reason.',
    compute,
    fields: [
      { dom: 'cpm-claims', arg: 'claims', kind: 'string', required: true, label: 'Claim lines, one per line: service date, provider, code, place of service, allowed amount, units, modifiers' },
      { dom: 'cpm-locality', arg: 'locality', kind: 'string', required: true, label: `Medicare locality: state and locality number, as TX-18 (one of ${LOCALITIES.length} physician fee schedule localities)` },
    ],
  },
];
