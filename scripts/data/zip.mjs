// scripts/data/zip.mjs -- spec-v1621 §2.
//
// A zero-dependency reader for the two archive formats the data pipeline
// meets: zip (every CMS download) and gzipped tar (FHIR packages from
// packages.fhir.org). Node built-ins only.
//
// Zip: read the end-of-central-directory record, walk the central directory,
// and inflate a member from its local header. Stored (0) and deflate (8) are
// the only methods CMS uses. Zip64 archives are refused by name rather than
// misread: a CMS file has never needed one.

import { inflateRawSync, gunzipSync } from 'node:zlib';

const EOCD = 0x06054b50;
const CEN = 0x02014b50;
const LOC = 0x04034b50;

function findEocd(buf) {
  // The EOCD is 22 bytes plus a comment of up to 65,535 bytes, at the end.
  const stop = Math.max(0, buf.length - 22 - 0xffff);
  for (let i = buf.length - 22; i >= stop; i -= 1) {
    if (buf.readUInt32LE(i) === EOCD) return i;
  }
  throw new Error('zip: no end-of-central-directory record (not a zip file, or truncated)');
}

// zipEntries(buf) -> [{ name, method, compressedSize, size, offset }]
export function zipEntries(bytes) {
  const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  const e = findEocd(buf);
  const count = buf.readUInt16LE(e + 10);
  let p = buf.readUInt32LE(e + 16);
  if (count === 0xffff || p === 0xffffffff) throw new Error('zip: zip64 archives are not supported');
  const out = [];
  for (let n = 0; n < count; n += 1) {
    if (buf.readUInt32LE(p) !== CEN) throw new Error(`zip: bad central directory entry ${n}`);
    const flags = buf.readUInt16LE(p + 8);
    const method = buf.readUInt16LE(p + 10);
    const compressedSize = buf.readUInt32LE(p + 20);
    const size = buf.readUInt32LE(p + 24);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const offset = buf.readUInt32LE(p + 42);
    // Bit 11: the name is UTF-8; otherwise CP437, which for CMS's ASCII names is the same.
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString(flags & 0x800 ? 'utf8' : 'latin1');
    if (compressedSize === 0xffffffff || size === 0xffffffff || offset === 0xffffffff) throw new Error(`zip: ${name} needs zip64`);
    out.push({ name, method, compressedSize, size, offset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

export function zipExtract(bytes, entry) {
  const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  const p = entry.offset;
  if (buf.readUInt32LE(p) !== LOC) throw new Error(`zip: bad local header for ${entry.name}`);
  const start = p + 30 + buf.readUInt16LE(p + 26) + buf.readUInt16LE(p + 28);
  const raw = buf.subarray(start, start + entry.compressedSize);
  let data;
  if (entry.method === 0) data = Buffer.from(raw);
  else if (entry.method === 8) data = inflateRawSync(raw);
  else throw new Error(`zip: ${entry.name} uses compression method ${entry.method}`);
  if (data.length !== entry.size) throw new Error(`zip: ${entry.name} inflated to ${data.length} bytes, expected ${entry.size}`);
  return data;
}

// zipFind(bytes, pattern) -> { entry, data } for the first member whose name
// matches. CMS member names vary in case and carry date stamps, so callers
// pass a regex, never an exact name. Directories are skipped.
export function zipFind(bytes, pattern) {
  const entry = zipEntries(bytes).find((x) => !x.name.endsWith('/') && pattern.test(x.name));
  return entry ? { entry, data: zipExtract(bytes, entry) } : null;
}

// tarEntries(tgzOrTar) -> [{ name, data }] for regular files. Handles ustar
// prefixes and pax `path` records, which npm-style FHIR packages can carry.
export function tarEntries(bytes, { gzipped = true } = {}) {
  const buf = gzipped ? gunzipSync(bytes) : (Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes));
  const out = [];
  let p = 0;
  let paxPath = null;
  const str = (a, b) => buf.subarray(a, b).toString('utf8').replace(/\0.*$/s, '');
  while (p + 512 <= buf.length) {
    const header = buf.subarray(p, p + 512);
    if (header.every((b) => b === 0)) break;
    const size = parseInt(str(p + 124, p + 136).trim() || '0', 8);
    const type = String.fromCharCode(buf[p + 156] || 48);
    const prefix = str(p + 345, p + 500);
    let name = str(p, p + 100);
    if (prefix) name = `${prefix}/${name}`;
    const dataStart = p + 512;
    const data = buf.subarray(dataStart, dataStart + size);
    if (type === 'x') {
      const m = /\d+ path=([^\n]*)\n/.exec(data.toString('utf8'));
      paxPath = m ? m[1] : null;
    } else if (type === '0' || type === '\0') {
      out.push({ name: paxPath || name, data: Buffer.from(data) });
      paxPath = null;
    } else {
      paxPath = null;
    }
    p = dataStart + Math.ceil(size / 512) * 512;
  }
  return out;
}
