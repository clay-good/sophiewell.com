// spec-v928: auto-PEEP measured by an end-expiratory hold, and the error it puts into everything
// else.
//
// Sources:
//   Pepe PE, Marini JJ. Occult positive end-expiratory pressure in mechanically ventilated
//   patients with airflow obstruction: the auto-PEEP effect. Am Rev Respir Dis.
//   1982;126(1):166-170.
//   Blanch L, Bernabe F, Lucangelo U. Measurement of air trapping, intrinsic positive
//   end-expiratory pressure, and dynamic hyperinflation in mechanically ventilated patients.
//   Respir Care. 2005;50(1):110-123.
//
//   Auto-PEEP = the total PEEP read during an end-expiratory hold, minus the PEEP set on the
//   ventilator.
//
// A HOLD MEASURES IT ONLY IN A PASSIVE PATIENT. Any expiratory muscle activity raises the
// measured pressure and any inspiratory effort lowers it, so on an actively breathing patient the
// number is not auto-PEEP. This is the commonest reason a measurement is wrong.
//
// A MEASURED ZERO DOES NOT EXCLUDE IT. Where airways collapse during expiration, the trapped gas
// behind them never reaches the ventilator circuit during the hold, so the manoeuvre reads zero
// while gas trapping is present. The expiratory flow tracing failing to return to zero before the
// next breath is the sign that survives this.
//
// IT PUTS AN ERROR INTO THE DRIVING PRESSURE. Driving pressure is the plateau minus the TOTAL
// PEEP. Subtracting the set PEEP instead OVERSTATES it by exactly the auto-PEEP, and that number
// is the one people carry to a ventilator decision.
//
// AND IT RAISES THE TRIGGER THRESHOLD. The patient has to generate the whole auto-PEEP before any
// flow reaches the sensor, which is where missed triggers come from.
//
// Pure: no DOM, no clock, no network.

export const AUTO_PEEP_NOTE = 'Auto-PEEP is the pressure still left in the chest at the end of expiration that the ventilator has not been told about. It is measured as the total PEEP read during an end-expiratory hold minus the PEEP set on the ventilator. Four things are worth stating plainly. The hold measures it only in a passive patient: any expiratory muscle activity raises the pressure read and any inspiratory effort lowers it, so on an actively breathing patient the number is not auto-PEEP, and this is the commonest reason a measurement is wrong. A measured zero does not exclude it, because where airways collapse during expiration the trapped gas behind them never reaches the circuit during the hold -- the expiratory flow tracing failing to return to zero before the next breath is the sign that survives that. It puts an error into the driving pressure, which is the plateau minus the total PEEP: subtracting the set PEEP instead overstates the driving pressure by exactly the auto-PEEP, and that is the number people carry to a ventilator decision. And it raises the trigger threshold, because the patient has to generate the whole auto-PEEP before any flow reaches the sensor, which is where missed triggers come from. This is arithmetic on two pressures. It does not diagnose gas trapping, and it does not change a ventilator setting.';

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function safeRound(n, places = 1) {
  const f = 10 ** places;
  const r = Math.round(n * f) / f;
  return Number.isFinite(r) ? r : n;
}

export function autoPeep(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const setPeep = num(o.setPeep);
  const totalPeep = num(o.totalPeep);
  const plateau = num(o.plateauPressure);
  const passive = on(o.passive);
  const flowNotZero = on(o.expiratoryFlowNotReturningToZero);

  if (setPeep === null || totalPeep === null) {
    return { valid: false, message: 'Enter the PEEP set on the ventilator and the total PEEP read during an end-expiratory hold, both in cmH2O.' };
  }
  if (totalPeep < setPeep) {
    return { valid: false, message: 'The total PEEP is below the set PEEP, which the hold cannot produce in a passive patient. Check which number is which, and whether the patient was making expiratory effort.' };
  }

  const auto = totalPeep - setPeep;
  const present = auto > 0;

  const drivingVsTotal = plateau === null ? null : plateau - totalPeep;
  const drivingVsSet = plateau === null ? null : plateau - setPeep;

  const bandLabel = present
    ? `Auto-PEEP ${safeRound(auto)} cmH2O`
    : 'No auto-PEEP measured by the hold';

  const band = present
    ? `Auto-PEEP of ${safeRound(auto)} cmH2O: the total PEEP of ${safeRound(totalPeep)} is ${safeRound(auto)} above the ${safeRound(setPeep)} set.`
    : `The hold read ${safeRound(totalPeep)}, the same as the PEEP set. That is no auto-PEEP measured, which is not the same as no gas trapping.`;

  // The reason a wrong measurement is the usual failure.
  const passiveNote = passive
    ? 'Recorded as passive, which is what the hold needs. Expiratory muscle activity raises the pressure read and inspiratory effort lowers it.'
    : 'The patient is not recorded as passive. The hold measures auto-PEEP only in a passive patient: expiratory muscle activity raises the pressure read and inspiratory effort lowers it, so on an actively breathing patient this number is not auto-PEEP. That is the commonest reason a measurement is wrong.';

  const zeroNote = present
    ? 'A measured value is a floor, not a ceiling: where airways collapse during expiration, the trapped gas behind them never reaches the circuit during the hold.'
    : `A measured zero does not exclude gas trapping. Where airways collapse during expiration the trapped gas never reaches the circuit during the hold.${flowNotZero ? ' The expiratory flow is recorded as not returning to zero before the next breath, which is the sign that survives that.' : ' The sign that survives it is the expiratory flow failing to return to zero before the next breath, and that is not recorded here.'}`;

  const drivingNote = plateau === null
    ? 'Driving pressure is the plateau minus the TOTAL PEEP. Subtracting the set PEEP instead overstates it by exactly the auto-PEEP. Enter a plateau to see both.'
    : `Driving pressure against the total PEEP is ${safeRound(drivingVsTotal)} cmH2O. Against the set PEEP it would read ${safeRound(drivingVsSet)}, overstated by exactly the ${safeRound(auto)} of auto-PEEP. The first is the real one.`;

  const triggerNote = present
    ? `It also raises the trigger threshold: the patient has to generate the whole ${safeRound(auto)} cmH2O before any flow reaches the sensor, which is where missed triggers come from.`
    : 'Auto-PEEP raises the trigger threshold when present, because the patient has to generate all of it before any flow reaches the sensor.';

  const scopeNote = 'This is arithmetic on two pressures. It does not diagnose gas trapping, and it does not change a ventilator setting.';

  return {
    valid: true,
    autoPeep: safeRound(auto),
    setPeep,
    totalPeep,
    present,
    passive,
    drivingPressureVsTotalPeep: drivingVsTotal === null ? null : safeRound(drivingVsTotal),
    drivingPressureVsSetPeep: drivingVsSet === null ? null : safeRound(drivingVsSet),
    passiveNote,
    zeroNote,
    drivingNote,
    triggerNote,
    scopeNote,
    abnormal: present,
    bandLabel,
    band,
    detail: 'Auto-PEEP = total PEEP measured during an end-expiratory hold, minus the PEEP set on the ventilator. Driving pressure = plateau minus total PEEP.',
    note: AUTO_PEEP_NOTE,
  };
}
