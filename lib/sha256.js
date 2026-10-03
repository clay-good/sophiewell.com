// spec-v1625: SHA-256, incremental, in plain JavaScript (FIPS 180-4).
//
// crypto.subtle.digest takes a whole buffer, and a hospital price file can be
// gigabytes, so receipts hash files in chunks with this instead. Pure: the same
// bytes give the same hex in the browser, its workers and Node, which is what a
// receipt checked on another machine needs.

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

export class Sha256 {
  constructor() {
    this.h = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
    this.buf = new Uint8Array(64);
    this.bufLen = 0;
    this.bytes = 0;
    this.w = new Uint32Array(64);
  }

  block(b, o) {
    const w = this.w;
    for (let i = 0; i < 16; i += 1) w[i] = (b[o + 4 * i] << 24) | (b[o + 4 * i + 1] << 16) | (b[o + 4 * i + 2] << 8) | b[o + 4 * i + 3];
    for (let i = 16; i < 64; i += 1) {
      const x = w[i - 15]; const y = w[i - 2];
      const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, bb, c, d, e, f, g, h] = this.h;
    for (let i = 0; i < 64; i += 1) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const t2 = (S0 + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
    }
    const H = this.h;
    H[0] += a; H[1] += bb; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
  }

  update(data) {
    const b = data instanceof Uint8Array ? data : new Uint8Array(data);
    this.bytes += b.length;
    let i = 0;
    if (this.bufLen) {
      const take = Math.min(64 - this.bufLen, b.length);
      this.buf.set(b.subarray(0, take), this.bufLen);
      this.bufLen += take;
      i = take;
      if (this.bufLen === 64) { this.block(this.buf, 0); this.bufLen = 0; }
    }
    for (; i + 64 <= b.length; i += 64) this.block(b, i);
    if (i < b.length) { this.buf.set(b.subarray(i), 0); this.bufLen = b.length - i; }
    return this;
  }

  hex() {
    const bits = this.bytes * 8;
    const pad = new Uint8Array(((this.bufLen < 56 ? 56 : 120) - this.bufLen) + 8);
    pad[0] = 0x80;
    const hi = Math.floor(bits / 2 ** 32);
    const n = pad.length;
    pad[n - 8] = hi >>> 24; pad[n - 7] = hi >>> 16; pad[n - 6] = hi >>> 8; pad[n - 5] = hi;
    pad[n - 4] = bits >>> 24; pad[n - 3] = bits >>> 16; pad[n - 2] = bits >>> 8; pad[n - 1] = bits;
    const bytes = this.bytes;
    this.update(pad);
    this.bytes = bytes;
    return [...this.h].map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }
}

export const sha256Hex = (data) => new Sha256().update(typeof data === 'string' ? new TextEncoder().encode(data) : data).hex();

// sha256Blob(blob) -> hex, reading 8 MB at a time.
export async function sha256Blob(blob, chunk = 8 * 1024 * 1024) {
  const h = new Sha256();
  for (let o = 0; o < blob.size; o += chunk) h.update(new Uint8Array(await blob.slice(o, o + chunk).arrayBuffer()));
  return h.hex();
}
