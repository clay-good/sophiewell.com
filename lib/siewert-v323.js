// spec-v323: Siewert classification of adenocarcinoma of the esophagogastric junction
// (AEG). The clinician selects the type (I-III) from the location of the tumor center
// relative to the anatomic GEJ; the tile reports the type and its standard definition. The
// catalog had no Siewert tile ("siewert" had zero corpus hits); it is the most frequently
// used AEG classification and informs the surgical approach. "siewert" / "esophagogastric
// junction adenocarcinoma type" routed to nothing.
//
// HIGH-STAKES: this reports the ANATOMIC CLASSIFICATION the clinician has determined, NOT a
// stage or a treatment order (spec-v11 §5.3). The surgical approach stays with the clinician.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Siewert JR, Stein HJ. Classification of adenocarcinoma of the oesophagogastric
//     junction. Br J Surg. 1998;85(11):1457-1459.
//   - Multiple reviews reproducing the same 1-5 cm above / 1 above to 2 below / 2-5 cm
//     below GEJ definitions (approved at the 1997 Munich IGCC).
//
// Types (by the location of the tumor center relative to the anatomic GEJ, within 5 cm):
//   I   : 1 to 5 cm ABOVE the GEJ -- distal esophageal adenocarcinoma.
//   II  : 1 cm above to 2 cm below the GEJ -- true carcinoma of the cardia.
//   III : 2 to 5 cm BELOW the GEJ -- subcardial gastric carcinoma infiltrating the cardia.

const TYPES = {
  1: {
    roman: 'I',
    label: 'Siewert type I',
    text: 'Siewert type I — adenocarcinoma of the distal esophagus with the tumor center located 1 to 5 cm above the anatomic esophagogastric junction (GEJ). A true (distal) esophageal adenocarcinoma.',
  },
  2: {
    roman: 'II',
    label: 'Siewert type II',
    text: 'Siewert type II — true carcinoma of the cardia with the tumor center located within 1 cm above to 2 cm below the GEJ (the junctional zone).',
  },
  3: {
    roman: 'III',
    label: 'Siewert type III',
    text: 'Siewert type III — subcardial gastric carcinoma with the tumor center located 2 to 5 cm below the GEJ, infiltrating the GEJ and distal esophagus from below.',
  },
};

const NOTE = 'Siewert classification of adenocarcinoma of the esophagogastric junction (Siewert & Stein 1998), by the location of the tumor center relative to the anatomic GEJ, within 5 cm of the cardia. Type I: 1 to 5 cm above the GEJ (distal esophageal adenocarcinoma). Type II: 1 cm above to 2 cm below the GEJ (true cardia carcinoma). Type III: 2 to 5 cm below the GEJ (subcardial gastric carcinoma infiltrating the cardia). It informs the surgical approach (for example esophagectomy versus extended gastrectomy) but is an anatomic classification, not a stage or a treatment order, which stay with the clinician.';

// input:
//   type: 1 | 2 | 3 (also accepts the roman numerals 'I' | 'II' | 'III')
export function siewert(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const ROMAN = { I: 1, II: 2, III: 3 };
  const n = Object.prototype.hasOwnProperty.call(ROMAN, raw) ? ROMAN[raw] : Number(raw);
  const t = TYPES[n];
  if (!t) {
    return { valid: false, message: 'Select the Siewert type (I, II, or III).' };
  }
  return {
    valid: true,
    type: n,
    class: t.roman,
    abnormal: false,
    bandLabel: t.label,
    band: t.text,
    note: NOTE,
  };
}
