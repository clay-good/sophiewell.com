// spec-v524: the Gray-Weale (Gray-Weale/Nicolaides) classification of carotid plaque echogenicity on B-mode
// ultrasound. Zero-hit before this tile: "gray-weale", "weale", "echolucent", "nicolaides", and "gsm" across
// corpus.json, app.js, and lib/meta.js, with no test/unit file. ("echogenicity" and "plaque" have hits, but
// they belong to the ACR TI-RADS thyroid tile and to unrelated prose respectively - vet what a token is
// DOING, not just that it appears.)
//
// A DIFFERENT AXIS ON THE SAME VESSEL FROM THE EXISTING nascet-carotid-stenosis TILE, which is why it is not
// a second answer to a question already answered. NASCET measures HOW NARROW the lumen is. Gray-Weale
// describes WHAT THE PLAQUE IS MADE OF, as far as ultrasound can tell. The two are known to disagree: a
// tight stenosis can be uniformly echogenic and a modest one uniformly echolucent, so neither number
// substitutes for the other.
//
// FOUR TYPES, DARK TO BRIGHT:
//   1  uniformly echolucent, typically beneath a thin echogenic cap
//   2  predominantly echolucent, with small areas of echogenicity
//   3  predominantly echogenic, with small areas of echolucency
//   4  uniformly echogenic, including the extensively calcified plaque
// Types 1 and 2 are conventionally grouped as ECHOLUCENT and types 3 and 4 as ECHOGENIC; the tile returns
// that grouping alongside the type because most of the published association is reported at the group level.
//
// IT IS A GRADE READ BY EYE, AND THE TILE SAYS SO. The reading is made against reference structures in the
// same image - the vessel LUMEN anchors what counts as echolucent, and the bright media-adventitia interface
// in the FAR WALL anchors what counts as echogenic - so it depends on gain settings and on the operator.
// This subjectivity is the reason computerized grayscale-median measurement exists as an alternative; this
// tile records the visual type and does not compute a grayscale median.
//
// HIGH-STAKES: echolucent plaque has been ASSOCIATED with symptomatic disease in published series. That is a
// group-level association, not a risk for the patient in front of you, and this tile therefore states the
// direction without attaching a stroke rate to a type. Most importantly, the plaque type is NOT an
// indication for carotid endarterectomy or stenting: the trials that established when to intervene selected
// patients on DEGREE OF STENOSIS and SYMPTOM STATUS, not on echogenicity, so a type 1 plaque is not a reason
// to operate and a type 4 plaque is not a reason not to (spec-v11 section 5.3). It also says nothing about
// medical therapy, which is driven by the presence of atherosclerosis rather than its appearance. The
// management decision stays with the clinician.
//
// TYPES AND REFERENCE STRUCTURES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing
// sources:
//   - Gray-Weale AC, Graham JC, Burnett JR, Byrne K, Lusby RJ. Carotid artery atheroma: comparison of
//     preoperative B-mode ultrasound appearance with carotid endarterectomy specimen pathology.
//     J Cardiovasc Surg (Torino). 1988;29(6):676-681.
//   - Carotid-ultrasound references reproducing the same four types in the same order (uniformly echolucent,
//     predominantly echolucent, predominantly echogenic, uniformly echogenic or extensively calcified), the
//     same echolucent/echogenic grouping, and the lumen and far-wall media-adventitia reference structures.

export const GRAY_WEALE_TYPES = [
  {
    value: '1',
    label: 'Type 1',
    group: 'echolucent',
    text: 'Uniformly echolucent, typically beneath a thin echogenic cap.',
    detail: 'The darkest of the four. Echolucency is judged against the vessel lumen in the same image.',
  },
  {
    value: '2',
    label: 'Type 2',
    group: 'echolucent',
    text: 'Predominantly echolucent, with small areas of echogenicity.',
    detail: 'Mostly dark, with scattered brighter areas.',
  },
  {
    value: '3',
    label: 'Type 3',
    group: 'echogenic',
    text: 'Predominantly echogenic, with small areas of echolucency.',
    detail: 'Mostly bright, with scattered darker areas.',
  },
  {
    value: '4',
    label: 'Type 4',
    group: 'echogenic',
    text: 'Uniformly echogenic, including the extensively calcified plaque.',
    detail: 'The brightest of the four. Echogenicity is judged against the media-adventitia interface in the far wall. Dense calcification can cast an acoustic shadow that hides plaque behind it.',
  },
];

const NOTE = 'The Gray-Weale classification (Gray-Weale and colleagues 1988) describes carotid plaque echogenicity on B-mode ultrasound in four types, from uniformly echolucent (type 1) through predominantly echolucent (2) and predominantly echogenic (3) to uniformly echogenic or extensively calcified (4). Types 1 and 2 are conventionally grouped as echolucent and types 3 and 4 as echogenic. This is a different axis from the degree of stenosis: NASCET measures how narrow the lumen is, this describes what the plaque appears to be made of, and the two are known to disagree, so neither substitutes for the other. It is a grade read by eye. The reading is anchored to structures in the same image, the vessel lumen for echolucency and the bright media-adventitia interface in the far wall for echogenicity, so it depends on gain settings and on the operator, which is why computerized grayscale-median measurement exists as an alternative. Echolucent plaque has been associated with symptomatic disease in published series; that is a group-level association rather than a risk for an individual patient, so no stroke rate is attached to a type here. The plaque type is not an indication for carotid endarterectomy or stenting: the trials that established when to intervene selected patients on degree of stenosis and symptom status, not on echogenicity, so a type 1 plaque is not a reason to operate and a type 4 plaque is not a reason not to.';

// input: type -- '1', '2', '3', or '4' (roman numerals I-IV also accepted).
export function grayWeale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.type;

  if (raw === '' || raw === null || raw === undefined) {
    return { valid: false, message: 'Choose the plaque type: 1, 2, 3, or 4.' };
  }

  const ROMAN = { I: '1', II: '2', III: '3', IV: '4' };
  let key = String(raw).trim().toUpperCase();
  if (Object.prototype.hasOwnProperty.call(ROMAN, key)) key = ROMAN[key];

  const entry = GRAY_WEALE_TYPES.find((t) => t.value === key);
  if (!entry) {
    return { valid: false, message: 'Type must be 1, 2, 3, or 4.' };
  }

  const groupText = entry.group === 'echolucent'
    ? 'Grouped with the echolucent plaques (types 1 and 2), which published series have associated with symptomatic disease at the group level.'
    : 'Grouped with the echogenic plaques (types 3 and 4).';

  return {
    valid: true,
    type: entry.value,
    group: entry.group,
    bandLabel: `Gray-Weale ${entry.label} (${entry.group})`,
    band: `${entry.label}: ${entry.text} ${entry.detail} ${groupText} This describes the plaque, not the degree of stenosis, and is not an indication for carotid intervention.`,
    note: NOTE,
  };
}
