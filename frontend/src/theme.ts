// Centralized design tokens and helpers for styled-components ThemeProvider
export const theme = {
  radius: { sm: 8, md: 12, lg: 16, xl: 24 },
  space: [0, 4, 8, 12, 16, 24, 32, 40, 48],
  z: { header: 100, modal: 130, toast: 140, dnd: 150 },
  shadow: {
    0: 'none',
    1: '0 1px 2px rgba(16,24,40,.06)',
    2: '0 2px 8px rgba(16,24,40,.08)',
    3: '0 8px 24px rgba(16,24,40,.12)'
  },
  motion: {
    duration: { fade: 120, elevate: 160, scale: 120 },
    easing: 'cubic-bezier(.2,.8,.2,1)'
  },
  color: {
    bg: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceMuted: '#F9FAFB',
    text: { primary: '#0F172A', secondary: '#475569', muted: '#64748B' },
    brand: { 50: '#EEF2FF', 500: '#6366F1', 600: '#5457E5' },
    danger: { 50: '#FEF2F2', 600: '#DC2626' },
    border: '#E5E7EB',
    chip: {
      // Consolidated chip families
      priority: {
        high: { bg: '#FEF3F2', fg: '#B42318', br: '#FDA29B' },
        med: { bg: '#FFF6ED', fg: '#C2410C', br: '#FEC6A1' },
        low: { bg: '#ECFDF3', fg: '#027A48', br: '#A6F4C5' }
      },
      type: {
        bug: { bg: '#FEF3F2', fg: '#B42318', br: '#FDA29B' },
        feature: { bg: '#EFF8FF', fg: '#175CD3', br: '#B2DDFF' },
        docs: { bg: '#EEF2FF', fg: '#3538CD', br: '#C7D2FE' }
      },
      area: {
        backend: { bg: '#F0FDF9', fg: '#12805C', br: '#99F6E4' },
        frontend: { bg: '#E6F9FB', fg: '#0B7285', br: '#99E9F2' },
        design: { bg: '#F8F9FC', fg: '#364152', br: '#E5E7EB' }
      }
    }
  },
  focus: {
    ring: '0 0 0 3px rgba(99,102,241,.35)'
  }
} as const

export type AppTheme = typeof theme


