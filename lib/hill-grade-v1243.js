// spec-v1243: the Hill grade of the gastroesophageal flap valve, seen on retroflexion.
//
// Source:
//   Hill LD, Kozarek RA, Kraemer SJ, Aye RW, Mercer CD, Low DE, Pope CE 2nd. The gastroesophageal
//   flap valve: in vitro and in vivo observations. Gastrointest Endosc. 1996;44(5):541-547.
//   PMID 8934159.
//
// The four grades, as described on a retroflexed view of the cardia:
//
//   I    a prominent fold of tissue along the lesser curvature, closely apposed to the endoscope
//   II   the fold is present but opens and closes around the scope with respiration
//   III  the fold is not prominent and the scope is not gripped; a hiatal hernia is often present
//   IV   no fold at all, the lumen stays open and the squamous mucosa is visible from below; a
//        hiatal hernia is always present
//
// WHAT MAKES THIS WORTH A TILE. The flap valve is an anatomical finding that an endoscopist sees on
// every upper endoscopy and reports on almost none. Grades III and IV are associated with reflux
// disease, and the grade is recorded at the moment it can be seen and not afterwards -- it cannot be
// recovered from a report that did not state it.
//
// IT IS NOT A GRADE OF ESOPHAGITIS. The catalog carries the LA grade for erosive esophagitis and the
// Savary-Miller classification, and both describe MUCOSAL DAMAGE in the esophagus. Hill describes the
// VALVE, in the stomach, looking up. A normal-looking esophagus with a Hill IV valve and a Hill I
// valve above LA grade D are both ordinary findings, because the two answer different questions.
//
// Pure: no DOM, no clock, no network.

export const HILL_NOTE = 'The Hill grade (Hill 1996) describes the gastroesophageal flap valve on a retroflexed view: grade I a prominent fold closely apposed to the endoscope, grade II a fold that opens and closes with respiration, grade III a fold that is not prominent and does not grip, and grade IV no fold at all with the lumen open. Grades III and IV are the ones associated with reflux disease. It grades the valve and not the mucosa, so it is not the LA grade or the Savary-Miller classification, which describe esophagitis. It reports the grade entered and is not a diagnosis of reflux.';

export const HILL_GRADES = [
  {
    value: 'I', text: 'I - a prominent fold of tissue along the lesser curvature, closely apposed to the endoscope',
    hernia: 'no hiatal hernia', competent: true,
  },
  {
    value: 'II', text: 'II - the fold is present but opens and closes around the endoscope with respiration',
    hernia: 'usually no hiatal hernia', competent: true,
  },
  {
    value: 'III', text: 'III - the fold is not prominent and the endoscope is not gripped',
    hernia: 'a hiatal hernia is often present', competent: false,
  },
  {
    value: 'IV', text: 'IV - no fold at all; the lumen stays open and the squamous mucosa is seen from below',
    hernia: 'a hiatal hernia is always present', competent: false,
  },
];

const BY_VALUE = new Map(HILL_GRADES.map((g) => [g.value, g]));

export function hillGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.grade == null ? '' : String(o.grade).trim().toUpperCase();
  if (raw === '') {
    return { valid: false, message: 'Choose the Hill grade from the retroflexed view. It is a finding that exists only while the endoscope is in: a report that did not state it cannot be graded afterwards.' };
  }
  const g = BY_VALUE.get(raw);
  if (!g) {
    return { valid: false, message: 'The Hill grade must be one of I, II, III or IV.' };
  }

  return {
    valid: true,
    grade: g.value,
    competent: g.competent,
    abnormal: !g.competent,
    bandLabel: `Hill grade ${g.value}`,
    band: `Hill grade ${g.value}: ${g.text.split(' - ')[1]}. On this grade ${g.hernia}. ${g.competent ? 'Grades I and II are the valve appearances not associated with reflux disease.' : 'Grades III and IV are the appearances associated with reflux disease.'}`,
    herniaNote: g.value === 'IV'
      ? 'A grade IV valve always has a hiatal hernia with it, so a grade IV recorded without one is worth a second look at the view rather than a second look at the grade.'
      : null,
    notEsophagitisNote: 'This grades the valve, looking up from the stomach, not the mucosa of the esophagus. The LA grade and the Savary-Miller classification in this catalog grade esophagitis, and a Hill IV valve above a normal esophagus is an ordinary combination because the two answer different questions.',
    postureNote: 'Decision support, not a verdict. The grade describes an anatomical appearance; whether a patient has reflux disease takes the symptoms, the response to treatment and often a pH study.',
    note: HILL_NOTE,
  };
}
