// Builds a zip archive in memory, byte by byte (local headers, central
// directory, end record), so the data pipeline's zip reader is tested against
// the real layout without committing binary fixtures. method 0 = stored,
// 8 = deflate.

import { deflateRawSync, crc32 } from 'node:zlib';

export function makeZip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, data, method = 8, modified = null } of files) {
    const raw = Buffer.from(data);
    const body = method === 8 ? deflateRawSync(raw) : raw;
    const nameBuf = Buffer.from(name);
    const loc = Buffer.alloc(30);
    loc.writeUInt32LE(0x04034b50, 0); loc.writeUInt16LE(20, 4); loc.writeUInt16LE(method, 8);
    loc.writeUInt32LE(crc32(raw), 14); loc.writeUInt32LE(body.length, 18); loc.writeUInt32LE(raw.length, 22);
    loc.writeUInt16LE(nameBuf.length, 26);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(method, 10);
    // `modified`, a Date, as the MS-DOS date and time fields (read back as UTC by zipEntries).
    if (modified) {
      cen.writeUInt16LE((modified.getUTCHours() << 11) | (modified.getUTCMinutes() << 5) | (modified.getUTCSeconds() >> 1), 12);
      cen.writeUInt16LE(((modified.getUTCFullYear() - 1980) << 9) | ((modified.getUTCMonth() + 1) << 5) | modified.getUTCDate(), 14);
    }
    cen.writeUInt32LE(crc32(raw), 16); cen.writeUInt32LE(body.length, 20); cen.writeUInt32LE(raw.length, 24);
    cen.writeUInt16LE(nameBuf.length, 28); cen.writeUInt32LE(offset, 42);
    locals.push(loc, nameBuf, body);
    centrals.push(cen, nameBuf);
    offset += 30 + nameBuf.length + body.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(files.length, 8); eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cd.length, 12); eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, eocd]);
}
