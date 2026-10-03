// spec-v1505 tool 3: MCP adapter for lcd-diagnosis-check. The dom keys mirror views/group-v1505.js. The
// articles are the data/mcd-articles shards the website ships, read from disk.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as LC from '../../lib/lcd-diagnosis-check.js';
import { datasetStatus, EXPIRED_TEXT } from '../../lib/data.js';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data', 'mcd-articles');
const readJson = (rel) => JSON.parse(readFileSync(join(DATA, rel), 'utf8'));

function compute(a) {
  const code = LC.normalizeCode(a.code);
  if (!code) return LC.lcdDiagnosisCheck(a);
  let manifest;
  try { manifest = readJson('manifest.json'); } catch { return LC.lcdDiagnosisCheck({ ...a, articles: undefined }); }
  if (datasetStatus(manifest).status === 'expired') return { valid: false, message: `${EXPIRED_TEXT} Check the articles in the Medicare Coverage Database instead.` };
  const index = readJson('index.json');
  const ids = [...new Set((index[code] || []).map(([id]) => id))];
  const articles = ids.flatMap((id) => (existsSync(join(DATA, 'shards', `${id}.json`)) ? readJson(join('shards', `${id}.json`)) : [])).filter((x) => ids.includes(x.id));
  return LC.lcdDiagnosisCheck({ ...a, articles, edition: manifest.sourceEdition });
}

export default [
  {
    id: 'lcd-diagnosis-check',
    summary: 'Whether a diagnosis supports a HCPCS or CPT code under the Medicare billing and coding articles for a state. The Medicare Coverage Database code and ICD-10-CM groups, paired by group.',
    compute,
    fields: [
      { dom: 'lcd-code', arg: 'code', kind: 'string', required: true, label: 'HCPCS or CPT code' },
      { dom: 'lcd-dx', arg: 'diagnoses', kind: 'string', required: true, label: 'ICD-10-CM diagnosis codes, separated by commas' },
      { dom: 'lcd-state', arg: 'state', kind: 'enum', required: true, values: LC.STATES.map((s) => s.value), label: 'State where the service is furnished' },
    ],
  },
];
