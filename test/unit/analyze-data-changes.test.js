// Unit test for scripts/analyze-data-changes.mjs. Sets up two minimal
// dataset folders (previous and current) and asserts the script's
// Markdown output contains the expected diff signals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const SCRIPT = join(ROOT, 'scripts', 'analyze-data-changes.mjs');

async function setupFixture(rootDir, mpfsCf, hcpcsCodes, nadacRows) {
  await mkdir(join(rootDir, 'mpfs', 'shards'), { recursive: true });
  await writeFile(join(rootDir, 'mpfs', 'manifest.json'), JSON.stringify({
    dataset: 'mpfs',
    shards: [{ name: 'A.json', sha256: '' }],
    files: null,
  }, null, 2));
  await writeFile(join(rootDir, 'mpfs', 'shards', 'A.json'), JSON.stringify([
    { code: '99213', workRvu: 1.30, peRvuFacility: 0.46, peRvuNonFacility: 1.04, mpRvu: 0.10 },
  ]));
  await writeFile(join(rootDir, 'mpfs', 'conversion-factor.json'), JSON.stringify({
    conversionFactor: mpfsCf, effectiveDate: '2026-01-01', source: 'CMS',
  }));
  await mkdir(join(rootDir, 'hcpcs'), { recursive: true });
  await writeFile(join(rootDir, 'hcpcs', 'manifest.json'), JSON.stringify({
    dataset: 'hcpcs', files: ['hcpcs.json'],
  }));
  await writeFile(join(rootDir, 'hcpcs', 'hcpcs.json'),
    JSON.stringify(hcpcsCodes.map((code) => ({ code, short: 'x', long: 'x' }))));
  await mkdir(join(rootDir, 'nadac'), { recursive: true });
  await writeFile(join(rootDir, 'nadac', 'manifest.json'), JSON.stringify({
    dataset: 'nadac', files: ['nadac.json'],
  }));
  await writeFile(join(rootDir, 'nadac', 'nadac.json'), JSON.stringify(nadacRows));
}

test('analyze-data-changes: detects MPFS conversion factor change', async () => {
  const base = await mkdtemp(join(tmpdir(), 'sw-adc-'));
  const prev = join(base, 'prev'); const cur = join(base, 'cur');
  await setupFixture(prev, 32.7442, ['A0001'], [{ ndc: '1', drug: 'a', perUnit: 1.0 }]);
  await setupFixture(cur,  33.0721, ['A0001'], [{ ndc: '1', drug: 'a', perUnit: 1.0 }]);
  const r = spawnSync(process.execPath, [SCRIPT, '--previous', prev, '--current', cur], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Conversion factor changed from 32.7442 to 33.0721/);
  await rm(base, { recursive: true, force: true });
});

test('analyze-data-changes: detects HCPCS code adds and removes', async () => {
  const base = await mkdtemp(join(tmpdir(), 'sw-adc-'));
  const prev = join(base, 'prev'); const cur = join(base, 'cur');
  await setupFixture(prev, 32.0, ['A0001', 'A0002'], []);
  await setupFixture(cur,  32.0, ['A0001', 'A0003'], []);
  const r = spawnSync(process.execPath, [SCRIPT, '--previous', prev, '--current', cur], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /\+1 added, -1 removed/);
  assert.match(r.stdout, /A0003/);
  assert.match(r.stdout, /A0002/);
  await rm(base, { recursive: true, force: true });
});

test('analyze-data-changes: detects NADAC top price changes', async () => {
  const base = await mkdtemp(join(tmpdir(), 'sw-adc-'));
  const prev = join(base, 'prev'); const cur = join(base, 'cur');
  const prevDrugs = [{ ndc: '0001-0001-01', drug: 'pillX', perUnit: 0.10 }];
  const curDrugs  = [{ ndc: '0001-0001-01', drug: 'pillX', perUnit: 0.20 }];
  await setupFixture(prev, 32.0, [], prevDrugs);
  await setupFixture(cur,  32.0, [], curDrugs);
  const r = spawnSync(process.execPath, [SCRIPT, '--previous', prev, '--current', cur], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Top price changes/);
  assert.match(r.stdout, /pillX/);
  await rm(base, { recursive: true, force: true });
});

test('analyze-data-changes: no previous flag prints sizes-only mode', async () => {
  const base = await mkdtemp(join(tmpdir(), 'sw-adc-'));
  const cur = join(base, 'cur');
  await setupFixture(cur, 32.0, ['A0001'], []);
  const r = spawnSync(process.execPath, [SCRIPT, '--current', cur], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /No previous data folder supplied/);
  await rm(base, { recursive: true, force: true });
});
