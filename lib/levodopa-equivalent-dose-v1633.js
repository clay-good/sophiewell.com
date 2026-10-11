// spec-v1633 tool 22: levodopa equivalent daily dose.
//
// Source: Jost ST, Kaldenbach M-A, Antonini A, et al. Levodopa Dose Equivalency in Parkinson's
// Disease: Updated Systematic Review and Proposals. Mov Disord 2023;38(7):1236-1252
// (doi 10.1002/mds.29410), Table 1 and its footnotes, re-read on October 11, 2026 from the published
// article in the University of Padua repository (the article is open access, CC BY-NC-ND; the
// factors are used as facts with attribution and the table is not reproduced as printed).
//
//   LED (mg/day) = sum of daily dose x factor, with these exceptions (footnotes a to d):
//   a  COMT inhibitors: the LED of the levodopa-containing drugs x 0.33 (entacapone) or x 0.5
//      (tolcapone, opicapone) is the inhibitor's LED, and is added. Opicapone applies to every
//      levodopa dose of the day; "tolcapone 100 mg for 8 hours and entacapone 200 mg for 4 hours".
//   b  Safinamide 50 or 100 mg/day = 150 mg; zonisamide 25 or 50 mg/day = 100 mg ("should not be
//      used outside Japan").
//   c  Trihexyphenidyl: each clinically efficacious single dose = 100 mg, only where that dose
//      improves the UPDRS-III total "by at least 5 points".
//   d  Istradefylline: 0.2 x the subtotal LED of levodopa-containing drugs and COMT inhibitors.
//
// The paper gives no interpretation bands; the number is reported alone. It is a research and
// comparison measure, in the paper's words "a practical guide", not a switching dose.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// arg, label, factor, whether it contains levodopa.
export const DRUGS = [
  { arg: 'levodopaIr', dom: 'levodopa-ir', text: 'Levodopa, immediate-release', factor: 1, levodopa: true },
  { arg: 'levodopaDualRelease', dom: 'levodopa-dual', text: 'Levodopa, dual-release (Madopar DR)', factor: 0.85, levodopa: true },
  { arg: 'levodopaCr', dom: 'levodopa-cr', text: 'Levodopa, controlled-release', factor: 0.75, levodopa: true },
  { arg: 'levodopaEr', dom: 'levodopa-er', text: 'Levodopa, extended-release (Rytary)', factor: 0.5, levodopa: true },
  { arg: 'levodopaInhaled', dom: 'levodopa-inhaled', text: 'Levodopa, inhaled (capsule dose)', factor: 0.69, levodopa: true },
  { arg: 'lcig', dom: 'lcig', text: 'Intrajejunal levodopa/carbidopa infusion (morning, maintenance and extra doses)', factor: 1.11, levodopa: true },
  { arg: 'lecigMorning', dom: 'lecig-morning', text: 'Intrajejunal levodopa/carbidopa/entacapone infusion: morning dose', factor: 1.11, levodopa: true },
  { arg: 'lecigMaintenance', dom: 'lecig-maintenance', text: 'Intrajejunal levodopa/carbidopa/entacapone infusion: maintenance and extra doses', factor: 1.46, levodopa: true },
  { arg: 'foslevodopa', dom: 'foslevodopa', text: 'Subcutaneous foslevodopa/foscarbidopa', factor: 0.75, levodopa: true },
  { arg: 'selegilineOral', dom: 'selegiline-oral', text: 'Selegiline, oral', factor: 10 },
  { arg: 'selegilineSublingual', dom: 'selegiline-sl', text: 'Selegiline, sublingual', factor: 80 },
  { arg: 'rasagiline', dom: 'rasagiline', text: 'Rasagiline', factor: 100 },
  { arg: 'pramipexoleSalt', dom: 'pramipexole-salt', text: 'Pramipexole, as salt', factor: 100 },
  { arg: 'pramipexoleBase', dom: 'pramipexole-base', text: 'Pramipexole, as base', factor: 142.86 },
  { arg: 'ropinirole', dom: 'ropinirole', text: 'Ropinirole', factor: 20 },
  { arg: 'rotigotine', dom: 'rotigotine', text: 'Rotigotine', factor: 30.3 },
  { arg: 'piribedil', dom: 'piribedil', text: 'Piribedil', factor: 1 },
  { arg: 'apomorphineSc', dom: 'apomorphine-sc', text: 'Apomorphine, subcutaneous', factor: 10 },
  { arg: 'apomorphineSl', dom: 'apomorphine-sl', text: 'Apomorphine, sublingual', factor: 1.5 },
  { arg: 'lisuride', dom: 'lisuride', text: 'Lisuride', factor: 100 },
  { arg: 'bromocriptine', dom: 'bromocriptine', text: 'Bromocriptine', factor: 10 },
  { arg: 'pergolide', dom: 'pergolide', text: 'Pergolide', factor: 100 },
  { arg: 'cabergoline', dom: 'cabergoline', text: 'Cabergoline', factor: 66.67 },
  { arg: 'dihydroergocryptine', dom: 'dhec', text: 'Dihydroergocryptine', factor: 5 },
  { arg: 'amantadineIr', dom: 'amantadine-ir', text: 'Amantadine, immediate-release', factor: 1 },
  { arg: 'amantadineErGocovri', dom: 'amantadine-gocovri', text: 'Amantadine, extended-release (Gocovri)', factor: 1.25 },
  { arg: 'amantadineErOsmolex', dom: 'amantadine-osmolex', text: 'Amantadine, extended-release (Osmolex ER)', factor: 1 },
];
export const COMT = [
  { value: 'none', text: 'No COMT inhibitor' },
  { value: 'entacapone', text: 'Entacapone', factor: 0.33 },
  { value: 'tolcapone', text: 'Tolcapone', factor: 0.5 },
  { value: 'opicapone', text: 'Opicapone', factor: 0.5 },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
const NOTE = 'The levodopa equivalent dose is a research and comparison measure (the paper calls its proposals "a practical guide"). It is not a dose to switch to, and the paper gives no bands for interpreting it.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const r2 = (x) => Math.round(x * 100) / 100;
const say = (x) => r2(x).toLocaleString('en-US');
const yes = (v, name) => { const s = String(v ?? '').trim(); if (s === '' || s === 'no') return false; if (s === 'yes') return true; throw new RangeError(`Choose yes or no for ${name}, or leave it blank.`); };

export function levodopaEquivalentDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const given = DRUGS.filter((d) => !blank(o[d.arg]));
  const f = inputFault(given.map((d) => [`the daily dose of ${d.text.toLowerCase()}`, o[d.arg], 0, 20000, 'mg']));
  if (f) return { valid: false, message: f };
  const comt = COMT.find((c) => c.value === (blank(o.comt) ? 'none' : String(o.comt).trim()));
  if (!comt) return { valid: false, message: 'Choose the COMT inhibitor from the list, or leave it as none.' };
  let ist; let saf; let zon;
  try { ist = yes(o.istradefylline, 'istradefylline'); saf = yes(o.safinamide, 'safinamide'); zon = yes(o.zonisamide, 'zonisamide'); } catch (e) { return { valid: false, message: e.message }; }
  let anti = 0;
  if (!blank(o.anticholinergicDoses)) {
    const af = inputFault([['the number of effective anticholinergic doses a day', o.anticholinergicDoses, 0, 12, '']]);
    if (af) return { valid: false, message: af };
    anti = Number(o.anticholinergicDoses);
    if (!Number.isInteger(anti)) return { valid: false, message: 'Enter the number of effective anticholinergic doses a day as a whole number.' };
  }
  const parts = given.filter((d) => Number(o[d.arg]) > 0).map((d) => ({ drug: d.text, dose: Number(o[d.arg]), factor: d.factor, led: Number(o[d.arg]) * d.factor, levodopa: Boolean(d.levodopa) }));
  const levodopaLed = parts.filter((p) => p.levodopa).reduce((a, p) => a + p.led, 0);
  const notes = [];
  let comtLed = 0;
  if (comt.value !== 'none') {
    if (!(levodopaLed > 0)) return { valid: false, message: 'A COMT inhibitor scales the levodopa dose it is taken with. Enter the levodopa, or set the COMT inhibitor to none.' };
    let covered = levodopaLed;
    if (comt.value !== 'opicapone') {
      const cf = inputFault([[`the levodopa equivalent covered by ${comt.value}`, o.comtCoveredLed, 0, levodopaLed, 'mg']]);
      if (cf) return { valid: false, message: `${cf} The paper applies ${comt.value} only for ${comt.value === 'tolcapone' ? '8 hours after a 100 mg dose' : '4 hours after a 200 mg dose'}, so say how much of the ${say(levodopaLed)} mg a day of levodopa equivalent falls in that time.` };
      covered = Number(o.comtCoveredLed);
    }
    comtLed = covered * comt.factor;
    parts.push({ drug: comt.text, dose: null, factor: comt.factor, led: comtLed, levodopa: false, basis: covered });
    notes.push(comt.value === 'opicapone' ? `Opicapone: the paper applies it to every levodopa dose of the day, so ${say(levodopaLed)} mg × 0.5 = ${say(comtLed)} mg is added.` : `${comt.text}: ${say(covered)} mg of the levodopa equivalent falls within its effect, so ${say(covered)} × ${comt.factor} = ${say(comtLed)} mg is added.`);
  }
  if (ist) { const led = (levodopaLed + comtLed) * 0.2; parts.push({ drug: 'Istradefylline', dose: null, factor: 0.2, led, levodopa: false, basis: levodopaLed + comtLed }); notes.push(`Istradefylline: 0.2 × the ${say(levodopaLed + comtLed)} mg subtotal of levodopa-containing drugs and COMT inhibitor = ${say(led)} mg.`); }
  if (saf) { parts.push({ drug: 'Safinamide (50 or 100 mg a day)', dose: null, factor: null, led: 150, levodopa: false }); notes.push('Safinamide: the paper proposes a fixed 150 mg for 50 or 100 mg a day.'); }
  if (zon) { parts.push({ drug: 'Zonisamide (25 or 50 mg a day)', dose: null, factor: null, led: 100, levodopa: false }); notes.push('Zonisamide: a fixed 100 mg for 25 or 50 mg a day. The paper says this conversion should not be used outside Japan.'); }
  if (anti > 0) { parts.push({ drug: 'Trihexyphenidyl or another anticholinergic', dose: null, factor: null, led: anti * 100, levodopa: false }); notes.push(`Anticholinergic: ${anti} clinically effective single dose${anti === 1 ? '' : 's'} a day at 100 mg each. The paper counts a dose only where it improves the UPDRS-III total by at least 5 points.`); }
  if (!parts.length) return { valid: false, message: 'Enter the total daily dose of at least one antiparkinsonian drug.' };
  const total = parts.reduce((a, p) => a + p.led, 0);
  const lines = parts.filter((p) => p.dose !== null).map((p) => `${p.drug}: ${say(p.dose)} mg × ${p.factor} = ${say(p.led)} mg.`);
  return {
    valid: true, flag: 'led', abnormal: false, totalLed: r2(total), levodopaLed: r2(levodopaLed),
    contributions: parts.map((p) => ({ drug: p.drug, factor: p.factor, led: r2(p.led) })),
    band: `Levodopa equivalent dose: ${say(total)} mg a day, from ${parts.length} item${parts.length === 1 ? '' : 's'} (Jost 2023 factors).`,
    bandLabel: `${say(total)} mg a day`,
    notes: [...lines, ...notes, 'Jost ST, et al. Mov Disord 2023;38:1236-1252, Table 1.'], note: NOTE,
  };
}
