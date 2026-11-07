#!/usr/bin/env node
// scripts/validate-qrs-mitdb.mjs -- spec-v1706's ship gate for qrs-detect-trace, run by hand.
//
// Runs lib/qrs-detect-trace-v1706.js on every record of a local copy of the MIT-BIH Arrhythmia Database (PhysioNet,
// doi:10.13026/C2F305, Open Data Commons Attribution License v1.0; Moody GB, Mark RG. IEEE Eng Med Biol 2001;20:45-50)
// and compares the detections with the reference beat annotations within 150 ms. The gate: aggregate sensitivity and
// positive predictivity of at least 99% on the non-paced records (102, 104, 107 and 217 are paced).
//
// Usage: node scripts/validate-qrs-mitdb.mjs PATH-TO/mit-bih-arrhythmia-database-1.0.0 [--markdown]
// The database is not in the repository; download it from physionet.org/content/mitdb/1.0.0/.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { detect } from '../lib/qrs-detect-trace-v1706.js';

// WFDB beat annotation codes (N L R a V F J A S E j / Q e n f B r ?).
export const BEAT_CODES = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 25, 30, 34, 35, 38, 41]);
export const PACED = new Set(['102', '104', '107', '217']);

// Format 212: two 12-bit samples in three bytes; the first channel is MLII.
export function read212(bytes) {
  const n = Math.floor(bytes.length / 3);
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) {
    let v = ((bytes[3 * i + 1] & 0x0f) << 8) | bytes[3 * i];
    if (v > 2047) v -= 4096;
    out[i] = v;
  }
  return out;
}

// MIT annotation format: 16-bit words of a 6-bit code and a 10-bit time increment, with SKIP, NUM, SUB, CHAN, AUX.
export function readAtr(bytes) {
  let t = 0;
  let i = 0;
  const beats = [];
  while (i + 1 < bytes.length) {
    const w = bytes[i] | (bytes[i + 1] << 8);
    i += 2;
    const code = w >> 10;
    const inc = w & 0x3ff;
    if (code === 0 && inc === 0) break;
    if (code === 59) { t += ((bytes[i] | (bytes[i + 1] << 8)) << 16) | (bytes[i + 2] | (bytes[i + 3] << 8)); i += 4; continue; }
    if (code === 63) { i += inc + (inc & 1); continue; }
    if (code >= 60 && code <= 62) continue;
    t += inc;
    if (BEAT_CODES.has(code)) beats.push(t);
  }
  return beats;
}

// score(peaks, beats, tol) -> { tp, fn, fp }, each reference beat matched to at most one detection.
export function score(peaks, beats, tol) {
  let j = 0;
  let tp = 0;
  const used = new Set();
  for (const a of beats) {
    while (j < peaks.length && peaks[j] < a - tol) j += 1;
    for (let k = j; k < peaks.length && peaks[k] <= a + tol; k += 1) if (!used.has(k)) { used.add(k); tp += 1; break; }
  }
  return { tp, fn: beats.length - tp, fp: peaks.length - tp };
}

if (process.argv[1] && process.argv[1].endsWith('validate-qrs-mitdb.mjs')) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node scripts/validate-qrs-mitdb.mjs PATH-TO/mit-bih-arrhythmia-database-1.0.0'); process.exit(2); }
  const records = readFileSync(join(dir, 'RECORDS'), 'utf8').trim().split(/\s+/);
  const md = process.argv.includes('--markdown');
  let TP = 0; let FN = 0; let FP = 0;
  if (md) console.log('| Record | Beats | Se % | +P % | FN | FP |\n|---|---|---|---|---|---|');
  for (const r of records) {
    const beats = readAtr(readFileSync(join(dir, `${r}.atr`)));
    const { peaks } = detect(read212(readFileSync(join(dir, `${r}.dat`))), 360);
    const s = score(peaks, beats, Math.round(0.15 * 360));
    const se = (100 * s.tp) / beats.length;
    const pp = (100 * s.tp) / Math.max(1, peaks.length);
    console.log(md ? `| ${r}${PACED.has(r) ? ' (paced)' : ''} | ${beats.length} | ${se.toFixed(2)} | ${pp.toFixed(2)} | ${s.fn} | ${s.fp} |` : `${r} Se ${se.toFixed(2)} +P ${pp.toFixed(2)} FN ${s.fn} FP ${s.fp}${PACED.has(r) ? ' (paced)' : ''}`);
    if (!PACED.has(r)) { TP += s.tp; FN += s.fn; FP += s.fp; }
  }
  const se = (100 * TP) / (TP + FN);
  const pp = (100 * TP) / (TP + FP);
  console.log(`\nNon-paced aggregate: sensitivity ${se.toFixed(2)}%, positive predictivity ${pp.toFixed(2)}% (TP ${TP}, FN ${FN}, FP ${FP}). Gate: both at least 99%: ${se >= 99 && pp >= 99 ? 'met' : 'NOT met'}.`);
  process.exit(se >= 99 && pp >= 99 ? 0 : 1);
}
