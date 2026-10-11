// spec-v1641 row 22: one parser for every NDC a tool takes.
//
// Today an NDC is 10 digits on the label (4-4-2, 5-3-2 or 5-4-1) and 11 digits in billing (5-4-2).
// FDA's final rule (91 FR 10749, March 5, 2026, read October 10, 2026) makes every NDC 12 digits in
// one 6-4-2 format: "This rule is effective March 7, 2033." Existing NDCs are converted "by adding
// leading zeros to the labeler code, product code, and/or package code segments as needed," and
// FDA considers the two "the same NDC with different formats." A 3-year transition follows the
// effective date, in which FDA "does not intend to object to continued use of" 10-digit NDCs on
// the labeling of products remaining in interstate commerce.
//
// Every tool parses through splitNdc, so the 2033 change is an edit to this file. Pure: no DOM.

import { todayUtc } from './pa/date.js';

export const NDC12_EFFECTIVE = '2033-03-07';

const SHAPES = new Set(['4-4-2', '5-3-2', '5-4-1', '5-4-2', '6-4-2']);

// splitNdc(raw) -> { labeler, product, package, source } with the segments padded to 6, 4 and 2
// digits, or { error: code } where code is blank | non-digit | segments | shape | bare10 | length.
// `shape` and `length` ride along for the caller's message. Ten bare digits cannot be placed (each
// label layout pads a different segment) and are refused rather than guessed.
export function splitNdc(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return { error: 'blank' };
  let parts = s.split(/[-\s]+/);
  if (parts.some((p) => !/^\d+$/.test(p))) return { error: 'non-digit' };
  let source;
  if (parts.length === 1) {
    if (s.length === 10) return { error: 'bare10' };
    if (s.length !== 11 && s.length !== 12) return { error: 'length', length: s.length };
    const lab = s.length - 6;
    parts = [s.slice(0, lab), s.slice(lab, lab + 4), s.slice(lab + 4)];
    source = `${lab}-4-2`;
  } else {
    if (parts.length !== 3) return { error: 'segments' };
    source = parts.map((p) => p.length).join('-');
    if (!SHAPES.has(source)) return { error: 'shape', shape: source };
  }
  return { labeler: parts[0].padStart(6, '0'), product: parts[1].padStart(4, '0'), package: parts[2].padStart(2, '0'), source };
}

// The 12-digit form, hyphenated 6-4-2.
export const ndc12Of = (p) => `${p.labeler}-${p.product}-${p.package}`;

// The 11 billing digits, or null when the labeler code has six significant digits: such an NDC
// has no 10- or 11-digit form. FDA assigns only 5-digit labeler codes today, so none exists yet.
export const ndc11Of = (p) => (p.labeler.startsWith('0') ? `${p.labeler.slice(1)}${p.product}${p.package}` : null);

// ndc12Status(now) -> whether the 12-digit format is in effect on that day, and the sentence to print.
export function ndc12Status(now) {
  const today = todayUtc(now).toISOString().slice(0, 10);
  const inEffect = today >= NDC12_EFFECTIVE;
  return {
    inEffect,
    effective: NDC12_EFFECTIVE,
    text: inEffect
      ? 'The 12-digit format has been in effect since March 7, 2033 (91 FR 10749). For 3 years after that date FDA does not intend to object to 10-digit NDCs assigned earlier staying on the labeling of products already in interstate commerce. Both forms are the same NDC.'
      : 'The 12-digit format is not yet in effect: FDA\'s final rule (91 FR 10749) takes effect March 7, 2033, with a 3-year transition after that date. Until then use the 10-digit label form and the 11-digit billing form. Both are the same NDC as the 12-digit form.',
  };
}

// ndcDigits(raw) -> the 11 billing digits when the value parses, else its digits as written. For
// records that carry an NDC without looking it up, so a 12-digit and an 11-digit copy still agree.
export function ndcDigits(raw) {
  const p = splitNdc(raw);
  return (!p.error && ndc11Of(p)) || String(raw ?? '').replace(/\D/g, '');
}
