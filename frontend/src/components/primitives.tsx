import styled, { css } from 'styled-components'

export const Surface = styled.div<{ $elevation?: 0 | 1 | 2 | 3; $padding?: number }>`
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  box-shadow: ${({ $elevation = 0, theme }) => theme.shadow[$elevation]};
  padding: ${({ $padding = 16 }) => `${$padding}px`};
`

export const Toolbar = styled.header`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.z.header};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[4]}px;
  padding: ${({ theme }) => `${theme.space[3]}px ${theme.space[5]}px`};
  background: ${({ theme }) => theme.color.surface};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  transition: background 0.3s ease, border-color 0.3s ease;
`

export const IconButton = styled.button<{ $variant?: 'default' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text.secondary};
  transition: transform .12s ${({ theme }) => theme.motion.easing}, box-shadow .12s, background .12s;
  &:hover { box-shadow: ${({ theme }) => theme.shadow[1]}; }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.focus.ring}; }
  ${({ $variant, theme }) => $variant === 'danger' && css`
    color: ${theme.color.danger[600]};
    &:hover { background: ${theme.color.danger[50]}; }
  `}
`

export const HStack = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[3]}px;
`

export const VStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[2]}px;
`

export const Chip = styled.span<{ $tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger'; $soft?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid ${({ theme }) => theme.color.border};
  color: ${({ theme }) => theme.color.text.secondary};
  background: ${({ theme }) => theme.color.surfaceMuted};
  ${({ $tone, theme }) => $tone === 'brand' && css`
    border-color: ${theme.color.brand[500] + '66'};
    color: ${theme.color.brand[600]};
    background: ${theme.color.brand[50]};
  `}
  ${({ $tone, theme }) => $tone === 'danger' && css`
    border-color: ${theme.color.danger[600] + '33'};
    color: ${theme.color.danger[600]};
    background: ${theme.color.danger[50]};
  `}
`

export const Card = styled(Surface)`
  border-radius: ${({ theme }) => theme.radius.lg}px;
  padding: ${({ theme }) => theme.space[4]}px;
  transition: box-shadow .16s ${({ theme }) => theme.motion.easing}, transform .16s ${({ theme }) => theme.motion.easing};
  &:hover { box-shadow: ${({ theme }) => theme.shadow[2]}; transform: translateY(-1px); }
  &:focus-within { box-shadow: ${({ theme }) => theme.focus.ring}; }
`

export const ColumnSurface = styled(Surface)`
  padding: ${({ theme }) => theme.space[5]}px;
  border-top: 3px solid ${({ theme }) => theme.color.brand[500]};
`

export const VisuallyHidden = styled.span`
  position: absolute !important;
  height: 1px; width: 1px; overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap; border: 0; padding: 0; margin: -1px;
`

export const Input = styled.input`
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text.primary};
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.focus.ring}; }
`

export const Select = styled.select`
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text.primary};
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.focus.ring}; }
`

export const PrimaryButton = styled.button`
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: ${({ theme }) => theme.color.brand[500]};
  color: white;
  font-weight: 600;
  transition: background .12s ${({ theme }) => theme.motion.easing}, transform .12s;
  &:hover { background: ${({ theme }) => theme.color.brand[600]}; }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.focus.ring}; }
`


