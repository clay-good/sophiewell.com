// spec-v531: the classification of endothermal heat-induced thrombosis (EHIT) after endovenous thermal
// ablation of a superficial vein. Zero-hit before this tile: "ehit", "kabnick", "endovenous", and
// "saphenofemoral" across corpus.json, app.js, and lib/meta.js.
//
// A DIFFERENT AXIS FROM THE EXISTING ceap-venous AND vcss TILES, which grade CHRONIC venous disease -- how
// bad is this patient's long-standing venous insufficiency. EHIT grades an ACUTE COMPLICATION of a specific
// procedure, found on a surveillance ultrasound in the weeks after ablation, and the decision it informs is
// binary and immediate: anticoagulate or not. A patient's CEAP class does not move when they develop an
// EHIT, and their EHIT class says nothing about their chronic disease.
//
// WHAT COUNTS AS EHIT: thrombus seen on ultrasound within FOUR WEEKS of endovenous thermal ablation, that
// ORIGINATES FROM THE TREATED VEIN and protrudes into a deep vein. Two things it is not, both formally
// distinguished by the consensus: a DVT in a segment NOT contiguous with the ablated vein is a non-EHIT DVT,
// and thrombus in a different superficial vein is post-ablation superficial venous thrombosis. This tile
// classifies EHIT and says so, because calling a non-contiguous DVT an "EHIT I" would understate it.
//
// FOUR CLASSES, BY HOW FAR THE THROMBUS EXTENDS:
//   I    thrombus WITHOUT propagation into the deep vein
//          Ia peripheral to the superficial epigastric vein
//          Ib central to it, up to and including the deep vein junction
//   II   propagation into the adjacent deep vein, occupying LESS THAN 50 percent of the deep vein lumen
//   III  propagation into the adjacent deep vein, occupying MORE THAN 50 percent of the lumen, not occlusive
//   IV   occlusive deep vein thrombus contiguous with the treated superficial vein
// The same percentages apply to the popliteal vein after a small-saphenous ablation; there is no separate
// saphenopopliteal threshold.
//
// THE 2021 CONSENSUS DID NOT RENUMBER ANYTHING, and that matters for reading older records. Classes II, III,
// and IV are word-for-word identical to the original 2006 Kabnick classification. The ONLY change was to
// subdivide class I, so **class Ib is exactly the old class I**, and Ia is newly carved out. A note written
// before 2021 saying "EHIT 1" means what Ib means now. Management is identical for Ia and Ib; the split
// exists for reporting granularity.
//
// DO NOT CONFLATE WITH THE LAWRENCE LEVELS. A separate 2010 system grades the same complication in SIX levels
// keyed to the epigastric vein rather than to percent lumen. Lawrence levels 1, 2, AND 3 all collapse into
// this class I -- so "level 3" is NOT "class III", and mistaking one for the other moves a patient who needs
// no treatment into the anticoagulation band. The tile names this explicitly.
//
// HIGH-STAKES: the class is an anatomic description, and the published recommendations attached to it are
// SUGGESTIONS AT DIFFERING STRENGTHS OF EVIDENCE, not orders. They are reported here because the whole point
// of classifying an EHIT is to decide about anticoagulation, but the decision belongs to the clinician and
// turns on bleeding risk, thrombophilia, symptoms, and the patient's other anticoagulant indications as much
// as on the class. Class IV in particular is explicitly individualized rather than protocolized. This tile
// does not choose an agent, a dose, or a duration, does not schedule the surveillance scan, and does not
// diagnose an EHIT -- that is an ultrasound finding (spec-v11 section 5.3).
//
// CLASSES, DEFINITIONS, AND RECOMMENDATIONS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the
// consensus document and corroborated across independent reproductions:
//   - Kabnick LS, Sadek M, Bjarnason H, et al. Classification and treatment of endothermal heat-induced
//     thrombosis: recommendations from the American Venous Forum and the Society for Vascular Surgery.
//     J Vasc Surg Venous Lymphat Disord. 2021;9(1):6-22.
//   - The original Kabnick 2006 classification, reproduced within that consensus, and independent
//     reproductions of both the classes and the per-class recommendations.

export const EHIT_CLASSES = [
  {
    value: 'Ia',
    label: 'Class Ia',
    text: 'Thrombus without propagation into the deep vein, peripheral to the superficial epigastric vein.',
    recommendation: 'No treatment or surveillance is suggested (a weak suggestion on low-quality evidence).',
    legacy: 'Newly carved out in 2021; not separately identified in the 2006 classification.',
  },
  {
    value: 'Ib',
    label: 'Class Ib',
    text: 'Thrombus without propagation into the deep vein, central to the superficial epigastric vein, up to and including the deep vein junction.',
    recommendation: 'No treatment or surveillance is suggested (a weak suggestion on low-quality evidence).',
    legacy: 'This is exactly the original 2006 class I. A record written before 2021 saying "EHIT 1" means this.',
  },
  {
    value: 'II',
    label: 'Class II',
    text: 'Propagation into the adjacent deep vein, occupying less than 50 percent of the deep vein lumen.',
    recommendation: 'No treatment is suggested, with weekly surveillance until the thrombus resolves (a weak suggestion on low-quality evidence). In a high-risk patient, antiplatelet therapy or prophylactic or therapeutic anticoagulation may be considered.',
    legacy: 'Unchanged from the 2006 classification.',
  },
  {
    value: 'III',
    label: 'Class III',
    text: 'Propagation into the adjacent deep vein, occupying more than 50 percent of the lumen, but not occlusive.',
    recommendation: 'Therapeutic anticoagulation with weekly surveillance is recommended, stopping treatment after the thrombus retracts or resolves (a strong recommendation on moderate-quality evidence).',
    legacy: 'Unchanged from the 2006 classification.',
  },
  {
    value: 'IV',
    label: 'Class IV',
    text: 'Occlusive deep vein thrombus contiguous with the treated superficial vein.',
    recommendation: 'Treatment is recommended to be individualized, weighing risks and benefits for the patient, following guidance for a provoked acute deep vein thrombosis (a strong recommendation on high-quality evidence). Note this is a recommendation to individualize, not a protocol.',
    legacy: 'Unchanged from the 2006 classification.',
  },
];

// Roman-numeral and arabic aliases. Bare '1' and 'I' are DELIBERATELY REJECTED as ambiguous across Ia and
// Ib: the two carry the same management but a record should not silently lose which one was meant.
const ALIASES = { '2': 'II', '3': 'III', '4': 'IV', IA: 'Ia', IB: 'Ib', '1A': 'Ia', '1B': 'Ib' };

const NOTE = 'The EHIT classification (American Venous Forum and Society for Vascular Surgery 2021, revising Kabnick 2006) describes thrombus seen on ultrasound within four weeks of endovenous thermal ablation that originates from the treated vein and protrudes into a deep vein. Class I is thrombus without propagation into the deep vein, subdivided at the superficial epigastric vein into Ia peripheral and Ib central; class II is propagation occupying less than 50 percent of the deep vein lumen; class III is more than 50 percent but not occlusive; and class IV is an occlusive deep vein thrombus contiguous with the treated vein. The same percentages apply to the popliteal vein after a small-saphenous ablation. The 2021 revision renumbered nothing: classes II, III, and IV are word for word the 2006 originals, and the only change was subdividing class I, so class Ib is exactly the old class I and a record written before 2021 saying EHIT 1 means Ib. Do not confuse this with the separate Lawrence system, which grades the same complication in six levels keyed to the epigastric vein: Lawrence levels 1, 2, and 3 all collapse into class I here, so a Lawrence level 3 is not a class III, and mistaking one for the other moves a patient who needs no treatment into the anticoagulation band. Two findings are formally distinguished from EHIT and should not be classified here: a deep vein thrombosis in a segment not contiguous with the ablated vein is a non-EHIT DVT, and thrombus in a different superficial vein is post-ablation superficial venous thrombosis. The recommendations attached to each class are suggestions at differing strengths of evidence rather than orders; the anticoagulation decision turns on bleeding risk, thrombophilia, symptoms, and other indications as much as on the class, and class IV is explicitly individualized rather than protocolized. This tile does not choose an agent, a dose, or a duration, does not schedule surveillance, and does not diagnose an EHIT, which is an ultrasound finding. It also grades a different thing from the CEAP classification and the venous clinical severity score, which describe chronic venous disease.';

// input: ehitClass -- 'Ia', 'Ib', 'II', 'III', or 'IV' (2/3/4 and 1a/1b accepted; bare 1 or I rejected).
export function ehit(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.ehitClass;

  if (raw === '' || raw === null || raw === undefined) {
    return { valid: false, message: 'Choose the EHIT class: Ia, Ib, II, III, or IV.' };
  }

  let key = String(raw).trim().toUpperCase();
  if (key === 'I' || key === '1') {
    return { valid: false, message: 'Class I is ambiguous here: choose Ia (peripheral to the superficial epigastric vein) or Ib (central to it, up to the deep vein junction). Ib is the original 2006 class I.' };
  }
  if (Object.prototype.hasOwnProperty.call(ALIASES, key)) key = ALIASES[key];

  const entry = EHIT_CLASSES.find((c) => c.value.toUpperCase() === key.toUpperCase());
  if (!entry) {
    return { valid: false, message: 'Class must be Ia, Ib, II, III, or IV.' };
  }

  const anticoagulated = entry.value === 'III' || entry.value === 'IV';

  return {
    valid: true,
    ehitClass: entry.value,
    anticoagulationDiscussed: anticoagulated,
    recommendation: entry.recommendation,
    legacy: entry.legacy,
    bandLabel: `EHIT ${entry.label}`,
    band: `${entry.label}: ${entry.text} ${entry.recommendation} ${entry.legacy} The published recommendation is a suggestion at a stated strength of evidence, not an order.`,
    note: NOTE,
  };
}
