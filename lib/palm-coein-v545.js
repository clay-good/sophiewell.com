// spec-v545: the FIGO PALM-COEIN classification of abnormal uterine bleeding in non-gravid women of
// reproductive age. Zero-hit before this tile: "palm-coein", "coein", "munro", "abnormal uterine bleeding",
// and "leiomyoma" across corpus.json, app.js, and lib/meta.js.
//
// A DIFFERENT AXIS FROM THE EXISTING pbac TILE. The pictorial blood loss assessment chart quantifies HOW
// MUCH a woman is bleeding. PALM-COEIN classifies WHY. A heavy PBAC score says nothing about cause, and a
// PALM-COEIN code says nothing about volume; the two are routinely reported together and neither substitutes
// for the other.
//
// **THIS IS NOT A SCORE. IT IS A NOTATION, AND EVERY CATEGORY IS REPORTED FOR EVERY PATIENT.** The system is
// explicitly modelled on TNM staging: each of the nine categories is addressed in every case, so a complete
// classification looks like "AUB P0 A0 L1(SM) M0 - C0 O1 E0 I0 N0". Categories are not omitted when absent;
// they are recorded as 0. That is the point of the system -- an unstated category is ambiguous between
// "looked for and not found" and "never assessed", which is why a third value exists.
//
// **THERE ARE THREE VALUES PER CATEGORY, NOT TWO: 0 ABSENT, 1 PRESENT, AND ? NOT YET ASSESSED.** A tile that
// offered only present/absent would force a clinician who has not yet done imaging or a coagulation screen
// to assert an absence they have not established. The "?" is a first-class answer here.
//
// THE NINE CATEGORIES SPLIT INTO STRUCTURAL AND NON-STRUCTURAL, WHICH IS WHAT THE ACRONYM ENCODES:
//   PALM  -- defined by visually objective structural criteria: Polyp, Adenomyosis, Leiomyoma,
//            Malignancy and hyperplasia
//   COEI  -- unrelated to structural anomalies: Coagulopathy, Ovulatory dysfunction, Endometrial, Iatrogenic
//   N     -- Not otherwise classified, for entities not yet placed
// Multiple categories can be positive at once, and commonly are: a woman may have a leiomyoma AND an
// ovulatory disorder, and the system exists partly because assuming the visible structural lesion is the
// cause is a known error.
//
// THE LEIOMYOMA CATEGORY HAS THREE TIERS, AND THE SECOND IS THE ONE THAT MATTERS CLINICALLY:
//   primary    present or absent, regardless of location, number, or size
//   secondary  SM (submucosal, involving the endometrial cavity) versus O (all others) -- because submucosal
//              lesions are the ones generally considered most likely to cause the bleeding
//   tertiary   types 0 to 8, describing the exact relationship to the myometrium
// A transmural lesion is notated with the endometrial relationship FIRST and the serosal SECOND, hyphenated,
// for example 2-3.
//
// **THIS TILE IMPLEMENTS THE 2018 REVISION AND SAYS SO, BECAUSE THE TWO EDITIONS DISAGREE IN WAYS THAT
// CHANGE A CASE'S CLASSIFICATION.** Two differences matter: type 3, which the 2011 paper placed outside the
// submucous group, is placed INSIDE it from 2018 (so SM spans types 0-3 and O spans 3-8, with type 3
// straddling); and anticoagulant-associated bleeding, classified as AUB-C in 2011, MOVED TO AUB-I in 2018,
// along with medications causing ovulatory disorders. A record classified under one edition cannot be
// silently compared with one classified under the other, and both remain in active clinical use, so the
// edition is stated in the output rather than assumed.
//
// HIGH-STAKES: this is a framework for organising a diagnosis, not a diagnosis. It does not establish that
// any category is present -- each requires its own assessment, and the structural categories in particular
// require imaging or histology. It does not exclude malignancy: AUB-M is a category to be assessed, and a
// classification recorded before endometrial sampling has been done says nothing about whether cancer is
// present. It does not quantify bleeding, does not assess anemia, does not identify pregnancy, which must be
// excluded first in any woman of reproductive age, and is not a treatment algorithm (spec-v11 section 5.3).
// The diagnosis stays with the clinician.
//
// CATEGORIES, TIERS, AND NOTATION RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the primary
// publication and its 2024 restatement by the same lead author:
//   - Munro MG, Critchley HOD, Broder MS, Fraser IS; FIGO Working Group on Menstrual Disorders. FIGO
//     classification system (PALM-COEIN) for causes of abnormal uterine bleeding in nongravid women of
//     reproductive age. Int J Gynaecol Obstet. 2011;113(1):3-13.
//   - Munro MG, Critchley HOD, Fraser IS. The two FIGO systems for normal and abnormal uterine bleeding
//     symptoms and classification of causes of abnormal uterine bleeding in the reproductive years: 2018
//     revisions. Int J Gynaecol Obstet. 2018;143(3):393-408.

export const PALM_COEIN_CATEGORIES = [
  { letter: 'P', key: 'polyp', group: 'PALM', name: 'Polyp' },
  { letter: 'A', key: 'adenomyosis', group: 'PALM', name: 'Adenomyosis' },
  { letter: 'L', key: 'leiomyoma', group: 'PALM', name: 'Leiomyoma' },
  { letter: 'M', key: 'malignancy', group: 'PALM', name: 'Malignancy and atypical hyperplasia' },
  { letter: 'C', key: 'coagulopathy', group: 'COEIN', name: 'Coagulopathy' },
  { letter: 'O', key: 'ovulatory', group: 'COEIN', name: 'Ovulatory dysfunction' },
  { letter: 'E', key: 'endometrial', group: 'COEIN', name: 'Endometrial' },
  { letter: 'I', key: 'iatrogenic', group: 'COEIN', name: 'Iatrogenic (includes anticoagulants from the 2018 revision)' },
  { letter: 'N', key: 'notClassified', group: 'COEIN', name: 'Not otherwise classified' },
];

// 0 absent, 1 present, ? not yet assessed. The third value is deliberate.
export const CATEGORY_VALUES = ['0', '1', '?'];

export const LEIOMYOMA_SECONDARY = [
  { value: 'SM', text: 'SM — submucosal, involving the endometrial cavity. From the 2018 revision this spans types 0 to 3.' },
  { value: 'O', text: 'O — other. From the 2018 revision this spans types 3 to 8, with type 3 straddling both groups.' },
];

export const LEIOMYOMA_TYPES = [
  { value: '0', text: '0 — intracavitary, attached to the endometrium by a narrow stalk (pedunculated)' },
  { value: '1', text: '1 — submucosal, less than 50 percent intramural' },
  { value: '2', text: '2 — submucosal, 50 percent or more intramural' },
  { value: '3', text: '3 — totally extracavitary but abuts the endometrium' },
  { value: '4', text: '4 — intramural, entirely within the myometrium, no extension to the endometrial surface or serosa' },
  { value: '5', text: '5 — subserosal, 50 percent or more intramural' },
  { value: '6', text: '6 — subserosal, less than 50 percent intramural' },
  { value: '7', text: '7 — subserosal, attached to the serosa by a stalk (pedunculated)' },
  { value: '8', text: '8 — does not relate to the myometrium at all: cervical, round or broad ligament without direct uterine attachment, or parasitic' },
];

const NOTE = 'The FIGO PALM-COEIN system (Munro and colleagues 2011, revised 2018) classifies the causes of abnormal uterine bleeding in non-gravid women of reproductive age. It is a notation, not a score. Modelled on TNM staging, every one of the nine categories is addressed for every patient, so a complete classification reads for example AUB P0 A0 L1(SM) M0 - C0 O1 E0 I0 N0. Each category takes one of three values: 0 absent, 1 present, or a question mark for not yet assessed. The third value matters, because an omitted category is otherwise ambiguous between looked-for-and-not-found and never-assessed, and a clinician who has not done imaging or a coagulation screen should not have to assert an absence they have not established. PALM covers the categories defined by visually objective structural criteria, namely polyp, adenomyosis, leiomyoma, and malignancy with atypical hyperplasia; COEI covers those unrelated to structural anomalies, namely coagulopathy, ovulatory dysfunction, endometrial and iatrogenic; and N is for entities not otherwise classified. More than one category can be positive at once and commonly is, which is part of the point: assuming a visible structural lesion is the cause is a known error. The leiomyoma category has three tiers, of which the secondary matters most clinically: submucosal lesions involving the endometrial cavity are distinguished from all others, because they are the ones generally considered most likely to cause the bleeding. The tertiary tier gives types 0 to 8, and a transmural lesion is notated with the endometrial relationship first and the serosal second, hyphenated. This tile implements the 2018 revision and says so, because the editions disagree in ways that change a classification: type 3 sits outside the submucous group in 2011 and inside it from 2018, and anticoagulant-associated bleeding moved from AUB-C to AUB-I in 2018 along with medications causing ovulatory disorders. Both editions remain in active use, so a record classified under one cannot be silently compared with one classified under the other. This is a framework for organising a diagnosis, not a diagnosis. It does not establish that any category is present, since each requires its own assessment and the structural categories require imaging or histology. It does not exclude malignancy: AUB-M is a category to be assessed, and a classification recorded before endometrial sampling says nothing about whether cancer is present. It does not quantify bleeding, does not assess anemia, does not identify pregnancy, which must be excluded first in any woman of reproductive age, and is not a treatment algorithm.';

function readCategory(raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  return CATEGORY_VALUES.includes(s) ? s : undefined;
}

// input: one key per PALM_COEIN_CATEGORIES entry, each '0' | '1' | '?';
//        when leiomyoma is '1', optionally leiomyomaSecondary and leiomyomaType.
export function palmCoein(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const read = PALM_COEIN_CATEGORIES.map((c) => ({ c, v: readCategory(o[c.key]) }));
  const missing = read.filter((r) => r.v === null).map((r) => r.c.letter);
  if (missing.length) {
    return { valid: false, message: `Every category is addressed for every patient. Still needed: ${missing.join(', ')}. Use 0 for absent, 1 for present, or ? for not yet assessed.` };
  }
  const bad = read.filter((r) => r.v === undefined).map((r) => r.c.letter);
  if (bad.length) {
    return { valid: false, message: `Each category must be 0, 1, or ?. Unrecognized: ${bad.join(', ')}.` };
  }

  const byKey = Object.fromEntries(read.map((r) => [r.c.key, r.v]));

  let secondary = null;
  let type = null;
  if (byKey.leiomyoma === '1') {
    const rawSec = o.leiomyomaSecondary;
    if (rawSec === '' || rawSec === null || rawSec === undefined) {
      return { valid: false, message: 'Leiomyoma is present, so the secondary classification is required: SM (submucosal, involving the endometrial cavity) or O (other). That distinction is what carries the clinical weight.' };
    }
    secondary = LEIOMYOMA_SECONDARY.find((x) => x.value === String(rawSec).trim().toUpperCase());
    if (!secondary) {
      return { valid: false, message: 'The leiomyoma secondary classification must be SM or O.' };
    }
    const rawType = o.leiomyomaType;
    if (rawType !== '' && rawType !== null && rawType !== undefined) {
      type = LEIOMYOMA_TYPES.find((t) => t.value === String(rawType).trim());
      if (!type) {
        return { valid: false, message: 'The leiomyoma type must be 0 through 8, or left blank.' };
      }
    }
  }

  const cell = (c) => {
    const v = byKey[c.key];
    if (c.key === 'leiomyoma' && v === '1' && secondary) {
      return `L1(${secondary.value}${type ? ` type ${type.value}` : ''})`;
    }
    return `${c.letter}${v}`;
  };

  const palm = PALM_COEIN_CATEGORIES.filter((c) => c.group === 'PALM').map(cell).join(' ');
  const coein = PALM_COEIN_CATEGORIES.filter((c) => c.group === 'COEIN').map(cell).join(' ');
  const notation = `AUB ${palm} - ${coein}`;

  const positives = PALM_COEIN_CATEGORIES.filter((c) => byKey[c.key] === '1');
  const unassessed = PALM_COEIN_CATEGORIES.filter((c) => byKey[c.key] === '?');
  const abbreviated = positives.length
    ? `AUB-${positives.map((c) => (c.key === 'leiomyoma' && secondary ? `L${secondary.value}` : c.letter)).join('; ')}`
    : null;

  return {
    valid: true,
    edition: '2018',
    notation,
    abbreviated,
    positives: positives.map((c) => c.letter),
    unassessed: unassessed.map((c) => c.letter),
    leiomyomaSecondary: secondary ? secondary.value : null,
    leiomyomaType: type ? type.value : null,
    bandLabel: notation,
    band: `${notation}${abbreviated ? ` (abbreviated: ${abbreviated})` : ''}. Classified under the 2018 revision, in which type 3 leiomyomas sit inside the submucous group and anticoagulant-associated bleeding is AUB-I rather than AUB-C; a record classified under the 2011 edition is not directly comparable.${unassessed.length ? ` Categories not yet assessed: ${unassessed.map((c) => c.letter).join(', ')} — these are recorded as unknown, not as absent.` : ''} This organises a diagnosis; it does not make one, and it does not exclude malignancy.`,
    note: NOTE,
  };
}
