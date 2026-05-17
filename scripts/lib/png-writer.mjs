// Pure-Node PNG encoder. Emits an 8-bit-per-channel RGBA PNG with a
// single IDAT chunk (filter type 0 = none per scanline, then deflated).
//
// No third-party deps: just node:zlib for compression. The CI image is
// stock Ubuntu with no `sharp`, no `sips`, and no font system, so this
// is the encoder Sophie's OG card pipeline ships against.

import { deflateSync } from 'node:zlib';
import { Buffer } from 'node:buffer';

// CRC32 (PNG polynomial 0xEDB88320). Lazily computed table.
let CRC_TABLE = null;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      CRC_TABLE[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)) >>> 0;
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// Encode an RGBA pixel buffer (width*height*4 bytes, row-major,
// top-to-bottom) as a PNG byte stream.
export function encodePNG(width, height, rgba) {
  if (rgba.length !== width * height * 4) {
    throw new Error(`encodePNG: buffer size ${rgba.length} != ${width * height * 4}`);
  }
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;     // bit depth
  ihdr[9] = 6;     // color type: truecolor + alpha
  ihdr[10] = 0;    // compression
  ihdr[11] = 0;    // filter
  ihdr[12] = 0;    // interlace
  // Prepend filter byte (0 = none) to each scanline.
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const dst = y * (1 + width * 4);
    raw[dst] = 0;
    rgba.copy ? rgba.copy(raw, dst + 1, y * width * 4, (y + 1) * width * 4)
              : raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), dst + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Allocate an RGBA buffer filled with a solid color.
export function makeCanvas(width, height, rgba) {
  const buf = Buffer.alloc(width * height * 4);
  const [r, g, b, a] = rgba;
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
  }
  return buf;
}

// Fill a solid rectangle (clipped to canvas).
export function fillRect(buf, bufW, bufH, x, y, w, h, rgba) {
  const [r, g, b, a] = rgba;
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  const x1 = Math.min(bufW, x + w);
  const y1 = Math.min(bufH, y + h);
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      const idx = (py * bufW + px) * 4;
      buf[idx] = r; buf[idx + 1] = g; buf[idx + 2] = b; buf[idx + 3] = a;
    }
  }
}
