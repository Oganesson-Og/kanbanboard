import styled from 'styled-components'

export const Segmented = styled.div`
  display: inline-flex; padding: 4px; border-radius: 12px;
  background: ${({theme})=> theme.surfaceElevated || theme.color.surface};
  border: 1px solid ${({theme})=> (theme as any).border?.subtle || theme.color.border};
`

export const SegItem = styled.button<{ $active:boolean }>`
  padding: 8px 14px; border-radius: 8px; border: 0; cursor: pointer; font-weight: 600;
  background: ${({$active,theme})=> $active ? (theme.brand?.subtle || theme.color.brand[50]) : 'transparent'};
  color: ${({$active,theme})=> $active ? theme.color.text.primary : theme.color.text.muted};
  transition: background-color .2s ease;
  &:focus-visible{ outline: 2px solid ${({theme})=> theme.brand?.ring || '#6366F1'}; outline-offset:2px;}
`

export default Segmented


