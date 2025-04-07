export interface TaxCodeSettings {
  code: string;
  applyPersonalAllowance: boolean;
  forcedRate?: 'basic' | 'higher' | 'additional' | 'scottish_basic' | 'scottish_intermediate' | 'scottish_higher' | 'scottish_advanced' | 'scottish_top';
  noTax?: boolean;
  forceScottish?: boolean;
  numericAllowance?: number;
  isEmergency?: boolean;
  isNegativeCode?: boolean;
}

function extractEmergencySuffix(code: string): string | null {
  const match = code.match(/\b(W1|M1|X)\b/i);
  return match ? match[0].toUpperCase() : null;
}

export function getTaxCodeSettings(code: string): TaxCodeSettings {
  const original = code.trim().toUpperCase();
  const emergency = extractEmergencySuffix(original);
  const cleanCode = original.replace(/\b(W1|M1|X)\b/i, '').trim();

  const taxCodes: Record<string, Omit<TaxCodeSettings, 'code'>> = {
    L: { applyPersonalAllowance: true },
    M: { applyPersonalAllowance: true },
    N: { applyPersonalAllowance: true },
    T: { applyPersonalAllowance: true },
    '0T': { applyPersonalAllowance: false },
    BR: { applyPersonalAllowance: false, forcedRate: 'basic' },
    D0: { applyPersonalAllowance: false, forcedRate: 'higher' },
    D1: { applyPersonalAllowance: false, forcedRate: 'additional' },
    NT: { applyPersonalAllowance: false, noTax: true },

    S: { applyPersonalAllowance: true, forceScottish: true },
    S0T: { applyPersonalAllowance: false, forceScottish: true },
    SBR: { applyPersonalAllowance: false, forceScottish: true, forcedRate: 'scottish_basic' },
    SD0: { applyPersonalAllowance: false, forceScottish: true, forcedRate: 'scottish_intermediate' },
    SD1: { applyPersonalAllowance: false, forceScottish: true, forcedRate: 'scottish_higher' },
    SD2: { applyPersonalAllowance: false, forceScottish: true, forcedRate: 'scottish_advanced' },
    SD3: { applyPersonalAllowance: false, forceScottish: true, forcedRate: 'scottish_top' },

    C: { applyPersonalAllowance: true },
    C0T: { applyPersonalAllowance: false },
    CBR: { applyPersonalAllowance: false, forcedRate: 'basic' },
    CD0: { applyPersonalAllowance: false, forcedRate: 'higher' },
    CD1: { applyPersonalAllowance: false, forcedRate: 'additional' }
  };

  // 1. Exact code match
  if (taxCodes[cleanCode]) {
    return {
      ...taxCodes[cleanCode],
      code: original,
      isEmergency: Boolean(emergency)
    };
  }

  // 2. K and SK negative codes (e.g. K800, SK1250)
  const kMatch = cleanCode.match(/^(SK|K)(\d{3,4})$/);
  if (kMatch) {
    const isScottish = kMatch[1] === 'SK';
    const num = parseInt(kMatch[2], 10);
    return {
      code: original,
      applyPersonalAllowance: true,
      numericAllowance: -num * 10,
      isNegativeCode: true,
      forceScottish: isScottish,
      isEmergency: Boolean(emergency)
    };
  }

  // 3. Personalised allowance codes like 1257L, 1257M, S1257N
  const match = cleanCode.match(/^([SC]?)(\d{3,4})([LMNT])$/);
  if (match) {
    const prefix = match[1];
    const num = parseInt(match[2], 10);
    const suffix = match[3];
    const isScottish = prefix === 'S';

    // Handle M and N suffixes for marriage allowance
    const marriageAllowanceCode = suffix === 'M' || suffix === 'N' ? suffix : null;
    return {
      code: original,
      applyPersonalAllowance: true,
      numericAllowance: num * 10,
      forceScottish: isScottish,
      isEmergency: Boolean(emergency)
    };
  }

  // 4. Fallback
  return {
    code: original,
    applyPersonalAllowance: true,
    isEmergency: Boolean(emergency)
  };
}