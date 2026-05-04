// Medicare Physician Fee Schedule calculator.
// payment = ((workRVU * workGPCI) + (peRVU * peGPCI) + (mpRVU * mpGPCI)) * conversionFactor

export function calcMpfsPayment({ workRvu, peRvu, mpRvu, gpci, conversionFactor }) {
  if (![workRvu, peRvu, mpRvu, conversionFactor].every(Number.isFinite)) {
    throw new TypeError('calcMpfsPayment: numeric inputs required.');
  }
  const { workGpci = 1, peGpci = 1, mpGpci = 1 } = gpci || {};
  const adjusted =
    workRvu * workGpci +
    peRvu * peGpci +
    mpRvu * mpGpci;
  return round2(adjusted * conversionFactor);
}

export function calcMpfsBoth({ code, mpfs, gpci, conversionFactor }) {
  // mpfs is the structural row from data/mpfs/shards.
  const facility = calcMpfsPayment({
    workRvu: mpfs.workRvu, peRvu: mpfs.peRvuFacility, mpRvu: mpfs.mpRvu, gpci, conversionFactor,
  });
  const nonFacility = calcMpfsPayment({
    workRvu: mpfs.workRvu, peRvu: mpfs.peRvuNonFacility, mpRvu: mpfs.mpRvu, gpci, conversionFactor,
  });
  return { code, facility, nonFacility };
}

export function chargeToMedicareRatio(charged, medicare) {
  if (!Number.isFinite(charged) || !Number.isFinite(medicare) || charged < 0 || medicare <= 0) {
    throw new TypeError('chargeToMedicareRatio: positive numeric inputs required.');
  }
  return round3(charged / medicare);
}

function round2(n) { return Math.round(n * 100) / 100; }
function round3(n) { return Math.round(n * 1000) / 1000; }
