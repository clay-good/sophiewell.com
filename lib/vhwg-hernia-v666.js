// spec-v666: Ventral Hernia Working Group (VHWG) grade for the risk of surgical site
// occurrence (SSO) in ventral hernia repair.
//
// A companion to the built hernia classifications (nyhus-hernia). Source:
//   Ventral Hernia Working Group; Breuing K, Butler CE, Ferzoco S, et al. Incisional
//   ventral hernias: review of the literature and recommendations regarding the grading
//   and technique of repair. Surgery. 2010;148(3):544-558. PMID 20304452.
//
// A decision-logic classifier: the grade is the MOST SEVERE category whose features are
// present (grades 1-4).
//   Grade 4 (infected): infected mesh or septic dehiscence;
//   Grade 3 (potentially contaminated): previous wound infection, a stoma, or violation
//     of the gastrointestinal tract;
//   Grade 2 (comorbid): smoking, obesity, diabetes, immunosuppression, or COPD;
//   Grade 1 (low risk): none of the above.
//
// The modified VHWG (Kanters AE, et al. J Am Coll Surg 2012) merges the contaminated
// grades 3 and 4 and sub-stratifies by CDC wound class, and moves isolated previous wound
// infection down to grade 2; this tile implements the original 4-grade version.
//
// Pure: no DOM, no clock, no network.

function toBool(v) {
  if (v === true) return true;
  if (v === false || v === '' || v === null || v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'on';
}

const LABEL = {
  1: 'Grade 1 (low risk)',
  2: 'Grade 2 (comorbid)',
  3: 'Grade 3 (potentially contaminated)',
  4: 'Grade 4 (infected)',
};

export const VHWG_NOTE = 'Ventral Hernia Working Group (VHWG) grade for the risk of surgical site occurrence in ventral hernia repair (Breuing K, et al., Surgery 2010;148(3):544-558). The grade is the most severe category present. Grade 4 (infected) is an infected mesh or septic dehiscence; grade 3 (potentially contaminated) is a previous wound infection, a stoma, or violation of the gastrointestinal tract; grade 2 (comorbid) is smoking, obesity, diabetes, immunosuppression, or COPD; and grade 1 (low risk) is none of these. A higher grade carries a higher risk of surgical site occurrence and informs the repair technique and mesh choice. The modified VHWG (Kanters AE, et al., J Am Coll Surg 2012) merges the contaminated grades 3 and 4 and sub-stratifies by CDC wound class and moves isolated previous wound infection to grade 2; this tile uses the original four-grade version. It supports the surgical plan and is read with the full clinical picture.';

export function vhwgHernia(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const infected = toBool(o.infected);
  const contaminated = toBool(o.contaminated);
  const comorbid = toBool(o.comorbid);

  let grade;
  if (infected) grade = 4;
  else if (contaminated) grade = 3;
  else if (comorbid) grade = 2;
  else grade = 1;

  const detailByGrade = {
    4: 'Infected mesh or septic dehiscence.',
    3: 'Previous wound infection, a stoma, or GI-tract violation.',
    2: 'A comorbidity (smoking, obesity, diabetes, immunosuppression, or COPD).',
    1: 'No comorbid, contamination, or infection features entered.',
  };

  return {
    valid: true,
    grade,
    code: `Grade ${grade}`,
    infected,
    contaminated,
    comorbid,
    abnormal: grade >= 3,
    gradeLabel: LABEL[grade],
    bandLabel: `VHWG ${LABEL[grade]}`,
    detail: detailByGrade[grade],
    note: VHWG_NOTE,
  };
}
