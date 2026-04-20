export const C = {
  // Backgrounds
  bg:          '#f0f4f8',
  surface:     '#ffffff',
  surface2:    '#f8fafc',
  surface3:    '#f1f5f9',

  // Borders
  border:      '#e2e8f0',
  borderLight: '#f1f5f9',

  // Text
  text:        '#0f172a',
  text2:       '#475569',
  text3:       '#94a3b8',

  // Brand
  primary:     '#2563eb',
  primaryD:    '#1d4ed8',
  primaryL:    '#3b82f6',

  // Status
  success:     '#16a34a',
  warning:     '#d97706',
  danger:      '#dc2626',

  // Dark palette
  navy:        '#0c1f40',
  navyMid:     '#1a2f50',
  navyLight:   '#1e293b',

  // Accents
  accent:      '#7c3aed',
  teal:        '#0d9488',
  gold:        '#d97706',
};

// Card shadow preset — spread into StyleSheet entries
export const shadow = {
  sm: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  md: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 10, elevation: 4,
  },
  lg: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 8,
  },
  xl: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28, shadowRadius: 28, elevation: 12,
  },
};

export const PAY_LABEL = { paid: '✓ Paid', pending: '⏳ Pending', overdue: '⚠ Overdue' };
export const PAY_COLOR = { paid: '#16a34a', pending: '#d97706', overdue: '#dc2626' };
export const PAY_BG    = { paid: '#dcfce7', pending: '#fef9c3', overdue: '#fee2e2' };
export const TERMS_LABEL  = { cod:'COD', net30:'Net 30', net60:'Net 60', net90:'Net 90' };
export const METHOD_LABEL = { invoice:'Invoice', bank:'Bank Transfer', card:'Credit Card', check:'Check', cod:'COD' };
