// An X12 835 shaped the way the Medicare Transaction Facilitator's companion guide describes (CMS, draft):
// CLP01 is the prescription reference number, "FILL" and the fill number; CLP03 the standard default refund
// amount; CLP04 the manufacturer's payment; CLP07 the MTF claim number; SVC01 N4 and the NDC-11; DTM*472 the
// date of service; CAS*PI*307 the adjustment; LQ*HE the remark code; BPR16 the payment date.
export function mtf835(claims, payDate = '20260330') {
  const body = ['ST*835*0001', `BPR*I*${claims.reduce((n, c) => n + (c.status === '22' ? -c.paid : c.paid), 0).toFixed(2)}*C*ACH*CCP*01*999999999*DA*123456*1234567890**01*999999999*DA*654321*${payDate}`,
    'TRN*1*12345*1234567890', 'REF*EV*123456789', 'N1*PR*MEDICARE TRANSACTION FACILITATOR', 'N1*PE*CORNER PHARMACY*FI*123456789', 'LX*1234567893'];
  for (const c of claims) {
    const sign = c.status === '22' ? -1 : 1;
    body.push(`CLP*${c.rx}FILL${c.fill}*${c.status || '1'}*${(sign * c.sdra).toFixed(2)}*${(sign * c.paid).toFixed(2)}**13*${c.mtf}`, 'NM1*QC*1');
    if (c.original) body.push(`REF*F8*${c.original}`);
    body.push(`SVC*N4:${c.ndc || '00169413212'}*${(sign * c.sdra).toFixed(2)}*${(sign * c.paid).toFixed(2)}**${c.qty || 30}`, `DTM*472*${c.dos}`);
    if (c.paid < c.sdra) body.push(`CAS*PI*307*${(sign * (c.sdra - c.paid)).toFixed(2)}`);
    if (c.rarc) body.push(`LQ*HE*${c.rarc}`);
  }
  body.push(`SE*${body.length + 1}*0001`);
  return [`ISA*00*          *00*          *ZZ*MTF            *ZZ*PHARM          *${payDate.slice(2)}*1200*^*00501*000000001*0*P*:`, `GS*HP*MTF*PHARM*${payDate}*1200*1*X*005010X221A1`, ...body, 'GE*1*1', 'IEA*1*000000001'].join('~') + '~';
}
