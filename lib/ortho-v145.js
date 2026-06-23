// spec-v145 (Wave 8 of the spec-v100 MDCalc Parity Completion program): five
// orthopedic risk / osteoarthritis instruments that fill confirmed gaps beside
// the v144 fracture-classification cluster and the existing ottawa-knee /
// ottawa-ankle ED rules. None duplicates a live tile; v145 parses no image and
// runs no AI.
//
//   frykmanClassification     - distal-radius fracture type I-VIII
//   mirelsScore               - impending-pathologic-fracture risk 4-12
//   kellgrenLawrence          - radiographic osteoarthritis grade 0-4
//   pittsburghKneeRule        - knee-radiograph indication (entry-gated)
//   compartmentDeltaPressure  - ΔP = diastolic - compartment; < 30 mmHg flag
//
// Per the spec-v100 §2 classification clarification, the Frykman, Mirels, and
// Kellgren-Lawrence tiles CONSUME the clinician's read of the film (joint
// involvement, lesion factors, radiographic grade) and COMPUTE a class/score --
// they are not no-input reference tables. Pure functions only (spec-v29 §3
// one-line test). Citations live inline in lib/meta.js; renderers in
// views/group-v145.js render the spec-v50 §3 clinical-posture note. Each tile
// reports the class/score/decision and the source's management-relevant
// interpretation; the operative decision stays with the clinician and local
// protocol (spec-v11 §5.3).
//
// DEFINITIONS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent authoritative sources (the original papers, the CORR
// "Classifications in Brief" reviews, Wheeless, UW Emergency Radiology,
// Radiopaedia, StatPearls, the Seaberg 1994/1998 PubMed abstracts).
// NO-FABRICATION / SOURCE-GOVERNANCE:
//   - frykmanClassification (Frykman G, Acta Orthop Scand 1967;Suppl 108): two
//     axes -- joint involvement (extra-articular / radiocarpal / distal
//     radioulnar / both) and an associated distal-ulna (styloid) fracture. Odd
//     types = NO ulnar fracture, even = WITH ulnar fracture, so each even type
//     is its preceding odd type plus an ulnar-styloid fracture. I/II extra-
//     articular, III/IV radiocarpal, V/VI radioulnar, VII/VIII both joints.
//     Higher number = more articular involvement / worse prognosis. Class A.
//   - mirelsScore (Mirels H, Clin Orthop Relat Res 1989;(249):256-264): four
//     factors each 1-3 -- site (upper-limb 1 / lower-limb 2 / peritrochanteric
//     3), pain (mild 1 / moderate 2 / functional 3), lesion nature (blastic 1 /
//     mixed 2 / lytic 3), size vs cortex (<1/3 = 1, 1/3-2/3 = 2, >2/3 = 3).
//     Total 4-12: <=7 low (~0-4% fracture risk, irradiate/observe), 8 borderline
//     (~15%, clinical judgment), >=9 high (>33%, prophylactic fixation). The
//     >=9 cutoff is sensitive (~91%) but not specific (~33%). Class A.
//   - kellgrenLawrence (Kellgren JH, Lawrence JS, Ann Rheum Dis 1957;16:494-502;
//     feature wording codified in the 1963 Atlas): 0 none, 1 doubtful JSN /
//     possible osteophytic lipping, 2 definite osteophytes + possible JSN, 3
//     moderate osteophytes + definite JSN + some sclerosis + possible bone-end
//     deformity, 4 large osteophytes + marked JSN + severe sclerosis + definite
//     deformity. Grade >= 2 is the accepted threshold for definite radiographic
//     OA. Subchondral cysts are NOT a KL feature. Class A.
//   - pittsburghKneeRule (Seaberg DC, Jackson R, Am J Emerg Med 1994; validated
//     Seaberg 1998): entry gate is blunt trauma OR a fall -- without it the rule
//     does not apply. Given the gate, a radiograph is indicated if age < 12 OR
//     age > 50 (strict inequalities) OR inability to take 4 weight-bearing steps
//     in the ED. Sensitivity ~99%, specificity ~60% (Seaberg 1998). Class A.
//   - compartmentDeltaPressure (McQueen MM, Court-Brown CM, J Bone Joint Surg Br
//     1996;78:99-104): ΔP = diastolic BP - measured intracompartmental pressure
//     (mmHg). The published threshold for fasciotomy is ΔP < 30 mmHg ("drops to
//     under 30"); the differential is more reliable than an absolute-pressure
//     threshold. A non-finite or blank input returns valid:false, never NaN.
//     Class A.

import { num, r1 } from './num.js';

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

// --- 2.1 Frykman classification (distal radius) ------------------------------
const FRYKMAN_NOTE = 'Frykman Classification (Frykman G, Acta Orthop Scand 1967;Suppl 108) — types a distal-radius fracture on two axes: the joint involvement (extra-articular; radiocarpal joint; distal radioulnar joint; or both joints) and whether there is an associated distal-ulna (ulnar styloid) fracture. Odd types have no ulnar-styloid fracture and even types add one, so I/II are extra-articular, III/IV involve the radiocarpal joint, V/VI the distal radioulnar joint, and VII/VIII both joints. A higher type means more articular involvement and a generally worse prognosis; the system omits displacement, dorsal comminution, and shortening, so it does not capture every prognostic factor. It reports the type and that framing; the management plan stays with the hand/orthopedic team.';
// Joint axis -> the odd (no-ulnar) base type. Even type = base + 1 with ulnar.
const FRYKMAN_BASE = {
  extraArticular: { base: 1, joint: 'extra-articular' },
  radiocarpal: { base: 3, joint: 'radiocarpal joint involvement (intra-articular)' },
  radioulnar: { base: 5, joint: 'distal radioulnar joint involvement (intra-articular)' },
  both: { base: 7, joint: 'both the radiocarpal and distal radioulnar joints (intra-articular)' },
};
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export function frykmanClassification(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const b = FRYKMAN_BASE[o.joint];
  if (!b) return { valid: false, message: 'Choose the joint-involvement pattern (extra-articular, radiocarpal, radioulnar, or both).' };
  const ulnar = onFlag(o.ulnarStyloid);
  const n = b.base + (ulnar ? 1 : 0); // 1..8
  const roman = ROMAN[n];
  const abnormal = n >= 3; // any intra-articular type
  const ulnText = ulnar ? ' with an associated distal-ulna (ulnar styloid) fracture' : ' without an ulnar-styloid fracture';
  return {
    valid: true,
    classification: roman,
    type: n,
    abnormal,
    band: `Frykman Type ${roman} — ${b.joint}${ulnText}.`,
    note: FRYKMAN_NOTE,
  };
}

// --- 2.2 Mirels score (impending pathologic fracture) ------------------------
const MIRELS_NOTE = 'Mirels Score (Mirels H, Clin Orthop Relat Res 1989;(249):256-264) — estimates the risk that a long-bone metastasis will progress to a pathologic fracture, summing four factors each scored 1–3: site (upper limb 1, lower limb 2, peritrochanteric 3), pain (mild 1, moderate 2, functional/mechanical 3), radiographic nature (blastic 1, mixed 2, lytic 3), and size relative to the cortical diameter (<⅓ = 1, ⅓–⅔ = 2, >⅔ = 3). The total runs 4–12: ≤7 is low risk (about 0–4% fracture risk; irradiate and observe), 8 is borderline (about 15%; use clinical judgment), and ≥9 is high risk (over 33%; prophylactic fixation is recommended before radiotherapy). The ≥9 cutoff is sensitive but not specific, so a borderline 8 is a clinical decision. It reports the total, the factor scores, and that recommendation framing; the fixation decision stays with the orthopedic/oncology team.';
const MIRELS_SITE = { upper: { pts: 1, label: 'upper limb' }, lower: { pts: 2, label: 'lower limb' }, peritrochanteric: { pts: 3, label: 'peritrochanteric' } };
const MIRELS_PAIN = { mild: { pts: 1, label: 'mild' }, moderate: { pts: 2, label: 'moderate' }, functional: { pts: 3, label: 'functional (mechanical)' } };
const MIRELS_LESION = { blastic: { pts: 1, label: 'blastic' }, mixed: { pts: 2, label: 'mixed' }, lytic: { pts: 3, label: 'lytic' } };
const MIRELS_SIZE = { small: { pts: 1, label: '<⅓ of cortex' }, mid: { pts: 2, label: '⅓–⅔ of cortex' }, large: { pts: 3, label: '>⅔ of cortex' } };

export function mirelsScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const site = MIRELS_SITE[o.site];
  const pain = MIRELS_PAIN[o.pain];
  const lesion = MIRELS_LESION[o.lesion];
  const size = MIRELS_SIZE[o.size];
  if (!site || !pain || !lesion || !size) {
    return { valid: false, message: 'Choose all four factors: site, pain, radiographic nature, and size.' };
  }
  const total = num('Mirels total', site.pts + pain.pts + lesion.pts + size.pts, { min: 4, max: 12 });
  let band; let risk; let abnormal;
  if (total <= 7) { band = 'Low risk'; risk = '~0–4% fracture risk — irradiate and observe.'; abnormal = false; }
  else if (total === 8) { band = 'Borderline'; risk = '~15% fracture risk — borderline; use clinical judgment (consider prophylactic fixation).'; abnormal = false; }
  else { band = 'High risk'; risk = '>33% fracture risk — prophylactic fixation recommended before radiotherapy.'; abnormal = true; }
  return {
    valid: true,
    score: total,
    bandLabel: band,
    abnormal,
    factors: { site: site.pts, pain: pain.pts, lesion: lesion.pts, size: size.pts },
    band: `Mirels ${total}/12 — ${band}. ${risk}`,
    detail: `Site ${site.label} ${site.pts}, pain ${pain.label} ${pain.pts}, ${lesion.label} ${lesion.pts}, size ${size.label} ${size.pts}.`,
    note: MIRELS_NOTE,
  };
}

// --- 2.3 Kellgren-Lawrence osteoarthritis grade ------------------------------
const KL_NOTE = 'Kellgren-Lawrence Osteoarthritis Grade (Kellgren JH, Lawrence JS, Ann Rheum Dis 1957;16:494-502; feature wording codified in the 1963 Atlas of Standard Radiographs) — grades radiographic osteoarthritis 0–4 from the plain film: 0 no changes; 1 doubtful joint-space narrowing with possible osteophytic lipping; 2 definite osteophytes with possible joint-space narrowing; 3 moderate multiple osteophytes, definite narrowing, some sclerosis, and possible deformity of the bone ends; 4 large osteophytes, marked narrowing, severe sclerosis, and definite deformity. Grade ≥ 2 is the accepted threshold for definite radiographic OA (osteophyte plus narrowing). Radiographic grade correlates only loosely with symptoms. It reports the grade and that threshold; the clinical diagnosis and management stay with the clinician.';
const KL_MAP = {
  0: { label: 'none', text: 'no radiographic features of osteoarthritis.', definite: false },
  1: { label: 'doubtful', text: 'doubtful joint-space narrowing with possible osteophytic lipping.', definite: false },
  2: { label: 'minimal', text: 'definite osteophytes with possible joint-space narrowing — the threshold for definite radiographic OA.', definite: true },
  3: { label: 'moderate', text: 'moderate multiple osteophytes, definite joint-space narrowing, some sclerosis, and possible deformity of the bone ends.', definite: true },
  4: { label: 'severe', text: 'large osteophytes, marked joint-space narrowing, severe sclerosis, and definite deformity of the bone ends.', definite: true },
};

export function kellgrenLawrence(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.grade;
  const g = raw === 0 || raw === '0' ? 0 : raw === 1 || raw === '1' ? 1 : raw === 2 || raw === '2' ? 2 : raw === 3 || raw === '3' ? 3 : raw === 4 || raw === '4' ? 4 : null;
  if (g === null) return { valid: false, message: 'Choose the radiographic grade (0–4) that matches the film.' };
  const m = KL_MAP[g];
  return {
    valid: true,
    classification: String(g),
    grade: g,
    abnormal: g >= 2,
    definiteOA: m.definite,
    band: `Kellgren-Lawrence grade ${g} (${m.label}) — ${m.text}`,
    note: KL_NOTE,
  };
}

// --- 2.4 Pittsburgh knee rule ------------------------------------------------
const PITT_NOTE = 'Pittsburgh Knee Rules (Seaberg DC, Jackson R, Am J Emerg Med 1994; validated Seaberg 1998) — decide whether a knee radiograph is indicated after acute injury. The entry gate is a mechanism of blunt trauma or a fall; if neither applies the rule does not apply. Given the gate, a radiograph is indicated when the patient is younger than 12 or older than 50 years, or is unable to take four weight-bearing steps in the emergency department. In validation the rule was about 99% sensitive and 60% specific for clinically significant fractures, and unlike the Ottawa knee rule it applies to children. It reports the indicated/not-indicated decision; the imaging order stays with the clinician.';

export function pittsburghKneeRule(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mechanism = onFlag(o.mechanism); // blunt trauma OR a fall — the entry gate
  if (!mechanism) {
    return {
      valid: true,
      applies: false,
      indicated: false,
      abnormal: false,
      band: 'Entry mechanism absent — the Pittsburgh rule applies only to a blunt-trauma or fall mechanism. It does not classify this injury; assess on other grounds.',
      note: PITT_NOTE,
    };
  }
  const ageOut = onFlag(o.ageUnder12) || onFlag(o.ageOver50);
  const cantBear = onFlag(o.cannotBearWeight);
  const indicated = ageOut || cantBear;
  const reasons = [];
  if (onFlag(o.ageUnder12)) reasons.push('age < 12 years');
  if (onFlag(o.ageOver50)) reasons.push('age > 50 years');
  if (cantBear) reasons.push('unable to take 4 weight-bearing steps');
  const band = indicated
    ? `Knee radiograph indicated — blunt-trauma/fall mechanism plus ${reasons.join(' and ')}.`
    : 'Knee radiograph not indicated — blunt-trauma/fall mechanism but no high-risk criterion (age < 12 or > 50, or inability to bear weight 4 steps).';
  return {
    valid: true,
    applies: true,
    indicated,
    abnormal: indicated,
    band,
    note: PITT_NOTE,
  };
}

// --- 2.5 Compartment delta pressure ------------------------------------------
const COMPARTMENT_NOTE = 'Compartment Delta Pressure (McQueen MM, Court-Brown CM, J Bone Joint Surg Br 1996;78:99-104) — the differential pressure ΔP = diastolic blood pressure − measured intracompartmental pressure (mmHg). The published threshold for fasciotomy is ΔP < 30 mmHg; in the original tibial-fracture monitoring series using this differential threshold there were no missed cases of acute compartment syndrome, whereas an absolute-pressure threshold would have led to many unnecessary fasciotomies. ΔP is a single data point alongside the serial clinical exam (pain out of proportion, pain on passive stretch, the rest of the 5 Ps); a falling or borderline ΔP with a concerning exam warrants surgical consultation. It reports the signed ΔP and the < 30 mmHg flag; the decompression decision stays with the surgical team.';

export function compartmentDeltaPressure(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const dia = o.diastolic;
  const comp = o.compartment;
  if (typeof dia !== 'number' || !Number.isFinite(dia) || typeof comp !== 'number' || !Number.isFinite(comp)) {
    return { valid: false, message: 'Enter both the diastolic blood pressure and the measured compartment pressure (mmHg).' };
  }
  if (dia < 0 || dia > 250 || comp < 0 || comp > 250) {
    return { valid: false, message: 'Enter pressures in mmHg within a plausible range (0–250).' };
  }
  const delta = r1(num('delta pressure', dia - comp));
  const low = delta < 30; // McQueen 1996: fasciotomy if ΔP < 30 mmHg
  const band = low
    ? `ΔP = ${delta} mmHg (< 30) — below the published fasciotomy threshold; correlate urgently with the clinical exam and obtain surgical consultation.`
    : `ΔP = ${delta} mmHg (≥ 30) — above the published fasciotomy threshold; continue serial monitoring and clinical assessment.`;
  return {
    valid: true,
    delta,
    abnormal: low,
    belowThreshold: low,
    band,
    note: COMPARTMENT_NOTE,
  };
}
