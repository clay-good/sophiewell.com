// spec-v572 MCP wave: adapter for the HEAVEN criteria in lib/heaven-criteria-v572.js. The dom keys mirror
// the browser renderer (views/group-v572.js) and META['heaven-criteria'].example.
//
// **HEAVEN IS A COUNT, NOT A POINT SCORE, AND IT HAS NO BAND TABLE.** Only TWO figures were ever published:
// about 94 percent first-attempt success with NO criteria, and about 43 percent with FIVE OR MORE.
// Everything in between exists in the source papers as a FIGURE, never as a numeric table. An agent asked
// "what is the success rate with 3 criteria?" must answer that none is published - reading a value off a
// chart and presenting it as data is exactly the failure this note exists to prevent.
//
// **FOUR OF THE SIX CRITERIA ARE OPERATOR-JUDGMENT DESCRIPTORS, NOT MEASUREMENTS**, defined with phrases
// like "anticipated to interfere" and "suspected". Only the hypoxemia threshold and the pediatric age are
// objective. **Obesity is DELIBERATELY undefined - there is no BMI threshold** - and supplying one replaces
// the operator judgment the instrument actually asks for.
//
// **"EXSANGUINATION" DOES NOT MEAN BLEEDING.** It means SUSPECTED ANEMIA, chronic or acute, scored for its
// effect on safe apnea time. A patient who is not bleeding at all can meet it, and a briskly bleeding
// patient with a normal hemoglobin may not. The name is actively misleading.
//
// **THE CRITERIA ARE ASSESSED AT THE MOMENT OF LARYNGOSCOPY, NOT ON ARRIVAL.** Effective preoxygenation can
// legitimately un-score hypoxemia, so a count taken on arrival is not a HEAVEN count.
//
// TWO OUTCOMES HAVE BEEN PUBLISHED AGAINST THE SAME CRITERIA - first-pass intubation success, and a poor
// laryngoscopic view (Cormack-Lehane III/IV) - so a figure quoted without its endpoint is ambiguous.

import * as H from '../../lib/heaven-criteria-v572.js';

export default [
  {
    id: 'heaven-criteria',
    summary: `The HEAVEN criteria for anticipating a difficult EMERGENCY airway (Kuzmack and colleagues, J Emerg Med 2018). A COMPANION to lemon and macocha rather than a duplicate: those tools assume a cooperative, largely elective patient, while HEAVEN is the rapid-sequence-intubation axis of the same question and includes PHYSIOLOGIC as well as anatomic difficulty. SIX CRITERIA: H - HYPOXEMIA, oxygen saturation ${H.HYPOXEMIA_THRESHOLD} percent or below at the time of initial laryngoscopy. E - EXTREMES OF SIZE, a pediatric patient ${H.PEDIATRIC_AGE_THRESHOLD} years or under, or clinical obesity the operator anticipates will interfere with bag-valve-mask ventilation or with visualizing the glottis. A - ANATOMIC CHALLENGE, any structural abnormality anticipated to limit the view, including airway trauma, limited oral aperture, large tongue, short neck, mass or swelling, foreign body, or an obstructing external structure. V - VOMIT, BLOOD OR FLUID, clinically significant fluid in the pharynx or hypopharynx before laryngoscopy anticipated to interfere. E - EXSANGUINATION. N - NECK, limited cervical range of motion from immobilization or arthritis. **HEAVEN IS A COUNT OF CRITERIA PRESENT (0 to ${H.HEAVEN_MAX}), NOT A POINT SCORE, AND IT HAS NO BAND TABLE.** Only TWO figures were ever published: about 94 percent first-attempt success with NO criteria present, and about 43 percent with FIVE OR MORE. Everything in between exists in the source papers as a FIGURE, never as a numeric table, so asked for the success rate at a count of 2 or 3 the correct answer is that none is published. Do NOT read values off a chart and present them as data. **FOUR OF THE SIX CRITERIA ARE EXPLICITLY OPERATOR-JUDGMENT DESCRIPTORS, NOT MEASUREMENTS**, defined with phrases such as "anticipated to interfere", "anticipated to limit" and "suspected". Only the hypoxemia threshold and the pediatric age are objective, and **OBESITY IS DELIBERATELY LEFT UNDEFINED - THERE IS NO BODY MASS INDEX THRESHOLD** - so supplying one replaces the operator judgment the instrument actually asks for. **"EXSANGUINATION" DOES NOT MEAN BLEEDING, AND THE NAME IS ACTIVELY MISLEADING**: it means SUSPECTED ANEMIA, chronic or acute, scored for its effect on SAFE APNEA TIME, meaning how fast the patient desaturates once breathing stops. A patient who is not bleeding at all can meet it, and a briskly bleeding patient with a normal hemoglobin may not. **THE CRITERIA ARE ASSESSED AT THE MOMENT OF LARYNGOSCOPY, NOT ON ARRIVAL**: hypoxemia and the fluid criterion both reference the time of initial laryngoscopy, so effective preoxygenation can legitimately un-score hypoxemia, and a count taken on arrival is not a HEAVEN count. TWO OUTCOMES have been published against the SAME criteria - first-pass intubation success in the original paper and a poor laryngoscopic view at Cormack-Lehane grade III or IV in a later analysis - so a figure quoted without its endpoint is ambiguous. This ANTICIPATES difficulty. It does NOT decide whether to intubate, when to intubate, or by what technique, and it is not an indication for a surgical airway. A COUNT OF ZERO DOES NOT MAKE AN AIRWAY SAFE: the published negative predictive value is high but not perfect, and unanticipated difficulty is exactly the scenario airway planning exists for. It does not replace a difficult-airway plan, backup equipment, or a trained second operator.`,
    compute: H.heavenCriteria,
    fields: H.HEAVEN_CRITERIA.map((c) => ({
      dom: `heaven-${c.key}`, arg: c.key, kind: 'enum', values: ['no', 'yes'], required: true,
      label: `${c.letter} - ${c.name}. ${c.text}${c.objective ? '' : ' OPERATOR JUDGMENT, not a measurement.'} Assessed at the moment of laryngoscopy, not on arrival.`,
    })),
  },
];
