// spec-v833: FIGO clinical grading of placenta accreta spectrum.
//
// Sources:
//   Jauniaux E, Ayres-de-Campos D, Langhoff-Roos J, Fox KA, Collins S; FIGO Placenta Accreta
//     Diagnosis and Management Expert Consensus Panel. FIGO classification for the clinical
//     diagnosis of placenta accreta spectrum disorders. Int J Gynaecol Obstet.
//     2019;146(1):20-24.
//   Table 1 of the accompanying review (PMC6929563), from which the observable criteria here
//     are taken.
//
// THIS IS A CLINICAL GRADING, NOT A HISTOLOGICAL ONE. FIGO grades what the surgeon SEES at
// delivery, deliberately, so that it can be applied without pathology and at the moment the
// decisions are being made. Histology may disagree, and the grade does not depend on it.
//
//   GRADE 1  no distension over the placental bed, no placental tissue through the uterine
//            surface, no or minimal neovascularity; the placenta does not separate and
//            manual removal brings heavy bleeding from the implantation site.
//   GRADE 2  abnormal macroscopic findings over the placental bed - bluish or purple color,
//            distension, the placental "bulge" - and significant neovascularity; gentle cord
//            traction pulls the uterus inwards without the placenta separating, the "dimple"
//            sign; still NO invasion through the uterine surface.
//   GRADE 3a placental tissue seen invading THROUGH the uterine serosa, no other organ
//            involved, and a clear surgical plane between bladder and uterus.
//   GRADE 3b invasion into the bladder wall or urothelium, no other organ; no clear surgical
//            plane between bladder and uterus.
//   GRADE 3c invasion into the broad ligament, vaginal wall, pelvic sidewall or any other
//            pelvic organ, WITH OR WITHOUT bladder involvement.
//
// TWO THINGS THAT DECIDE A GRADE AND ARE EASY TO SKIP:
//   * 3a versus 3b turns on the SURGICAL PLANE, not on how close the placenta looks to the
//     bladder. A clear plane between bladder and uterus is 3a even with serosal breach.
//   * 3c outranks 3b. Parametrial or other pelvic involvement is 3c whether or not the
//     bladder is also involved, so finding bladder invasion does not settle the grade.
//
// Pure: no DOM, no clock, no network.

export const PAS_NOTE = 'The FIGO clinical grading of placenta accreta spectrum (Jauniaux E, Ayres-de-Campos D, Langhoff-Roos J, et al, Int J Gynaecol Obstet 2019;146(1):20-24) grades what the surgeon sees at delivery rather than what the pathologist later reports, deliberately, so that it can be applied without histology and at the moment decisions are being made. Grade one has no distension over the placental bed, no placental tissue through the uterine surface and little or no new vessel formation, with a placenta that will not separate and heavy bleeding from the implantation site on manual removal. Grade two adds abnormal appearances over the placental bed, a bluish or purple color and a placental bulge, with significant new vessels, and gentle cord traction pulling the uterus inwards without the placenta separating, the dimple sign, but still no invasion through the uterine surface. Grade three is placental tissue seen invading through the serosa: 3a with no other organ involved and a clear surgical plane between bladder and uterus, 3b with invasion into the bladder wall and no clear plane, and 3c with invasion into the broad ligament, vaginal wall, pelvic sidewall or any other pelvic organ, with or without the bladder. Two points decide a grade and are easy to skip. The difference between 3a and 3b is the surgical plane rather than how close the placenta looks to the bladder. And 3c outranks 3b, so parametrial involvement settles the grade whether or not the bladder is involved. It describes findings already made at operation and it does not plan the surgery or decide about hysterectomy.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function figoPas(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const throughSerosa = truthy(o.invadesThroughSerosa);
  const bladder = truthy(o.bladderInvasion);
  const otherOrgan = truthy(o.otherPelvicOrgan);
  const clearPlane = truthy(o.clearSurgicalPlane);

  const bulge = truthy(o.placentalBulge);
  const neovascularity = truthy(o.neovascularity);
  const dimple = truthy(o.dimpleSign);

  const noSeparation = truthy(o.failsToSeparate);
  const heavyBleeding = truthy(o.heavyBleedingOnRemoval);

  let grade = null;
  let basis = null;

  if (otherOrgan) {
    grade = '3c';
    basis = 'invasion into the broad ligament, vaginal wall, pelvic sidewall or another pelvic organ';
  } else if (bladder) {
    grade = '3b';
    basis = 'invasion into the bladder wall or urothelium, with no clear surgical plane between bladder and uterus';
  } else if (throughSerosa) {
    grade = '3a';
    basis = 'placental tissue invading through the uterine serosa, with no other organ involved';
  } else if (bulge || dimple || neovascularity) {
    grade = '2';
    basis = `abnormal macroscopic findings over the placental bed${dimple ? ' with the dimple sign' : ''}, without invasion through the uterine surface`;
  } else if (noSeparation || heavyBleeding) {
    grade = '1';
    basis = 'a placenta that does not separate, without distension, neovascularity or invasion through the uterine surface';
  }

  // 3c outranks 3b, so bladder invasion does not settle the grade.
  const outrankNote = otherOrgan && bladder
    ? 'Bladder invasion is also present, but grade 3c covers parametrial or other pelvic involvement WITH OR WITHOUT the bladder. The other-organ finding settles the grade, not the bladder.'
    : null;

  // The 3a / 3b discriminator.
  const planeNote = throughSerosa && !otherOrgan
    ? (bladder
      ? 'This is 3b rather than 3a because there is invasion into the bladder wall. The discriminator is the surgical plane between bladder and uterus, not how close the placenta appears to the bladder.'
      : (clearPlane
        ? 'A clear surgical plane between bladder and uterus is recorded, which is what keeps a serosal breach at 3a rather than 3b.'
        : 'No bladder invasion is recorded, so this is 3a. Note the 3a / 3b discriminator is the surgical plane between bladder and uterus rather than proximity.'))
    : null;

  const clinicalNote = grade
    ? 'This is a clinical grading of what is seen at operation, not a histological one. FIGO grades the operative findings deliberately, so the grade holds without pathology and may not match a later histological report.'
    : null;

  return {
    valid: true,
    grade,
    basis,
    outrankNote,
    planeNote,
    clinicalNote,
    abnormal: !!grade,
    bandLabel: grade ? `FIGO grade ${grade}` : 'No grade assigned',
    band: grade
      ? `FIGO placenta accreta spectrum grade ${grade} — ${basis}.`
      : 'No FIGO grade assigned on these findings. Grade 1 needs at least a placenta that fails to separate.',
    detail: 'Grade 1 adherent without distension or neovascularity; grade 2 abnormal macroscopic findings and the dimple sign, without serosal breach; 3a through the serosa with a clear bladder plane; 3b into the bladder; 3c into the parametrium or another pelvic organ, with or without the bladder.',
    note: PAS_NOTE,
  };
}
