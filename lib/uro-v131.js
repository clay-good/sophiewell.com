// spec-v131 (Wave 5 of the spec-v100 MDCalc Parity Completion program): the
// renal-mass, kidney-stone, and testicular-torsion instruments that close the
// urology cluster begun in v130. Five deterministic tiles; none duplicates a
// live tile. Each consumes clinician-entered measurements / anatomic findings
// and returns a score and the source's interpretation -- not a browsable
// reference table (spec-v100 §2).
//
//   capraScore           - UCSF CAPRA prostate-cancer recurrence score (0-10)
//   renalNephrometry     - R.E.N.A.L. nephrometry score (4-12) + a/p/x[h] suffix
//   paduaRenal           - PADUA renal-tumour complexity score (6-14)
//   stoneNephrolithometry- S.T.O.N.E. nephrolithometry (5-13), PCNL complexity
//   twistScore           - TWIST testicular-torsion score (0-7)
//
// roksStoneRecurrence (the ROKS recurrence nomogram) was scoped for v131 but is
// DEFERRED, not shipped: its 2/5/10-yr probability formula is published, but the
// per-variable POINTS feed only a graphical nomogram (Figure 2A of Rule 2014 /
// the revised Rule 2019). The paper publishes hazard ratios, not a numeric point
// table or the points-scaling constant, so the points cannot be transcribed
// exactly from open sources. Shipping reverse-engineered coefficients in a
// clinical tool is the failure mode this program already refused once (gwtg-hf,
// spec-v102). The id is reserved; ROKS ships only with an institutional source
// for the coefficient appendix. See docs/spec-v131.md §2.5 (amended).
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v131.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the score/class and the source's framing; the
// management decision (and any emergent torsion decision) stays with the
// clinician and local protocol (spec-v11 §5.3). All five are Class A (fixed
// published point tables; journal+author citations, no ISSUER_PATTERN trip) --
// no docs/citation-staleness.md row.
//
// POINT TABLES RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - capraScore (Cooperberg 2005, J Urol 173:1938): age >=50 = +1; PSA <=6 = 0,
//     >6-10 = +1, >10-20 = +2, >20-30 = +3, >30 = +4; Gleason axis NOT the 2-10
//     sum -- primary pattern 4/5 = +3, else secondary pattern 4/5 = +1, else 0
//     (there is no +2 level, it jumps 1->3); clinical stage T3a = +1 (T1/T2 = 0);
//     >=34% positive cores = +1. Total 0-10. Tiers 0-2 low / 3-5 intermediate /
//     6-10 high. PSA bands inclusive at the top (a PSA of exactly 6 scores 0).
//   - renalNephrometry (Kutikov & Uzzo 2009, J Urol 182:844): R radius <=4 cm = 1,
//     >4-<7 = 2, >=7 = 3; E exophytic >=50% = 1, <50% = 2, entirely endophytic = 3;
//     N nearness to collecting system/sinus >=7 mm = 1, >4-<7 = 2, <=4 = 3; L
//     location entirely above/below polar line = 1, crosses polar line = 2,
//     >50% across / entirely between lines / crosses axial midline = 3. A is a
//     NON-scoring suffix a(nterior)/p(osterior)/x; h appended for a hilar tumour.
//     Total 4-12. Tiers 4-6 low / 7-9 moderate / 10-12 high.
//   - paduaRenal (Ficarra 2009, Eur Urol 56:786): longitudinal polar = 1 / middle
//     = 2; exophytic >=50% = 1, <50% = 2, endophytic = 3; rim lateral = 1 /
//     medial = 2; renal sinus not-involved = 1 / involved = 2; urinary collecting
//     system not-involved = 1 / involved = 2; size <=4 cm = 1, >4-7 = 2, >7 = 3.
//     Anterior/posterior face is a NON-scoring suffix. Total 6-14. Tiers 6-7 low /
//     8-9 intermediate / >=10 high.
//   - stoneNephrolithometry (Okhunov 2013, Urology 81:1154; the ORIGINAL PCNL
//     AREA version, total 5-13 -- NOT the later URS diameter adaptation, 5-15):
//     S size area (length x width mm^2) 0-399 = 1, 400-799 = 2, 800-1599 = 3,
//     >=1600 = 4; T tract length (skin-to-stone mm) <=100 = 1, >100 = 2; O
//     obstruction none/mild = 1, moderate/severe = 2; N involved calices 1-2 = 1,
//     3 = 2, full staghorn = 3; E essence/density <=950 HU = 1, >950 = 2. Total
//     5-13. A HIGHER score = LOWER PCNL stone-free likelihood / higher complexity.
//     Tiers low 5-6 / moderate 7-8 / high >=9 (the per-score stone-free percentage
//     curve is reported by the source only approximately, so it is not quoted as
//     an exact number).
//   - twistScore (Barbosa 2013, J Urol 189:1859): testicular swelling = 2, hard
//     testis = 2, absent cremasteric reflex = 1, nausea/vomiting = 1, high-riding
//     testis = 1. Total 0-7. Barbosa set two cutoffs (low <=2, high >=5), giving
//     three bands: 0-2 low (~2% torsion, no ultrasound), 3-4 intermediate (image),
//     5-7 high (~87% torsion, direct exploration).

import { r1 } from './num.js';

const obj = (input) => (input && typeof input === 'object' ? input : {});
const pos = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const nonNeg = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const intIn = (v, lo, hi) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && Number.isInteger(n) && n >= lo && n <= hi ? n : null;
};
// a scored component level: an integer in the allowed set, else null (blank /
// not assessed -> surfaced fallback, never silently scored 0).
const lvl = (v, allowed) => {
  const n = intIn(v, allowed[0], allowed[allowed.length - 1]);
  return n !== null && allowed.includes(n) ? n : null;
};
const fields = 'Complete every field to compute the score.';

// --- 2.1 capra-score ----------------------------------------------------------
const CAPRA_NOTE = 'UCSF CAPRA score (Cooperberg MR, et al, J Urol 2005): a 0-10 preoperative predictor of biochemical recurrence after radical prostatectomy, summing age (>=50 = +1), PSA (<=6 = 0, >6-10 = +1, >10-20 = +2, >20-30 = +3, >30 = +4), the Gleason axis (primary pattern 4/5 = +3, else secondary pattern 4/5 = +1, else 0 -- there is no +2 level), clinical stage (T3a = +1) and percent positive biopsy cores (>=34% = +1). 0-2 = low, 3-5 = intermediate, 6-10 = high; roughly double the recurrence risk per 2-point rise. It frames recurrence risk; the management decision stays with the clinician.';

function capraPsaPoints(psa) {
  if (psa <= 6) return 0;
  if (psa <= 10) return 1;
  if (psa <= 20) return 2;
  if (psa <= 30) return 3;
  return 4;
}

export function capraScore(input = {}) {
  const o = obj(input);
  const age = pos(o.age);
  const psa = pos(o.psa);
  const primary = lvl(o.gleasonPrimary, [1, 2, 3, 4, 5]);
  const secondary = lvl(o.gleasonSecondary, [1, 2, 3, 4, 5]);
  const stage = typeof o.stage === 'string' ? o.stage.trim() : '';
  const cores = nonNeg(o.cores);
  const stageOk = stage === 'T1-T2' || stage === 'T3a';
  if (age === null || psa === null || primary === null || secondary === null || !stageOk || cores === null || cores > 100) {
    return { valid: false, message: 'Enter age, PSA (ng/mL), the primary and secondary Gleason patterns, the clinical stage, and the percent of positive biopsy cores (0-100).' };
  }
  const agePts = age >= 50 ? 1 : 0;
  const psaPts = capraPsaPoints(psa);
  const gleasonPts = primary >= 4 ? 3 : secondary >= 4 ? 1 : 0;
  const stagePts = stage === 'T3a' ? 1 : 0;
  const corePts = cores >= 34 ? 1 : 0;
  const total = agePts + psaPts + gleasonPts + stagePts + corePts;
  const tier = total >= 6 ? 'High' : total >= 3 ? 'Intermediate' : 'Low';
  return {
    valid: true, total, tier,
    parts: { age: agePts, psa: psaPts, gleason: gleasonPts, stage: stagePts, cores: corePts },
    abnormal: total >= 3,
    band: `CAPRA ${total} of 10 -- ${tier.toLowerCase()} risk of biochemical recurrence after radical prostatectomy (0-2 low, 3-5 intermediate, 6-10 high).`,
    note: CAPRA_NOTE,
  };
}

// --- 2.2 renal-nephrometry ----------------------------------------------------
const RENAL_NOTE = 'R.E.N.A.L. nephrometry score (Kutikov A, Uzzo RG, J Urol 2009): a 4-12 anatomic-complexity score for a renal mass facing nephron-sparing surgery, summing Radius (tumour size), Exophytic/endophytic properties, Nearness to the collecting system/sinus and Location relative to the polar lines (each 1-3), with a non-scoring Anterior/posterior (a/p/x) suffix and an h suffix for a hilar tumour. 4-6 = low, 7-9 = moderate, 10-12 = high complexity. It frames anatomic complexity; the surgical decision stays with the clinician.';

export function renalNephrometry(input = {}) {
  const o = obj(input);
  const radius = lvl(o.radius, [1, 2, 3]);
  const exophytic = lvl(o.exophytic, [1, 2, 3]);
  const nearness = lvl(o.nearness, [1, 2, 3]);
  const location = lvl(o.location, [1, 2, 3]);
  const ap = typeof o.ap === 'string' ? o.ap.trim() : '';
  const apOk = ap === 'a' || ap === 'p' || ap === 'x';
  const hilar = o.hilar === true || o.hilar === 'h';
  if (radius === null || exophytic === null || nearness === null || location === null || !apOk) {
    return { valid: false, message: 'Score Radius, Exophytic/endophytic, Nearness and Location (each 1-3) and choose the anterior/posterior descriptor.' };
  }
  const total = radius + exophytic + nearness + location;
  const suffix = ap + (hilar ? 'h' : '');
  const complexity = total >= 10 ? 'high' : total >= 7 ? 'moderate' : 'low';
  return {
    valid: true, total, suffix, complexity,
    parts: { radius, exophytic, nearness, location },
    abnormal: total >= 7,
    band: `R.E.N.A.L. ${total}${suffix} -- ${complexity} complexity (4-6 low, 7-9 moderate, 10-12 high).`,
    note: RENAL_NOTE,
  };
}

// --- 2.3 padua-renal ----------------------------------------------------------
const PADUA_NOTE = 'PADUA score (Ficarra V, et al, Eur Urol 2009): a renal-tumour anatomic-complexity score for nephron-sparing-surgery candidates, summing longitudinal polar location (polar = 1, middle = 2), exophytic rate (>=50% = 1, <50% = 2, endophytic = 3), renal rim (lateral = 1, medial = 2), renal-sinus involvement (no = 1, yes = 2), urinary-collecting-system involvement (no = 1, yes = 2) and tumour size (<=4 cm = 1, >4-7 = 2, >7 = 3), with a non-scoring anterior/posterior face descriptor. Total 6-14: 6-7 = low, 8-9 = intermediate, >=10 = high complexity-risk. It frames complexity; the surgical decision stays with the clinician.';

export function paduaRenal(input = {}) {
  const o = obj(input);
  const longitudinal = lvl(o.longitudinal, [1, 2]);
  const exophytic = lvl(o.exophytic, [1, 2, 3]);
  const rim = lvl(o.rim, [1, 2]);
  const sinus = lvl(o.sinus, [1, 2]);
  const ucs = lvl(o.ucs, [1, 2]);
  const size = lvl(o.size, [1, 2, 3]);
  const face = typeof o.face === 'string' ? o.face.trim() : '';
  const faceOk = face === 'a' || face === 'p';
  if (longitudinal === null || exophytic === null || rim === null || sinus === null || ucs === null || size === null || !faceOk) {
    return { valid: false, message: 'Score the longitudinal location, exophytic rate, renal rim, sinus involvement, collecting-system involvement and tumor size, and choose the anterior/posterior face.' };
  }
  const total = longitudinal + exophytic + rim + sinus + ucs + size;
  const complexity = total >= 10 ? 'high' : total >= 8 ? 'intermediate' : 'low';
  return {
    valid: true, total, face, complexity,
    parts: { longitudinal, exophytic, rim, sinus, ucs, size },
    abnormal: total >= 8,
    band: `PADUA ${total} (${face}) -- ${complexity} complexity-risk (6-7 low, 8-9 intermediate, >=10 high).`,
    note: PADUA_NOTE,
  };
}

// --- 2.4 stone-nephrolithometry ----------------------------------------------
const STONE_NOTE = 'S.T.O.N.E. nephrolithometry (Okhunov Z, et al, Urology 2013): a 5-13 PCNL complexity score summing Stone size (area = length x width, mm^2: 0-399 = 1, 400-799 = 2, 800-1599 = 3, >=1600 = 4), Tract length (skin-to-stone mm: <=100 = 1, >100 = 2), Obstruction (none/mild = 1, moderate/severe = 2), Number of involved calices (1-2 = 1, 3 = 2, staghorn = 3) and Essence/density (<=950 HU = 1, >950 = 2). A HIGHER score means LOWER stone-free likelihood and a more complex case (low 5-6, moderate 7-8, high >=9). It frames complexity; the surgical plan stays with the clinician.';

export function stoneNephrolithometry(input = {}) {
  const o = obj(input);
  const length = pos(o.length);
  const width = pos(o.width);
  const tract = pos(o.tract);
  const obstruction = lvl(o.obstruction, [1, 2]);
  const calices = lvl(o.calices, [1, 2, 3]);
  const hu = pos(o.hu);
  if (length === null || width === null || tract === null || obstruction === null || calices === null || hu === null) {
    return { valid: false, message: 'Enter stone length and width (mm), tract length (mm) and density (HU), and score obstruction and the number of involved calices.' };
  }
  const area = length * width;
  const sizePts = area >= 1600 ? 4 : area >= 800 ? 3 : area >= 400 ? 2 : 1;
  const tractPts = tract > 100 ? 2 : 1;
  const huPts = hu > 950 ? 2 : 1;
  const total = sizePts + tractPts + obstruction + calices + huPts;
  const complexity = total >= 9 ? 'high' : total >= 7 ? 'moderate' : 'low';
  return {
    valid: true, total, area: r1(area), complexity,
    parts: { size: sizePts, tract: tractPts, obstruction, calices, essence: huPts },
    abnormal: total >= 9,
    band: `S.T.O.N.E. ${total} of 13 (stone area ${r1(area)} mm^2) -- ${complexity} complexity; higher scores carry a lower PCNL stone-free likelihood (low 5-6, moderate 7-8, high >=9).`,
    note: STONE_NOTE,
  };
}

// --- 2.5 twist-score ----------------------------------------------------------
const TWIST_NOTE = 'TWIST score (Barbosa JA, et al, J Urol 2013): a 0-7 point-of-care score to triage suspected testicular torsion, summing testicular swelling (2), a hard testis (2), an absent cremasteric reflex (1), nausea/vomiting (1) and a high-riding testis (1). Barbosa set two cutoffs -- low <=2, high >=5 -- giving three bands: 0-2 low (about 2% torsion, ultrasound usually unnecessary), 3-4 intermediate (obtain scrotal ultrasound), 5-7 high (about 87% torsion, consider direct surgical exploration). Torsion is a time-critical surgical emergency; the decision stays with the clinician.';

const TWIST_ITEMS = [
  ['swelling', 2, 'testicular swelling'],
  ['hardTestis', 2, 'hard testis'],
  ['absentCremasteric', 1, 'absent cremasteric reflex'],
  ['nauseaVomiting', 1, 'nausea/vomiting'],
  ['highRiding', 1, 'high-riding testis'],
];

const present = (v) => v === true || v === 1 || v === '1' || v === 'yes';

export function twistScore(input = {}) {
  const o = obj(input);
  let total = 0;
  const scored = [];
  for (const [key, pts, label] of TWIST_ITEMS) {
    if (present(o[key])) { total += pts; scored.push(label); }
  }
  const tier = total >= 5 ? 'High' : total >= 3 ? 'Intermediate' : 'Low';
  const action = total >= 5 ? 'about 87% torsion -- consider direct surgical exploration'
    : total >= 3 ? 'obtain scrotal ultrasound'
    : 'about 2% torsion -- ultrasound usually unnecessary';
  return {
    valid: true, total, tier, scored,
    abnormal: total >= 3,
    band: `TWIST ${total} of 7 -- ${tier.toLowerCase()} risk (${action}).${scored.length ? ' Present: ' + scored.join(', ') + '.' : ' No listed findings present.'}`,
    note: TWIST_NOTE,
  };
}
