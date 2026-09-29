// spec-v1623 step 2 / spec-v1611 §4: the inventory of everything a reader
// dropped -- files, folders, zips inside zips -- each recognized from its head.
// Runs in the intake worker, and in Node for tests and MCP (Blob and
// DecompressionStream exist in both). Nothing leaves the tab; nothing here
// reads more than a head of any file except to unpack an archive member.

import { recognize, recognizeArchive, LIMITS } from './file-kinds.js';
import { readHead } from './file-head.js';
import { zipMembers, memberBlob, refusal, gunzipBlob } from './zip-reader.js';
import { CSV_TOOLS } from './upload-fields.js';

// Hidden and system files are skipped and counted, never recognized.
export function isSkipped(path) {
  const parts = String(path).split('/').filter(Boolean);
  const base = parts.at(-1) || '';
  return base.startsWith('.') || parts.includes('__MACOSX') || /^(thumbs\.db|desktop\.ini)$/i.test(base);
}

const baseName = (p) => String(p).split('/').filter(Boolean).at(-1) || String(p);

// inventory(entries) -> { rows, skipped, refused, limitReached }
//   entries: [{ file: Blob, name, relativePath? }]
//   rows: [{ path, name, size, container, kind, label, family, confidence,
//            evidence, tools, ambiguous, candidates, headers }]
//   refused: [{ path, reason }] -- an archive or member that broke a limit
export async function inventory(entries, { csvTools = CSV_TOOLS, limits = LIMITS } = {}) {
  const rows = [];
  const refused = [];
  let skipped = 0;
  let limitReached = null;
  const queue = entries.map((e) => ({ blob: e.file, path: e.relativePath || e.name, depth: (e.relativePath || '').split('/').length - 1, container: null }));
  while (queue.length) {
    const item = queue.shift();
    if (isSkipped(item.path)) { skipped += 1; continue; }
    if (item.depth > limits.maxDepth) { refused.push({ path: item.path, reason: `It is nested more than ${limits.maxDepth} folders or archives deep.` }); continue; }
    if (rows.length >= limits.maxFiles) { limitReached = `Only the first ${limits.maxFiles.toLocaleString('en-US')} files were read; drop the rest separately.`; break; }
    const name = baseName(item.path);
    let res;
    try {
      res = recognize(await readHead(item.blob, limits.headBytes), { name, size: item.blob.size }, { csvTools });
    } catch (err) {
      refused.push({ path: item.path, reason: `It could not be read (${err.message}).` });
      continue;
    }
    if (res.kind === 'zip') {
      let members;
      try { members = await zipMembers(item.blob); } catch (err) { refused.push({ path: item.path, reason: err.message }); continue; }
      const whole = recognizeArchive(members.map((m) => m.name), { name });
      if (whole) { rows.push(row(item, name, whole)); continue; }
      const bomb = refusal(members);
      if (bomb) { refused.push({ path: item.path, reason: bomb }); continue; }
      for (const m of members) {
        if (m.dir) continue;
        const path = `${item.path}/${m.name}`;
        if (isSkipped(path)) { skipped += 1; continue; }
        try {
          queue.push({ blob: await memberBlob(item.blob, m), path, depth: item.depth + 1 + m.name.split('/').length - 1, container: item.path });
        } catch (err) { refused.push({ path, reason: err.message }); }
      }
      continue;
    }
    if (res.kind === 'gzip') {
      try {
        queue.push({ blob: await gunzipBlob(item.blob), path: item.path.replace(/\.gz$/i, ''), depth: item.depth + 1, container: item.path });
      } catch (err) { refused.push({ path: item.path, reason: `The gzip file could not be unpacked (${err.message}).` }); }
      continue;
    }
    rows.push(row(item, name, res));
  }
  return { rows, skipped, refused, limitReached };
}

function row(item, name, res) {
  return {
    path: item.path, name, size: item.blob.size, container: item.container,
    kind: res.kind, label: res.label, family: res.family, confidence: res.confidence,
    evidence: res.evidence, tools: res.tools, ambiguous: Boolean(res.ambiguous),
    candidates: res.candidates || null, headers: res.headers || null, transactionText: res.transactionText || null,
    // The bytes themselves, so a row (a zip member included) can be handed to
    // the tool that opens it. A Blob survives postMessage; it never leaves the tab.
    blob: item.blob,
  };
}
