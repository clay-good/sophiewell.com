// spec-v406: Le Fort classification of midface (maxillary) fractures, by the level of the transverse
// fracture plane through the midface — types I / II / III. A maxillofacial-trauma classification the
// clinician determines from the CT. "le fort" / "midface fracture" / "maxillary fracture classification"
// routed to nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Higher levels involve more
// of the craniofacial skeleton, but this reports the type; the management decision stays with the
// maxillofacial / trauma team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Le Fort R. Etude experimentale sur les fractures de la machoire superieure. Rev Chir Paris.
//     1901;23:208-227, 360-379, 479-507 (the original I / II / III midface-fracture patterns).
//   - Maxillofacial-surgery / radiology references reproducing the same floating-palate (I) /
//     pyramidal-floating-maxilla (II) / craniofacial-disjunction (III) grouping; each level's fracture
//     passes through the pterygoid plates.
//
// Types (level of the transverse midface fracture; all involve the pterygoid plates):
//   I   : horizontal ("floating palate") fracture across the maxilla above the tooth apices, separating
//         the alveolar process and hard palate from the rest of the maxilla (Guerin fracture).
//   II  : pyramidal ("floating maxilla") fracture through the central maxilla up through the infraorbital
//         rims and medial orbital walls to the nasofrontal region.
//   III : craniofacial disjunction ("floating face") - a transverse fracture separating the entire midface
//         from the skull base through the nasofrontal suture, medial and lateral orbital walls, and
//         zygomaticofrontal sutures.

const TYPES = {
  I: { type: 'I', text: 'Le Fort I - a horizontal "floating palate" fracture across the maxilla above the tooth apices, separating the alveolar process and hard palate from the rest of the maxilla (Guerin fracture).' },
  II: { type: 'II', text: 'Le Fort II - a pyramidal "floating maxilla" fracture through the central maxilla, up through the infraorbital rims and medial orbital walls to the nasofrontal region.' },
  III: { type: 'III', text: 'Le Fort III - craniofacial disjunction ("floating face"): a transverse fracture separating the entire midface from the skull base through the nasofrontal suture, medial and lateral orbital walls, and zygomaticofrontal sutures.' },
};

const NOTE = 'The Le Fort classification (Le Fort 1901) groups a midface (maxillary) fracture by the level of the transverse fracture plane; all three levels pass through the pterygoid plates. I: horizontal floating palate (Guerin). II: pyramidal floating maxilla, up to the nasofrontal region. III: craniofacial disjunction, the whole midface separated from the skull base. Patterns are often mixed or asymmetric. Higher levels involve more of the craniofacial skeleton, but this reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   type: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3).
export function leFort(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Le Fort type (I, II, or III).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Le Fort ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
