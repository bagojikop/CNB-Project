export const VALIDATION_PATTERNS = {
  numbersOnly: '^[0-9]*$',
  mobile: '^[0-9+\\-\\s]*$',
  email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  gstinBasic: '^[0-9A-Z]{15}$',
  gstin: '^(0[1-9]|[1-2][0-9]|3[0-8])[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$',
  gstinUnregistered: '^(URP)?$',
  pan: '^[A-Z]{5}[0-9]{4}[A-Z]$',
  tan: '^[A-Z]{4}[0-9]{5}[A-Z]$',
  cin: '^[A-Z0-9]{21}$',
} as const;
