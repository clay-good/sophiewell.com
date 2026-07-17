// spec-v402: Lauge-Hansen classification of rotational ankle fractures, by the mechanism of injury (the
// foot position + the deforming force) — supination-adduction (SA), supination-external-rotation (SER),
// pronation-abduction (PAB), pronation-external-rotation (PER), and pronation-dorsiflexion (PD). It is the
// mechanistic companion to the anatomic Danis-Weber ankle classification (weber-ankle) already in the
// catalog. "lauge hansen" / "ankle fracture mechanism" routed to nothing.
//
// HIGH-STAKES: this reports the mechanism PATTERN the clinician has determined from the radiographs, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The pattern
// describes the injury sequence; the management decision stays with the orthopedic team.
//
// PATTERNS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Lauge-Hansen N. Fractures of the ankle. II. Combined experimental-surgical and experimental-roentgen
//     logic investigations. Arch Surg. 1950;60(5):957-985 (the supination / pronation mechanism patterns
//     and their sequential stages).
//   - Orthopedic / radiology references reproducing the same SA / SER / PAB / PER (/ PD) mechanism
//     grouping and the fibula-level correlation with Danis-Weber (SER->Weber B, PAB/PER->Weber C).
//
// Patterns (foot position first, deforming force second; sequential stages within each):
//   SA  : supination-adduction. 1) transverse avulsion fracture of the lateral malleolus below the plafond
//         (or a lateral ligament tear); 2) vertical/oblique fracture of the medial malleolus.
//   SER : supination-external-rotation (the most common). 1) anterior tibiofibular (AITFL) injury;
//         2) spiral oblique fracture of the distal fibula at the plafond (Weber B); 3) posterior malleolus
//         fracture or PITFL injury; 4) medial malleolus fracture or deltoid rupture.
//   PAB : pronation-abduction. 1) medial malleolus fracture or deltoid rupture; 2) syndesmotic ligament
//         injury; 3) transverse / comminuted fracture of the fibula above the plafond (Weber C).
//   PER : pronation-external-rotation. 1) medial malleolus fracture or deltoid rupture; 2) AITFL injury;
//         3) high spiral fibula fracture above the syndesmosis (Weber C; Maisonneuve if very proximal);
//         4) posterior malleolus fracture or PITFL injury.
//   PD  : pronation-dorsiflexion. Axial-load pattern: medial malleolus, anterior tibial margin, fibula,
//         and posterior tibial plafond (pilon-type) injuries in sequence.

const PATTERNS = {
  SA: { code: 'SA', text: 'Lauge-Hansen supination-adduction (SA): 1) transverse avulsion fracture of the lateral malleolus below the plafond (or a lateral ligament tear); 2) vertical/oblique fracture of the medial malleolus.' },
  SER: { code: 'SER', text: 'Lauge-Hansen supination-external-rotation (SER, the most common): 1) AITFL injury; 2) spiral oblique fibula fracture at the plafond (Weber B); 3) posterior malleolus fracture or PITFL injury; 4) medial malleolus fracture or deltoid rupture.' },
  PAB: { code: 'PAB', text: 'Lauge-Hansen pronation-abduction (PAB): 1) medial malleolus fracture or deltoid rupture; 2) syndesmotic ligament injury; 3) transverse / comminuted fibula fracture above the plafond (Weber C).' },
  PER: { code: 'PER', text: 'Lauge-Hansen pronation-external-rotation (PER): 1) medial malleolus fracture or deltoid rupture; 2) AITFL injury; 3) high spiral fibula fracture above the syndesmosis (Weber C; Maisonneuve if very proximal); 4) posterior malleolus fracture or PITFL injury.' },
  PD: { code: 'PD', text: 'Lauge-Hansen pronation-dorsiflexion (PD): an axial-load pattern with medial malleolus, anterior tibial margin, fibula, and posterior tibial plafond (pilon-type) injuries in sequence.' },
};

const NOTE = 'The Lauge-Hansen classification (Lauge-Hansen 1950) groups a rotational ankle fracture by its mechanism - the foot position (supination / pronation) plus the deforming force (adduction / external rotation / abduction / dorsiflexion) - and describes the sequential injuries. It is the mechanistic companion to the anatomic Danis-Weber classification (SER correlates with Weber B; PAB and PER with Weber C). This reports the mechanism pattern the clinician has determined, not a diagnosis, a treatment decision, or a prognosis; the management decision stays with the orthopedic team. Companion: the Danis-Weber ankle classification.';

const ALIAS = {
  SA: 'SA', SER: 'SER', PAB: 'PAB', PER: 'PER', PD: 'PD',
  'SUPINATION-ADDUCTION': 'SA', 'SUPINATION ADDUCTION': 'SA',
  'SUPINATION-EXTERNAL-ROTATION': 'SER', 'SUPINATION EXTERNAL ROTATION': 'SER',
  'PRONATION-ABDUCTION': 'PAB', 'PRONATION ABDUCTION': 'PAB',
  'PRONATION-EXTERNAL-ROTATION': 'PER', 'PRONATION EXTERNAL ROTATION': 'PER',
  'PRONATION-DORSIFLEXION': 'PD', 'PRONATION DORSIFLEXION': 'PD',
};

// input:
//   mechanism: 'SA' / 'SER' / 'PAB' / 'PER' / 'PD' (case-insensitive; also accepts the spelled-out
//   mechanism names).
export function laugeHansen(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.mechanism == null ? '' : o.mechanism).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const p = PATTERNS[key];
  if (!p) {
    return { valid: false, message: 'Select the Lauge-Hansen mechanism (SA, SER, PAB, PER, or PD).' };
  }
  return {
    valid: true,
    mechanism: p.code,
    bandLabel: `Lauge-Hansen ${p.code}`,
    band: p.text,
    note: NOTE,
  };
}
