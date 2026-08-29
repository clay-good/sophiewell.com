// spec-v877: the Ishoo staging of angioedema by the site of swelling.
//
// Source:
//   Ishoo E, Shah UK, Grillone GA, Stram JR, Fuleihan NS. Predicting airway risk in angioedema:
//   staging system based on presentation. Otolaryngol Head Neck Surg. 1999;121(3):263-268.
//
//   Stage I    face or lip
//   Stage II   soft palate
//   Stage III  tongue
//   Stage IV   larynx
//
//   In the original series the need for an intensive care admission and for an airway
//   intervention rose steeply from stage III to stage IV, while stages I and II were managed
//   on a ward or discharged.
//
// THE STAGE IS THE SITE OF THE MOST DISTAL SWELLING, AND THAT IS WHY THIS TILE EXISTS. It is not
// a severity score and nothing is added up: a large facial swelling is still stage I, and a
// modest tongue swelling is stage III.
//
// IT DESCRIBES DISPOSITION RISK, NOT AIRWAY PATENCY RIGHT NOW. A patient at any stage whose
// airway is threatened is an airway emergency, and the staging does not defer that.
//
// STRIDOR AND VOICE CHANGE ARE LATE. Their absence does not make a stage III or IV swelling
// safe, and progression over hours is the expected course of bradykinin-mediated angioedema.
//
// IT DOES NOT SEPARATE THE MECHANISM. Bradykinin-mediated angioedema, which includes the
// angiotensin-converting enzyme inhibitor and hereditary forms, does not respond to
// epinephrine, antihistamines or corticosteroids, and the site of swelling does not tell you
// which mechanism you are looking at.
//
// Pure: no DOM, no clock, no network.

export const ISHOO_NOTE = 'The Ishoo staging system (Ishoo and colleagues, Otolaryngology-Head and Neck Surgery, 1999) sorts angioedema by the site of the most distal swelling: stage I is the face or lip, stage II the soft palate, stage III the tongue, and stage IV the larynx. In the original series patients at stages I and II were managed on a ward or discharged, while the need for an intensive care admission and for an airway intervention rose steeply at stages III and IV. Four things about it are worth stating plainly. The stage is the site of the most distal swelling and not a severity score, so nothing is added up: a large facial swelling is still stage I and a modest tongue swelling is stage III. It describes disposition risk rather than airway patency right now, so a patient at any stage whose airway is threatened is an airway emergency and the staging does not defer that. Stridor and voice change are late findings, so their absence does not make a stage III or IV swelling safe, and progression over hours is the expected course of bradykinin-mediated angioedema. And the staging does not separate the mechanism: bradykinin-mediated angioedema, which includes the angiotensin-converting enzyme inhibitor and hereditary forms, does not respond to epinephrine, antihistamines or corticosteroids, and the site of swelling does not tell you which mechanism you are looking at. It stages a finding already examined. It does not decide the airway, and it does not choose a drug.';

export const SITES = [
  { key: 'faceOrLip', stage: 1, text: 'Face or lip' },
  { key: 'softPalate', stage: 2, text: 'Soft palate' },
  { key: 'tongue', stage: 3, text: 'Tongue' },
  { key: 'larynx', stage: 4, text: 'Larynx' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export function ishooAngioedema(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const involved = SITES.filter((s) => on(o[s.key]));
  // The stage is the MOST DISTAL site involved, not a count and not a sum.
  const stage = involved.length ? Math.max(...involved.map((s) => s.stage)) : 0;
  const airwayThreatened = on(o.airwayThreatened);

  const stageText = {
    0: 'No site of swelling is recorded, so there is no stage.',
    1: 'Stage I: swelling of the face or lip. In the original series these patients were managed on a ward or discharged.',
    2: 'Stage II: swelling of the soft palate. In the original series these patients were managed on a ward or discharged.',
    3: 'Stage III: swelling of the tongue. In the original series the need for intensive care admission and for airway intervention rose sharply here.',
    4: 'Stage IV: laryngeal swelling. The highest stage, and the group in which airway intervention was most often required.',
  }[stage];

  const action = airwayThreatened
    ? `${stageText} The airway is recorded as threatened, and that overrides the staging entirely: this is an airway emergency at any stage.`
    : stageText;

  // The reason the tile exists, on every result.
  const notASeverityScoreNote = 'The stage is the site of the most distal swelling, not a severity score. Nothing is added up: a large facial swelling is still stage I, and a modest tongue swelling is stage III.';

  const multipleSitesNote = involved.length > 1
    ? `${involved.length} sites are recorded and the stage takes the most distal of them, ${involved.find((s) => s.stage === stage).text.toLowerCase()}. The others do not raise it.`
    : null;

  const dispositionNote = 'It describes disposition risk from a published series, not airway patency right now. A patient at any stage whose airway is threatened is an airway emergency, and the staging does not defer that.';

  const lateSignsNote = stage >= 3
    ? 'Stridor and voice change are late. Their absence does not make this safe, and progression over hours is the expected course of bradykinin-mediated angioedema.'
    : null;

  const mechanismNote = 'The staging does not separate the mechanism. Bradykinin-mediated angioedema, which includes the angiotensin-converting enzyme inhibitor and hereditary forms, does not respond to epinephrine, antihistamines or corticosteroids, and the site of swelling does not tell you which one this is.';

  const involvedNote = involved.length
    ? `Recorded: ${involved.map((s) => s.text.toLowerCase()).join('; ')}.`
    : 'No site of swelling was recorded.';

  const scopeNote = 'This stages a finding already examined. It does not decide the airway, and it does not choose a drug.';

  return {
    valid: true,
    stage,
    involved: involved.map((s) => s.text),
    airwayThreatened,
    action,
    involvedNote,
    notASeverityScoreNote,
    multipleSitesNote,
    dispositionNote,
    lateSignsNote,
    mechanismNote,
    scopeNote,
    abnormal: stage >= 3 || airwayThreatened,
    bandLabel: stage ? `Stage ${['', 'I', 'II', 'III', 'IV'][stage]}` : 'No stage',
    band: action,
    detail: 'Stage I is the face or lip, stage II the soft palate, stage III the tongue, and stage IV the larynx. The stage is the most distal site involved. In the original series stages I and II were managed on a ward or discharged, and the need for intensive care and airway intervention rose sharply at stages III and IV.',
    note: ISHOO_NOTE,
  };
}
