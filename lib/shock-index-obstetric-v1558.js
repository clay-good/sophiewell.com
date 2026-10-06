// spec-v1558 tool 4: the obstetric (low-resource referral) bands for the shock index (pulse / systolic), a
// mode on the `shock-index` tile.
//
// Source: El Ayadi AM, Nathan HL, Seed PT, et al. Vital sign prediction of adverse maternal outcomes in women
// with hypovolemic shock: the role of shock index. PLoS One. 2016;11(2):e0148729 (PMC4762936; CC BY 4.0).
// Read October 6, 2026, abstract and conclusions: in lower-level facilities in low-resource settings, a
// shock index of 0.9 or more indicates the need for referral, 1.4 or more urgent intervention in tertiary
// facilities, and 1.7 or more a high chance of an adverse outcome (thresholds to be prospectively validated).
// Below 0.9 is the proposed upper limit of normal immediately postpartum. Nathan 2015 (BJOG) is not used
// here.
//
// Pure: no DOM, no clock.

export function obstetricShockBand(si) {
  const x = Number(si);
  if (!Number.isFinite(x) || x <= 0) return null;
  if (x >= 1.7) return { band: 'Obstetric hemorrhage band (El Ayadi 2016): 1.7 or more, a high chance of an adverse outcome.', level: 'high' };
  if (x >= 1.4) return { band: 'Obstetric hemorrhage band (El Ayadi 2016): 1.4 or more, urgent intervention needed at a tertiary facility.', level: 'urgent' };
  if (x >= 0.9) return { band: 'Obstetric hemorrhage band (El Ayadi 2016): 0.9 or more, refer.', level: 'refer' };
  return { band: 'Obstetric hemorrhage band (El Ayadi 2016): below 0.9, the proposed upper limit of normal just after birth.', level: 'normal' };
}
