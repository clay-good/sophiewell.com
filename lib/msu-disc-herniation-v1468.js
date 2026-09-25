// spec-v1468: MSU (Michigan State University) classification of lumbar disc herniation on MRI.
//
// Source, read 2026-09-25: Mysliwiec LW, Cholewicki J, Winkelpleck MD, Eis GP. MSU classification
// for herniated lumbar discs on MRI: toward developing objective criteria for surgical selection.
// Eur Spine J 2010;19(7):1087-1093 (doi:10.1007/s00586-009-1274-4, PMC2900017).
//   One T2 axial cut at the level of maximal herniation; the reference is the intra-facet line, joining
//   the medial margins of the facet joints.
//   SIZE: the herniation extends "up to or less than 50% of the distance from the non-herniated
//   posterior aspect of the disc to the intra-facet line (size-1), or more than 50% of that distance
//   (size-2). If the herniation extends altogether beyond the intra-facet line, it is termed a size-3
//   disc." For a migrated fragment the distance is taken from the posterior vertebral cortex/endplate.
//   LOCATION: three points split the intra-facet line into quarters; the central quadrants are zone A,
//   the lateral quadrants zone B, and zone C lies beyond the medial margin of the facet joint (far
//   lateral, at the foramen). The zone the nucleus intrudes furthest into gives A, AB, B or C.
//   Figure: 2-B commonly symptomatic; 3-A often seen in cauda equina; 2-C the largest foraminal
//   lesions; 2-AB quite common. Size-1 lesions were all excluded from surgical consideration; 2-B and
//   2-AB were the types most often selected for surgery. Inter-examiner reliability 98%.
// Reliability in residents: Acta Ortop Bras 2018 (PMC6362681), Fleiss kappa 0.422 between six
// observers, 0.750 to 0.859 within an observer.
//
// Size comes from the select OR from two measurements; complete measurements decide it, and a chosen
// size that disagrees is reported rather than hidden. A blank is never read as an option.
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const MSU_SIZES = [
  { value: '1', text: '1: up to half-way from the posterior disc to the intra-facet line' },
  { value: '2', text: '2: more than half-way, up to the intra-facet line' },
  { value: '3', text: '3: beyond the intra-facet line' },
];
export const MSU_ZONES = [
  { value: 'A', text: 'A: central quadrant' },
  { value: 'AB', text: 'AB: on the line between the central and lateral quadrants' },
  { value: 'B', text: 'B: lateral quadrant' },
  { value: 'C', text: 'C: foramen, beyond the medial margin of the facet joint (far lateral)' },
];

const SIZE_WORDS = {
  1: 'the herniation reaches up to half-way from the posterior disc to the intra-facet line',
  2: 'the herniation reaches more than half-way to the intra-facet line but not beyond it',
  3: 'the herniation extends beyond the intra-facet line',
};
const ZONE_WORDS = {
  A: 'intrudes furthest into a central quadrant (zone A)',
  AB: 'intrudes furthest to the line between the central and lateral quadrants (zone AB)',
  B: 'intrudes furthest into a lateral quadrant (zone B)',
  C: 'intrudes furthest into the foramen, beyond the medial margin of the facet joint (zone C, far lateral)',
};
const FIGURE = {
  '2-B': 'In the derivation paper, 2-B lesions are commonly symptomatic.',
  '3-A': 'In the derivation paper, 3-A lesions are often seen in cauda equina.',
  '2-C': 'In the derivation paper, 2-C lesions are the largest foraminal lesions.',
  '2-AB': 'In the derivation paper, 2-AB lesions are quite common.',
};

const MAX_MM = 60;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const pick = (list, v) => {
  if (blank(v)) return null;
  const s = String(v).trim();
  return list.some((x) => x.value === s) ? s : null;
};

export function msuDiscHerniation(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let measured = null;
  let pct = null;
  if (!blank(o.dist) || !blank(o.extent)) {
    const fault = inputFault([
      ['the distance from the posterior disc to the intra-facet line', o.dist, null, MAX_MM, 'mm'],
      ['how far the herniation extends from the posterior disc', o.extent, 0, MAX_MM, 'mm'],
    ]);
    if (fault) return { valid: false, message: fault };
    const dist = Number(o.dist);
    const extent = Number(o.extent);
    measured = extent * 2 <= dist ? 1 : extent <= dist ? 2 : 3;
    pct = Math.round((extent / dist) * 100);
  }

  const chosen = pick(MSU_SIZES, o.size);
  const size = measured !== null ? measured : chosen === null ? null : Number(chosen);
  if (size === null) {
    return { valid: false, message: 'Choose the size (1, 2 or 3), or enter both measurements.' };
  }
  const zone = pick(MSU_ZONES, o.zone);
  if (!zone) return { valid: false, message: 'Choose the location zone: A, AB, B or C.' };

  const type = `${size}-${zone}`;
  const notes = [];
  if (measured !== null) {
    notes.push(`Size ${measured} from the measurements: the herniation reaches ${pct}% of the distance to the intra-facet line.`);
    if (chosen !== null && Number(chosen) !== measured) {
      notes.push(`The measurements give size ${measured}; the chosen size ${chosen} was not used.`);
    }
  }
  if (FIGURE[type]) notes.push(FIGURE[type]);
  notes.push('In the derivation series every size-1 lesion was excluded from surgical consideration; 2-B and 2-AB were the types most often selected for surgery.');
  notes.push('Agreement: 98% between examiners in the derivation study; among six orthopedic residents, moderate between observers (Fleiss kappa 0.42) and 0.75 to 0.86 within an observer.');
  notes.push('It describes the image; the decision to operate rests on the clinical findings.');

  return {
    valid: true,
    abnormal: size >= 2,
    type,
    size,
    zone,
    band: `MSU type ${type}: ${SIZE_WORDS[size]}, and ${ZONE_WORDS[zone]}.`,
    bandLabel: `Type ${type}`,
    notes,
    note: 'Mysliwiec LW et al, Eur Spine J 2010 (T2 axial MRI at the level of maximal herniation); resident reliability from Acta Ortop Bras 2018.',
  };
}
