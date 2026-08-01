#!/usr/bin/env node
// spec-v183 §4: MCP catalog gate.
//
// Asserts the optional stdio MCP surface stays single-sourced and honest:
//   1. every adapter id exists in app.js UTILITIES (enforced at registry load);
//   2. every exposed id carries the domain-correct disclaimer (spec-v629:
//      clinical tiles the clinical disclaimer, non-clinical the admin one);
//   3. docs/mcp-coverage.md "Exposed" list equals the live adapter set exactly;
//   4. every adapter's META.example round-trips through compute_calculator
//      (every numeric token in example.expected appears in the result, the same
//      numeric-correctness contract as the e2e example-correctness sweep);
//   5. no adapter compute module references a DOM global (bare-Node safety);
//   6. each adapter declares a valid JSON Schema and a summary (load-time).
//
// The MCP subtree is optional and deletable (spec-v183 §3): if mcp/ is absent
// this gate is a clean no-op so `npm run lint` stays green with or without it.

import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

async function exists(rel) {
  try { await access(join(ROOT, rel), constants.F_OK); return true; } catch { return false; }
}

// Numeric-fact extraction + tolerant match, mirroring
// test/integration/example-correctness.spec.js so the MCP round-trip enforces
// the same numeric-correctness contract on the JSON surface.
function numericFacts(s) {
  const facts = [];
  const re = /(~)?(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?(\s*%)?/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const value = Number(m[2]);
    if (Number.isInteger(value) && value >= 1900 && value <= 2100 && /^\d{4}$/.test(m[2])) continue;
    facts.push({ value, raw: m[0], isApprox: !!m[1], rangeEnd: m[3] ? Number(m[3]) : null });
  }
  return facts;
}
function findNumberNear(haystack, fact) {
  const tol = fact.isApprox ? Math.max(Math.abs(fact.value) * 0.15, 1) : Math.max(Math.abs(fact.value) * 0.02, 0.05);
  const lo = (fact.rangeEnd != null ? Math.min(fact.value, fact.rangeEnd) : fact.value) - tol;
  const hi = (fact.rangeEnd != null ? Math.max(fact.value, fact.rangeEnd) : fact.value) + tol;
  const found = [...haystack.matchAll(/\d+(?:\.\d+)?/g)].map((x) => Number(x[0]));
  return found.some((n) => n >= lo && n <= hi);
}

// Parse the backtick-wrapped ids under the "## Exposed" heading of the ledger.
function parseLedgerExposed(text) {
  const ids = new Set();
  const start = text.indexOf('## Exposed');
  if (start === -1) throw new Error('mcp-catalog: "## Exposed" heading not found in docs/mcp-coverage.md');
  const end = text.indexOf('\n## ', start + 1);
  const section = text.slice(start, end === -1 ? undefined : end);
  for (const m of section.matchAll(/^-\s+`([a-z0-9_-]+)`/gm)) ids.add(m[1]);
  return ids;
}

// Static no-DOM scan: a pure compute module must not touch a browser global.
function scansForDomGlobal(libText) {
  const re = /\bdocument\.[A-Za-z_$]|\bwindow\.[A-Za-z_$]|getElementById|\blocalStorage\b|\bsessionStorage\b/;
  return re.test(libText);
}

async function main() {
  if (!(await exists('mcp/catalog.js'))) {
    console.log('check-mcp-catalog: mcp/ absent, skipping (optional subtree, spec-v183 section 3).');
    return;
  }

  const errors = [];

  // Importing the registry runs checks 1, 2, and the structural half of 6
  // (id in UTILITIES, clinical:true, summary present); a failure throws.
  const catalog = await import('../mcp/catalog.js');
  const meta = (await import('../lib/meta.js')).META;
  const tools = await import('../mcp/tools.js');
  const entries = catalog.allCalculators();

  // 3. Ledger exposed-set equals the live adapter set exactly.
  const ledgerText = await readFile(join(ROOT, 'docs/mcp-coverage.md'), 'utf8');
  const ledger = parseLedgerExposed(ledgerText);
  const live = new Set(entries.map((e) => e.id));
  for (const id of live) if (!ledger.has(id)) errors.push(`ledger missing exposed id: ${id}`);
  for (const id of ledger) if (!live.has(id)) errors.push(`ledger lists ${id} but it is not in the live adapter set`);

  // spec-v637 §2: id-aliases accountability. Each alias must map a RETIRED id
  // (not a live one) to a LIVE canonical successor, so an agent's hardcoded old
  // id self-heals and no alias silently shadows a real tile. Optional file.
  if (await exists('data/id-aliases.json')) {
    try {
      const aliasDoc = JSON.parse(await readFile(join(ROOT, 'data/id-aliases.json'), 'utf8'));
      const aliases = (aliasDoc && typeof aliasDoc.aliases === 'object' && aliasDoc.aliases) || {};
      for (const [oldId, rec] of Object.entries(aliases)) {
        if (live.has(oldId)) errors.push(`id-alias "${oldId}" shadows a live tile id (an alias must map a retired id)`);
        if (!rec || typeof rec.canonical !== 'string') { errors.push(`id-alias "${oldId}" has no canonical id`); continue; }
        if (rec.canonical === oldId) errors.push(`id-alias "${oldId}" points to itself`);
        if (!live.has(rec.canonical)) errors.push(`id-alias "${oldId}" canonical "${rec.canonical}" is not a live exposed id`);
      }
    } catch (err) {
      errors.push(`data/id-aliases.json is not valid JSON: ${err && err.message ? err.message : err}`);
    }
  }

  // spec-v632: waiver-ledger accountability. Every catalog tile is either exposed
  // or listed in docs/mcp-waivers.md with a reason -- so no computational tile can
  // silently ship without an MCP adapter. exposed and waived must not overlap.
  const WAIVER_REASONS = new Set([
    'template-generator', 'bespoke-shape', 'redundant', 'wrong-input-modality',
    'pending-adapter', 'time-dependent', 'outputs-recommendation', 'static-reference',
  ]);
  const appText = await readFile(join(ROOT, 'app.js'), 'utf8');
  const uStart = appText.indexOf('const UTILITIES = [');
  const allIds = new Set();
  if (uStart !== -1) {
    let depth = 0; let k = appText.indexOf('[', uStart); let uEnd = -1;
    for (; k < appText.length; k += 1) { const ch = appText[k]; if (ch === '[') depth += 1; else if (ch === ']') { depth -= 1; if (depth === 0) { uEnd = k; break; } } }
    const uBody = appText.slice(uStart, uEnd);
    const uRe = /\{\s*id:\s*'([^']+)',\s*name:\s*'((?:\\.|[^'])*)',\s*group:\s*'([^']*)'[^}]*?clinical:\s*(true|false)\b/g;
    let um;
    while ((um = uRe.exec(uBody)) !== null) allIds.add(um[1]);
  }
  if (!(await exists('docs/mcp-waivers.md'))) {
    errors.push('spec-v632: docs/mcp-waivers.md is missing');
  } else {
    const wText = await readFile(join(ROOT, 'docs/mcp-waivers.md'), 'utf8');
    const wStart = wText.indexOf('## Waived');
    const wSection = wStart === -1 ? '' : wText.slice(wStart);
    const waived = new Set();
    // Ledger lines are `- <id> - <reason>`; the separator is a plain hyphen.
    for (const m of wSection.matchAll(/^-\s+`([a-z0-9_-]+)`\s+-\s+([a-z-]+)\s*$/gm)) {
      const id = m[1];
      const reason = m[2];
      if (waived.has(id)) errors.push(`waiver: duplicate entry for ${id}`);
      waived.add(id);
      if (!WAIVER_REASONS.has(reason)) errors.push(`waiver: ${id} has unknown reason "${reason}"`);
      if (!allIds.has(id)) errors.push(`waiver: ${id} is not a catalog tile`);
      if (live.has(id)) errors.push(`waiver: ${id} is waived but also exposed -- retire the waiver`);
    }
    for (const id of allIds) {
      if (!live.has(id) && !waived.has(id)) {
        errors.push(`accountability: ${id} is neither exposed nor waived -- add an mcp adapter or a docs/mcp-waivers.md entry`);
      }
    }
  }

  // 5. No-DOM scan of each distinct compute module.
  const seenModules = new Map(); // module rel-path -> ok
  for (const e of entries) {
    const rel = `lib/${e.module}.js`;
    if (!seenModules.has(rel)) {
      const text = await readFile(join(ROOT, rel), 'utf8');
      seenModules.set(rel, !scansForDomGlobal(text));
    }
    if (!seenModules.get(rel)) errors.push(`${e.id}: compute module ${rel} references a DOM global (not bare-Node safe)`);
  }

  // 6. Valid JSON Schema + summary per adapter.
  for (const e of entries) {
    const s = e.inputSchema;
    if (!s || s.type !== 'object' || typeof s.properties !== 'object') errors.push(`${e.id}: invalid inputSchema`);
    if (typeof e.summary !== 'string' || e.summary.length < 8) errors.push(`${e.id}: missing summary`);
  }

  // 2b. spec-v629: describe reports the domain-correct disclaimer for each tile.
  for (const e of entries) {
    const d = tools.describeCalculator({ id: e.id });
    const expectedDomain = e.clinical ? 'clinical' : 'administrative';
    if (d.domain !== expectedDomain) errors.push(`${e.id}: domain "${d.domain}" != expected "${expectedDomain}"`);
    if (typeof d.disclaimer !== 'string' || d.disclaimer.length < 20) errors.push(`${e.id}: missing/short disclaimer`);
  }

  // 4. Example round-trip: every numeric fact in expected appears in the result.
  for (const e of entries) {
    const ex = meta[e.id] && meta[e.id].example;
    if (!ex || !ex.fields || !ex.expected) { errors.push(`${e.id}: no META.example to round-trip`); continue; }
    const r = tools.computeCalculator({ id: e.id, inputs: ex.fields });
    if (!r.valid) { errors.push(`${e.id}: example did not compute: ${r.message}`); continue; }
    const serialized = JSON.stringify(r.result);
    const missing = numericFacts(ex.expected).filter((f) => !findNumberNear(serialized, f)).map((f) => f.raw);
    if (missing.length) errors.push(`${e.id}: example expected numbers not in result: ${missing.join(', ')}`);
  }

  if (errors.length) {
    console.error('check-mcp-catalog: violations.');
    for (const err of errors) console.error(`  ${err}`);
    process.exit(1);
  }
  console.log(`check-mcp-catalog: clean (${entries.length} adapters across ${seenModules.size} modules, ledger exact, examples round-trip, no DOM coupling).`);
}

main().catch((err) => { console.error('check-mcp-catalog: error', err && err.stack ? err.stack : err); process.exit(2); });
