// spec-v1623 step 1 / spec-v1611 §2.1: read an X12 interchange envelope from
// the head of a file. Pure; no DOM. The full per-transaction parsers stay in
// lib/x12-*-v1515.js -- this reads only enough to say what the file is.
//
// An interchange begins with a fixed-width ISA segment of 106 characters: the
// character at offset 3 is the element separator and appears exactly 16 times
// in it, ISA16 (offset 104) is the component separator, and the character
// after it (offset 105) ends the segment. GS and ST are then read with those
// separators.

const ISA_LENGTH = 106;

// readEnvelope(text) -> null when the text is not an X12 interchange, else
// { elementSep, segmentSep, componentSep, sender, receiver,
//   groups: [{ gs01, gs08, sets: [st01, ...] }], transactions, complete }
// `complete` is false when the head ended before the IEA trailer, so counts
// are "at least".
export function readEnvelope(input) {
  const text = String(input || '').replace(/^﻿/, '').replace(/^\s+/, '');
  if (!text.startsWith('ISA') || text.length < ISA_LENGTH) return null;
  const elementSep = text[3];
  if (/[A-Za-z0-9\s]/.test(elementSep)) return null;
  const isa = text.slice(0, ISA_LENGTH);
  let seps = 0;
  for (const c of isa.slice(0, ISA_LENGTH - 1)) if (c === elementSep) seps += 1;
  if (seps !== 16 || isa[103] !== elementSep) return null;
  const componentSep = isa[104];
  const segmentSep = isa[105];
  if (componentSep === elementSep || segmentSep === elementSep || /[A-Za-z0-9]/.test(segmentSep)) return null;
  const isaFields = isa.slice(0, ISA_LENGTH - 1).split(elementSep);
  const groups = [];
  let transactions = 0;
  let complete = false;
  for (const raw of text.slice(ISA_LENGTH).split(segmentSep)) {
    const seg = raw.replace(/^[\r\n]+/, '');
    if (!seg) continue;
    const el = seg.split(elementSep);
    if (el[0] === 'GS') groups.push({ gs01: (el[1] || '').trim(), gs08: (el[8] || '').trim(), sets: [] });
    else if (el[0] === 'ST') {
      transactions += 1;
      const g = groups.at(-1);
      if (g) g.sets.push((el[1] || '').trim());
      else groups.push({ gs01: '', gs08: '', sets: [(el[1] || '').trim()] });
    } else if (el[0] === 'IEA') complete = true;
  }
  return {
    elementSep, segmentSep, componentSep,
    sender: (isaFields[6] || '').trim(), receiver: (isaFields[8] || '').trim(),
    groups, transactions, complete,
  };
}
