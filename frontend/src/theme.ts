// Centralized design tokens and helpers for styled-components ThemeProvider

const baseTheme = {
  radius: { sm: 8, md: 12, lg: 16, xl: 24 },
  space: [0, 4, 8, 12, 16, 24, 32, 40, 48] as const,
  z: { header: 100, modal: 130, toast: 140, dnd: 150 },
  motion: {
    duration: { fade: 120, elevate: 160, scale: 120 },
    easing: 'cubic-bezier(.2,.8,.2,1)' as const
  },
}

export const lightTheme = {
  ...baseTheme,
  shadow: {
    0: 'none' as const,
    1: '0 1px 2px rgba(16,24,40,.06)' as string,
    2: '0 2px 8px rgba(16,24,40,.08)' as string,
    3: '0 8px 24px rgba(16,24,40,.12)' as string
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
    ring: '0 0 0 3px rgba(99,102,241,.35)' as string
  }
}

export const darkTheme = {
  ...baseTheme,
  shadow: {
    0: 'none' as const,
    1: '0 2px 4px rgba(0,0,0,.4)' as string,
    2: '0 4px 12px rgba(0,0,0,.5)' as string,
    3: '0 12px 32px rgba(0,0,0,.6)' as string
  },
  color: {
    bg: '#0F172A',
    surface: '#1E293B',
    surfaceMuted: '#334155',
    text: { primary: '#F1F5F9', secondary: '#CBD5E1', muted: '#94A3B8' },
    brand: { 50: '#312E81', 500: '#818CF8', 600: '#A5B4FC' },
    danger: { 50: '#7F1D1D', 600: '#F87171' },
    border: '#334155',
    chip: {
      // Consolidated chip families - adjusted for dark mode
      priority: {
        high: { bg: '#7F1D1D', fg: '#FCA5A5', br: '#991B1B' },
        med: { bg: '#78350F', fg: '#FED7AA', br: '#92400E' },
        low: { bg: '#14532D', fg: '#86EFAC', br: '#166534' }
      },
      type: {
        bug: { bg: '#7F1D1D', fg: '#FCA5A5', br: '#991B1B' },
        feature: { bg: '#1E3A8A', fg: '#93C5FD', br: '#1E40AF' },
        docs: { bg: '#312E81', fg: '#C7D2FE', br: '#4338CA' }
      },
      area: {
        backend: { bg: '#064E3B', fg: '#6EE7B7', br: '#047857' },
        frontend: { bg: '#164E63', fg: '#67E8F9', br: '#0E7490' },
        design: { bg: '#1E293B', fg: '#CBD5E1', br: '#334155' }
      }
    }
  },
  focus: {
    ring: '0 0 0 3px rgba(129,140,248,.4)' as string
  }
}

// Default theme (light)
export const theme = lightTheme

export type AppTheme = typeof lightTheme


