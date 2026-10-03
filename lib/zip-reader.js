// spec-v1623 step 1 / spec-v1611 §4: read a zip archive the reader dropped,
// in the browser, with no library. The central directory at the end of the
// file lists the members; each is inflated with DecompressionStream
// ('deflate-raw'), streamed, so a large member never sits in memory twice.
// Stored and deflate members only. Works on any Blob (a File is one), and in
// Node 22, which has Blob and DecompressionStream too.
//
// Limits are refused with a reason, never silently skipped: a member that
// would inflate more than MAX_RATIO times its compressed size is treated as a
// zip bomb, and the members together may not exceed MAX_TOTAL bytes.

export const MAX_RATIO = 100;
export const MAX_TOTAL = 4 * 1024 ** 3;

const EOCD = 0x06054b50;
const CEN = 0x02014b50;
const LOC = 0x04034b50;

async function bytesOf(blob, start, end) {
  return new Uint8Array(await blob.slice(start, end).arrayBuffer());
}
const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

// zipMembers(blob) -> [{ name, method, compressedSize, size, offset, dir }]
// Throws when the archive has no readable central directory.
export async function zipMembers(blob) {
  const tailStart = Math.max(0, blob.size - 22 - 0xffff);
  const tail = await bytesOf(blob, tailStart, blob.size);
  let e = -1;
  for (let i = tail.length - 22; i >= 0; i -= 1) if (u32(tail, i) === EOCD) { e = i; break; }
  if (e === -1) throw new Error('This is not a readable zip archive (no central directory).');
  const count = u16(tail, e + 10);
  const cdSize = u32(tail, e + 12);
  const cdOffset = u32(tail, e + 16);
  if (count === 0xffff || cdOffset === 0xffffffff) throw new Error('This zip uses the zip64 format, which is not read here.');
  const cd = await bytesOf(blob, cdOffset, cdOffset + cdSize);
  const dec = new TextDecoder();
  const out = [];
  let p = 0;
  for (let k = 0; k < count; k += 1) {
    if (u32(cd, p) !== CEN) throw new Error('The zip central directory is damaged.');
    const nameLen = u16(cd, p + 28);
    const name = dec.decode(cd.subarray(p + 46, p + 46 + nameLen));
    out.push({
      name,
      method: u16(cd, p + 10),
      compressedSize: u32(cd, p + 20),
      size: u32(cd, p + 24),
      offset: u32(cd, p + 42),
      dir: name.endsWith('/'),
    });
    p += 46 + nameLen + u16(cd, p + 30) + u16(cd, p + 32);
  }
  return out;
}

// refusal(members) -> a sentence when the archive breaks a limit, else null.
export function refusal(members) {
  let total = 0;
  for (const m of members) {
    if (m.dir) continue;
    total += m.size;
    if (m.compressedSize > 0 && m.size / m.compressedSize > MAX_RATIO) {
      return `${m.name} would expand more than ${MAX_RATIO} times its compressed size, which is how a zip bomb looks, so the archive was not opened.`;
    }
    if (m.compressedSize === 0 && m.size > 0) return `${m.name} claims ${m.size} bytes from none, so the archive was not opened.`;
  }
  if (total > MAX_TOTAL) return `The archive would expand to more than 4 GB, so it was not opened.`;
  return null;
}

// memberBlob(blob, member) -> Blob of the member's uncompressed bytes.
// Stored members are a slice (no copy); deflate members are streamed through
// DecompressionStream. Unsupported methods throw with the method named.
export async function memberBlob(blob, m) {
  const head = await bytesOf(blob, m.offset, m.offset + 30);
  if (u32(head, 0) !== LOC) throw new Error(`The zip entry for ${m.name} is damaged.`);
  const start = m.offset + 30 + u16(head, 26) + u16(head, 28);
  const raw = blob.slice(start, start + m.compressedSize);
  if (m.method === 0) return raw;
  if (m.method !== 8) throw new Error(`${m.name} uses a compression method (${m.method}) that is not read here.`);
  const stream = raw.stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).blob();
}

// gunzipBlob(blob) -> Blob, streamed through DecompressionStream('gzip').
export async function gunzipBlob(blob) {
  return new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).blob();
}
