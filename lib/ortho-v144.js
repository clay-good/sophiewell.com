// spec-v144 (Wave 8 of the spec-v100 MDCalc Parity Completion program): six
// orthopedic fracture-classification decision rules that fill confirmed gaps
// beside the orthopedic triage/risk cluster (ottawa-ankle, ottawa-knee,
// nexus-cspine, canadian-c-spine). None duplicates a live tile; v144 parses no
// image and runs no AI.
//
//   gustiloAnderson        - open long-bone fracture severity I / II / IIIA-C
//   gardenClassification   - femoral-neck displacement grade I-IV
//   weberAnkle             - distal-fibula level vs syndesmosis A / B / C
//   schatzkerClassification- tibial-plateau type I-VI
//   salterHarris           - physeal (growth-plate) fracture type I-V
//   neerClassification     - proximal-humerus displaced-part count 1-4
//
// Per the spec-v100 §2 classification clarification, each tile CONSUMES the
// clinician's read of the film (wound size, displacement, fibula level, plateau
// geometry, physeal pattern, displaced-part count) and COMPUTES a class -- it is
// not a no-input reference table. Pure functions only (spec-v29 §3 one-line
// test). Citations live inline in lib/meta.js; renderers in views/group-v144.js
// render the spec-v50 §3 clinical-posture note. Each tile reports the class and
// the source's management-relevant interpretation; the operative decision stays
// with the clinician and local protocol (spec-v11 §5.3).
//
// CATEGORY DEFINITIONS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-
// verified across >= 2 independent authoritative sources (AO Foundation,
// Orthobullets, Radiopaedia, the original / CORR "Classifications in Brief"
// papers, StatPearls). NO-FABRICATION / SOURCE-GOVERNANCE:
//   - gustiloAnderson (Gustilo RB, Anderson JT, J Bone Joint Surg Am 1976; Type
//     III A/B/C subtypes Gustilo, Mendoza, Williams, J Trauma 1984): the III
//     subtype is decided by COVERAGE and VASCULAR status, NOT wound size. An
//     arterial injury requiring repair forces IIIC irrespective of wound size or
//     soft-tissue grade; inadequate coverage requiring a flap forces IIIB; an
//     extensive-soft-tissue / high-energy qualifier (segmental, traumatic
//     amputation, gunshot/high-velocity, farm injury) or a wound > 10 cm forces
//     at least Type III (IIIA when coverage is adequate and no vascular repair is
//     needed). The unverifiable mnemonic triggers (">8 h old", "war/combat",
//     "mass casualty") are deliberately NOT encoded -- they are absent from the
//     canonical definition. Class A.
//   - gardenClassification (Garden RS, J Bone Joint Surg Br 1961): I incomplete
//     valgus-impacted (nondisplaced), II complete nondisplaced, III complete
//     partially displaced (trabecular angle altered), IV complete fully displaced
//     (trabeculae realign parallel). Stable I-II vs unstable III-IV -- the
//     displacement split that drives internal-fixation vs arthroplasty. Class A.
//   - weberAnkle (Weber BG, Die Verletzungen des oberen Sprunggelenkes, 1972;
//     pathologic-anatomic basis Danis 1949; adopted by the AO Foundation as
//     44-A/B/C): defined SOLELY by the distal-fibula fracture level relative to
//     the syndesmosis -- A below (infrasyndesmotic, syndesmosis intact, stable),
//     B at (transsyndesmotic, syndesmosis variable -- requires a medial/stress
//     check before declaring stability), C above (suprasyndesmotic, syndesmosis
//     disrupted, unstable). Source date is 1972 (a common reproduction prints
//     1966). Class B (textbook/monograph, AO-adopted -- citation-staleness row).
//   - schatzkerClassification (Schatzker J, McBroom R, Bruce D, Clin Orthop Relat
//     Res 1979): I lateral split, II lateral split-depression, III lateral pure
//     (central) depression, IV medial plateau, V bicondylar, VI plateau fracture
//     with metaphyseal-diaphyseal dissociation. Low-energy I-III vs high-energy
//     IV-VI; IV-VI carry the worst prognosis (IV neurovascular, VI compartment-
//     syndrome risk). Class A.
//   - salterHarris (Salter RB, Harris WR, J Bone Joint Surg Am 1963): SALTR --
//     I Slipped (through physis only), II Above (physis + metaphysis, Thurston-
//     Holland fragment; the most common, ~75%), III Lower (physis + epiphysis,
//     intra-articular), IV Through (metaphysis + physis + epiphysis, intra-
//     articular), V cRush (physeal compression, often radiographically occult).
//     Growth-disturbance risk worsens ascending I -> V. Class A.
//   - neerClassification (Neer CS 2nd, J Bone Joint Surg Am 1970): four segments
//     (articular surface/anatomic neck, greater tuberosity, lesser tuberosity,
//     surgical neck/shaft); a segment is DISPLACED when separated > 1 cm OR
//     angulated > 45 deg. The part count is 1 + the number of displaced segments
//     (an undisplaced fracture is one-part regardless of the number of fracture
//     lines). Fracture-dislocation is a modifier. Class A.

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

// --- 2.1 Gustilo-Anderson ----------------------------------------------------
const GUSTILO_NOTE = 'Gustilo-Anderson Open Fracture Classification (Gustilo RB, Anderson JT, J Bone Joint Surg Am 1976; Type III A/B/C subtypes Gustilo, Mendoza, Williams, J Trauma 1984) — grades open long-bone fractures by wound size, contamination/energy, soft-tissue coverage, and vascular status, tracking rising infection risk (roughly 0–2% for I, 2–7% for II, 10–50% for III). The Type III subtype is set by coverage and perfusion, not wound size: an arterial injury requiring repair is IIIC regardless of the wound, inadequate coverage requiring a flap is IIIB, and an extensive-soft-tissue/high-energy mechanism (segmental, traumatic amputation, gunshot, farm injury) or a wound over 10 cm is at least Type III. The definitive grade is often set intra-operatively after debridement. It reports the class and the source’s coverage/infection framing; the operative plan stays with the trauma and orthopedic team.';
const GUSTILO_INFO = {
  I: 'Type I — wound under 1 cm, clean, low-energy, minimal soft-tissue injury; lowest infection risk.',
  II: 'Type II — wound 1–10 cm, moderate soft-tissue damage without extensive stripping, flaps, or avulsion; adequate coverage.',
  IIIA: 'Type IIIA — extensive soft-tissue injury or high-energy mechanism but adequate soft-tissue coverage of bone; no flap required.',
  IIIB: 'Type IIIB — extensive soft-tissue loss with periosteal stripping and bone exposure requiring flap (rotational/free) coverage; involve plastic surgery.',
  IIIC: 'Type IIIC — open fracture with an arterial injury requiring repair, irrespective of wound size or soft-tissue grade; involve vascular surgery for revascularization.',
};

export function gustiloAnderson(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!(o.wound === 'lt1' || o.wound === '1to10' || o.wound === 'gt10')) {
    return { valid: false, message: 'Choose the wound size; check any soft-tissue, flap, or vascular findings present.' };
  }
  const arterial = onFlag(o.arterial);
  const flap = onFlag(o.flapCoverage);
  const highEnergy = onFlag(o.severeSoftTissue);
  const isThree = arterial || flap || highEnergy || o.wound === 'gt10';
  let cls;
  if (isThree) {
    cls = arterial ? 'IIIC' : flap ? 'IIIB' : 'IIIA';
  } else {
    cls = o.wound === 'lt1' ? 'I' : 'II';
  }
  const abnormal = cls.startsWith('III');
  return {
    valid: true,
    classification: cls,
    abnormal,
    band: `Gustilo-Anderson Type ${cls}. ${GUSTILO_INFO[cls]}`,
    note: GUSTILO_NOTE,
  };
}

// --- 2.2 Garden classification (femoral neck) --------------------------------
const GARDEN_NOTE = 'Garden Classification (Garden RS, J Bone Joint Surg Br 1961) — grades a femoral-neck fracture by completeness and displacement on the AP radiograph: I incomplete/valgus-impacted, II complete nondisplaced, III complete partially displaced (the head trabeculae no longer line up with the acetabulum), IV complete fully displaced (the trabeculae realign parallel). Grades I–II are stable/nondisplaced and III–IV are unstable/displaced — the split that drives management (internal fixation for nondisplaced or younger patients; arthroplasty for displaced fractures in older patients). Interobserver agreement is far better for the displaced-vs-nondisplaced grouping than for the four grades. It reports the grade and that framing; the fixation decision stays with the orthopedic team.';
const GARDEN_MAP = {
  incomplete: { grade: 'I', text: 'Grade I — incomplete, valgus-impacted fracture; nondisplaced. Stable (I–II).', displaced: false },
  complete: { grade: 'II', text: 'Grade II — complete fracture, nondisplaced. Stable (I–II).', displaced: false },
  partial: { grade: 'III', text: 'Grade III — complete fracture, partially displaced (trabecular angle altered). Unstable (III–IV).', displaced: true },
  full: { grade: 'IV', text: 'Grade IV — complete fracture, fully displaced (trabeculae realign parallel). Unstable (III–IV).', displaced: true },
};

export function gardenClassification(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const m = GARDEN_MAP[o.pattern];
  if (!m) return { valid: false, message: 'Choose the femoral-neck displacement pattern.' };
  return {
    valid: true,
    classification: m.grade,
    abnormal: m.displaced,
    band: `Garden ${m.text}`,
    note: GARDEN_NOTE,
  };
}

// --- 2.3 Danis-Weber ankle ---------------------------------------------------
const WEBER_NOTE = 'Danis-Weber Ankle Classification (Weber BG, Die Verletzungen des oberen Sprunggelenkes, 1972; pathologic-anatomic basis Danis 1949; adopted by the AO Foundation as 44-A/B/C) — classifies a distal-fibula fracture by its level relative to the tibiofibular syndesmosis: A below (infrasyndesmotic, syndesmosis intact, usually stable), B at the level (transsyndesmotic, syndesmosis variably injured — a medial/stress check is needed before calling it stable), C above (suprasyndesmotic, syndesmosis disrupted, unstable, usually ORIF with syndesmotic fixation). Higher fracture, higher type. It reports the type and the source’s stability framing; the operative decision stays with the orthopedic team.';
const WEBER_MAP = {
  below: { type: 'A', text: 'Type A — infrasyndesmotic (below the syndesmosis); syndesmosis intact, usually a stable injury.', unstable: false },
  at: { type: 'B', text: 'Type B — transsyndesmotic (at the level of the syndesmosis); syndesmosis variably injured — assess the medial side / stress films before declaring stability.', unstable: false },
  above: { type: 'C', text: 'Type C — suprasyndesmotic (above the syndesmosis); syndesmosis disrupted, an unstable injury usually needing fixation.', unstable: true },
};

export function weberAnkle(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const m = WEBER_MAP[o.level];
  if (!m) return { valid: false, message: 'Choose the distal-fibula fracture level relative to the syndesmosis.' };
  return {
    valid: true,
    classification: m.type,
    abnormal: m.unstable,
    band: `Danis-Weber ${m.text}`,
    note: WEBER_NOTE,
  };
}

// --- 2.4 Schatzker classification (tibial plateau) ---------------------------
const SCHATZKER_NOTE = 'Schatzker Classification (Schatzker J, McBroom R, Bruce D, Clin Orthop Relat Res 1979) — grades a tibial-plateau fracture by pattern and condylar involvement: I lateral split, II lateral split-depression, III lateral pure (central) depression, IV medial plateau, V bicondylar, VI plateau fracture with metaphyseal-diaphyseal dissociation. Types I–III are typically low-energy; IV–VI are high-energy with the worst prognosis (Type IV carries peroneal-nerve and popliteal-vessel risk, Type VI compartment-syndrome risk, and V–VI are often staged). It reports the type and the source’s energy/management framing; the operative plan stays with the orthopedic team.';
const SCHATZKER_MAP = {
  lateralSplit: { type: 'I', text: 'Type I — lateral plateau split (wedge), no depression. Low-energy (I–III).', high: false },
  lateralSplitDepression: { type: 'II', text: 'Type II — lateral plateau split-depression. Low-energy (I–III).', high: false },
  lateralDepression: { type: 'III', text: 'Type III — lateral plateau pure (central) depression, no split. Low-energy (I–III).', high: false },
  medial: { type: 'IV', text: 'Type IV — medial plateau fracture; high-energy (IV–VI), worst prognosis — assess for peroneal-nerve and popliteal-vessel injury.', high: true },
  bicondylar: { type: 'V', text: 'Type V — bicondylar fracture (both plateaus). High-energy (IV–VI), often staged.', high: true },
  dissociation: { type: 'VI', text: 'Type VI — plateau fracture with metaphyseal-diaphyseal dissociation. High-energy (IV–VI); watch for compartment syndrome.', high: true },
};

export function schatzkerClassification(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const m = SCHATZKER_MAP[o.pattern];
  if (!m) return { valid: false, message: 'Choose the tibial-plateau fracture pattern.' };
  return {
    valid: true,
    classification: m.type,
    abnormal: m.high,
    band: `Schatzker ${m.text}`,
    note: SCHATZKER_NOTE,
  };
}

// --- 2.5 Salter-Harris (physeal) ---------------------------------------------
const SALTER_NOTE = 'Salter-Harris Classification (Salter RB, Harris WR, J Bone Joint Surg Am 1963) — grades a physeal (growth-plate) fracture by the SALTR mnemonic: I Slipped (through the physis only), II Above (physis into the metaphysis, with a Thurston-Holland fragment; the most common at about 75%), III Lower (physis into the epiphysis, intra-articular), IV Through (across metaphysis, physis, and epiphysis, intra-articular), V cRush (compression of the physis, often radiographically occult). Growth-disturbance risk rises ascending I to V; III and IV are intra-articular and usually need anatomic reduction. It reports the type and the source’s prognosis framing; the management decision stays with the (pediatric) orthopedic team.';
const SALTER_MAP = {
  physis: { type: 'I', text: 'Type I — fracture through the physis only (epiphysis separates from metaphysis); lowest growth-arrest risk.', high: false },
  metaphysis: { type: 'II', text: 'Type II — through the physis and into the metaphysis (Thurston-Holland fragment); the most common pattern (~75%).', high: false },
  epiphysis: { type: 'III', text: 'Type III — through the physis and into the epiphysis; intra-articular, usually needs anatomic reduction.', high: true },
  both: { type: 'IV', text: 'Type IV — across the metaphysis, physis, and epiphysis; intra-articular, higher growth-arrest risk, usually needs ORIF.', high: true },
  crush: { type: 'V', text: 'Type V — crush/compression of the physis; often radiographically occult, poorest prognosis for growth arrest.', high: true },
};

export function salterHarris(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const m = SALTER_MAP[o.pattern];
  if (!m) return { valid: false, message: 'Choose the physeal-fracture pattern (relation to physis, metaphysis, epiphysis).' };
  return {
    valid: true,
    classification: m.type,
    abnormal: m.high,
    band: `Salter-Harris ${m.text}`,
    note: SALTER_NOTE,
  };
}

// --- 2.6 Neer classification (proximal humerus) ------------------------------
const NEER_SEGMENTS = [
  ['articular', 'articular surface (anatomic neck)'],
  ['greaterTuberosity', 'greater tuberosity'],
  ['lesserTuberosity', 'lesser tuberosity'],
  ['shaft', 'surgical neck / shaft'],
];
const NEER_WORDS = ['one-part', 'two-part', 'three-part', 'four-part'];
const NEER_NOTE = 'Neer Classification (Neer CS 2nd, J Bone Joint Surg Am 1970) — classifies a proximal-humerus fracture by how many of the four segments (articular surface/anatomic neck, greater tuberosity, lesser tuberosity, surgical neck/shaft) are displaced. A segment counts as displaced when it is separated more than 1 cm or angulated more than 45 degrees; the part count is one plus the number of displaced segments, so an undisplaced fracture is one-part no matter how many fracture lines it has. One-part fractures are generally stable and treated nonoperatively; higher part counts (especially four-part) are unstable with a higher avascular-necrosis risk. Fracture-dislocation is noted as a modifier. It reports the part classification and the source’s displacement framing; the operative decision stays with the orthopedic team.';

export function neerClassification(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const displaced = [];
  for (const [key, label] of NEER_SEGMENTS) {
    if (onFlag(o[key])) displaced.push(label);
  }
  // Part count = 1 + displaced segments, clamped to the published 1-4 range
  // (spec-v144 §3 fixed integer guard): the articular/head segment is the
  // anchor, so four-part is the ceiling even if all four selects are checked.
  const parts = Math.min(1 + displaced.length, 4); // 1..4 — one-part when nothing is displaced
  const dislocation = onFlag(o.dislocation);
  const word = NEER_WORDS[parts - 1];
  const named = displaced.length ? ` Displaced: ${displaced.join(', ')}.` : ' No segment meets the > 1 cm / > 45° displacement criteria.';
  const disText = dislocation ? ' Fracture-dislocation present (classified by part count plus direction).' : '';
  return {
    valid: true,
    classification: word,
    parts,
    abnormal: parts >= 3 || dislocation,
    displaced,
    dislocation,
    band: `Neer ${word} fracture (${displaced.length} displaced segment${displaced.length === 1 ? '' : 's'}).${named}${disText}`,
    note: NEER_NOTE,
  };
}
