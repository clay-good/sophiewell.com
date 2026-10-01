// spec-v1604 tool 4: MCP adapter for pharmacy-spread-check. The dom key mirrors views/group-v1604.js. The
// NADAC week is the data/nadac shards the website ships, read from disk for the labelers the claims name.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as SP from '../../lib/pharmacy-spread-check.js';
import { shardName } from '../../lib/nadac-margin.js';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data', 'nadac');
const readJson = (rel) => JSON.parse(readFileSync(join(DATA, rel), 'utf8'));

function compute(a) {
  const first = SP.pharmacySpreadCheck(a);
  if (!first.needLabelers) return first;
  let nadac;
  try {
    const manifest = readJson('manifest.json');
    const shards = new Map();
    for (const lab of first.needLabelers) {
      const file = join('shards', shardName(lab));
      if (existsSync(join(DATA, file))) shards.set(lab, readJson(file));
    }
    nadac = SP.nadacFrom(manifest, readJson('week.json'), first.needLabelers, shards);
  } catch {
    nadac = { status: 'unavailable' };
  }
  return SP.pharmacySpreadCheck({ ...a, nadac });
}

export default [
  {
    id: 'pharmacy-spread-check',
    summary: 'A health plan\'s pharmacy claims against NADAC. What the plan and members paid above the national average acquisition cost, by drug and by month, and the PBM spread where the pharmacy payment is disclosed.',
    compute,
    fields: [
      { dom: 'psc-claims', arg: 'claims', kind: 'string', required: true, label: 'Claims, one per line: NDC, quantity, fill date, plan paid, member paid, pharmacy paid (optional)' },
    ],
  },
];
