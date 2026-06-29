// spec-v177 (fifth feature spec of the spec-v172 Long-Term Care & Geriatric
// Assessment program, cluster §3.5): frailty & sarcopenia case-finders for the
// long-term-care surface. v177 ships 4 of its 7 proposed tiles; the other three
// are deferred (see the deferral note below). Each item list, per-item range,
// and cutoff was re-fetched and cross-verified against >= 2 independent sources
// at implementation (spec-v97).
//
//   sarcF           - SARC-F sarcopenia screen, 5 items 0-2, total 0-10, >= 4 positive.
//   sarcCalf        - SARC-F + calf-circumference add-on, total 0-20, >= 11 positive.
//   prisma7         - PRISMA-7 frailty/disability questionnaire, 7 items, >= 3 flags.
//   sofFrailtyIndex - Study of Osteoporotic Fractures index, 3 items, 0 robust /
//                     1 pre-frail / >= 2 frail.
//
// DEFERRED at implementation (not shipped here):
//   - clinical-frailty-scale: the Rockwood CFS is copyright Dalhousie University
//     and requires a license for commercial use; reproducing the nine anchored
//     level descriptors verbatim fails the free-reproducibility bar (spec-v100 §8,
//     the spec-v148 §7.1 deferral pattern, as with PACSLAC in spec-v175).
//   - groningen-frailty-indicator and edmonton-frail-scale: the 15 GFI items and
//     the 9 EFS domains could not be byte-verified at their exact per-item 0/1
//     (GFI item-15 fitness threshold) / 0/1/2 (EFS) scoring against >= 2
//     independent sources at implementation; deferred on sourcing grounds
//     (spec-v97), the same gate as the spec-v173 deferrals.
//
// Per the spec-v100 §2 doctrine each consumes the clinician's / nurse's answers
// and returns a score mapped to the source's published bands; none authors a
// care-plan order in Sophie's voice (spec-v11 §5.3). Citations live inline in
// lib/meta.js. No AI, no runtime network call.
//
// SCORING / CUTOFFS RE-FETCHED, NEVER RECALLED (spec-v97):
//   - sarcF: 5 items (Strength, Assistance walking, Rise from a chair, Climb a
//     flight of stairs, Falls), each 0 (none) / 1 (some) / 2 (a lot / unable);
//     total 0-10; >= 4 predicts sarcopenia (Malmstrom TK, Morley JE, J Am Med
//     Dir Assoc 2013).
//   - sarcCalf: the SARC-F total (0-10) plus +10 when calf circumference is below
//     the sex-specific cutoff (< 34 cm men, < 33 cm women), else 0; total 0-20;
//     >= 11 positive (Barbosa-Silva TG, et al, J Am Med Dir Assoc 2016).
//   - prisma7: 7 yes/no items, each +1 — age > 85; male sex; health problems
//     limiting activities; needs help on a regular basis; health problems
//     requiring staying at home; can count on someone close (scored when "no",
//     i.e., lacking support); uses a cane/walker/wheelchair. Total 0-7; >= 3
//     suggests frailty / moderate-to-severe disability (Raiche M, et al, Arch
//     Gerontol Geriatr 2008).
//   - sofFrailtyIndex: 3 items each +1 — weight loss >= 5% over the prior year;
//     inability to rise from a chair 5 times without using the arms; reduced
//     energy ("no" to "do you feel full of energy?"); total 0-3; 0 robust,
//     1 pre-frail, >= 2 frail (Ensrud KE, et al, Arch Intern Med 2008).

import { num } from './num.js';

void num;

function intIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < lo || n > hi) return null;
  return n;
}
function yn(v) {
  if (v === true || v === 'yes' || v === '1' || v === 1) return true;
  if (v === false || v === 'no' || v === '0' || v === 0) return false;
  return null;
}
function numFinite(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// --- 2.2 SARC-F ---------------------------------------------------------------
const SARCF_ITEMS = ['strength', 'assistanceWalking', 'riseFromChair', 'climbStairs', 'falls'];
const SARCF_NOTE = 'SARC-F sarcopenia screen (Malmstrom TK, Morley JE, J Am Med Dir Assoc 2013). Five items — Strength (lifting/carrying ~10 lb), Assistance walking across a room, Rise from a chair or bed, Climb a flight of stairs, and Falls in the past year — each rated 0 (none), 1 (some difficulty), or 2 (a lot of difficulty or unable). Total 0–10; a score of 4 or more predicts sarcopenia and poor outcomes.';

function sarcFTotal(o) {
  const vals = SARCF_ITEMS.map((k) => intIn(o[k], 0, 2));
  if (vals.some((x) => x === null)) return null;
  return vals.reduce((a, b) => a + b, 0); // 0–10
}

export function sarcF(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const total = sarcFTotal(o);
  if (total === null) {
    return { valid: false, message: 'Rate all 5 SARC-F items 0 (none), 1 (some), or 2 (a lot / unable).' };
  }
  const positive = total >= 4;
  return {
    valid: true,
    total,
    positive,
    bandLabel: `SARC-F ${total}/10`,
    band: `SARC-F ${total}/10 — ${positive ? 'positive screen, predicts sarcopenia (≥ 4)' : 'negative screen (0–3)'}`,
    detail: `Five items each 0–2; ${total} of 10.`,
    note: SARCF_NOTE,
  };
}

// --- 2.3 SARC-CalF ------------------------------------------------------------
const SARCCALF_NOTE = 'SARC-CalF (Barbosa-Silva TG, et al, J Am Med Dir Assoc 2016): the SARC-F total (0–10) plus a calf-circumference add-on. The add-on contributes +10 points when calf circumference is below the sex-specific cutoff (under 34 cm for men, under 33 cm for women), and 0 otherwise. Total 0–20; a score of 11 or more is a positive sarcopenia screen.';

export function sarcCalf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sarc = sarcFTotal(o);
  const calf = numFinite(o.calfCm);
  const sex = o.sex === 'male' || o.sex === 'female' ? o.sex : null;
  if (sarc === null || calf === null || calf <= 0 || !sex) {
    return { valid: false, message: 'Rate the 5 SARC-F items and enter calf circumference (cm) and sex.' };
  }
  const cutoff = sex === 'male' ? 34 : 33;
  const addon = calf < cutoff ? 10 : 0;
  const total = sarc + addon; // 0–20
  const positive = total >= 11;
  return {
    valid: true,
    sarcF: sarc,
    addon,
    total,
    positive,
    bandLabel: `SARC-CalF ${total}/20`,
    band: `SARC-CalF ${total}/20 — ${positive ? 'positive screen, predicts sarcopenia (≥ 11)' : 'negative screen (0–10)'}`,
    detail: `SARC-F ${sarc}/10; calf ${calf} cm ${addon ? `below the ${cutoff} cm cutoff (+10)` : `at/above the ${cutoff} cm cutoff (+0)`}.`,
    note: SARCCALF_NOTE,
  };
}

// --- 2.4 PRISMA-7 -------------------------------------------------------------
// Item 6 ("can you count on someone close to you?") is reverse-scored: a "no"
// (lacking support) scores the point. The other six score on "yes".
const PRISMA_NOTE = 'PRISMA-7 frailty / disability case-finding questionnaire (Raiche M, et al, Arch Gerontol Geriatr 2008). Seven items, each scoring 1 point: age over 85; male sex; health problems that limit activities; needs help on a regular basis; health problems requiring staying at home; cannot count on someone close (lacking support — scored on "no"); and uses a cane, walker, or wheelchair. Total 0–7; a score of 3 or more suggests frailty or moderate-to-severe disability.';

export function prisma7(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const over85 = yn(o.over85);
  const male = yn(o.male);
  const limitActivities = yn(o.healthLimitActivities);
  const needHelp = yn(o.needHelpRegularly);
  const stayHome = yn(o.healthStayHome);
  const canCount = yn(o.canCountOnSomeone); // reverse: scores when false
  const mobilityAid = yn(o.usesMobilityAid);
  const all = [over85, male, limitActivities, needHelp, stayHome, canCount, mobilityAid];
  if (all.some((x) => x === null)) {
    return { valid: false, message: 'Answer all 7 PRISMA-7 questions yes or no.' };
  }
  const total = (over85 ? 1 : 0) + (male ? 1 : 0) + (limitActivities ? 1 : 0) + (needHelp ? 1 : 0)
    + (stayHome ? 1 : 0) + (canCount ? 0 : 1) + (mobilityAid ? 1 : 0); // 0–7
  const positive = total >= 3;
  return {
    valid: true,
    total,
    positive,
    bandLabel: `PRISMA-7 ${total}/7`,
    band: `PRISMA-7 ${total}/7 — ${positive ? 'suggests frailty / moderate-to-severe disability (≥ 3)' : 'below the frailty cut (0–2)'}`,
    detail: `Seven items; the support item scores when help cannot be counted on. ${total} of 7.`,
    note: PRISMA_NOTE,
  };
}

// --- 2.5 SOF Frailty Index ----------------------------------------------------
const SOF_NOTE = 'Study of Osteoporotic Fractures (SOF) frailty index (Ensrud KE, et al, Arch Intern Med 2008). Three items, each 1 point: weight loss of 5% or more over the prior year; inability to rise from a chair five times without using the arms; and reduced energy level ("no" to "do you feel full of energy?"). Total 0–3; 0 is robust, 1 is pre-frail, and 2 or more is frail.';

export function sofFrailtyIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const weightLoss = yn(o.weightLoss5pct);
  const cannotRise = yn(o.cannotRise5x);
  const reducedEnergy = yn(o.reducedEnergy); // "no to full of energy" entered as yes = reduced
  const all = [weightLoss, cannotRise, reducedEnergy];
  if (all.some((x) => x === null)) {
    return { valid: false, message: 'Answer all 3 SOF items yes or no.' };
  }
  const total = (weightLoss ? 1 : 0) + (cannotRise ? 1 : 0) + (reducedEnergy ? 1 : 0); // 0–3
  let band;
  if (total === 0) band = 'robust (0)';
  else if (total === 1) band = 'pre-frail (1)';
  else band = 'frail (≥ 2)';
  return {
    valid: true,
    total,
    bandLabel: `SOF ${total}/3`,
    band: `SOF ${total}/3 — ${band}`,
    detail: `Weight loss ${weightLoss ? 'yes' : 'no'}, cannot rise 5× ${cannotRise ? 'yes' : 'no'}, reduced energy ${reducedEnergy ? 'yes' : 'no'}.`,
    note: SOF_NOTE,
  };
}
