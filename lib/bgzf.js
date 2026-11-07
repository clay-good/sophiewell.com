// BGZF, the blocked gzip every bgzipped .vcf.gz is written in (SAMv1 §4.1, hts-specs, read November 7,
// 2026): "a series of concatenated BGZF blocks, each no larger than 64 KiB", each "a spec-compliant gzip
// archive", whose FEXTRA field carries the subfield SI1 = 66, SI2 = 67 ('BC') with BSIZE, "total Block SIZE
// minus 1". DecompressionStream('gzip') decodes one gzip member and throws on the next (tested in Chrome 152
// and Node 26), so a BGZF file is split here at each BSIZE and every block is decoded on its own.
// Pure: Blob and DecompressionStream only, so it runs in the intake worker and in Node.

// SAMv1 §4.1.2: the 28-byte empty block that ends a well-formed file.
export const BGZF_EOF = Uint8Array.from([
  0x1f, 0x8b, 0x08, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x06, 0x00, 0x42, 0x43,
  0x02, 0x00, 0x1b, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

const bytesAt = async (blob, start, end) => new Uint8Array(await blob.slice(start, end).arrayBuffer());

// blockLengthAt(blob, offset) -> the whole block's length in bytes, or null when the gzip member that
// starts there has no BC subfield (not BGZF, or not gzip at all).
async function blockLengthAt(blob, offset) {
  const h = await bytesAt(blob, offset, offset + 12);
  if (h.length < 12 || h[0] !== 0x1f || h[1] !== 0x8b || h[2] !== 8 || !(h[3] & 4)) return null;
  const xlen = h[10] | (h[11] << 8);
  const x = await bytesAt(blob, offset + 12, offset + 12 + xlen);
  for (let p = 0; p + 4 <= x.length;) {
    const slen = x[p + 2] | (x[p + 3] << 8);
    if (x[p] === 66 && x[p + 1] === 67 && slen === 2 && p + 6 <= x.length) return (x[p + 4] | (x[p + 5] << 8)) + 1;
    p += 4 + slen;
  }
  return null;
}

const inflate = (part) => new Response(part.stream().pipeThrough(new DecompressionStream('gzip'))).blob();

// readBgzf(blob) -> { blob, blocks, eofMarker }, or null when the file does not start with a BGZF block
// (the caller then reads it as ordinary gzip). Throws with the byte offset when a block is damaged.
export async function readBgzf(blob) {
  const parts = [];
  let offset = 0;
  let lastStart = 0;
  let lastLength = 0;
  while (offset < blob.size) {
    const length = await blockLengthAt(blob, offset);
    if (length === null) {
      if (offset === 0) return null;
      throw new Error(`the BGZF data is damaged at byte ${offset}: no block starts there`);
    }
    if (offset + length > blob.size) throw new Error(`the BGZF data is damaged at byte ${offset}: its block runs past the end of the file`);
    parts.push(await inflate(blob.slice(offset, offset + length)));
    lastStart = offset;
    lastLength = length;
    offset += length;
  }
  let eofMarker = lastLength === BGZF_EOF.length;
  if (eofMarker) {
    const tail = await bytesAt(blob, lastStart, lastStart + lastLength);
    eofMarker = tail.every((b, i) => b === BGZF_EOF[i]);
  }
  return { blob: new Blob(parts), blocks: parts.length, eofMarker };
}
