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
      // spec-v915: the browser has its own copy of this map, because app.js reads no
      // JSON at runtime. An alias in one and not the other is the split this pair
      // exists to prevent -- an agent self-heals to the survivor while a reader
      // following the same permalink lands on the home page with no explanation.
      const appSrc = await readFile(join(ROOT, 'app.js'), 'utf8');
      const start = appSrc.indexOf('const RETIRED_TILE_ALIASES = new Map([');
      if (start === -1) {
        if (Object.keys(aliases).length) errors.push('app.js has no RETIRED_TILE_ALIASES map, so a retired id resolves for agents and not for readers');
      } else {
        const body = appSrc.slice(start, appSrc.indexOf(']);', start));
        const inApp = new Map([...body.matchAll(/\['([a-z0-9-]+)',\s*'([a-z0-9-]+)'\]/g)].map((m) => [m[1], m[2]]));
        for (const [oldId, rec] of Object.entries(aliases)) {
          if (!inApp.has(oldId)) errors.push(`id-alias "${oldId}" is in data/id-aliases.json and not in app.js RETIRED_TILE_ALIASES`);
          else if (inApp.get(oldId) !== rec.canonical) errors.push(`id-alias "${oldId}" points at "${rec.canonical}" for agents and "${inApp.get(oldId)}" for readers`);
        }
        for (const [oldId] of inApp) {
          if (!aliases[oldId]) errors.push(`app.js RETIRED_TILE_ALIASES has "${oldId}" and data/id-aliases.json does not`);
        }
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

  // 7. The one number mcp/README.md states about the code rather than about
  // the catalog. It read "22 verified templates" while lib/query-compute.js
  // shipped 21 -- a count nothing checked, so it drifted the moment a template
  // was added or dropped. Checked here for the same reason every visible tile
  // count is checked in check-catalog-truth: a number a reader can see and a
  // gate cannot is a number that will be wrong.
  if (await exists('mcp/README.md')) {
    const readme = await readFile(join(ROOT, 'mcp', 'README.md'), 'utf8');
    const claimed = readme.match(/Tries\s+(\d+)\s+verified templates/);
    const { _testing } = await import(new URL('../lib/query-compute.js', import.meta.url).href);
    const actual = (_testing && _testing.TEMPLATES || []).length;
    if (!claimed) {
      errors.push('mcp/README.md no longer states how many verified templates answer_query tries');
    } else if (Number(claimed[1]) !== actual) {
      errors.push(`mcp/README.md says ${claimed[1]} verified templates; lib/query-compute.js ships ${actual}`);
    }

    // The other two numbers on that page an agent acts on: how many tools the
    // surface has, and which error codes it can branch on. Both are written
    // out in prose, both would go stale the first time a tool or a code was
    // added, and an agent that trusts a stale list writes a broken client.
    const { TOOL_DEFS } = await import(new URL('../mcp/tools.js', import.meta.url).href);
    const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
    const said = readme.match(/A fixed ([a-z]+)-tool surface/);
    if (!said) {
      errors.push('mcp/README.md no longer states how many tools the surface has');
    } else if (said[1] !== WORDS[TOOL_DEFS.length]) {
      errors.push(`mcp/README.md calls it a ${said[1]}-tool surface; mcp/tools.js ships ${TOOL_DEFS.length}`);
    }
    const rows = [...readme.matchAll(/^\| `([a-z_]+)` \|/gm)].map((m) => m[1]);
    const listed = new Set(rows);
    for (const t of TOOL_DEFS) {
      if (!listed.has(t.name)) errors.push(`mcp/README.md's tool table does not list ${t.name}`);
    }
    for (const r of rows) {
      if (!TOOL_DEFS.some((t) => t.name === r)) errors.push(`mcp/README.md's tool table lists ${r}, which the server does not serve`);
    }
    // The codes the server actually returns, read out of the server rather
    // than kept in a second list that can disagree with it. The README named
    // nine of the twelve; an agent branching on `code` never learned that
    // `AMBIGUOUS`, `MISSING_INPUTS` or `NO_VALUES` could come back.
    const served = new Set();
    for (const f of ['tools.js', 'server.js', 'catalog.js', 'fields.js']) {
      if (!(await exists(join('mcp', f)))) continue;
      const src = await readFile(join(ROOT, 'mcp', f), 'utf8');
      for (const m of src.matchAll(/code: '([A-Z_]{3,})'/g)) served.add(m[1]);
    }
    const codeLine = readme.match(/branch without parsing prose: ([^.]+)\./);
    const named = codeLine ? codeLine[1].match(/[A-Z_]{3,}/g) || [] : [];
    if (!codeLine) errors.push('mcp/README.md no longer lists the error codes a client can branch on');
    for (const c of served) {
      if (!named.includes(c)) errors.push(`mcp/README.md does not name the error code ${c}`);
    }
    for (const c of named) {
      if (!served.has(c)) errors.push(`mcp/README.md names an error code the server never returns: ${c}`);
    }
  }

  if (errors.length) {
    console.error('check-mcp-catalog: violations.');
    for (const err of errors) console.error(`  ${err}`);
    process.exit(1);
  }
  console.log(`check-mcp-catalog: clean (${entries.length} adapters across ${seenModules.size} modules, ledger exact, examples round-trip, no DOM coupling).`);
}

main().catch((err) => { console.error('check-mcp-catalog: error', err && err.stack ? err.stack : err); process.exit(2); });
